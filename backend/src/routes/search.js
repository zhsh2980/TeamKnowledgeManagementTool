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
          .map(([tag, count]) => ({ tag, count }));

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
      `SELECT DISTINCT keyword, tags
       FROM search_logs
       WHERE user_id = ? AND (keyword != '' OR tags != '')
       ORDER BY searched_at DESC
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

module.exports = router;