require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./utils/database');

const app = express();
const PORT = process.env.PORT || 3001;

// 初始化数据库
initDatabase();

// 中间件配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 用于文件下载
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 路由配置
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/search', require('./routes/search'));
app.use('/api/admin', require('./routes/admin'));

// 根路径
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>团队知识库后台管理系统</title>
      <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><defs><linearGradient id='serverGrad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%23dc2626'/><stop offset='100%' style='stop-color:%23b91c1c'/></linearGradient></defs><rect x='4' y='6' width='24' height='20' rx='3' fill='url(%23serverGrad)' stroke='%23991b1b' stroke-width='1'/><rect x='6' y='9' width='20' height='3' rx='1' fill='%23fecaca'/><rect x='6' y='14' width='20' height='3' rx='1' fill='%23fecaca'/><rect x='6' y='19' width='20' height='3' rx='1' fill='%23fecaca'/><circle cx='23' cy='10.5' r='1.5' fill='%2322c55e'/><circle cx='23' cy='15.5' r='1.5' fill='%2322c55e'/><circle cx='23' cy='20.5' r='1.5' fill='%2322c55e'/><circle cx='16' cy='4' r='2.5' fill='%23f59e0b' stroke='%23d97706'/><path d='M14.5,2 L17.5,2 M14.5,6 L17.5,6 M13,3.5 L13,4.5 M19,3.5 L19,4.5' stroke='%23d97706' stroke-width='0.8' fill='none'/></svg>" />
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          margin: 0;
          padding: 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 {
          font-size: 2.5em;
          margin-bottom: 20px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .status {
          font-size: 1.2em;
          margin: 20px 0;
          opacity: 0.9;
        }
        .version {
          font-size: 0.9em;
          opacity: 0.7;
          margin-top: 30px;
        }
        .api-info {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 20px;
          margin-top: 30px;
        }
        .endpoint {
          font-family: 'Courier New', monospace;
          background: rgba(0, 0, 0, 0.2);
          padding: 5px 10px;
          border-radius: 5px;
          margin: 5px 0;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 团队知识库后台管理系统</h1>
        <div class="status">✅ 服务运行正常</div>
        <div class="api-info">
          <h3>API 接口地址</h3>
          <div class="endpoint">/api/auth - 用户认证</div>
          <div class="endpoint">/api/documents - 文档管理</div>
          <div class="endpoint">/api/search - 搜索功能</div>
          <div class="endpoint">/api/admin - 管理功能</div>
        </div>
        <div class="version">版本: 1.0.0</div>
      </div>
    </body>
    </html>
  `);
});

// 404错误处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);

  // Multer错误处理
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: '文件大小超过限制'
    });
  }

  if (err.message === '不支持的文件类型') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器已启动，运行在端口 ${PORT}`);
  console.log(`📝 API文档: http://localhost:${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;