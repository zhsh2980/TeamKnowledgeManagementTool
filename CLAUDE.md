# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个团队知识库管理工具，采用前后端分离架构，使用React + Express + SQLite技术栈，支持文档上传、搜索、标签管理和权限控制功能。

## 常用开发命令

### ⚡ Claude Code开发规则

关于subAgent的使用：

* 本项目的前端代码改动请使用 frontend-developer
* 本项目的后端代码改动请使用 backend-architect

* 本项目的ui设计和改动请使用 ui-ux-designer

**重要：每次修改完代码后，必须执行以下命令重启服务：**
```bash
# 步骤1: 启动服务 + 自动打开浏览器（推荐）
npm run start-services

# 自动完成：
# 1. 清理现有服务（端口3000/3001）
# 2. 以分离模式启动前后端服务
# 3. 等待服务就绪
# 4. 自动打开浏览器页面（前端+后端）
# 5. 脚本退出，服务继续后台运行

# 步骤2: 代码质量检查
npm run lint:all
```
这确保修改的代码能够正确加载和测试。

### 🚀 自动化开发工作流（推荐）
```bash
# 简化的两步工作流：

# 启动服务 + 自动打开浏览器（推荐）
npm run start-services

# 自动完成：
# 1. 清理现有服务（端口3000/3001）
# 2. 以分离模式启动前后端服务
# 3. 等待服务就绪
# 4. 自动打开浏览器页面（前端+后端）
# 5. 脚本退出，服务继续后台运行

# 代码质量检查
npm run lint:all

# 执行前后端代码检查

# 完整工作流（包含上述两步）
npm run auto-dev

# 等价于步骤1，执行完成后手动运行步骤2

# 其他有用命令
npm run cleanup          # 清理所有运行中的服务
npm run health-check     # 检查服务健康状态
npm run install:all      # 安装所有依赖（根目录+前端+后端）
```

### 传统开发方式

#### 后端开发
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

#### 前端开发
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

