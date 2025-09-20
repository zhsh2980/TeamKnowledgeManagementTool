#!/usr/bin/env node

const http = require('http');
const { URL } = require('url');

class ServiceHealthCheck {
  constructor() {
    this.services = [
      { name: '后端API', url: 'http://localhost:3001', path: '/' },
      { name: '前端应用', url: 'http://localhost:3000', path: '/' }
    ];
    this.maxAttempts = 30;
    this.checkInterval = 2000;
  }

  async waitForServices() {
    console.log('⏳ 等待服务启动就绪...');

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      console.log(`🔍 第 ${attempt}/${this.maxAttempts} 次检查...`);

      const results = await Promise.allSettled(
        this.services.map(service => this.checkService(service))
      );

      const allReady = results.every(result => result.status === 'fulfilled');

      if (allReady) {
        console.log('🎉 所有服务已就绪！');
        return true;
      }

      // 显示详细状态
      results.forEach((result, index) => {
        const service = this.services[index];
        if (result.status === 'fulfilled') {
          console.log(`✅ ${service.name}: 就绪`);
        } else {
          console.log(`❌ ${service.name}: ${result.reason}`);
        }
      });

      if (attempt < this.maxAttempts) {
        console.log(`⏱️ 等待 ${this.checkInterval / 1000} 秒后重试...`);
        await this.sleep(this.checkInterval);
      }
    }

    throw new Error('服务启动超时，请检查服务配置');
  }

  checkService(service) {
    return new Promise((resolve, reject) => {
      const url = new URL(service.path, service.url);

      const request = http.get({
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        timeout: 5000
      }, (response) => {
        if (response.statusCode >= 200 && response.statusCode < 400) {
          resolve(`${service.name} 响应正常 (${response.statusCode})`);
        } else {
          reject(`${service.name} 响应异常: ${response.statusCode}`);
        }
      });

      request.on('error', (error) => {
        reject(`${service.name} 连接失败: ${error.message}`);
      });

      request.on('timeout', () => {
        request.destroy();
        reject(`${service.name} 请求超时`);
      });
    });
  }

  async checkServiceDetails() {
    console.log('🔍 检查服务详细状态...');

    for (const service of this.services) {
      try {
        await this.checkService(service);
        console.log(`✅ ${service.name} (${service.url}): 正常运行`);
      } catch (error) {
        console.log(`❌ ${service.name} (${service.url}): ${error}`);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const healthCheck = new ServiceHealthCheck();

  const command = process.argv[2];

  if (command === 'wait') {
    healthCheck.waitForServices().then(() => {
      console.log('✅ 健康检查完成');
      process.exit(0);
    }).catch((error) => {
      console.error('❌ 健康检查失败:', error.message);
      process.exit(1);
    });
  } else {
    healthCheck.checkServiceDetails().then(() => {
      process.exit(0);
    });
  }
}

module.exports = ServiceHealthCheck;