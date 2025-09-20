// 获取当前用户信息
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// 获取token
export const getToken = () => {
  return localStorage.getItem('token');
};

// 保存用户信息和token
export const saveAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// 清除认证信息
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// 检查是否已登录
export const isAuthenticated = () => {
  return !!getToken();
};

// 检查是否是管理员
export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

// 格式化文件大小
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 获取文件图标
export const getFileIcon = (mimeType) => {
  if (mimeType.includes('pdf')) return 'file-pdf';
  if (mimeType.includes('word')) return 'file-word';
  if (mimeType.includes('image')) return 'file-image';
  if (mimeType.includes('text')) return 'file-text';
  return 'file';
};