# 部署指南文档

## 1. 部署概述

### 1.1 部署环境要求
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / macOS 10.15+
- **Node.js**: 18.x 或更高版本
- **内存**: 最少 2GB，推荐 4GB+
- **磁盘空间**: 最少 10GB，推荐 50GB+
- **网络**: 稳定的互联网连接

### 1.2 部署架构
```
┌─────────────────────────────────────────────────┐
│                负载均衡器 (可选)                  │
│              (Nginx/Apache)                    │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────┐
│                应用服务器                        │
│  ┌─────────────┐  ┌─────────────┐              │
│  │   前端      │  │   后端      │              │
│  │  (React)    │  │ (Node.js)   │              │
│  └─────────────┘  └─────────────┘              │
│                     │                          │
│  ┌─────────────────┴───────────────┐          │
│  │        数据存储                  │          │
│  │  ┌─────────────┐ ┌──────────────┐│          │
│  │  │   SQLite    │ │ 文件存储     ││          │
│  │  │   数据库     │ │ (uploads/)   ││          │
│  │  └─────────────┘ └──────────────┘│          │
│  └─────────────────────────────────┘          │
└─────────────────────────────────────────────────┘
```

## 2. 环境准备

### 2.1 系统依赖安装

#### Ubuntu/Debian
```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装必要工具
sudo apt install -y curl wget git build-essential

# 安装Node.js (使用NodeSource仓库)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version

# 安装PM2 (生产环境进程管理)
sudo npm install -y pm2 -g

# 安装Nginx (可选，用作反向代理)
sudo apt install -y nginx

# 创建应用用户
sudo adduser --system --group knowledge-base
```

#### CentOS/RHEL
```bash
# 更新系统包
sudo yum update -y

# 安装EPEL仓库
sudo yum install -y epel-release

# 安装必要工具
sudo yum groupinstall -y "Development Tools"
sudo yum install -y curl wget git

# 安装Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 安装PM2
sudo npm install -y pm2 -g

# 安装Nginx
sudo yum install -y nginx

# 创建应用用户
sudo adduser knowledge-base
```

#### macOS
```bash
# 安装Homebrew (如果尚未安装)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装Node.js
brew install node

# 安装PM2
npm install -y pm2 -g

# 安装Nginx (可选)
brew install nginx
```

### 2.2 防火墙配置
```bash
# Ubuntu (ufw)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

## 3. 应用部署

### 3.1 获取源码
```bash
# 方式1: 从Git仓库克隆
git clone https://github.com/yourorg/TeamKnowledgeManagementTool.git
cd TeamKnowledgeManagementTool

# 方式2: 下载发布包
wget https://github.com/yourorg/TeamKnowledgeManagementTool/releases/latest/download/app.tar.gz
tar -xzf app.tar.gz
cd TeamKnowledgeManagementTool

# 切换到应用用户
sudo chown -R knowledge-base:knowledge-base .
sudo -u knowledge-base -i
cd /path/to/TeamKnowledgeManagementTool
```

### 3.2 后端部署

#### 3.2.1 安装依赖
```bash
cd backend
npm install --only=production

# 如果需要安装开发依赖（用于构建）
npm install
```

#### 3.2.2 环境配置
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

环境变量配置示例：
```bash
# .env
# 服务器配置
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# 数据库配置
DATABASE_PATH=./database/knowledge_base.db

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-here
REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=15m
REFRESH_EXPIRES_IN=7d

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.txt,.md,.xls,.xlsx

# 安全配置
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-here

# CORS配置
CORS_ORIGIN=https://yourdomain.com

# 日志配置
LOG_LEVEL=info
LOG_DIR=./logs

# 邮件配置 (可选)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=your-email-password

# Redis配置 (可选，用于缓存和限流)
REDIS_URL=redis://localhost:6379
```

#### 3.2.3 数据库初始化
```bash
# 创建数据库目录
mkdir -p database uploads logs

