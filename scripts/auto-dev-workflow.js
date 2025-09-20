#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class AutoDevWorkflow {
  constructor() {
    this.isRunning = false;
  }

  async run() {
    console.log('🚀 启动自动化开发工作流...');
    console.log('📋 流程: 启动服务 → 返回控制权给Claude → Claude执行检查');

    try {
      // 第1步: 调用服务启动脚本
      console.log('🔧 调用服务启动脚本...');
      await this.startServices();

      // 第2步: 返回成功状态
      console.log('🎉 自动化工作流已启动服务！');
      console.log('✅ 控制权现在返回给Claude环境');
      console.log('💡 请在Claude中继续执行Lint检查和Playwright测试');

      return true;

    } catch (error) {
      console.error('❌ 工作流执行失败:', error.message);
      throw error;
    }
  }

  async startServices() {
    console.log('🔧 调用独立的服务启动脚本...');

    try {
      const { stdout, stderr } = await execAsync('node scripts/start-services.js', {
        cwd: process.cwd(),
        timeout: 120000 // 2分钟超时
      });

      if (stdout) {
        console.log(stdout);
      }

      if (stderr) {
        console.log('⚠️ 启动过程警告:', stderr);
      }

      console.log('✅ 服务启动脚本执行完成');

    } catch (error) {
      console.error('❌ 服务启动脚本执行失败:', error.message);
      throw error;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\n🛑 收到退出信号，正在退出...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 收到终止信号，正在退出...');
  process.exit(0);
});

// 如果直接运行此脚本
if (require.main === module) {
  const workflow = new AutoDevWorkflow();

  workflow.run().then(() => {
    console.log('\n🎯 服务启动工作流完成！');
    console.log('💡 控制权已返回给调用环境');
    console.log('💡 请继续在Claude中执行后续检查');
    process.exit(0); // 明确退出
  }).catch((error) => {
    console.error('\n❌ 服务启动失败:', error.message);
    process.exit(1);
  });
}

module.exports = AutoDevWorkflow;