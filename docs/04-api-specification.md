# API接口规范文档

## 1. API概述

### 1.1 基本信息
- **API版本**: v1.0.0
- **基础URL**: `http://localhost:3000/api/v1`
- **协议**: HTTP/HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

### 1.2 认证方式
- **认证类型**: JWT Bearer Token
- **Token位置**: HTTP Header
- **Header格式**: `Authorization: Bearer <token>`

### 1.3 响应格式
所有API响应都遵循统一格式：

```json
{
  "success": true|false,
  "data": {},
  "message": "操作描述",
  "error": {
    "code": "错误代码",
    "details": "错误详情"
  },
  "timestamp": "2023-12-01T10:00:00Z",
  "requestId": "uuid"
}
```

### 1.4 HTTP状态码
| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 422 | 数据验证失败 |
| 500 | 服务器内部错误 |

## 2. 认证API

### 2.1 用户注册
**接口**: `POST /auth/register`

**请求体**:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "role": "member",
      "created_at": "2023-12-01T10:00:00Z"
    }
  },
  "message": "用户注册成功"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": "用户名已存在"
  },
  "message": "注册失败"
}
```

### 2.2 用户登录
**接口**: `POST /auth/login`

**请求体**:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "role": "member"
    }
  },
  "message": "登录成功"
}
```

### 2.3 Token刷新
**接口**: `POST /auth/refresh`

**请求体**:
```json
{
  "refreshToken": "refresh_token_here"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "token": "new_access_token",
    "expiresIn": 3600
  },
  "message": "Token刷新成功"
}
```

### 2.4 用户注销
**接口**: `POST /auth/logout`

**请求头**: `Authorization: Bearer <token>`

**响应**:
```json
{
  "success": true,
  "message": "注销成功"
}
```

### 2.5 获取当前用户信息
**接口**: `GET /auth/profile`

**请求头**: `Authorization: Bearer <token>`

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "member",
    "avatar_url": null,
    "last_login_at": "2023-12-01T09:00:00Z",
    "created_at": "2023-12-01T08:00:00Z"
  }
}
```

## 3. 文档管理API

### 3.1 获取文档列表
**接口**: `GET /documents`

**查询参数**:
- `page`: 页码（默认1）
- `limit`: 每页数量（默认20，最大100）
- `search`: 搜索关键词
- `tags`: 标签过滤（逗号分隔）
- `mine`: 仅显示我的文档（true/false）

**请求示例**: `GET /documents?page=1&limit=10&search=技术&tags=文档,教程`

**响应**:
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": 1,
        "title": "技术文档示例",
        "description": "这是一个技术文档",
        "file_name": "tech_doc.pdf",
        "file_size": 1024000,
        "mime_type": "application/pdf",
        "view_count": 10,
        "download_count": 5,
        "is_public": true,
        "uploader": {
          "id": 1,
          "username": "testuser"
        },
        "tags": [
          {"id": 1, "name": "技术文档", "color": "#1890ff"}
        ],
        "created_at": "2023-12-01T10:00:00Z",
        "updated_at": "2023-12-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

### 3.2 获取文档详情
**接口**: `GET /documents/:id`

**路径参数**: `id` - 文档ID

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "技术文档示例",
    "description": "这是一个技术文档",
    "file_name": "tech_doc.pdf",
    "file_path": "/uploads/documents/2023/12/01/tech_doc_uuid.pdf",
    "file_size": 1024000,
    "mime_type": "application/pdf",
    "view_count": 11,
    "download_count": 5,
    "is_public": true,
    "uploader": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com"
    },
    "tags": [
      {"id": 1, "name": "技术文档", "color": "#1890ff"}
    ],
    "permissions": [
      {
        "user_id": 2,
        "username": "user2",
        "permission_type": "read"
      }
    ],
    "created_at": "2023-12-01T10:00:00Z",
    "updated_at": "2023-12-01T10:00:00Z"
  }
}
```

### 3.3 上传文档
**接口**: `POST /documents`

**请求类型**: `multipart/form-data`

