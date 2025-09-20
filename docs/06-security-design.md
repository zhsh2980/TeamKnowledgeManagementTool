# 安全设计文档

## 1. 安全概述

### 1.1 安全目标
- **机密性（Confidentiality）**: 确保敏感数据只能被授权用户访问
- **完整性（Integrity）**: 保证数据在传输和存储过程中不被篡改
- **可用性（Availability）**: 确保系统服务的持续可用性
- **认证（Authentication）**: 验证用户身份的真实性
- **授权（Authorization）**: 控制用户对资源的访问权限
- **审计（Auditing）**: 记录和监控系统操作日志

### 1.2 威胁模型
- **未授权访问**: 恶意用户尝试访问系统和数据
- **数据泄露**: 敏感信息被非法获取
- **注入攻击**: SQL注入、XSS等代码注入攻击
- **会话劫持**: 用户会话被恶意劫持
- **文件上传攻击**: 恶意文件上传导致的安全风险
- **拒绝服务攻击**: 系统资源被恶意耗尽
- **内部威胁**: 内部用户的恶意操作

## 2. 认证安全

### 2.1 密码策略

#### 2.1.1 密码强度要求
```typescript
interface PasswordPolicy {
  minLength: 8;
  maxLength: 128;
  requireUppercase: true;
  requireLowercase: true;
  requireNumbers: true;
  requireSpecialChars: true;
  forbiddenPatterns: string[];
  historyLimit: 5; // 不能重复使用最近5个密码
}

const validatePassword = (password: string): ValidationResult => {
  const policy = getPasswordPolicy();
  const errors: string[] = [];

  if (password.length < policy.minLength) {
    errors.push(`密码长度至少${policy.minLength}位`);
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('密码必须包含大写字母');
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('密码必须包含小写字母');
  }

  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('密码必须包含数字');
  }

  if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密码必须包含特殊字符');
  }

  // 检查常见弱密码
  if (policy.forbiddenPatterns.some(pattern => password.includes(pattern))) {
    errors.push('密码不能包含常见的弱密码模式');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
```

#### 2.1.2 密码加密存储
```javascript
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

// 密码加密
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error('密码加密失败');
  }
};

// 密码验证
const verifyPassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('密码验证失败');
  }
};
```

### 2.2 JWT Token安全

#### 2.2.1 Token配置
```javascript
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_CONFIG = {
  accessTokenExpiry: '15m',      // 访问令牌15分钟过期
  refreshTokenExpiry: '7d',      // 刷新令牌7天过期
  algorithm: 'HS256',
  issuer: 'knowledge-base-app',
  audience: 'knowledge-base-users'
};

// 生成安全的密钥
const generateSecretKey = () => {
  return crypto.randomBytes(64).toString('hex');
};

// JWT_SECRET应该从环境变量读取
const JWT_SECRET = process.env.JWT_SECRET || generateSecretKey();
const REFRESH_SECRET = process.env.REFRESH_SECRET || generateSecretKey();
```

#### 2.2.2 Token生成和验证
```javascript
// 生成访问令牌
const generateAccessToken = (user) => {
  const payload = {
    sub: user.id,
    username: user.username,
    role: user.role,
    iss: JWT_CONFIG.issuer,
    aud: JWT_CONFIG.audience,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15分钟
  };

  return jwt.sign(payload, JWT_SECRET, {
    algorithm: JWT_CONFIG.algorithm
  });
};

// 生成刷新令牌
const generateRefreshToken = (user) => {
  const payload = {
    sub: user.id,
    type: 'refresh',
    iss: JWT_CONFIG.issuer,
    aud: JWT_CONFIG.audience
  };

  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: JWT_CONFIG.refreshTokenExpiry,
    algorithm: JWT_CONFIG.algorithm
  });
};

// Token验证中间件
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', details: '缺少认证信息' }
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // 检查令牌是否在黑名单中
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_REVOKED', details: '令牌已被撤销' }
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', details: '令牌已过期' }
      });
    }

    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', details: '无效的令牌' }
    });
  }
};
```

