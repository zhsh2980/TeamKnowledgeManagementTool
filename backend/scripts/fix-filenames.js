const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库路径
const dbPath = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath);

// 修复文件名编码
function fixFilename(brokenName) {
  try {
    // 尝试将错误编码的字符串转换回正确的UTF-8
    return Buffer.from(brokenName, 'latin1').toString('utf8');
  } catch (e) {
    console.error('无法修复文件名:', brokenName, e);
    return brokenName;
  }
}

// 修复数据库中的文件名
db.all('SELECT id, file_name FROM documents', [], (err, rows) => {
  if (err) {
    console.error('查询失败:', err);
    db.close();
    return;
  }

  let fixed = 0;
  let total = rows.length;

  rows.forEach((row) => {
    const fixedName = fixFilename(row.file_name);

    if (fixedName !== row.file_name) {
      db.run(
        'UPDATE documents SET file_name = ? WHERE id = ?',
        [fixedName, row.id],
        (err) => {
          if (err) {
            console.error(`修复文档 ${row.id} 失败:`, err);
          } else {
            console.log(`✅ 修复文档 ${row.id}: ${row.file_name} → ${fixedName}`);
            fixed++;
          }

          total--;
          if (total === 0) {
            console.log(`\n修复完成！共修复 ${fixed} 个文档的文件名。`);
            db.close();
          }
        }
      );
    } else {
      total--;
      if (total === 0) {
        console.log(`\n修复完成！共修复 ${fixed} 个文档的文件名。`);
        db.close();
      }
    }
  });

  if (rows.length === 0) {
    console.log('没有文档需要修复。');
    db.close();
  }
});