**请求参数**:
- `file`: 文件（必需）
- `title`: 文档标题（必需）
- `description`: 文档描述（可选）
- `tags`: 标签ID数组（可选）
- `is_public`: 是否公开（默认false）

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "新上传的文档",
    "description": "文档描述",
    "file_name": "document.pdf",
    "file_size": 1024000,
    "mime_type": "application/pdf",
    "upload_user_id": 1,
    "is_public": false,
    "created_at": "2023-12-01T10:00:00Z"
  },
  "message": "文档上传成功"
}
```

### 3.4 更新文档信息
**接口**: `PUT /documents/:id`

**请求体**:
```json
{
  "title": "更新后的标题",
  "description": "更新后的描述",
  "is_public": true
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "更新后的标题",
    "description": "更新后的描述",
    "is_public": true,
    "updated_at": "2023-12-01T11:00:00Z"
  },
  "message": "文档更新成功"
}
```

### 3.5 删除文档
**接口**: `DELETE /documents/:id`

**响应**:
```json
{
  "success": true,
  "message": "文档删除成功"
}
```

### 3.6 下载文档
**接口**: `GET /documents/:id/download`

**响应**: 文件流（Content-Type根据文件类型设置）

**响应头**:
```
Content-Disposition: attachment; filename="document.pdf"
Content-Type: application/pdf
Content-Length: 1024000
```

## 4. 搜索API

### 4.1 搜索文档
**接口**: `GET /search`

**查询参数**:
- `q`: 搜索关键词（必需）
- `tags`: 标签过滤（可选，逗号分隔）
- `type`: 文件类型过滤（可选）
- `page`: 页码（默认1）
- `limit`: 每页数量（默认20）
- `sort`: 排序方式（relevance/date/title）

**请求示例**: `GET /search?q=技术&tags=文档&sort=date&page=1&limit=10`

**响应**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": 1,
        "title": "技术文档示例",
        "description": "这是一个技术文档",
        "file_name": "tech_doc.pdf",
        "relevance_score": 0.95,
        "uploader": {
          "id": 1,
          "username": "testuser"
        },
        "tags": [
          {"id": 1, "name": "技术文档", "color": "#1890ff"}
        ],
        "created_at": "2023-12-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    },
    "filters": {
      "applied_tags": ["技术文档"],
      "available_tags": [
        {"id": 1, "name": "技术文档", "count": 15},
        {"id": 2, "name": "会议纪要", "count": 8}
      ]
    }
  }
}
```

## 5. 标签管理API

### 5.1 获取标签列表
**接口**: `GET /tags`

**查询参数**:
- `search`: 搜索标签名称
- `sort`: 排序方式（name/usage_count/created_at）

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "技术文档",
      "color": "#1890ff",
      "description": "技术相关文档",
      "usage_count": 15,
      "created_by": {
        "id": 1,
        "username": "admin"
      },
      "created_at": "2023-12-01T08:00:00Z"
    }
  ]
}
```

### 5.2 创建标签
**接口**: `POST /tags`

**请求体**:
```json
{
  "name": "新标签",
  "color": "#52c41a",
  "description": "标签描述"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "新标签",
    "color": "#52c41a",
    "description": "标签描述",
    "usage_count": 0,
    "created_by": 1,
    "created_at": "2023-12-01T11:00:00Z"
  },
  "message": "标签创建成功"
}
```

### 5.3 更新标签
**接口**: `PUT /tags/:id`

**请求体**:
```json
{
  "name": "更新后的标签",
  "color": "#faad14",
  "description": "更新后的描述"
}
```

### 5.4 删除标签
**接口**: `DELETE /tags/:id`

**响应**:
```json
{
  "success": true,
  "message": "标签删除成功"
}
```

### 5.5 为文档添加标签
**接口**: `POST /documents/:documentId/tags`

**请求体**:
```json
{
  "tag_ids": [1, 2, 3]
}
```

### 5.6 从文档移除标签
**接口**: `DELETE /documents/:documentId/tags/:tagId`

## 6. 权限管理API

### 6.1 获取文档权限
**接口**: `GET /documents/:id/permissions`

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": {
        "id": 2,
        "username": "user2",
        "email": "user2@example.com"
      },
      "permission_type": "read",
      "granted_by": {
        "id": 1,
        "username": "admin"
      },
      "expires_at": null,
      "created_at": "2023-12-01T10:00:00Z"
    }
  ]
}
```

### 6.2 设置文档权限
**接口**: `POST /permissions`

**请求体**:
```json
{
  "user_id": 2,
  "document_id": 1,
  "permission_type": "read",
  "expires_at": "2024-12-01T00:00:00Z"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 2,
    "document_id": 1,
    "permission_type": "read",
    "expires_at": "2024-12-01T00:00:00Z",
    "granted_by": 1,
    "created_at": "2023-12-01T11:00:00Z"
  },
  "message": "权限设置成功"
}
```

### 6.3 更新权限
**接口**: `PUT /permissions/:id`

