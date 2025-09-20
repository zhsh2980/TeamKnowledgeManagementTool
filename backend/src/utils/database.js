const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, '../../database.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath);

// 初始化数据库表
const initDatabase = () => {
  db.serialize(() => {
    // 创建用户表
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建文档表
    db.run(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        upload_user_id INTEGER NOT NULL,
        is_public BOOLEAN DEFAULT 0,
        tags TEXT,
        download_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (upload_user_id) REFERENCES users(id)
      )
    `);

    // 创建搜索日志表
    db.run(`
      CREATE TABLE IF NOT EXISTS search_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        keyword VARCHAR(255),
        tags TEXT,
        result_count INTEGER DEFAULT 0,
        searched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 创建登录记录表
    db.run(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 创建索引
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_documents_title ON documents(title)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_documents_upload_user ON documents(upload_user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_documents_public ON documents(is_public)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_search_logs_user ON search_logs(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_search_logs_searched_at ON search_logs(searched_at)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_login_logs_user ON login_logs(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_login_logs_time ON login_logs(login_time)`);

    console.log('✅ 数据库表和索引创建成功');
  });
};

// 如果直接运行此文件，则初始化数据库
if (require.main === module) {
  initDatabase();
  db.close();
}

module.exports = {
  db,
  initDatabase
};