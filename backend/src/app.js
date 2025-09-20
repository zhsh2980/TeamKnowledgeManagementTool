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
  res.json({
    success: true,
    message: '团队知识库管理工具后端服务',
    version: '1.0.0'
  });
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