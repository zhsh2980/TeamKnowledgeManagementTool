const express = require('express');
const path = require('path');
const fs = require('fs');
const { db } = require('../utils/database');
const authMiddleware = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

const router = express.Router();

// 获取文档列表
router.get('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, search = '', tags = '' } = req.query;
    const offset = (page - 1) * limit;

    // 构建查询条件
    let whereClause = '(is_public = 1 OR upload_user_id = ?)';
    let params = [userId];

    if (search) {
      whereClause += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }

    if (tags) {
      whereClause += ' AND tags LIKE ?';
      params.push(`%${tags}%`);
    }

    // 获取总数
    db.get(
      `SELECT COUNT(*) as total FROM documents WHERE ${whereClause}`,
      params,
      (err, countResult) => {
        if (err) {
          console.error('获取文档总数错误:', err);
          return res.status(500).json({
            success: false,
            message: '服务器内部错误'
          });
        }

        // 获取文档列表
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
              console.error('获取文档列表错误:', err);
              return res.status(500).json({
                success: false,
                message: '服务器内部错误'
              });
            }

            res.json({
              success: true,
              data: {
                documents,
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
    console.error('获取文档列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 上传文档
router.post('/', authMiddleware, uploadMiddleware.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件'
      });
    }

    const { title, description = '', tags = '', is_public = '0' } = req.body;

    if (!title) {
      // 删除已上传的文件
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: '文档标题不能为空'
      });
    }

    const userId = req.user.id;

    // 插入文档记录
    db.run(
      `INSERT INTO documents (
        title, description, file_name, file_path,
        file_size, mime_type, upload_user_id, is_public, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        req.file.originalname,
        req.file.filename,
        req.file.size,
        req.file.mimetype,
        userId,
        parseInt(is_public),
        tags
      ],
      function(err) {
        if (err) {
          // 删除已上传的文件
          fs.unlinkSync(req.file.path);
          console.error('保存文档记录错误:', err);
          return res.status(500).json({
            success: false,
            message: '保存文档失败'
          });
        }

        res.status(201).json({
          success: true,
          data: {
            id: this.lastID,
            title,
            description,
            file_name: req.file.originalname,
            file_size: req.file.size,
            mime_type: req.file.mimetype,
            tags,
            is_public: parseInt(is_public),
            created_at: new Date().toISOString()
          },
          message: '上传成功'
        });
      }
    );
  } catch (error) {
    // 删除已上传的文件
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    console.error('上传文档错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 下载文档
router.get('/:id/download', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 查询文档信息
    db.get(
      `SELECT * FROM documents WHERE id = ?`,
      [id],
      (err, document) => {
        if (err) {
          console.error('查询文档错误:', err);
          return res.status(500).json({
            success: false,
            message: '服务器内部错误'
          });
        }

        if (!document) {
          return res.status(404).json({
            success: false,
            message: '文档不存在'
          });
        }

        // 权限检查
        if (!document.is_public && document.upload_user_id !== userId && req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: '无权限下载该文档'
          });
        }

        // 更新下载次数
        db.run(
          'UPDATE documents SET download_count = download_count + 1 WHERE id = ?',
          [id],
          (err) => {
            if (err) {
              console.error('更新下载次数错误:', err);
            }
          }
        );

        // 发送文件
        const filePath = path.join(__dirname, '../../uploads', document.file_path);

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({
            success: false,
            message: '文件不存在'
          });
        }

        res.download(filePath, document.file_name);
      }
    );
  } catch (error) {
    console.error('下载文档错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 删除文档
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 查询文档信息
    db.get(
      'SELECT * FROM documents WHERE id = ?',
      [id],
      (err, document) => {
        if (err) {
          console.error('查询文档错误:', err);
          return res.status(500).json({
            success: false,
            message: '服务器内部错误'
          });
        }

        if (!document) {
          return res.status(404).json({
            success: false,
            message: '文档不存在'
          });
        }

        // 权限检查
        if (document.upload_user_id !== userId && req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: '无权限删除该文档'
          });
        }

        // 删除数据库记录
        db.run(
          'DELETE FROM documents WHERE id = ?',
          [id],
          (err) => {
            if (err) {
              console.error('删除文档记录错误:', err);
              return res.status(500).json({
                success: false,
                message: '删除文档失败'
              });
            }

            // 删除文件
            const filePath = path.join(__dirname, '../../uploads', document.file_path);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }

            res.json({
              success: true,
              data: null,
              message: '删除成功'
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('删除文档错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

module.exports = router;