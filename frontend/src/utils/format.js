// 格式化文件大小
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 格式化日期
export const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  };

  return date.toLocaleString('zh-CN', options);
};

// 格式化相对时间
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return '刚刚';
  } else if (diffMin < 60) {
    return `${diffMin}分钟前`;
  } else if (diffHour < 24) {
    return `${diffHour}小时前`;
  } else if (diffDay < 30) {
    return `${diffDay}天前`;
  } else {
    return formatDate(dateString);
  }
};

// 截断字符串
export const truncateString = (str, maxLength = 50) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

// 获取文件扩展名
export const getFileExtension = (filename) => {
  if (!filename) return '';
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.substring(lastDot + 1).toLowerCase();
};

// 获取文件图标类型
export const getFileIconType = (filename) => {
  const ext = getFileExtension(filename);
  const iconMap = {
    pdf: 'file-pdf',
    doc: 'file-word',
    docx: 'file-word',
    xls: 'file-excel',
    xlsx: 'file-excel',
    ppt: 'file-ppt',
    pptx: 'file-ppt',
    txt: 'file-text',
    png: 'file-image',
    jpg: 'file-image',
    jpeg: 'file-image',
    gif: 'file-image',
    zip: 'file-zip',
    rar: 'file-zip'
  };

  return iconMap[ext] || 'file';
};