### 2.3 会话管理

#### 2.3.1 Token黑名单机制
```javascript
const Redis = require('redis');
const redisClient = Redis.createClient();

// 将Token加入黑名单
const blacklistToken = async (token, expiresIn) => {
  const key = `blacklist:${token}`;
  await redisClient.setex(key, expiresIn, 'revoked');
};

// 检查Token是否在黑名单中
const isTokenBlacklisted = async (token) => {
  const key = `blacklist:${token}`;
  const result = await redisClient.get(key);
  return result === 'revoked';
};

// 用户注销时撤销Token
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization.substring(7);
    const decoded = jwt.decode(token);

    if (decoded && decoded.exp) {
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      if (expiresIn > 0) {
        await blacklistToken(token, expiresIn);
      }
    }

    res.json({
      success: true,
      message: '注销成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'LOGOUT_ERROR', details: '注销失败' }
    });
  }
};
```

### 2.4 多因素认证（MFA）

#### 2.4.1 TOTP实现
```javascript
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// 生成MFA密钥
const generateMFASecret = (username) => {
  return speakeasy.generateSecret({
    name: `Knowledge Base (${username})`,
    issuer: 'Knowledge Base App',
    length: 32
  });
};

// 生成QR码
const generateQRCode = async (secret) => {
  try {
    return await qrcode.toDataURL(secret.otpauth_url);
  } catch (error) {
    throw new Error('QR码生成失败');
  }
};

// 验证TOTP令牌
const verifyTOTP = (token, secret) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // 允许前后2个时间窗口的误差
  });
};

// MFA验证中间件
const requireMFA = async (req, res, next) => {
  const { user } = req;

  if (user.mfa_enabled) {
    const mfaToken = req.headers['x-mfa-token'];

    if (!mfaToken) {
      return res.status(401).json({
        success: false,
        error: { code: 'MFA_REQUIRED', details: '需要多因素认证' }
      });
    }

    const userRecord = await getUserById(user.sub);
    const isValid = verifyTOTP(mfaToken, userRecord.mfa_secret);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_MFA_TOKEN', details: '无效的MFA令牌' }
      });
    }
  }

  next();
};
```

## 3. 授权安全

### 3.1 基于角色的访问控制（RBAC）

#### 3.1.1 权限定义
```typescript
enum Role {
  ADMIN = 'admin',
  MEMBER = 'member'
}

enum Permission {
  // 文档权限
  DOCUMENT_READ = 'document:read',
  DOCUMENT_WRITE = 'document:write',
  DOCUMENT_DELETE = 'document:delete',
  DOCUMENT_SHARE = 'document:share',

  // 标签权限
  TAG_READ = 'tag:read',
  TAG_WRITE = 'tag:write',
  TAG_DELETE = 'tag:delete',

  // 用户权限
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  USER_DELETE = 'user:delete',

  // 系统权限
  SYSTEM_ADMIN = 'system:admin'
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_WRITE,
    Permission.DOCUMENT_DELETE,
    Permission.DOCUMENT_SHARE,
    Permission.TAG_READ,
    Permission.TAG_WRITE,
    Permission.TAG_DELETE,
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.USER_DELETE,
    Permission.SYSTEM_ADMIN
  ],
  [Role.MEMBER]: [
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_WRITE,
    Permission.DOCUMENT_SHARE,
    Permission.TAG_READ
  ]
};
```

