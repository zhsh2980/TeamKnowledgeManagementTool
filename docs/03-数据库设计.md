# 数据库设计文档

## 1. 数据库概述

### 1.1 数据库选择
- **数据库类型**: SQLite 3.x
- **选择理由**: 轻量级、零配置、文件数据库、适合小型团队应用
- **存储路径**: `./database/knowledge_base.db`

### 1.2 设计原则
- 遵循第三范式，减少数据冗余
- 合理使用外键约束保证数据完整性
- 为常用查询字段建立索引
- 支持软删除（逻辑删除）

## 2. 实体关系图 (ERD)

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    users    │       │   permissions   │       │ documents   │
│             │       │                 │       │             │
│ id (PK)     │       │ id (PK)         │       │ id (PK)     │
│ username    │◄──────┤ user_id (FK)    │       │ title       │
│ email       │       │ document_id (FK)├──────►│ description │
│ password    │       │ permission_type │       │ file_name   │
│ role        │       │ granted_by (FK) │       │ file_path   │
│ created_at  │       │ created_at      │       │ file_size   │
│ updated_at  │       └─────────────────┘       │ mime_type   │
│             │                                 │ upload_user │
│             │                                 │ created_at  │
│             │                                 │ updated_at  │
│             │                                 │ deleted_at  │
└─────────────┘                                 └─────────────┘
                                                        │
                                                        │
┌─────────────┐       ┌─────────────────┐               │
│    tags     │       │ document_tags   │               │
│             │       │                 │               │
│ id (PK)     │       │ id (PK)         │               │
│ name        │◄──────┤ tag_id (FK)     │               │
│ color       │       │ document_id (FK)├───────────────┘
│ created_at  │       │ created_at      │
│ updated_at  │       └─────────────────┘
│ deleted_at  │
└─────────────┘
```

## 3. 数据表设计

### 3.1 用户表 (users)

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'member') DEFAULT 'member',
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT 1,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

**字段说明**:
- `id`: 主键，自增
- `username`: 用户名，唯一约束
- `email`: 邮箱，唯一约束
- `password_hash`: 密码哈希值（bcrypt加密）
- `role`: 用户角色（admin/member）
- `avatar_url`: 头像URL（可选）
- `is_active`: 账户是否激活
- `last_login_at`: 最后登录时间
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `deleted_at`: 软删除时间

**索引设计**:
```sql
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
```

### 3.2 文档表 (documents)

```sql
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    upload_user_id INTEGER NOT NULL,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT 0,
    is_archived BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (upload_user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**字段说明**:
- `id`: 主键，自增
- `title`: 文档标题
- `description`: 文档描述
- `file_name`: 原始文件名
- `file_path`: 服务器存储路径
- `file_size`: 文件大小（字节）
- `mime_type`: 文件MIME类型
- `upload_user_id`: 上传用户ID（外键）
- `view_count`: 查看次数
- `download_count`: 下载次数
- `is_public`: 是否公开文档
- `is_archived`: 是否归档
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `deleted_at`: 软删除时间

**索引设计**:
```sql
CREATE INDEX idx_documents_upload_user ON documents(upload_user_id);
CREATE INDEX idx_documents_title ON documents(title);
CREATE INDEX idx_documents_mime_type ON documents(mime_type);
CREATE INDEX idx_documents_public ON documents(is_public);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_documents_deleted_at ON documents(deleted_at);
```

### 3.3 标签表 (tags)

```sql
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#1890ff',
    description TEXT,
    created_by INTEGER,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

**字段说明**:
- `id`: 主键，自增
- `name`: 标签名称，唯一约束
- `color`: 标签颜色（十六进制）
- `description`: 标签描述
- `created_by`: 创建者ID（外键）
- `usage_count`: 使用次数（冗余字段，提高查询性能）
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `deleted_at`: 软删除时间

**索引设计**:
```sql
CREATE UNIQUE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_created_by ON tags(created_by);
CREATE INDEX idx_tags_usage_count ON tags(usage_count);
```

### 3.4 文档标签关联表 (document_tags)

```sql
CREATE TABLE document_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(document_id, tag_id)
);
```

**字段说明**:
- `id`: 主键，自增
- `document_id`: 文档ID（外键）
- `tag_id`: 标签ID（外键）
- `created_by`: 关联创建者
- `created_at`: 创建时间
- 联合唯一约束防止重复关联

**索引设计**:
```sql
CREATE INDEX idx_document_tags_document ON document_tags(document_id);
CREATE INDEX idx_document_tags_tag ON document_tags(tag_id);
CREATE UNIQUE INDEX idx_document_tags_unique ON document_tags(document_id, tag_id);
```

### 3.5 权限表 (permissions)

```sql
CREATE TABLE permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    document_id INTEGER NOT NULL,
    permission_type ENUM('read', 'write', 'admin') NOT NULL,
    granted_by INTEGER NOT NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, document_id)
);
```

**字段说明**:
- `id`: 主键，自增
- `user_id`: 用户ID（外键）
- `document_id`: 文档ID（外键）
- `permission_type`: 权限类型（read/write/admin）
- `granted_by`: 授权者ID（外键）
- `expires_at`: 权限过期时间（可为空表示永久）
- `created_at`: 创建时间
- `updated_at`: 更新时间
- 联合唯一约束确保一个用户对一个文档只有一种权限

**索引设计**:
```sql
CREATE INDEX idx_permissions_user ON permissions(user_id);
CREATE INDEX idx_permissions_document ON permissions(document_id);
CREATE INDEX idx_permissions_type ON permissions(permission_type);
CREATE UNIQUE INDEX idx_permissions_unique ON permissions(user_id, document_id);
```

### 3.6 操作日志表 (activity_logs)

```sql
CREATE TABLE activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INTEGER,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**字段说明**:
- `id`: 主键，自增
- `user_id`: 操作用户ID（外键）
- `action`: 操作类型（create/read/update/delete/login/logout等）
- `resource_type`: 资源类型（document/tag/user等）
- `resource_id`: 资源ID
- `details`: 操作详情（JSON格式）
- `ip_address`: 客户端IP地址
- `user_agent`: 用户代理信息
- `created_at`: 操作时间

