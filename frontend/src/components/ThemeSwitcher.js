import React from 'react';
import { Button, Dropdown, Tooltip } from 'antd';
import {
  SunOutlined,
  MoonOutlined,
  DesktopOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeSwitcher.css';

const ThemeSwitcher = ({ showText = false, placement = 'bottomRight' }) => {
  const { themeMode, currentTheme, toggleTheme, setTheme, getThemeDisplayName, THEME_MODES } = useTheme();

  // 主题选项
  const themeOptions = [
    {
      key: THEME_MODES.LIGHT,
      icon: <SunOutlined />,
      label: '浅色模式',
      description: '经典的浅色界面'
    },
    {
      key: THEME_MODES.DARK,
      icon: <MoonOutlined />,
      label: '深色模式',
      description: '护眼的深色界面'
    },
    {
      key: THEME_MODES.SYSTEM,
      icon: <DesktopOutlined />,
      label: '跟随系统',
      description: '自动跟随系统设置'
    }
  ];

  // 获取当前主题图标
  const getCurrentIcon = () => {
    switch (themeMode) {
      case THEME_MODES.LIGHT:
        return <SunOutlined className="theme-icon theme-icon-light" />;
      case THEME_MODES.DARK:
        return <MoonOutlined className="theme-icon theme-icon-dark" />;
      case THEME_MODES.SYSTEM:
        return <DesktopOutlined className="theme-icon theme-icon-system" />;
      default:
        return <BulbOutlined className="theme-icon" />;
    }
  };

  // 下拉菜单项
  const dropdownItems = {
    items: themeOptions.map(option => ({
      key: option.key,
      icon: React.cloneElement(option.icon, {
        className: `menu-icon ${themeMode === option.key ? 'active' : ''}`
      }),
      label: (
        <div className="theme-option">
          <div className="theme-option-main">
            <span className="theme-option-label">{option.label}</span>
            {themeMode === option.key && (
              <span className="theme-option-badge">当前</span>
            )}
          </div>
          <div className="theme-option-description">{option.description}</div>
        </div>
      ),
      onClick: () => setTheme(option.key)
    })),
    selectable: false
  };

  // 简单切换按钮（点击直接切换）
  const SimpleToggle = () => (
    <Tooltip title={`切换主题 (当前: ${getThemeDisplayName()})`} placement={placement}>
      <Button
        type="text"
        icon={getCurrentIcon()}
        onClick={toggleTheme}
        className={`theme-switcher-btn simple-toggle ${currentTheme}`}
        size="large"
      >
        {showText && <span className="theme-text">{getThemeDisplayName()}</span>}
      </Button>
    </Tooltip>
  );

  // 下拉选择按钮
  const DropdownToggle = () => (
    <Dropdown
      menu={dropdownItems}
      trigger={['click']}
      placement={placement}
      overlayClassName="theme-switcher-dropdown"
    >
      <Button
        type="text"
        icon={getCurrentIcon()}
        className={`theme-switcher-btn dropdown-toggle ${currentTheme}`}
        size="large"
      >
        {showText && <span className="theme-text">{getThemeDisplayName()}</span>}
      </Button>
    </Dropdown>
  );

  // 根据props决定渲染哪种模式
  return showText ? <DropdownToggle /> : <SimpleToggle />;
};

export default ThemeSwitcher;