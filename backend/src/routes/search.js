const express = require('express');
const { db } = require('../utils/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// 搜索文档
router.get('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { keyword = '', tags = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // 构建查询条件
    let whereConditions = ['(is_public = 1 OR upload_user_id = ?)'];
    let params = [userId];

    if (keyword) {
      whereConditions.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (tags) {
      // 支持多个标签搜索，用逗号分隔
      const tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tagList.length > 0) {
        const tagConditions = tagList.map(() => 'tags LIKE ?').join(' OR ');
        whereConditions.push(`(${tagConditions})`);
        tagList.forEach(tag => params.push(`%${tag}%`));
      }
    }

    const whereClause = whereConditions.join(' AND ');

    // 获取搜索结果总数
    db.get(
      `SELECT COUNT(*) as total FROM documents WHERE ${whereClause}`,
      params,
      (err, countResult) => {
        if (err) {
          console.error('获取搜索结果总数错误:', err);
          return res.status(500).json({
            success: false,
            message: '服务器内部错误'
          });
        }

        // 获取搜索结果
        db.all(
          `SELECT d.*, u.username as upload_username
           FROM documents d
           LEFT JOIN users u ON d.upload_user_id = u.id
           WHERE ${whereClause}
           ORDER BY d.created_at DESC
           LIMIT ? OFFSET ?`,
          [...params, parseInt(limit), parseInt(offset)],
          (err, documents) => {
            if (err) {
              console.error('搜索文档错误:', err);
              return res.status(500).json({
                success: false,
                message: '服务器内部错误'
              });
            }

            // 记录搜索历史
            db.run(
              `INSERT INTO search_logs (user_id, keyword, tags, result_count)
               VALUES (?, ?, ?, ?)`,
              [userId, keyword, tags, countResult.total],
              (err) => {
                if (err) {
                  console.error('记录搜索历史错误:', err);
                }
              }
            );

            res.json({
              success: true,
              data: {
                documents,
                total: countResult.total,
                keyword,
                tags,
                page: parseInt(page),
                limit: parseInt(limit)
              },
              message: '搜索成功'
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('搜索错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取热门标签
router.get('/tags', authMiddleware, (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // 查询所有公开文档的标签
    db.all(
      `SELECT tags FROM documents WHERE is_public = 1 AND tags IS NOT NULL AND tags != ''`,
      [],
      (err, rows) => {
        if (err) {
          console.error('获取标签错误:', err);
          return res.status(500).json({
            success: false,
            message: '服务器内部错误'
          });
        }

        // 统计标签频率
        const tagCount = {};
        rows.forEach(row => {
          const tags = row.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
          tags.forEach(tag => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          });
        });

        // 排序并获取热门标签
        const hotTags = Object.entries(tagCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, parseInt(limit))
          .map(([tag, count]) => ({ name: tag, count }));

        res.json({
          success: true,
          data: hotTags,
          message: '获取热门标签成功'
        });
      }
    );
  } catch (error) {
    console.error('获取热门标签错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取搜索历史
router.get('/history', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    db.all(
      `SELECT id, keyword, tags, searched_at
       FROM search_logs
       WHERE user_id = ? AND (keyword != '' OR tags != '')
       GROUP BY keyword, tags
       ORDER BY MAX(searched_at) DESC
       LIMIT ?`,
      [userId, parseInt(limit)],
      (err, history) => {
        if (err) {
          console.error('获取搜索历史错误:', err);
          return res.status(500).json({
            success: false,
            message: '服务器内部错误'
          });
        }

        res.json({
          success: true,
          data: history,
          message: '获取搜索历史成功'
        });
      }
    );
  } catch (error) {
    console.error('获取搜索历史错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 删除单个搜索历史
router.delete('/history/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const historyId = req.params.id;

    // 验证历史记录是否属于当前用户
    db.get(
      `SELECT id FROM search_logs WHERE id = ? AND user_id = ?`,
      [historyId, userId],
      (err, record) => {
        if (err) {
          console.error('查询搜索历史错误:', err);
          return res.status(500).json({
            success: false,
            message: '服务器内部错误'
          });
        }

        if (!record) {
          return res.status(404).json({
            success: false,
            message: '搜索历史不存在或无权限删除'
          });
        }

        // 删除搜索历史记录
        db.run(
          `DELETE FROM search_logs WHERE id = ? AND user_id = ?`,
          [historyId, userId],
          function(err) {
            if (err) {
              console.error('删除搜索历史错误:', err);
              return res.status(500).json({
                success: false,
                message: '服务器内部错误'
              });
            }

            res.json({
              success: true,
              message: '删除搜索历史成功'
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('删除搜索历史错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 删除特定关键词和标签的搜索历史
router.delete('/history', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { keyword, tags } = req.body;

    if (!keyword && !tags) {
      return res.status(400).json({
        success: false,
        message: '请提供关键词或标签'
      });
    }

    // 构建删除条件
    let whereConditions = ['user_id = ?'];
    let params = [userId];

    if (keyword) {
      whereConditions.push('keyword = ?');
      params.push(keyword);
    }

    if (tags) {
      whereConditions.push('tags = ?');
      params.push(tags);
    }

    const whereClause = whereConditions.join(' AND ');

    db.run(
      `DELETE FROM search_logs WHERE ${whereClause}`,
      params,
      function(err) {
        if (err) {
          console.error('删除搜索历史错误:', err);
          return res.status(500).json({
            success: false,
            message: '服务器内部错误'
          });
        }

        res.json({
          success: true,
          data: { deletedCount: this.changes },
          message: '删除搜索历史成功'
        });
      }
    );
  } catch (error) {
    console.error('删除搜索历史错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 清空所有搜索历史
router.delete('/history/clear', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;

    db.run(
      `DELETE FROM search_logs WHERE user_id = ?`,
      [userId],
      function(err) {
        if (err) {
          console.error('清空搜索历史错误:', err);
          return res.status(500).json({
            success: false,
            message: '服务器内部错误'
          });
        }

        res.json({
          success: true,
          data: { deletedCount: this.changes },
          message: '清空搜索历史成功'
        });
      }
    );
  } catch (error) {
    console.error('清空搜索历史错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

module.exports = router;