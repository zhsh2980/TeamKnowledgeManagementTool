// 浏览器页面测试脚本 - 专注登录页面测试
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testLoginPage() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    defaultViewport: { width: 1200, height: 800 }
  });
  const page = await browser.newPage();

  // 创建截图目录
  const screenshotDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  // 收集控制台日志
  const consoleLogs = [];
  const errors = [];

  page.on('console', msg => {
    const log = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
      timestamp: new Date().toISOString()
    };
    consoleLogs.push(log);

    console.log(`📝 控制台[${msg.type()}]:`, msg.text());

    if (msg.type() === 'error' || msg.type() === 'warning') {
      errors.push(log);
      console.error(`❌ 控制台${msg.type()}:`, msg.text());
    }
  });

  page.on('pageerror', error => {
    const errorLog = {
      type: 'pageerror',
      text: error.message,
      timestamp: new Date().toISOString()
    };
    errors.push(errorLog);
    console.error('❌ 页面错误:', error.message);
  });

  // 监控网络请求
  const networkRequests = [];
  page.on('request', request => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      timestamp: new Date().toISOString()
    });
  });

  page.on('response', response => {
    console.log(`🌐 响应: ${response.status()} ${response.url()}`);
  });

  console.log('\n🚀 开始测试登录页面...');
  console.log('目标URL: http://localhost:3000/login');

  try {
    // 1. 访问登录页面
    console.log('\n📍 步骤1: 访问登录页面...');
    const startTime = Date.now();
    await page.goto('http://localhost:3000/login', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    const loadTime = Date.now() - startTime;
    console.log(`✅ 页面加载完成，耗时: ${loadTime}ms`);

    // 截图1: 页面加载完成
    await page.screenshot({
      path: path.join(screenshotDir, '01-page-loaded.png'),
      fullPage: true
    });

    // 2. 检查页面基本信息
    console.log('\n📍 步骤2: 检查页面基本信息...');
    const title = await page.title();
    const currentUrl = page.url();
    console.log('✅ 页面标题:', title);
    console.log('✅ 当前URL:', currentUrl);

    // 3. 检查登录表单元素
    console.log('\n📍 步骤3: 检查登录表单元素...');

    // 等待表单元素加载
    await page.waitForSelector('form', { timeout: 10000 });

    const formElements = await page.evaluate(() => {
      const form = document.querySelector('form');
      const usernameInput = document.querySelector('input[name="username"]') ||
                           document.querySelector('input#username') ||
                           document.querySelector('input[placeholder*="用户名"]') ||
                           document.querySelector('input[placeholder*="username"]');
      const passwordInput = document.querySelector('input[name="password"]') ||
                           document.querySelector('input#password') ||
                           document.querySelector('input[type="password"]');
      const submitButton = document.querySelector('button[type="submit"]') ||
                          document.querySelector('button.ant-btn-primary') ||
                          document.querySelector('button:contains("登录")');

      return {
        form: !!form,
        usernameInput: !!usernameInput,
        passwordInput: !!passwordInput,
        submitButton: !!submitButton,
        usernameSelector: usernameInput ? usernameInput.getAttribute('name') || usernameInput.id || usernameInput.placeholder : null,
        passwordSelector: passwordInput ? passwordInput.getAttribute('name') || passwordInput.id || passwordInput.type : null
      };
    });

    console.log('✅ 登录表单存在:', formElements.form);
    console.log('✅ 用户名输入框存在:', formElements.usernameInput);
    console.log('✅ 密码输入框存在:', formElements.passwordInput);
    console.log('✅ 登录按钮存在:', formElements.submitButton);
    console.log('📝 用户名输入框信息:', formElements.usernameSelector);
    console.log('📝 密码输入框信息:', formElements.passwordSelector);

    // 4. 尝试输入测试数据
    console.log('\n📍 步骤4: 输入测试数据...');

    if (formElements.usernameInput && formElements.passwordInput) {
      // 查找用户名输入框
      const usernameInput = await page.$('input[name="username"]') ||
                           await page.$('input#username') ||
                           await page.$('input[placeholder*="用户名"]') ||
                           await page.$('input[placeholder*="username"]');

      // 查找密码输入框
      const passwordInput = await page.$('input[name="password"]') ||
                           await page.$('input#password') ||
                           await page.$('input[type="password"]');

      if (usernameInput && passwordInput) {
        // 清空并输入测试数据
        await usernameInput.click();
        await usernameInput.evaluate(el => el.value = '');
        await usernameInput.type('testuser', { delay: 100 });
        console.log('✅ 已输入用户名: testuser');

        await passwordInput.click();
        await passwordInput.evaluate(el => el.value = '');
        await passwordInput.type('testpass123', { delay: 100 });
        console.log('✅ 已输入密码: testpass123');

        // 截图2: 输入完成
        await page.screenshot({
          path: path.join(screenshotDir, '02-form-filled.png'),
          fullPage: true
        });
      }
    } else {
      console.log('❌ 无法找到输入框，跳过输入测试');
    }

    // 5. 点击登录按钮
    console.log('\n📍 步骤5: 点击登录按钮...');

    if (formElements.submitButton) {
      const submitButton = await page.$('button[type="submit"]') ||
                          await page.$('button.ant-btn-primary') ||
                          await page.$('button');

      if (submitButton) {
        console.log('✅ 准备点击登录按钮...');

        // 截图3: 点击前
        await page.screenshot({
          path: path.join(screenshotDir, '03-before-submit.png'),
          fullPage: true
        });

        await submitButton.click();
        console.log('✅ 已点击登录按钮');

        // 等待响应
        await page.waitForTimeout(3000);

        // 截图4: 点击后
        await page.screenshot({
          path: path.join(screenshotDir, '04-after-submit.png'),
          fullPage: true
        });

        // 检查URL变化
        const newUrl = page.url();
        console.log('📝 点击后URL:', newUrl);

        if (newUrl !== currentUrl) {
          console.log('✅ 页面发生跳转');
        } else {
          console.log('📝 页面未跳转，可能有验证错误');
        }
      }
    } else {
      console.log('❌ 无法找到登录按钮，跳过点击测试');
    }

    // 6. 检查页面响应和UI变化
    console.log('\n📍 步骤6: 检查页面响应和UI变化...');

    // 检查是否有错误提示
    const errorMessages = await page.evaluate(() => {
      const errors = [];
      const errorSelectors = [
        '.ant-form-item-explain-error',
        '.error-message',
        '.alert-danger',
        '[class*="error"]',
        '[class*="Error"]'
      ];

      errorSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el.textContent.trim()) {
            errors.push({
              selector: selector,
              text: el.textContent.trim(),
              visible: el.offsetParent !== null
            });
          }
        });
      });

      return errors;
    });

    if (errorMessages.length > 0) {
      console.log('📝 发现页面错误提示:');
      errorMessages.forEach((error, index) => {
        console.log(`   ${index + 1}. [${error.selector}] ${error.text} (可见: ${error.visible})`);
      });
    } else {
      console.log('✅ 未发现页面错误提示');
    }

    // 7. 输出控制台日志汇总
    console.log('\n📍 步骤7: 控制台日志汇总...');
    console.log(`📊 总控制台消息数: ${consoleLogs.length}`);
    console.log(`📊 错误/警告数: ${errors.length}`);
    console.log(`📊 网络请求数: ${networkRequests.length}`);

    if (errors.length > 0) {
      console.log('\n❌ 控制台错误详情:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.timestamp}] ${error.type}: ${error.text}`);
      });
    }

    // 输出最近的控制台日志
    if (consoleLogs.length > 0) {
      console.log('\n📝 最近的控制台日志 (最多10条):');
      consoleLogs.slice(-10).forEach((log, index) => {
        console.log(`${index + 1}. [${log.type}] ${log.text}`);
      });
    }

    // 8. 最终截图
    await page.screenshot({
      path: path.join(screenshotDir, '05-final-state.png'),
      fullPage: true
    });

    console.log('\n✅ 测试完成！');
    console.log(`📁 截图保存在: ${screenshotDir}`);

  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message);

    // 错误截图
    try {
      await page.screenshot({
        path: path.join(screenshotDir, 'error-screenshot.png'),
        fullPage: true
      });
    } catch (screenshotError) {
      console.error('❌ 无法保存错误截图:', screenshotError.message);
    }
  }

  // 等待5秒供观察
  console.log('\n⏳ 等待5秒钟供观察...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  await browser.close();
  console.log('\n🏁 浏览器已关闭');
}

testLoginPage().catch(console.error);