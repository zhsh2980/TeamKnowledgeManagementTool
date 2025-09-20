# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个团队知识库管理工具，采用前后端分离架构，使用React + Express + SQLite技术栈，支持文档上传、搜索、标签管理和权限控制功能。

## 常用开发命令

### 后端开发
```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 初始化数据库（首次运行）
npm run db:init

# 开发模式运行（带热重载）
npm run dev

# 生产模式运行
npm start
```

### 前端开发
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 开发模式运行（端口3000）
npm start

# 构建生产版本
npm run build

# 运行测试
npm test
```

### 同时运行前后端
```bash
# 在两个终端分别运行
# 终端1：后端（端口3001）
cd backend && npm run dev

# 终端2：前端（端口3000，已配置proxy到3001）
cd frontend && npm start
```

## 核心架构设计

### 前后端通信架构
- **前端**: React应用运行在3000端口，通过package.json中的proxy配置转发API请求到后端3001端口
- **认证机制**: 基于JWT Token，存储在localStorage，通过axios拦截器自动添加到请求头
- **API规范**: RESTful风格，统一响应格式 `{code, message, data}`

### 后端架构（Express + SQLite）
```
backend/
├── src/
│   ├── app.js              # Express主应用，配置中间件和路由
│   ├── routes/             # API路由定义
│   │   └── auth.js         # 认证相关路由（注册/登录）
│   ├── middleware/         # 中间件层
│   │   ├── auth.js         # JWT认证中间件
│   │   └── upload.js       # 文件上传中间件（multer）
│   └── utils/              # 工具函数
│       ├── database.js     # SQLite数据库连接和初始化
│       └── auth.js         # JWT生成和验证工具
└── uploads/                # 文件上传存储目录
```

### 前端架构（React + Ant Design）
```
frontend/
├── src/
│   ├── App.js              # 主应用，配置路由
│   ├── pages/              # 页面组件
│   │   └── Login.js        # 登录页面
│   ├── components/         # 可复用组件
│   │   ├── Layout/         # 布局组件
│   │   └── PrivateRoute.js # 路由守卫组件
│   ├── services/           # API服务层
│   │   └── api.js          # axios实例和API调用
│   └── utils/              # 工具函数
│       └── auth.js         # 认证相关工具
```

### 数据库设计（SQLite）
- **users表**: id, username, password, role, created_at
- **documents表**: id, title, content, file_path, user_id, is_public, created_at
- **tags表**: id, name, created_at
- **document_tags表**: document_id, tag_id（多对多关系）

### 认证和权限控制流程
1. 用户登录后获得JWT Token（有效期7天）
2. Token存储在localStorage中
3. axios请求拦截器自动添加Authorization头
4. 后端middleware/auth.js验证Token并注入用户信息到req.user
5. 基于用户角色（admin/user）控制访问权限

## 开发注意事项

### API开发模式
- 所有API路由挂载在 `/api` 前缀下
- 使用统一的响应格式和错误处理
- 文件上传限制10MB，支持的文件类型在upload中间件配置

### 前端开发模式
- 使用React Router v6进行路由管理
- 使用Ant Design组件库构建UI
- 通过PrivateRoute组件实现路由守卫
- API调用全部通过services/api.js统一管理

### 环境配置
- 后端环境变量通过 `.env` 文件配置（JWT_SECRET, PORT等）
- 前端开发环境已配置proxy，无需手动处理跨域
- SQLite数据库文件存储在 `backend/database.db`

## 语言和规范约定

### 代码规范
- 变量名、函数名使用英文命名
- 代码注释使用中文
- 用户提示信息使用中文
- Git提交信息使用中文

### 文档规范
- 技术文档使用中文
- API接口名称保持英文
- README.md保持中英文混合