**索引设计**:
```sql
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
```

## 4. 数据库初始化

### 4.1 数据库创建脚本

```sql
-- 启用外键约束
PRAGMA foreign_keys = ON;

-- 创建所有表
-- （表创建语句见上文）

-- 插入初始管理员账户
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@example.com', '$2b$10$hashedpassword', 'admin');

-- 插入默认标签
INSERT INTO tags (name, color, description) VALUES
('技术文档', '#1890ff', '技术相关文档'),
('会议纪要', '#52c41a', '会议记录文档'),
('项目资料', '#faad14', '项目相关资料'),
('培训材料', '#722ed1', '培训和学习资料');
```

### 4.2 数据迁移脚本

```sql
-- 版本1.0.0初始化脚本
-- migration_001_initial.sql

-- 版本1.1.0添加文档统计字段
-- migration_002_add_document_stats.sql
ALTER TABLE documents ADD COLUMN view_count INTEGER DEFAULT 0;
ALTER TABLE documents ADD COLUMN download_count INTEGER DEFAULT 0;

-- 版本1.2.0添加标签使用统计
-- migration_003_add_tag_usage.sql
ALTER TABLE tags ADD COLUMN usage_count INTEGER DEFAULT 0;

-- 更新现有标签的使用次数
UPDATE tags SET usage_count = (
    SELECT COUNT(*) FROM document_tags WHERE tag_id = tags.id
);
```

## 5. 查询优化

### 5.1 常用查询语句

**获取用户有权限的文档列表**:
```sql
SELECT DISTINCT d.*, u.username as uploader_name
FROM documents d
JOIN users u ON d.upload_user_id = u.id
LEFT JOIN permissions p ON d.id = p.document_id
WHERE (d.is_public = 1 OR d.upload_user_id = ? OR p.user_id = ?)
AND d.deleted_at IS NULL
ORDER BY d.created_at DESC
LIMIT ? OFFSET ?;
```