#### 同时运行前后端
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
│   │   ├── auth.js         # 认证相关路由（注册/登录，支持用户名/邮箱登录）
│   │   ├── documents.js    # 文档管理路由（上传/下载/搜索）
│   │   ├── search.js       # 搜索功能路由
│   │   └── admin.js        # 管理员功能路由
│   ├── middleware/         # 中间件层
│   │   ├── auth.js         # JWT认证中间件
│   │   └── upload.js       # 文件上传中间件（支持中文文件名和Markdown）
│   └── utils/              # 工具函数
│       ├── database.js     # SQLite数据库连接和初始化
│       └── auth.js         # JWT生成和验证工具
├── scripts/                # 实用脚本和自动化工具
│   ├── auto-dev-workflow.js    # 主自动化工作流脚本
│   ├── cleanup-services.js     # 服务清理脚本
│   ├── service-health-check.js # 服务健康检查脚本
│   ├── playwright-runner.js    # Playwright测试运行器
│   ├── create-admin.js         # 创建管理员账户脚本
│   └── fix-filenames.js        # 修复文件名编码脚本
└── uploads/                # 文件上传存储目录
```

### 前端架构（React + Ant Design）
```
frontend/
├── src/
│   ├── App.js              # 主应用，配置路由
│   ├── pages/              # 页面组件
│   │   ├── Login.js        # 登录页面（支持用户名/邮箱登录）
│   │   ├── Register.js     # 注册页面
│   │   ├── DocumentList.js # 文档列表页面
│   │   ├── Upload.js       # 文档上传页面（支持Markdown等格式）
│   │   ├── Search.js       # 文档搜索页面（支持标签搜索）
│   │   └── Admin.js        # 管理员仪表板页面
│   ├── components/         # 可复用组件
│   │   ├── Layout/         # 布局组件
│   │   └── PrivateRoute.js # 路由守卫组件
│   ├── services/           # API服务层
│   │   └── api.js          # axios实例和API调用
│   └── utils/              # 工具函数
│       ├── auth.js         # 认证相关工具
│       └── format.js       # 格式化工具函数
```

### 数据库设计（SQLite）
- **users表**: id, username, email, password_hash, role, created_at
- **documents表**: id, title, description, file_name, file_path, file_size, upload_user_id, is_public, tags, download_count, created_at
- **search_logs表**: id, user_id, keyword, tags, result_count, searched_at（搜索日志记录）
- **login_logs表**: id, user_id, ip_address, user_agent, login_time（登录日志记录，用于统计活跃用户）

### 认证和权限控制流程
1. 用户可使用用户名或邮箱登录，系统自动识别登录方式
2. 注册时对用户名和邮箱进行重复检查，提供明确的错误提示
3. 用户登录后获得JWT Token（有效期7天）
4. Token存储在localStorage中
5. axios请求拦截器自动添加Authorization头
6. 后端middleware/auth.js验证Token并注入用户信息到req.user
7. 基于用户角色（admin/user）控制访问权限
8. 管理员可通过Admin页面查看统计数据和管理用户角色

## 开发注意事项

### API开发模式
- 所有API路由挂载在 `/api` 前缀下
- 使用统一的响应格式和错误处理
- 文件上传限制10MB，支持PDF、Word、Excel、PPT、TXT、Markdown、图片等格式
- 支持中文文件名的正确编码和下载
- 实现了搜索日志记录和文档下载计数功能

### 前端开发模式
- 使用React Router v6进行路由管理
- 使用Ant Design组件库构建UI
- 通过PrivateRoute组件实现路由守卫
- API调用全部通过services/api.js统一管理
- 文档上传时自动填充文件名（去除扩展名）作为标题
- 支持标签搜索和搜索历史功能
- 实现了完整的管理员仪表板，包含用户管理和统计数据

### 自动化开发流程
- **推荐使用方式**：`npm run start-services` 启动服务 + 自动打开浏览器
- **简化流程**：两步工作流，去除复杂的自动化测试
- **端口管理**：自动清理端口占用，确保服务端口固定（3000/3001）
- **真正分离**：服务以detached模式运行，脚本完成后立即退出
- **自动打开**：服务就绪后自动打开前后端页面供开发者查看
- **跨平台支持**：自动识别操作系统（macOS/Windows/Linux）并使用正确的命令
- **健康监控**：智能等待服务就绪，避免服务启动竞争问题
- **一键清理**：使用 `npm run cleanup` 停止所有服务

**简化工作流程**：
1. `npm run start-services` - 启动服务 + 自动打开浏览器页面
2. `npm run lint:all` - 代码质量检查
3. 手动在浏览器中查看和测试应用

### 环境配置
- 后端环境变量通过 `.env` 文件配置（JWT_SECRET, PORT等）
- 前端开发环境已配置proxy，无需手动处理跨域
- SQLite数据库文件存储在 `backend/database.db`
- 后端默认运行在3001端口，前端通过proxy转发请求

### 实用脚本和自动化工具
**自动化开发工具**：
- `scripts/start-services.js`: 专用服务启动脚本，分离模式启动前后端服务
- `scripts/auto-dev-workflow.js`: 主自动化工作流脚本，调用服务启动并返回控制权
- `scripts/cleanup-services.js`: 智能服务清理脚本，强制清理端口占用
- `scripts/service-health-check.js`: 服务健康检查脚本，确保服务正常运行

**数据库和管理工具**：
- `backend/scripts/create-admin.js`: 创建管理员账户的脚本（用户名: admin, 密码: 123456）
- `backend/scripts/fix-filenames.js`: 修复数据库中文件名编码问题的脚本

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

### Git提交规范
- **重要规则**：每次代码修改完成后必须执行git commit
- 提交信息格式：`类型: 简短描述`
- 提交类型：feat（新功能）、fix（修复）、docs（文档）、style（格式）、refactor（重构）、test（测试）
- 提交信息末尾包含Claude Code标识：
  ```
  🤖 Generated with [Claude Code](https://claude.ai/code)
  
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```
- 示例提交信息：
  ```
  fix: 修复管理员仪表板显示问题
  
  - 添加login_logs表记录用户登录日志
  - 修复活跃用户登录次数显示为0的问题
  - 修复用户管理文档数显示为0的问题
  
  🤖 Generated with [Claude Code](https://claude.ai/code)
  
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

### 文档同步规则
**重要规则：当修改代码逻辑时，必须同步更新对应的文档！**

具体规则：
1. **架构变更**：修改项目结构、新增/删除文件、修改路由时，必须更新CLAUDE.md中的架构图
2. **数据库变更**：修改数据库表结构、新增表、修改字段时，必须更新数据库设计部分
3. **功能变更**：新增功能、修改业务逻辑、修改API接口时，必须更新相关功能描述
4. **配置变更**：修改环境配置、依赖包、开发命令时，必须更新配置相关文档
5. **工具变更**：新增脚本、修改构建流程时，必须更新工具相关文档

**检查清单**：每次代码变更后，检查是否需要更新：
- [ ] 项目架构图
- [ ] 数据库设计
- [ ] API接口说明
- [ ] 开发命令
- [ ] 环境配置
- [ ] 功能描述