# 运行数据库迁移
npm run migrate

# 创建初始管理员账户
npm run seed

# 设置正确的权限
chmod 600 database/knowledge_base.db
chmod 755 uploads
chmod 755 logs
```

#### 3.2.4 后端服务启动
```bash
# 开发环境启动
npm run dev

# 生产环境启动
npm start

# 使用PM2启动 (推荐)
pm2 start ecosystem.config.js
```

### 3.3 前端部署

#### 3.3.1 构建前端
```bash
cd frontend

# 安装依赖
npm install

# 配置生产环境变量
cp .env.example .env.production

# 编辑生产环境配置
nano .env.production
```

前端环境变量：
```bash
# .env.production
VITE_API_BASE_URL=/api/v1
VITE_APP_TITLE=团队知识库管理工具
VITE_UPLOAD_MAX_SIZE=104857600
VITE_SUPPORTED_FILE_TYPES=.pdf,.doc,.docx,.txt,.md,.xls,.xlsx
```

```bash
# 构建生产版本
npm run build

# 构建产物位于 dist/ 目录
ls -la dist/
```

#### 3.3.2 静态文件服务
```bash
# 方式1: 使用Nginx服务静态文件 (推荐)
sudo cp -r dist/* /var/www/html/

# 方式2: 使用Node.js服务静态文件
# 在后端配置中添加静态文件服务
```

## 4. Web服务器配置

### 4.1 Nginx配置

#### 4.1.1 基本配置
```nginx
# /etc/nginx/sites-available/knowledge-base
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL配置
    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 客户端最大请求体大小
    client_max_body_size 100M;

    # 静态文件服务
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;

        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 文件上传特殊处理
    location /api/v1/documents {
        proxy_pass http://localhost:3001;
        proxy_request_buffering off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 上传超时设置
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }

    # 错误页面
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;

    location = /50x.html {
        root /var/www/html;
    }
}
```

#### 4.1.2 启用配置
```bash
# 创建软链接启用站点
sudo ln -s /etc/nginx/sites-available/knowledge-base /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重新加载配置
sudo systemctl reload nginx

# 启用并启动Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 4.2 SSL/TLS配置

#### 4.2.1 使用Let's Encrypt
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 设置自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 4.2.2 手动SSL证书
```bash
# 创建SSL目录
sudo mkdir -p /etc/ssl/certs /etc/ssl/private

# 复制证书文件
sudo cp yourdomain.com.crt /etc/ssl/certs/
sudo cp yourdomain.com.key /etc/ssl/private/

# 设置权限
sudo chmod 644 /etc/ssl/certs/yourdomain.com.crt
sudo chmod 600 /etc/ssl/private/yourdomain.com.key
```

## 5. 进程管理

### 5.1 PM2配置

#### 5.1.1 生态系统配置
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'knowledge-base-api',
    script: './src/app.js',
    cwd: './backend',
    instances: 'max', // 使用所有CPU核心
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',

    // 自动重启配置
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',

    // 健康检查
    health_check: {
      url: 'http://localhost:3001/health',
      interval: 30000,
      timeout: 5000
    }
  }]
};
```

#### 5.1.2 PM2命令
```bash
# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status
pm2 list

# 查看日志
pm2 logs knowledge-base-api
pm2 logs --lines 100

# 监控
pm2 monit

# 重启应用
pm2 restart knowledge-base-api

# 停止应用
pm2 stop knowledge-base-api

# 删除应用
pm2 delete knowledge-base-api

# 保存PM2配置
pm2 save

# 设置开机启动
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u knowledge-base --hp /home/knowledge-base
```

### 5.2 Systemd服务配置

```ini
# /etc/systemd/system/knowledge-base.service
[Unit]
Description=Knowledge Base Management Tool
After=network.target

[Service]
Type=simple
User=knowledge-base
Group=knowledge-base
WorkingDirectory=/opt/knowledge-base
ExecStart=/usr/bin/node src/app.js
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=5
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=knowledge-base
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

```bash
# 启用并启动服务
sudo systemctl daemon-reload
sudo systemctl enable knowledge-base
sudo systemctl start knowledge-base

# 查看状态
sudo systemctl status knowledge-base

# 查看日志
sudo journalctl -u knowledge-base -f
```

## 6. 监控和日志

### 6.1 应用监控

#### 6.1.1 健康检查端点
```javascript
// backend/src/routes/health.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  };

  // 检查数据库连接
  try {
    const db = require('../config/database');
    await db.prepare('SELECT 1').get();
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    health.status = 'error';
  }

  // 检查文件系统
  try {
    const uploadsDir = process.env.UPLOAD_DIR || './uploads';
    await fs.promises.access(uploadsDir, fs.constants.W_OK);
    health.filesystem = 'writable';
  } catch (error) {
    health.filesystem = 'readonly';
    health.status = 'warning';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
```

#### 6.1.2 基本监控脚本
```bash
#!/bin/bash
# scripts/monitor.sh

# 配置
API_URL="http://localhost:3001/health"
LOG_FILE="/var/log/knowledge-base/monitor.log"
EMAIL="admin@yourdomain.com"

# 检查服务健康状态
check_health() {
    local response=$(curl -s -w "%{http_code}" "$API_URL" -o /dev/null)

    if [ "$response" = "200" ]; then
        echo "$(date): 服务正常" >> "$LOG_FILE"
        return 0
    else
        echo "$(date): 服务异常 (HTTP $response)" >> "$LOG_FILE"
        return 1
    fi
}

# 检查磁盘空间
check_disk_space() {
    local usage=$(df /opt/knowledge-base | awk 'NR==2{print $5}' | sed 's/%//')

    if [ "$usage" -gt 90 ]; then
        echo "$(date): 磁盘空间不足 ($usage%)" >> "$LOG_FILE"
        echo "磁盘空间警告: $usage%" | mail -s "Knowledge Base 磁盘空间警告" "$EMAIL"
        return 1
    fi

    return 0
}

# 主监控逻辑
main() {
    if ! check_health; then
        echo "服务健康检查失败" | mail -s "Knowledge Base 服务异常" "$EMAIL"

        # 尝试重启服务
        systemctl restart knowledge-base
        sleep 30

        if ! check_health; then
            echo "服务重启后仍然异常" | mail -s "Knowledge Base 严重故障" "$EMAIL"
        fi
    fi

    check_disk_space
}

# 执行监控
main
```

### 6.2 日志管理

#### 6.2.1 日志轮转配置
```bash
# /etc/logrotate.d/knowledge-base
/opt/knowledge-base/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 knowledge-base knowledge-base
    postrotate
        systemctl reload knowledge-base
    endscript
}

/var/log/nginx/*knowledge-base*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
```

#### 6.2.2 日志分析脚本
```bash
#!/bin/bash
# scripts/log-analysis.sh

LOG_DIR="/opt/knowledge-base/logs"
REPORT_FILE="/tmp/daily-report.txt"

# 生成每日报告
generate_daily_report() {
    local date=$(date --date="yesterday" +%Y-%m-%d)

    echo "Knowledge Base 每日报告 - $date" > "$REPORT_FILE"
    echo "=================================" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    # 登录统计
    echo "登录统计:" >> "$REPORT_FILE"
    grep "$date.*login_success" "$LOG_DIR/security.log" | wc -l | \
        xargs -I {} echo "成功登录: {} 次" >> "$REPORT_FILE"

    grep "$date.*login_failure" "$LOG_DIR/security.log" | wc -l | \
        xargs -I {} echo "失败登录: {} 次" >> "$REPORT_FILE"

    echo "" >> "$REPORT_FILE"

    # 文档操作统计
    echo "文档操作统计:" >> "$REPORT_FILE"
    grep "$date.*document.*upload" "$LOG_DIR/app.log" | wc -l | \
        xargs -I {} echo "文档上传: {} 次" >> "$REPORT_FILE"

    grep "$date.*document.*download" "$LOG_DIR/app.log" | wc -l | \
        xargs -I {} echo "文档下载: {} 次" >> "$REPORT_FILE"

    echo "" >> "$REPORT_FILE"

    # 错误统计
    echo "错误统计:" >> "$REPORT_FILE"
    grep "$date.*ERROR" "$LOG_DIR/app.log" | wc -l | \
        xargs -I {} echo "应用错误: {} 次" >> "$REPORT_FILE"

    # 发送报告
    mail -s "Knowledge Base 每日报告 - $date" admin@yourdomain.com < "$REPORT_FILE"
}

generate_daily_report
```

## 7. 备份和恢复

### 7.1 自动备份脚本
```bash
#!/bin/bash
# scripts/backup.sh

# 配置
BACKUP_DIR="/var/backups/knowledge-base"
APP_DIR="/opt/knowledge-base"
DB_FILE="$APP_DIR/database/knowledge_base.db"
UPLOADS_DIR="$APP_DIR/uploads"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 数据库备份
echo "开始数据库备份..."
sqlite3 "$DB_FILE" ".backup $BACKUP_DIR/database_$DATE.db"

# 文件备份
echo "开始文件备份..."
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C "$APP_DIR" uploads/

# 配置备份
echo "开始配置备份..."
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" -C "$APP_DIR" .env ecosystem.config.js

# 创建备份清单
echo "创建备份清单..."
cat > "$BACKUP_DIR/backup_$DATE.txt" << EOF
备份时间: $(date)
数据库文件: database_$DATE.db
上传文件: uploads_$DATE.tar.gz
配置文件: config_$DATE.tar.gz
应用版本: $(cd $APP_DIR && git rev-parse HEAD 2>/dev/null || echo "unknown")
EOF

# 清理旧备份
echo "清理旧备份..."
find "$BACKUP_DIR" -name "*.db" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.txt" -mtime +$RETENTION_DAYS -delete

echo "备份完成: $BACKUP_DIR"

# 验证备份
if [ -f "$BACKUP_DIR/database_$DATE.db" ] && [ -f "$BACKUP_DIR/uploads_$DATE.tar.gz" ]; then
    echo "备份验证成功"
    exit 0
else
    echo "备份验证失败"
    exit 1
fi
```

### 7.2 恢复脚本
```bash
#!/bin/bash
# scripts/restore.sh

# 使用方法: ./restore.sh YYYYMMDD_HHMMSS

if [ $# -ne 1 ]; then
    echo "使用方法: $0 <备份时间戳>"
    echo "示例: $0 20231201_143000"
    exit 1
fi

BACKUP_DATE="$1"
BACKUP_DIR="/var/backups/knowledge-base"
APP_DIR="/opt/knowledge-base"

# 检查备份文件是否存在
DB_BACKUP="$BACKUP_DIR/database_$BACKUP_DATE.db"
UPLOADS_BACKUP="$BACKUP_DIR/uploads_$BACKUP_DATE.tar.gz"
CONFIG_BACKUP="$BACKUP_DIR/config_$BACKUP_DATE.tar.gz"

if [ ! -f "$DB_BACKUP" ] || [ ! -f "$UPLOADS_BACKUP" ]; then
    echo "错误: 备份文件不存在"
    exit 1
fi

echo "准备恢复备份: $BACKUP_DATE"
read -p "这将覆盖现有数据，确认继续? (y/N): " confirm

if [ "$confirm" != "y" ]; then
    echo "恢复已取消"
    exit 0
fi

# 停止服务
echo "停止服务..."
systemctl stop knowledge-base
systemctl stop nginx

# 创建当前数据备份
echo "创建当前数据备份..."
CURRENT_DATE=$(date +%Y%m%d_%H%M%S)
cp "$APP_DIR/database/knowledge_base.db" "$BACKUP_DIR/pre_restore_$CURRENT_DATE.db"

# 恢复数据库
echo "恢复数据库..."
cp "$DB_BACKUP" "$APP_DIR/database/knowledge_base.db"

# 恢复文件
echo "恢复上传文件..."
rm -rf "$APP_DIR/uploads"
tar -xzf "$UPLOADS_BACKUP" -C "$APP_DIR"

# 恢复配置 (可选)
if [ -f "$CONFIG_BACKUP" ]; then
    echo "恢复配置文件..."
    tar -xzf "$CONFIG_BACKUP" -C "$APP_DIR"
fi

# 设置权限
echo "设置权限..."
chown -R knowledge-base:knowledge-base "$APP_DIR"
chmod 600 "$APP_DIR/database/knowledge_base.db"

# 启动服务
echo "启动服务..."
systemctl start knowledge-base
systemctl start nginx

# 验证恢复
sleep 10
if curl -s "http://localhost:3001/health" > /dev/null; then
    echo "恢复成功，服务正常运行"
else
    echo "警告: 服务可能未正常启动，请检查日志"
fi
```

## 8. 性能优化

### 8.1 数据库优化
```sql
-- 数据库索引优化
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA cache_size=10000;
PRAGMA temp_store=memory;

-- 创建复合索引
CREATE INDEX IF NOT EXISTS idx_documents_user_public ON documents(upload_user_id, is_public);
CREATE INDEX IF NOT EXISTS idx_documents_created_public ON documents(created_at, is_public);
CREATE INDEX IF NOT EXISTS idx_permissions_user_doc ON permissions(user_id, document_id);

-- 定期维护
PRAGMA optimize;
VACUUM;
ANALYZE;
```

### 8.2 缓存配置
```javascript
// 应用层缓存配置
const redis = require('redis');
const client = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('Redis服务器拒绝连接');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('重试时间耗尽');
        }
        return Math.min(options.attempt * 100, 3000);
    }
});

// 缓存中间件
const cache = (duration = 300) => {
    return async (req, res, next) => {
        const key = `cache:${req.originalUrl}:${req.user?.sub || 'anonymous'}`;

        try {
            const cached = await client.get(key);
            if (cached) {
                return res.json(JSON.parse(cached));
            }

            // 拦截res.json方法
            const originalJson = res.json.bind(res);
            res.json = (data) => {
                if (res.statusCode === 200) {
                    client.setex(key, duration, JSON.stringify(data));
                }
                return originalJson(data);
            };

            next();
        } catch (error) {
            // 缓存失败时继续执行
            next();
        }
    };
};
```

### 8.3 Nginx优化
```nginx
# nginx.conf 优化配置

# 工作进程数
worker_processes auto;

# 事件配置
events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # 基本配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # 缓存配置
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=app_cache:10m max_size=1g
                     inactive=60m use_temp_path=off;

    # 限流配置
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=upload:10m rate=1r/s;

    # 在server块中应用
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        # ... 其他配置
    }

    location /api/v1/documents {
        limit_req zone=upload burst=5 nodelay;
        # ... 其他配置
    }
}
```

## 9. 安全加固

### 9.1 系统安全
```bash
# 系统安全加固脚本
#!/bin/bash

# 更新系统
apt update && apt upgrade -y

# 配置自动安全更新
apt install unattended-upgrades -y
dpkg-reconfigure -plow unattended-upgrades

# 配置fail2ban
apt install fail2ban -y

cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

systemctl enable fail2ban
systemctl start fail2ban

# 配置SSH安全
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh

# 设置文件权限
chmod 700 /home/knowledge-base/.ssh
chmod 600 /home/knowledge-base/.ssh/authorized_keys
```

### 9.2 应用安全
```bash
# 应用安全检查脚本
#!/bin/bash

# 检查敏感文件权限
check_permissions() {
    echo "检查文件权限..."

    local files=(
        "/opt/knowledge-base/.env:600"
        "/opt/knowledge-base/database/knowledge_base.db:600"
        "/opt/knowledge-base/logs:755"
        "/opt/knowledge-base/uploads:755"
    )

    for item in "${files[@]}"; do
        IFS=':' read -r file expected_perm <<< "$item"
        if [ -e "$file" ]; then
            actual_perm=$(stat -c "%a" "$file")
            if [ "$actual_perm" != "$expected_perm" ]; then
                echo "警告: $file 权限不正确 (当前: $actual_perm, 期望: $expected_perm)"
                chmod "$expected_perm" "$file"
            fi
        fi
    done
}

# 检查依赖包漏洞
check_vulnerabilities() {
    echo "检查依赖包漏洞..."
    cd /opt/knowledge-base/backend
    npm audit --audit-level moderate

    cd ../frontend
    npm audit --audit-level moderate
}

# 执行检查
check_permissions
check_vulnerabilities
```

## 10. 部署检查清单

### 10.1 部署前检查
```markdown
# 部署前检查清单

## 环境准备
- [ ] 服务器规格满足要求
- [ ] 操作系统已更新
- [ ] 必要软件已安装 (Node.js, Nginx等)
- [ ] 防火墙已配置
- [ ] 域名已解析

## 应用配置
- [ ] 环境变量已设置
- [ ] 数据库已初始化
- [ ] SSL证书已配置
- [ ] 文件权限已设置正确

## 安全配置
- [ ] JWT密钥已生成
- [ ] 密码策略已配置
- [ ] 文件上传限制已设置
- [ ] 安全头已配置

## 监控配置
- [ ] 日志记录已配置
- [ ] 备份策略已实施
- [ ] 监控脚本已设置
- [ ] 告警通知已配置
```

### 10.2 部署后验证
```bash
#!/bin/bash
# 部署后验证脚本

# 基础服务检查
echo "检查基础服务..."
systemctl is-active --quiet nginx && echo "✓ Nginx运行正常" || echo "✗ Nginx未运行"
systemctl is-active --quiet knowledge-base && echo "✓ 应用服务运行正常" || echo "✗ 应用服务未运行"

# 端口检查
echo "检查端口..."
ss -tlnp | grep :80 > /dev/null && echo "✓ 端口80开放" || echo "✗ 端口80未开放"
ss -tlnp | grep :443 > /dev/null && echo "✓ 端口443开放" || echo "✗ 端口443未开放"
ss -tlnp | grep :3001 > /dev/null && echo "✓ 端口3001开放" || echo "✗ 端口3001未开放"

# HTTP响应检查
echo "检查HTTP响应..."
http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
if [ "$http_code" = "301" ] || [ "$http_code" = "302" ]; then
    echo "✓ HTTP重定向正常"
else
    echo "✗ HTTP重定向异常 (状态码: $http_code)"
fi

# HTTPS检查
echo "检查HTTPS..."
https_code=$(curl -s -o /dev/null -w "%{http_code}" https://localhost -k)
if [ "$https_code" = "200" ]; then
    echo "✓ HTTPS访问正常"
else
    echo "✗ HTTPS访问异常 (状态码: $https_code)"
fi

# API健康检查
echo "检查API健康状态..."
api_response=$(curl -s http://localhost:3001/health)
if echo "$api_response" | grep -q '"status":"ok"'; then
    echo "✓ API健康检查通过"
else
    echo "✗ API健康检查失败"
fi

# 数据库连接检查
echo "检查数据库连接..."
if echo "$api_response" | grep -q '"database":"connected"'; then
    echo "✓ 数据库连接正常"
else
    echo "✗ 数据库连接异常"
fi

echo "验证完成"
```

这个部署指南提供了从环境准备到生产部署的完整流程，包括性能优化、安全加固、监控配置等方面的详细说明，确保系统能够稳定、安全地运行在生产环境中。