#### 3.1.2 权限检查中间件
```javascript
// 检查用户是否有指定权限
const hasPermission = (userRole, requiredPermission) => {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return userPermissions.includes(requiredPermission);
};

// 权限验证中间件
const requirePermission = (permission) => {
  return (req, res, next) => {
    const { user } = req;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', details: '未授权访问' }
      });
    }

    if (!hasPermission(user.role, permission)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', details: '权限不足' }
      });
    }

    next();
  };
};

// 资源级权限检查
const checkDocumentPermission = async (req, res, next) => {
  const { id: documentId } = req.params;
  const { user } = req;

  try {
    const document = await getDocumentById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', details: '文档不存在' }
      });
    }

    // 管理员有所有权限
    if (user.role === Role.ADMIN) {
      return next();
    }

    // 文档所有者有所有权限
    if (document.upload_user_id === user.sub) {
      return next();
    }

    // 公开文档所有人都可以读取
    if (document.is_public && req.method === 'GET') {
      return next();
    }

    // 检查是否有明确的权限分配
    const permission = await getDocumentPermission(documentId, user.sub);
    if (permission) {
      const actionPermissionMap = {
        'GET': ['read', 'write', 'admin'],
        'PUT': ['write', 'admin'],
        'DELETE': ['admin']
      };

      const allowedPermissions = actionPermissionMap[req.method] || [];
      if (allowedPermissions.includes(permission.permission_type)) {
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', details: '无权限访问此文档' }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', details: '权限检查失败' }
    });
  }
};
```

## 4. 数据安全

### 4.1 输入验证

#### 4.1.1 数据验证中间件
```javascript
const Joi = require('joi');

// 通用验证中间件
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          details: '请求参数验证失败',
          fields: errorDetails
        }
      });
    }

    req[property] = value;
    next();
  };
};

// 文档上传验证
const documentUploadSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(255)
    .trim()
    .required()
    .messages({
      'string.empty': '文档标题不能为空',
      'string.max': '文档标题不能超过255字符'
    }),

  description: Joi.string()
    .max(1000)
    .trim()
    .allow('')
    .messages({
      'string.max': '文档描述不能超过1000字符'
    }),

  tags: Joi.array()
    .items(Joi.number().integer().positive())
    .max(10)
    .unique()
    .messages({
      'array.max': '最多只能选择10个标签',
      'array.unique': '标签不能重复'
    }),

  is_public: Joi.boolean().default(false)
});

// 用户注册验证
const userRegistrationSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': '用户名只能包含字母和数字',
      'string.min': '用户名至少3个字符',
      'string.max': '用户名不能超过30个字符'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '请输入有效的邮箱地址'
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .required()
    .messages({
      'string.min': '密码至少8个字符',
      'string.max': '密码不能超过128个字符',
      'string.pattern.base': '密码必须包含大小写字母、数字和特殊字符'
    })
});
```

#### 4.1.2 SQL注入防护
```javascript
const Database = require('better-sqlite3');
const db = new Database('knowledge_base.db');

// 使用参数化查询防止SQL注入
const getUserByEmail = (email) => {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
};

const getDocumentsByTag = (tagName, userId) => {
  const stmt = db.prepare(`
    SELECT d.* FROM documents d
    JOIN document_tags dt ON d.id = dt.document_id
    JOIN tags t ON dt.tag_id = t.id
    WHERE t.name = ? AND (d.is_public = 1 OR d.upload_user_id = ?)
  `);
  return stmt.all(tagName, userId);
};

// 错误示例（容易SQL注入）
// const query = `SELECT * FROM users WHERE email = '${email}'`;

// 正确示例（使用参数化查询）
// const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
// const user = stmt.get(email);
```

### 4.2 XSS防护

#### 4.2.1 输出编码
```javascript
const DOMPurify = require('isomorphic-dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const createDOMPurify = require('dompurify')(window);

// HTML内容清理
const sanitizeHTML = (content) => {
  return createDOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['class'],
    REMOVE_DATA_ATTR: true,
    REMOVE_SCRIPT_ELEMENT: true
  });
};

// 文本内容转义
const escapeHTML = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// 中间件：自动清理请求中的HTML内容
const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeHTML(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) {
    sanitizeObject(req.body);
  }

  next();
};
```

#### 4.2.2 CSP设置
```javascript
const helmet = require('helmet');

// 内容安全策略配置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Ant Design需要内联样式
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-eval'" // React开发模式需要
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:"
      ],
      connectSrc: [
        "'self'",
        process.env.NODE_ENV === 'development' ? "ws://localhost:*" : ""
      ].filter(Boolean),
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false // 避免一些兼容性问题
}));
```