**请求体**:
```json
{
  "permission_type": "write",
  "expires_at": null
}
```

### 6.4 删除权限
**接口**: `DELETE /permissions/:id`

## 7. 用户管理API（管理员专用）

### 7.1 获取用户列表
**接口**: `GET /users`

**权限要求**: 管理员

**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `search`: 搜索用户名或邮箱
- `role`: 角色过滤

**响应**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "role": "member",
        "is_active": true,
        "last_login_at": "2023-12-01T09:00:00Z",
        "created_at": "2023-12-01T08:00:00Z",
        "document_count": 5,
        "upload_size": 50000000
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### 7.2 更新用户信息
**接口**: `PUT /users/:id`

**权限要求**: 管理员或用户本人

**请求体**:
```json
{
  "username": "newusername",
  "email": "newemail@example.com",
  "role": "admin",
  "is_active": true
}
```

### 7.3 禁用/启用用户
**接口**: `PATCH /users/:id/status`

**权限要求**: 管理员

**请求体**:
```json
{
  "is_active": false
}
```

### 7.4 删除用户
**接口**: `DELETE /users/:id`

**权限要求**: 管理员

## 8. 系统API

### 8.1 获取系统统计
**接口**: `GET /system/stats`

**权限要求**: 管理员

**响应**:
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 100,
      "active": 85,
      "admins": 3
    },
    "documents": {
      "total": 500,
      "public": 200,
      "total_size": 1073741824
    },
    "tags": {
      "total": 25,
      "most_used": [
        {"name": "技术文档", "count": 150},
        {"name": "会议纪要", "count": 80}
      ]
    },
    "activity": {
      "uploads_today": 5,
      "downloads_today": 25,
      "active_users_today": 15
    }
  }
}
```

### 8.2 获取操作日志
**接口**: `GET /system/logs`

**权限要求**: 管理员

**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `action`: 操作类型过滤
- `user_id`: 用户过滤
- `start_date`: 开始日期
- `end_date`: 结束日期

**响应**:
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "user": {
          "id": 1,
          "username": "testuser"
        },
        "action": "upload",
        "resource_type": "document",
        "resource_id": 1,
        "details": {
          "file_name": "document.pdf",
          "file_size": 1024000
        },
        "ip_address": "192.168.1.100",
        "created_at": "2023-12-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1000,
      "pages": 20
    }
  }
}
```

## 9. 错误代码定义

| 错误代码 | HTTP状态码 | 说明 |
|----------|------------|------|
| VALIDATION_ERROR | 400 | 请求参数验证失败 |
| UNAUTHORIZED | 401 | 未提供认证信息或认证失败 |
| FORBIDDEN | 403 | 权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 资源冲突（如用户名已存在） |
| FILE_TOO_LARGE | 413 | 文件大小超出限制 |
| UNSUPPORTED_FILE_TYPE | 415 | 不支持的文件类型 |
| RATE_LIMIT_EXCEEDED | 429 | 请求频率超出限制 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| DATABASE_ERROR | 500 | 数据库操作错误 |
| FILE_UPLOAD_ERROR | 500 | 文件上传错误 |

## 10. 接口限流

### 10.1 限流规则
- 认证接口：每分钟5次请求
- 上传接口：每分钟3次请求
- 搜索接口：每分钟30次请求
- 其他接口：每分钟60次请求

### 10.2 限流响应
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "details": "请求频率超出限制，请稍后再试"
  },
  "message": "请求过于频繁"
}
```

## 11. API版本控制

### 11.1 版本策略
- URL版本控制：`/api/v1/`
- Header版本控制：`API-Version: v1`
- 向后兼容性：支持3个版本

### 11.2 版本弃用
- 提前3个月通知
- 响应头包含弃用信息：`Deprecated: true`
- 升级指南和迁移文档

## 12. 测试示例

### 12.1 Postman集合
提供完整的Postman测试集合，包含：
- 环境变量配置
- 认证流程测试
- 各模块功能测试
- 错误场景测试

### 12.2 curl示例

**登录获取Token**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**上传文档**:
```bash
curl -X POST http://localhost:3000/api/v1/documents \
  -H "Authorization: Bearer your_token_here" \
  -F "file=@document.pdf" \
  -F "title=测试文档" \
  -F "description=这是一个测试文档"
```

**搜索文档**:
```bash
curl -X GET "http://localhost:3000/api/v1/search?q=技术&tags=文档&page=1&limit=10" \
  -H "Authorization: Bearer your_token_here"
```