**搜索文档（标题和描述）**:
```sql
SELECT d.*, u.username as uploader_name
FROM documents d
JOIN users u ON d.upload_user_id = u.id
WHERE (d.title LIKE '%?%' OR d.description LIKE '%?%')
AND d.deleted_at IS NULL
AND (d.is_public = 1 OR d.upload_user_id = ? OR EXISTS (
    SELECT 1 FROM permissions p WHERE p.document_id = d.id AND p.user_id = ?
))
ORDER BY d.created_at DESC;
```

**获取文档及其标签**:
```sql
SELECT d.*, GROUP_CONCAT(t.name) as tags
FROM documents d
LEFT JOIN document_tags dt ON d.id = dt.document_id
LEFT JOIN tags t ON dt.tag_id = t.id
WHERE d.id = ?
GROUP BY d.id;
```

### 5.2 性能优化建议

1. **索引优化**:
   - 为经常查询的字段建立索引
   - 复合索引支持多字段查询
   - 定期分析查询计划

2. **查询优化**:
   - 使用预编译语句防止SQL注入
   - 避免SELECT *，只查询需要的字段
   - 合理使用LIMIT和OFFSET分页

3. **数据库维护**:
   - 定期VACUUM优化数据库
   - 监控数据库大小和性能
   - 备份策略制定

## 6. 数据完整性约束

### 6.1 外键约束
- 所有外键关系都设置了合适的级联操作
- 用户删除时相关权限记录级联删除
- 文档删除时相关标签关联和权限记录级联删除

### 6.2 唯一约束
- 用户名和邮箱唯一
- 标签名唯一
- 用户对文档的权限唯一
- 文档和标签的关联唯一

### 6.3 检查约束
```sql
-- 文件大小检查
ALTER TABLE documents ADD CONSTRAINT chk_file_size
CHECK (file_size > 0 AND file_size <= 104857600); -- 100MB

-- 用户角色检查
ALTER TABLE users ADD CONSTRAINT chk_user_role
CHECK (role IN ('admin', 'member'));

-- 权限类型检查
ALTER TABLE permissions ADD CONSTRAINT chk_permission_type
CHECK (permission_type IN ('read', 'write', 'admin'));
```

## 7. 备份和恢复策略

### 7.1 备份策略
- 每日自动备份数据库文件
- 保留30天的备份历史
- 关键操作前手动备份

### 7.2 备份脚本
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
DB_FILE="./database/knowledge_base.db"

mkdir -p $BACKUP_DIR
cp $DB_FILE "$BACKUP_DIR/knowledge_base_$DATE.db"

# 清理30天前的备份
find $BACKUP_DIR -name "knowledge_base_*.db" -mtime +30 -delete
```

## 8. 数据字典

### 8.1 枚举值定义

**用户角色 (user.role)**:
- `admin`: 管理员，拥有所有权限
- `member`: 普通成员，有限权限

**权限类型 (permissions.permission_type)**:
- `read`: 只读权限，可以查看和下载文档
- `write`: 写权限，可以修改文档信息和权限
- `admin`: 管理权限，可以删除文档

**操作类型 (activity_logs.action)**:
- `login`: 用户登录
- `logout`: 用户注销
- `create`: 创建资源
- `read`: 查看资源
- `update`: 更新资源
- `delete`: 删除资源
- `download`: 下载文档
- `share`: 分享文档

### 8.2 默认值说明
- 用户默认角色为 `member`
- 文档默认不公开 (`is_public = 0`)
- 标签默认颜色为蓝色 (`#1890ff`)
- 统计字段默认为0

## 9. 数据库升级计划

### 9.1 版本控制
- 使用语义化版本号（major.minor.patch）
- 每次架构变更都有对应的迁移脚本
- 支持前向和后向兼容

### 9.2 未来扩展考虑
- 文档版本控制（document_versions表）
- 用户组和团队支持（groups表）
- 文档评论系统（comments表）
- 全文搜索索引优化
- 分布式部署支持