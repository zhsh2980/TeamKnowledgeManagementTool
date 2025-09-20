const express = require('express');
const { db } = require('../utils/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// 管理员权限中间件
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
  next();
};

// 获取用户列表（管理员）
router.get('/users', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // 获取用户总数
    db.get(
      'SELECT COUNT(*) as total FROM users',
      [],
      (err, countResult) => {
        if (err) {
          console.error('获取用户总数错误:', err);
          return res.status(500).json({
            success: false,
            message: '服务器内部错误'
          });
        }

        // 获取用户列表
        db.all(
          `SELECT id, username, email, role, created_at
           FROM users
           ORDER BY created_at DESC
           LIMIT ? OFFSET ?`,
          [parseInt(limit), parseInt(offset)],
          (err, users) => {
            if (err) {
              console.error('获取用户列表错误:', err);
              return res.status(500).json({
                success: false,
                message: '服务器内部错误'
              });
            }

            res.json({
              success: true,
              data: {
                users,
                total: countResult.total,
                page: parseInt(page),
                limit: parseInt(limit)
              },
              message: '获取成功'
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取系统统计信息（管理员）
router.get('/statistics', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const queries = {
      totalUsers: 'SELECT COUNT(*) as count FROM users',
      totalDocuments: 'SELECT COUNT(*) as count FROM documents',
      totalDownloads: 'SELECT SUM(download_count) as count FROM documents',
      totalSize: 'SELECT SUM(file_size) as count FROM documents',
      recentUsers: `SELECT COUNT(*) as count FROM users
                    WHERE datetime(created_at) > datetime('now', '-7 days')`,
      recentDocuments: `SELECT COUNT(*) as count FROM documents
                        WHERE datetime(created_at) > datetime('now', '-7 days')`
    };

    const statistics = {};
    const queryKeys = Object.keys(queries);
    let completedQueries = 0;

    queryKeys.forEach(key => {
      db.get(queries[key], [], (err, result) => {
        if (err) {
          console.error(`获取${key}错误:`, err);
          statistics[key] = 0;
        } else {
          statistics[key] = result.count || 0;
        }

        completedQueries++;
        if (completedQueries === queryKeys.length) {
          res.json({
            success: true,
            data: statistics,
            message: '获取统计信息成功'
          });
        }
      });
    });
  } catch (error) {
    console.error('获取统计信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取最活跃用户（管理员）
router.get('/active-users', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { limit = 10 } = req.query;

    db.all(
      `SELECT u.id, u.username, u.email,
              COUNT(d.id) as document_count,
              COALESCE(SUM(d.download_count), 0) as total_downloads
       FROM users u
       LEFT JOIN documents d ON u.id = d.upload_user_id
       GROUP BY u.id
       ORDER BY document_count DESC
       LIMIT ?`,
      [parseInt(limit)],
      (err, users) => {
        if (err) {
          console.error('获取活跃用户错误:', err);
          return res.status(500).json({
            success: false,
            message: '服务器内部错误'
          });
        }

        res.json({
          success: true,
          data: users,
          message: '获取活跃用户成功'
        });
      }
    );
  } catch (error) {
    console.error('获取活跃用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取热门文档（管理员）
router.get('/popular-documents', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { limit = 10 } = req.query;

    db.all(
      `SELECT d.id, d.title, d.download_count, d.created_at,
              u.username as upload_username
       FROM documents d
       LEFT JOIN users u ON d.upload_user_id = u.id
       ORDER BY d.download_count DESC
       LIMIT ?`,
      [parseInt(limit)],
      (err, documents) => {
        if (err) {
          console.error('获取热门文档错误:', err);
          return res.status(500).json({
            success: false,
            message: '服务器内部错误'
          });
        }

        res.json({
          success: true,
          data: documents,
          message: '获取热门文档成功'
        });
      }
    );
  } catch (error) {
    console.error('获取热门文档错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 修改用户角色（管理员）
router.put('/users/:id/role', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // 验证角色值
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: '无效的角色值'
      });
    }

    // 防止修改自己的角色
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: '不能修改自己的角色'
      });
    }

    db.run(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id],
      function(err) {
        if (err) {
          console.error('修改用户角色错误:', err);
          return res.status(500).json({
            success: false,
            message: '修改用户角色失败'
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message: '用户不存在'
          });
        }

        res.json({
          success: true,
          data: null,
          message: '修改成功'
        });
      }
    );
  } catch (error) {
    console.error('修改用户角色错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

module.exports = router;