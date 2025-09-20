# 团队知识库管理工具 (Team Knowledge Management Tool)

一个简单实用的团队知识库管理系统，支持文档上传、搜索、标签管理、用户权限控制等核心功能。

## 📋 项目概述

### 核心功能
- 🔐 **用户管理** - 用户注册、登录、权限控制
- 📄 **文档管理** - 上传、下载、查看、删除文档
- 🔍 **搜索功能** - 关键词搜索、标签筛选
- 🏷️ **标签系统** - 文档分类、标签管理
- 👥 **权限控制** - 基于角色的访问控制、公开/私有文档
- 👨‍💼 **管理功能** - 管理员可管理所有内容

### 技术架构
- **前端**: React 18 + Ant Design
- **后端**: Node.js + Express + JWT
- **数据库**: SQLite
- **开发周期**: 2周快速实现

## 📚 文档结构

### 核心文档
| 文档 | 描述 | 状态 |
|------|------|------|
| [需求分析](docs/01-需求分析.md) | 功能需求、用户角色、验收标准 | ✅ 完成 |
| [技术设计](docs/02-技术设计.md) | 系统架构、技术选型、数据库设计 | ✅ 完成 |
| [开发计划](docs/03-开发计划.md) | 2周开发计划、任务分解、团队分工 | ✅ 完成 |
| [API文档](docs/04-API文档.md) | 接口文档、请求响应格式、错误码 | ✅ 完成 |
| [进度跟踪](docs/05-进度跟踪.md) | 任务进度、风险管理、质量指标 | ✅ 完成 |

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0
- Git >= 2.30.0

### 开发环境搭建
```bash
# 1. 克隆项目
git clone https://github.com/yourorg/TeamKnowledgeManagementTool.git
cd TeamKnowledgeManagementTool

# 2. 安装依赖
cd backend && npm install
cd ../frontend && npm install

# 3. 环境配置
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.development

# 4. 数据库初始化
cd backend && npm run db:init

# 5. 启动开发服务器
npm run dev  # 同时启动前后端
```

### 生产环境部署
详细部署步骤请参考 [部署指南](docs/07-deployment.md)

## 📖 开发指南

### 项目结构
```
TeamKnowledgeManagementTool/
├── docs/                   # 项目文档
├── frontend/               # React前端应用
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API服务
│   │   ├── store/         # 状态管理
│   │   └── types/         # 类型定义
│   └── package.json
├── backend/                # Node.js后端服务
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由定义
│   │   ├── middleware/    # 中间件
│   │   └── services/      # 业务服务
│   └── package.json
└── README.md
```

### 开发流程
1. **需求分析** - 查看 [需求分析文档](docs/01-需求分析.md)
2. **技术设计** - 参考 [技术设计文档](docs/02-技术设计.md)
3. **编码实现** - 遵循 [API文档](docs/04-API文档.md) 进行开发
4. **测试验证** - 按照 [开发计划](docs/03-开发计划.md) 进行测试
5. **进度跟踪** - 使用 [进度跟踪文档](docs/05-进度跟踪.md) 管理进度

### 代码规范
- 统一代码风格
- 添加必要注释
- 错误处理完善
- 基础功能测试

## 🗓️ 开发计划

### 2周开发计划
| 阶段 | 时间 | 主要功能 | 状态 |
|------|------|----------|------|
| 第一周 | Day 1-7 | 基础架构、用户认证、文档管理 | ⏳ 待开始 |
| 第二周 | Day 8-14 | 搜索功能、权限控制、测试优化 | ⏳ 待开始 |

详细开发计划请查看 [开发计划文档](docs/03-开发计划.md)

## 📊 项目进度

### 当前状态
- **项目阶段**: 文档设计阶段完成，准备开始编码
- **完成度**: 8% (文档和规划)
- **下一个里程碑**: 开始项目初始化和环境搭建

### 功能完成度
| 功能模块 | 状态 |
|----------|------|
| 用户认证 | ⏳ 待开始 |
| 文档管理 | ⏳ 待开始 |
| 搜索功能 | ⏳ 待开始 |
| 权限控制 | ⏳ 待开始 |
| 标签系统 | ⏳ 待开始 |
| 管理功能 | ⏳ 待开始 |

实时进度跟踪请查看 [进度跟踪文档](docs/05-进度跟踪.md)

## 🔒 安全特性

- **认证安全**: JWT Token认证、密码bcrypt加密
- **权限控制**: 基于角色的访问控制、文档级权限
- **数据安全**: 输入验证、SQL参数化查询防注入
- **文件安全**: 文件类型白名单、文件大小限制
- **基础防护**: 中间件统一权限验证

## 🛠️ 技术特性

### 前端特性
- **现代框架**: React 18
- **组件库**: Ant Design
- **路由管理**: React Router
- **HTTP客户端**: Axios
- **开发工具**: 快速搭建，开箱即用

### 后端特性
- **轻量框架**: Node.js + Express
- **数据库**: SQLite (零配置、文件数据库)
- **认证**: JWT Token认证
- **安全**: bcrypt密码加密
- **文件处理**: multer文件上传
- **统一响应**: 标准API格式

## 📈 性能指标

### 目标指标
- **响应时间**: 页面加载 < 3秒，API响应 < 2秒
- **并发性能**: 支持10-20并发用户
- **文件处理**: 支持10MB文件上传
- **搜索性能**: 搜索响应时间 < 2秒
- **基础可用性**: 稳定的文件上传下载

### 优化策略
- 数据库索引优化
- 基础的前端性能优化
- 合理的错误处理
- 简单的缓存策略

## 🤝 贡献指南

### 开发流程
1. Fork项目到个人仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

### 代码规范
- 遵循现有代码风格
- 添加必要的单元测试
- 更新相关文档
- 通过所有CI检查

## 📞 联系方式

- **项目负责人**: [Your Name]
- **技术支持**: [tech-support@example.com]
- **问题反馈**: [GitHub Issues](https://github.com/yourorg/TeamKnowledgeManagementTool/issues)

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

感谢所有为本项目做出贡献的开发者和使用者。

---

**注意**: 本项目正在积极开发中，功能和文档会持续更新。如有问题或建议，欢迎提交Issue或联系项目团队。