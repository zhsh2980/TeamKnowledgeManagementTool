const express = require('express');
const { db } = require('../utils/database');
const { generateToken, hashPassword, comparePassword } = require('../utils/auth');

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 基本验证
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码不能为空'
      });
    }

    // 检查用户是否已存在
    db.get(
      'SELECT username, email FROM users WHERE email = ? OR username = ?',
      [email, username],
      async (err, row) => {
        if (err) {
          console.error('数据库查询错误:', err);
          return res.status(500).json({
            success: false,
            message: '服务器内部错误'
          });
        }

        if (row) {
          if (row.email === email) {
            return res.status(400).json({
              success: false,
              message: '邮箱已被注册'
            });
          }
          if (row.username === username) {
            return res.status(400).json({
              success: false,
              message: '用户名已被占用'
            });
          }
        }

        // 加密密码
        const hashedPassword = await hashPassword(password);

        // 创建用户
        db.run(
          'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
          [username, email, hashedPassword],
          function(err) {
            if (err) {
              console.error('创建用户错误:', err);
              return res.status(500).json({
                success: false,
                message: '创建用户失败'
              });
            }

            res.status(201).json({
              success: true,
              data: {
                id: this.lastID,
                username,
                email,
                role: 'user'
              },
              message: '注册成功'
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 用户登录
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // 基本验证
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名/邮箱和密码不能为空'
      });
    }

    // 查找用户（支持用户名或邮箱登录）
    db.get(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, email],
      async (err, user) => {
        if (err) {
          console.error('数据库查询错误:', err);
          return res.status(500).json({
            success: false,
            message: '服务器内部错误'
          });
        }

        if (!user) {
          return res.status(401).json({
            success: false,
            message: '用户名/邮箱或密码错误'
          });
        }

        // 验证密码
        const isValidPassword = await comparePassword(password, user.password_hash);
        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            message: '用户名/邮箱或密码错误'
          });
        }

        // 生成JWT token
        const token = generateToken({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        });

        // 记录登录日志
        const ip = req.ip || req.connection.remoteAddress || '未知';
        const userAgent = req.get('User-Agent') || '未知';

        db.run(
          'INSERT INTO login_logs (user_id, ip_address, user_agent) VALUES (?, ?, ?)',
          [user.id, ip, userAgent],
          (logErr) => {
            if (logErr) {
              console.warn('记录登录日志失败:', logErr);
            }
          }
        );

        res.json({
          success: true,
          data: {
            token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role
            }
          },
          message: '登录成功'
        });
      }
    );
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

module.exports = router;