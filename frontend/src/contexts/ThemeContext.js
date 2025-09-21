import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import { lightTheme, darkTheme } from '../styles/theme';

// 创建主题上下文
const ThemeContext = createContext();

// 主题模式枚举
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// 主题提供者组件
export const ThemeProvider = ({ children }) => {
  // 从localStorage读取保存的主题设置，默认为系统主题
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('theme-mode');
    return saved || THEME_MODES.SYSTEM;
  });

  // 当前实际使用的主题（light或dark）
  const [currentTheme, setCurrentTheme] = useState('light');

  // 检测系统主题
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // 应用主题到DOM
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    setCurrentTheme(theme);
  };

  // 计算并应用实际主题
  useEffect(() => {
    let actualTheme;

    if (themeMode === THEME_MODES.SYSTEM) {
      actualTheme = getSystemTheme();
    } else {
      actualTheme = themeMode;
    }

    applyTheme(actualTheme);
  }, [themeMode]);

  // 监听系统主题变化
  useEffect(() => {
    if (themeMode === THEME_MODES.SYSTEM) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addListener(handleChange);

      return () => {
        mediaQuery.removeListener(handleChange);
      };
    }
  }, [themeMode]);

  // 保存主题设置到localStorage
  useEffect(() => {
    localStorage.setItem('theme-mode', themeMode);
  }, [themeMode]);

  // 切换主题模式
  const toggleTheme = () => {
    const modes = Object.values(THEME_MODES);
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  };

  // 设置特定主题模式
  const setTheme = (mode) => {
    if (Object.values(THEME_MODES).includes(mode)) {
      setThemeMode(mode);
    }
  };

  // 获取主题显示名称
  const getThemeDisplayName = (mode = themeMode) => {
    const names = {
      [THEME_MODES.LIGHT]: '浅色模式',
      [THEME_MODES.DARK]: '深色模式',
      [THEME_MODES.SYSTEM]: '跟随系统'
    };
    return names[mode];
  };

  // 获取主题图标
  const getThemeIcon = (mode = themeMode) => {
    const icons = {
      [THEME_MODES.LIGHT]: '☀️',
      [THEME_MODES.DARK]: '🌙',
      [THEME_MODES.SYSTEM]: '🖥️'
    };
    return icons[mode];
  };

  // 判断是否为深色主题
  const isDark = currentTheme === 'dark';

  // 获取Ant Design主题配置
  const getAntdTheme = () => {
    const baseTheme = isDark ? darkTheme : lightTheme;

    return {
      ...baseTheme,
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    };
  };

  // 上下文值
  const contextValue = {
    // 主题状态
    themeMode,
    currentTheme,
    isDark,

    // 主题操作
    toggleTheme,
    setTheme,

    // 工具函数
    getThemeDisplayName,
    getThemeIcon,
    getAntdTheme,

    // 常量
    THEME_MODES
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={getAntdTheme()}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

// 使用主题的Hook
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

// 默认导出
export default ThemeContext;