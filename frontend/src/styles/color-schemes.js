// 专业配色方案集合
export const colorSchemes = {
  // 方案1：深邃海洋 (当前使用)
  ocean: {
    name: '深邃海洋',
    primary: '#0F766E',
    primaryLight: '#14B8A6',
    primaryDark: '#0D5953',
    gradient: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
    description: '沉稳专业，带有科技感'
  },

  // 方案2：商务深蓝
  business: {
    name: '商务深蓝',
    primary: '#1E40AF',
    primaryLight: '#3B82F6',
    primaryDark: '#1E3A8A',
    gradient: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
    description: '经典商务风格，稳重可靠'
  },

  // 方案3：科技紫
  tech: {
    name: '科技紫',
    primary: '#6B21A8',
    primaryLight: '#9333EA',
    primaryDark: '#581C87',
    gradient: 'linear-gradient(135deg, #6B21A8 0%, #9333EA 100%)',
    description: '富有创新感，适合科技企业'
  },

  // 方案4：活力橙
  vibrant: {
    name: '活力橙',
    primary: '#EA580C',
    primaryLight: '#FB923C',
    primaryDark: '#C2410C',
    gradient: 'linear-gradient(135deg, #EA580C 0%, #FB923C 100%)',
    description: '充满活力，适合创意团队'
  },

  // 方案5：优雅灰蓝
  elegant: {
    name: '优雅灰蓝',
    primary: '#475569',
    primaryLight: '#64748B',
    primaryDark: '#334155',
    gradient: 'linear-gradient(135deg, #475569 0%, #64748B 100%)',
    description: '低调优雅，极简主义'
  },

  // 方案6：自然绿
  nature: {
    name: '自然绿',
    primary: '#16A34A',
    primaryLight: '#22C55E',
    primaryDark: '#15803D',
    gradient: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
    description: '清新自然，环保健康'
  },

  // 方案7：专业墨绿
  professional: {
    name: '专业墨绿',
    primary: '#14532D',
    primaryLight: '#166534',
    primaryDark: '#052E16',
    gradient: 'linear-gradient(135deg, #14532D 0%, #166534 100%)',
    description: '深沉专业，高端大气'
  },

  // 方案8：现代靛蓝
  modern: {
    name: '现代靛蓝',
    primary: '#312E81',
    primaryLight: '#4338CA',
    primaryDark: '#1E1B4B',
    gradient: 'linear-gradient(135deg, #312E81 0%, #4338CA 100%)',
    description: '现代感强，专业可信'
  }
};

// 快速应用配色方案的函数
export const applyColorScheme = (schemeName) => {
  const scheme = colorSchemes[schemeName];
  if (!scheme) return;

  const root = document.documentElement;
  root.style.setProperty('--primary-color', scheme.primary);
  root.style.setProperty('--primary-light', scheme.primaryLight);
  root.style.setProperty('--primary-dark', scheme.primaryDark);
  root.style.setProperty('--primary-gradient', scheme.gradient);

  // 保存到localStorage以便持久化
  localStorage.setItem('colorScheme', schemeName);
};

// 获取当前配色方案
export const getCurrentScheme = () => {
  return localStorage.getItem('colorScheme') || 'ocean';
};