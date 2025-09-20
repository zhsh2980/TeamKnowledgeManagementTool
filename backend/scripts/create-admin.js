const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库路径
const dbPath = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath);

// 管理员信息
const adminData = {
  username: 'admin',
  email: 'admin@admin.com',
  password: '123456',
  role: 'admin'
};

async function createAdmin() {
  try {
    // 生成密码哈希
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminData.password, salt);

    // 检查是否已存在管理员账户
    db.get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [adminData.username, adminData.email],
      (err, existingUser) => {
        if (err) {
          console.error('查询错误:', err);
          db.close();
          return;
        }

        if (existingUser) {
          console.log('❌ 管理员账户已存在');

          // 更新为管理员角色
          db.run(
            'UPDATE users SET role = ? WHERE username = ? OR email = ?',
            ['admin', adminData.username, adminData.email],
            function(err) {
              if (err) {
                console.error('更新失败:', err);
              } else {
                console.log('✅ 已将现有账户更新为管理员');
                console.log('用户名:', adminData.username);
                console.log('邮箱:', adminData.email);
                console.log('密码: 123456');
              }
              db.close();
            }
          );
        } else {
          // 插入新管理员
          db.run(
            `INSERT INTO users (username, email, password_hash, role)
             VALUES (?, ?, ?, ?)`,
            [adminData.username, adminData.email, passwordHash, adminData.role],
            function(err) {
              if (err) {
                console.error('创建失败:', err);
              } else {
                console.log('✅ 管理员账户创建成功！');
                console.log('用户名:', adminData.username);
                console.log('邮箱:', adminData.email);
                console.log('密码: 123456');
                console.log('角色: 管理员');
              }
              db.close();
            }
          );
        }
      }
    );
  } catch (error) {
    console.error('错误:', error);
    db.close();
  }
}

createAdmin();