### 4.3 文件上传安全

#### 4.3.1 文件类型验证
```javascript
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// 允许的文件类型
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.md', '.xls', '.xlsx'];

// 文件类型检查
const checkFileType = (file, cb) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (ALLOWED_EXTENSIONS.includes(fileExtension) &&
      ALLOWED_MIME_TYPES.includes(mimeType)) {
    return cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${fileExtension}`));
  }
};

// Multer配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成安全的文件名
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 1 // 一次只能上传一个文件
  },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
});

// 文件上传中间件
const uploadMiddleware = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          error: { code: 'FILE_TOO_LARGE', details: '文件大小超过限制' }
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: { code: 'TOO_MANY_FILES', details: '文件数量超过限制' }
        });
      }
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: { code: 'FILE_UPLOAD_ERROR', details: err.message }
      });
    }

    next();
  });
};
```

#### 4.3.2 文件病毒扫描
```javascript
const ClamScan = require('clamscan');

// 初始化病毒扫描
const initVirusScanner = async () => {
  try {
    const clamscan = await new ClamScan().init({
      removeInfected: true,
      quarantineInfected: './quarantine/',
      debugMode: false
    });
    return clamscan;
  } catch (error) {
    console.warn('病毒扫描器初始化失败:', error.message);
    return null;
  }
};

// 文件病毒扫描中间件
const virusScanMiddleware = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const scanner = await initVirusScanner();

  if (!scanner) {
    console.warn('跳过病毒扫描：扫描器不可用');
    return next();
  }

  try {
    const scanResult = await scanner.scanFile(req.file.path);

    if (scanResult.isInfected) {
      // 删除感染文件
      require('fs').unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        error: {
          code: 'VIRUS_DETECTED',
          details: '检测到恶意文件，上传已被阻止'
        }
      });
    }

    next();
  } catch (error) {
    console.error('病毒扫描失败:', error);
    // 扫描失败时仍然允许上传，但记录日志
    next();
  }
};
```

## 5. 传输安全

### 5.1 HTTPS配置
```javascript
const https = require('https');
const fs = require('fs');

// HTTPS证书配置
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../ssl/private-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../ssl/certificate.pem')),
  // 可选：中间证书
  ca: fs.readFileSync(path.join(__dirname, '../ssl/ca-bundle.pem'))
};

// 创建HTTPS服务器
const server = https.createServer(httpsOptions, app);

// 强制HTTPS重定向
const forceHTTPS = (req, res, next) => {
  if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.get('host')}${req.url}`);
  }
  next();
};

// 在生产环境使用
if (process.env.NODE_ENV === 'production') {
  app.use(forceHTTPS);
}
```

### 5.2 CORS配置
```javascript
const cors = require('cors');

// CORS配置
const corsOptions = {
  origin: (origin, callback) => {
    // 允许的域名列表
    const allowedOrigins = [
      'https://yourdomain.com',
      'https://www.yourdomain.com'
    ];

    // 开发环境允许localhost
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000');
    }

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('不允许的CORS来源'));
    }
  },
  credentials: true, // 允许发送cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-MFA-Token'
  ],
  maxAge: 86400 // 预检请求缓存24小时
};

app.use(cors(corsOptions));
```

## 6. 监控和审计

