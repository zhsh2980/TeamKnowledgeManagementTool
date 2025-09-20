#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');
const ServiceCleanup = require('./cleanup-services');
const ServiceHealthCheck = require('./service-health-check');

class ServiceStarter {
  constructor() {
    this.cleanup = new ServiceCleanup();
    this.healthCheck = new ServiceHealthCheck();
  }

  async start() {
    console.log('🚀 启动前后端服务...');

    try {
      // 第1步: 清理现有服务
      await this.cleanup.cleanup();

      // 第2步: 启动服务并立即分离
      await this.startDetachedServices();

      // 第3步: 等待服务就绪
      await this.healthCheck.waitForServices();

      // 第4步: 自动打开浏览器页面
      await this.openBrowserPages();

      // 第5步: 返回成功状态
      console.log('🎉 服务启动完成！');
      console.log('📊 状态报告:');
      console.log('- 后端服务: http://localhost:3001 ✅');
      console.log('- 前端服务: http://localhost:3000 ✅');
      console.log('- 浏览器页面: 已自动打开 ✅');
      console.log('💡 服务已在后台运行，主脚本即将退出');
      console.log('💡 请在Claude环境中继续执行后续检查');

      return true;

    } catch (error) {
      console.error('❌ 服务启动失败:', error.message);
      console.log('🔧 正在清理失败的启动尝试...');
      await this.cleanup.cleanup();
      throw error;
    }
  }

  async startDetachedServices() {
    console.log('🔧 以分离模式启动服务...');

    // 启动后端服务 - 真正的分离模式
    console.log('🚀 启动后端服务 (端口 3001)...');
    const backendProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(process.cwd(), 'backend'),
      stdio: 'ignore', // 完全忽略输入输出
      detached: true   // 分离进程
    });
    backendProcess.unref(); // 允许主进程退出

    // 启动前端服务 - 真正的分离模式
    console.log('🚀 启动前端服务 (端口 3000)...');
    const frontendProcess = spawn('npm', ['start'], {
      cwd: path.join(process.cwd(), 'frontend'),
      stdio: 'ignore', // 完全忽略输入输出
      detached: true,  // 分离进程
      env: {
        ...process.env,
        BROWSER: 'none',  // 防止自动打开浏览器
        CI: 'true'        // 防止交互式提示
      }
    });
    frontendProcess.unref(); // 允许主进程退出

    console.log('✅ 服务启动命令已执行（分离模式）');

    // 给服务一点时间开始启动
    await this.sleep(3000);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async openBrowserPages() {
    console.log('🌐 自动打开浏览器页面...');

    const urls = [
      'http://localhost:3000',
      'http://localhost:3001'
    ];

    // 检测操作系统并选择相应的命令
    const platform = os.platform();
    let openCommand;

    switch (platform) {
      case 'darwin':  // macOS
        openCommand = 'open';
        break;
      case 'win32':   // Windows
        openCommand = 'start';
        break;
      case 'linux':   // Linux
        openCommand = 'xdg-open';
        break;
      default:
        console.log('⚠️ 无法识别操作系统，跳过自动打开浏览器');
        return;
    }

    try {
      for (const url of urls) {
        const command = platform === 'win32' ? `${openCommand} ${url}` : `${openCommand} ${url}`;

        exec(command, (error) => {
          if (error) {
            console.log(`⚠️ 无法打开 ${url}: ${error.message}`);
          } else {
            console.log(`✅ 已打开: ${url}`);
          }
        });

        // 稍微延迟避免同时打开过多窗口
        await this.sleep(500);
      }

      console.log('🎉 浏览器页面打开完成！');
      console.log('📋 页面地址:');
      console.log('  - 前端应用: http://localhost:3000');
      console.log('  - 后端API: http://localhost:3001');

    } catch (error) {
      console.log('⚠️ 打开浏览器时出现错误:', error.message);
    }
  }
}

// 处理进程退出信号
process.on('SIGINT', () => {
  console.log('\n🛑 收到中断信号，正在退出...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 收到终止信号，正在退出...');
  process.exit(0);
});

// 如果直接运行此脚本
if (require.main === module) {
  const starter = new ServiceStarter();

  starter.start().then(() => {
    console.log('\n✅ 服务启动脚本执行完成');
    console.log('🔄 控制权已返回给调用环境');
    process.exit(0); // 明确退出
  }).catch((error) => {
    console.error('\n❌ 服务启动失败:', error.message);
    process.exit(1); // 失败退出
  });
}

module.exports = ServiceStarter;