#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class ServiceCleanup {
  constructor() {
    this.targetPorts = [3000, 3001];
    this.processNames = ['npm run dev', 'npm start', 'react-scripts start', 'nodemon'];
  }

  async cleanup() {
    console.log('🔄 开始清理现有服务...');

    try {
      // 清理端口占用
      await this.cleanupPorts();

      // 清理相关进程
      await this.cleanupProcesses();

      // 等待清理完成
      console.log('⏳ 等待服务完全停止...');
      await this.sleep(3000);

      // 验证清理结果
      await this.verifyCleanup();

      console.log('✅ 服务清理完成');

    } catch (error) {
      console.error('❌ 清理过程中出现错误:', error.message);
      // 不抛出错误，允许继续执行
    }
  }

  async cleanupPorts() {
    console.log('🔧 清理端口占用...');

    for (const port of this.targetPorts) {
      try {
        // macOS/Linux 清理端口
        await execAsync(`lsof -ti:${port} | xargs kill -9`);
        console.log(`✅ 已清理端口 ${port}`);
      } catch (error) {
        // 端口没有被占用是正常情况
        console.log(`ℹ️ 端口 ${port} 无占用进程`);
      }
    }
  }

  async cleanupProcesses() {
    console.log('🔧 清理相关进程...');

    const cleanupCommands = [
      'pkill -f "npm run dev"',
      'pkill -f "npm start"',
      'pkill -f "react-scripts start"',
      'pkill -f "nodemon"',
      'pkill -f "node.*app.js"'
    ];

    for (const cmd of cleanupCommands) {
      try {
        await execAsync(cmd);
        console.log(`✅ 已执行: ${cmd}`);
      } catch (error) {
        // 进程不存在是正常情况
        console.log(`ℹ️ 无相关进程: ${cmd}`);
      }
    }
  }

  async verifyCleanup() {
    console.log('🔍 验证清理结果...');

    for (const port of this.targetPorts) {
      try {
        const { stdout } = await execAsync(`lsof -i:${port}`);
        if (stdout.trim()) {
          console.log(`⚠️ 端口 ${port} 仍有进程占用:`);
          console.log(stdout);
        } else {
          console.log(`✅ 端口 ${port} 已完全释放`);
        }
      } catch (error) {
        // lsof 无输出说明端口空闲
        console.log(`✅ 端口 ${port} 已完全释放`);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const cleanup = new ServiceCleanup();
  cleanup.cleanup().then(() => {
    console.log('🎉 清理脚本执行完成');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ 清理脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = ServiceCleanup;