### 6.1 安全日志记录
```javascript
const winston = require('winston');

// 配置安全日志
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'security' },
  transports: [
    new winston.transports.File({
      filename: 'logs/security.log',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// 安全事件记录
const logSecurityEvent = (event, details, req) => {
  securityLogger.info('Security Event', {
    event,
    details,
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user.sub : null,
    url: req.originalUrl,
    method: req.method
  });
};

// 安全事件类型
const SECURITY_EVENTS = {
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  PERMISSION_DENIED: 'permission_denied',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  FILE_UPLOAD: 'file_upload',
  DATA_ACCESS: 'data_access'
};

// 在相关中间件中记录安全事件
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);

    if (!user || !await verifyPassword(password, user.password_hash)) {
      logSecurityEvent(SECURITY_EVENTS.LOGIN_FAILURE, { email }, req);
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', details: '邮箱或密码错误' }
      });
    }

    // 检查账户状态
    if (!user.is_active) {
      logSecurityEvent(SECURITY_EVENTS.LOGIN_FAILURE, {
        email,
        reason: 'account_disabled'
      }, req);
      return res.status(401).json({
        success: false,
        error: { code: 'ACCOUNT_DISABLED', details: '账户已被禁用' }
      });
    }

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 更新最后登录时间
    await updateLastLogin(user.id);

    logSecurityEvent(SECURITY_EVENTS.LOGIN_SUCCESS, {
      userId: user.id,
      email: user.email
    }, req);

    res.json({
      success: true,
      data: { token, refreshToken, user },
      message: '登录成功'
    });
  } catch (error) {
    logSecurityEvent(SECURITY_EVENTS.LOGIN_FAILURE, {
      error: error.message
    }, req);
    res.status(500).json({
      success: false,
      error: { code: 'LOGIN_ERROR', details: '登录失败' }
    });
  }
};
```

### 6.2 异常行为检测
```javascript
const Redis = require('redis');
const redisClient = Redis.createClient();

// 限流配置
const RATE_LIMITS = {
  login: { max: 5, window: 15 * 60 * 1000 }, // 15分钟内最多5次登录尝试
  api: { max: 100, window: 60 * 1000 }, // 1分钟内最多100次API调用
  upload: { max: 10, window: 60 * 60 * 1000 } // 1小时内最多10次上传
};

// 限流中间件
const rateLimiter = (type) => {
  return async (req, res, next) => {
    const limit = RATE_LIMITS[type];
    if (!limit) return next();

    const key = `rate_limit:${type}:${req.ip}`;

    try {
      const current = await redisClient.incr(key);

      if (current === 1) {
        await redisClient.expire(key, Math.floor(limit.window / 1000));
      }

      if (current > limit.max) {
        logSecurityEvent(SECURITY_EVENTS.SUSPICIOUS_ACTIVITY, {
          type: 'rate_limit_exceeded',
          limit: type,
          attempts: current
        }, req);

        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            details: '请求过于频繁，请稍后再试'
          }
        });
      }

      next();
    } catch (error) {
      // Redis错误时跳过限流
      next();
    }
  };
};

// 可疑活动检测
const detectSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /(\bscript\b|\bjavascript\b|\bonload\b|\bonerror\b)/i, // XSS尝试
    /(\bunion\b|\bselect\b|\binsert\b|\bdelete\b|\bdrop\b)/i, // SQL注入尝试
    /(\.\.\/|\.\.\\)/g, // 目录遍历尝试
    /<script|<iframe|<object/i // HTML注入尝试
  ];

  const checkString = (str) => {
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };

  const checkObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && checkString(obj[key])) {
        return true;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkObject(obj[key])) return true;
      }
    }
    return false;
  };

  // 检查请求参数
  if ((req.body && checkObject(req.body)) ||
      (req.query && checkObject(req.query)) ||
      (req.params && checkObject(req.params))) {

    logSecurityEvent(SECURITY_EVENTS.SUSPICIOUS_ACTIVITY, {
      type: 'malicious_input_detected',
      body: req.body,
      query: req.query,
      params: req.params
    }, req);

    return res.status(400).json({
      success: false,
      error: { code: 'MALICIOUS_INPUT', details: '检测到恶意输入' }
    });
  }

  next();
};
```

## 7. 数据备份与恢复

### 7.1 数据库备份
```bash
#!/bin/bash
# scripts/backup.sh

# 配置
BACKUP_DIR="/var/backups/knowledge-base"
DB_FILE="/path/to/knowledge_base.db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="knowledge_base_${DATE}.db"
ENCRYPTION_KEY_FILE="/etc/backup/encryption.key"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 数据库备份
sqlite3 "$DB_FILE" ".backup $BACKUP_DIR/$BACKUP_NAME"

# 加密备份文件
if [ -f "$ENCRYPTION_KEY_FILE" ]; then
  gpg --cipher-algo AES256 --compress-algo 1 --s2k-mode 3 \
      --s2k-digest-algo SHA512 --s2k-count 65536 \
      --symmetric --output "$BACKUP_DIR/${BACKUP_NAME}.gpg" \
      --batch --passphrase-file "$ENCRYPTION_KEY_FILE" \
      "$BACKUP_DIR/$BACKUP_NAME"

  # 删除未加密的备份文件
  rm "$BACKUP_DIR/$BACKUP_NAME"
fi

# 清理旧备份（保留30天）
find "$BACKUP_DIR" -name "knowledge_base_*.db.gpg" -mtime +30 -delete

# 验证备份完整性
if [ -f "$BACKUP_DIR/${BACKUP_NAME}.gpg" ]; then
  echo "备份成功: $BACKUP_DIR/${BACKUP_NAME}.gpg"

  # 发送备份状态通知
  curl -X POST "https://your-monitoring-service.com/webhook" \
       -H "Content-Type: application/json" \
       -d "{\"status\":\"success\",\"backup\":\"${BACKUP_NAME}.gpg\"}"
else
  echo "备份失败!"

  # 发送失败通知
  curl -X POST "https://your-monitoring-service.com/webhook" \
       -H "Content-Type: application/json" \
       -d "{\"status\":\"failed\",\"backup\":\"${BACKUP_NAME}\"}"

  exit 1
fi
```

### 7.2 灾难恢复计划
```markdown
# 灾难恢复计划

## 恢复步骤

### 1. 评估损坏程度
- 检查系统状态
- 确定数据丢失范围
- 评估恢复时间需求

### 2. 系统恢复
```bash
# 停止服务
sudo systemctl stop knowledge-base

# 恢复数据库
gpg --decrypt /var/backups/knowledge-base/knowledge_base_YYYYMMDD_HHMMSS.db.gpg > /tmp/restored.db
cp /tmp/restored.db /path/to/knowledge_base.db

# 恢复文件
rsync -av /var/backups/knowledge-base/uploads/ /path/to/uploads/

# 设置权限
chown -R knowledge-base:knowledge-base /path/to/app/
chmod 600 /path/to/knowledge_base.db

# 启动服务
sudo systemctl start knowledge-base
```

### 3. 验证恢复
- 检查数据完整性
- 测试核心功能
- 验证用户访问

### 4. 更新监控
- 更新监控配置
- 重置安全警报
- 通知相关人员
```

## 8. 安全检查清单

### 8.1 部署前安全检查
```markdown
# 部署安全检查清单

## 认证和授权
- [ ] 密码策略已配置
- [ ] JWT密钥已设置（环境变量）
- [ ] 权限控制已实现
- [ ] 多因素认证可选功能已测试

## 数据保护
- [ ] 所有输入已验证
- [ ] SQL注入防护已测试
- [ ] XSS防护已实现
- [ ] 文件上传安全检查已配置

## 传输安全
- [ ] HTTPS已配置
- [ ] CORS策略已设置
- [ ] 安全头已配置（CSP、HSTS等）

## 日志和监控
- [ ] 安全日志已配置
- [ ] 异常检测已启用
- [ ] 备份策略已实施

## 基础设施安全
- [ ] 防火墙已配置
- [ ] 操作系统已更新
- [ ] 依赖包已扫描漏洞
- [ ] 访问控制已设置
```

### 8.2 定期安全审计
```javascript
// scripts/security-audit.js
const fs = require('fs');
const path = require('path');

// 检查敏感文件权限
const checkFilePermissions = () => {
  const sensitiveFiles = [
    'knowledge_base.db',
    '.env',
    'ssl/private-key.pem'
  ];

  sensitiveFiles.forEach(file => {
    try {
      const stats = fs.statSync(file);
      const mode = (stats.mode & parseInt('777', 8)).toString(8);

      if (mode !== '600' && mode !== '400') {
        console.warn(`警告: ${file} 权限过于宽松 (${mode})`);
      }
    } catch (error) {
      console.error(`无法检查文件权限: ${file}`);
    }
  });
};

// 检查弱密码
const checkWeakPasswords = async () => {
  const users = await getAllUsers();
  const weakPasswords = [
    'password', '123456', 'admin', 'user', 'test'
  ];

  for (const user of users) {
    for (const weak of weakPasswords) {
      if (await verifyPassword(weak, user.password_hash)) {
        console.warn(`警告: 用户 ${user.username} 使用弱密码`);
      }
    }
  }
};

// 检查过期权限
const checkExpiredPermissions = async () => {
  const expiredPermissions = await getExpiredPermissions();

  if (expiredPermissions.length > 0) {
    console.warn(`发现 ${expiredPermissions.length} 个过期权限需要清理`);

    // 自动清理过期权限
    for (const permission of expiredPermissions) {
      await revokePermission(permission.id);
    }
  }
};

// 执行安全审计
const runSecurityAudit = async () => {
  console.log('开始安全审计...');

  checkFilePermissions();
  await checkWeakPasswords();
  await checkExpiredPermissions();

  console.log('安全审计完成');
};

// 定期运行（通过cron配置）
if (require.main === module) {
  runSecurityAudit().catch(console.error);
}
```

## 9. 事件响应计划

### 9.1 安全事件分类
```markdown
# 安全事件响应计划

## 事件严重级别

### 严重（Critical）
- 数据泄露
- 系统被完全入侵
- 大规模服务中断

**响应时间**: 立即（15分钟内）

### 高（High）
- 恶意文件上传
- 权限提升攻击
- 异常的管理员活动

**响应时间**: 1小时内

### 中（Medium）
- 登录失败次数异常
- 可疑的用户行为
- 小规模服务中断

**响应时间**: 4小时内

### 低（Low）
- 常规的安全警告
- 配置问题
- 性能异常

**响应时间**: 24小时内
```

### 9.2 自动响应措施
```javascript
// 自动安全响应
const securityResponse = {
  // 自动封禁可疑IP
  blockSuspiciousIP: async (ip, reason) => {
    await redisClient.setex(`blocked_ip:${ip}`, 3600, reason);
    logSecurityEvent('IP_BLOCKED', { ip, reason });
  },

  // 自动禁用受攻击的账户
  suspendCompromisedAccount: async (userId, reason) => {
    await updateUserStatus(userId, { is_active: false });
    await revokeAllUserTokens(userId);
    logSecurityEvent('ACCOUNT_SUSPENDED', { userId, reason });
  },

  // 自动删除恶意文件
  quarantineMaliciousFile: async (filePath, reason) => {
    const quarantinePath = `/quarantine/${path.basename(filePath)}`;
    await fs.promises.rename(filePath, quarantinePath);
    logSecurityEvent('FILE_QUARANTINED', { filePath, reason });
  }
};

// 安全事件处理器
const handleSecurityEvent = async (eventType, details) => {
  switch (eventType) {
    case 'BRUTE_FORCE_DETECTED':
      await securityResponse.blockSuspiciousIP(details.ip, 'brute_force');
      break;

    case 'MALICIOUS_FILE_UPLOADED':
      await securityResponse.quarantineMaliciousFile(details.filePath, 'virus_detected');
      await securityResponse.suspendCompromisedAccount(details.userId, 'malicious_upload');
      break;

    case 'PRIVILEGE_ESCALATION':
      await securityResponse.suspendCompromisedAccount(details.userId, 'privilege_escalation');
      break;
  }
};
```

通过以上综合的安全设计，我们构建了一个多层次的安全防护体系，涵盖了认证、授权、数据保护、传输安全、监控审计等各个方面，确保团队知识库管理工具的安全性和可靠性。