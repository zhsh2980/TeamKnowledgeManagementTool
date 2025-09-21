import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Space, Divider, Row, Col, Card, Tooltip } from 'antd';
import {
  BgColorsOutlined,
  CheckOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import { colorSchemes, applyColorScheme, getCurrentScheme } from '../styles/color-schemes';
import './ColorThemeSelector.css';

const ColorThemeSelector = ({ placement = 'bottomRight' }) => {
  const { isDark } = useTheme();
  const [currentScheme, setCurrentScheme] = useState(getCurrentScheme());
  const [previewScheme, setPreviewScheme] = useState(null);

  // 当颜色方案改变时更新状态
  useEffect(() => {
    const savedScheme = getCurrentScheme();
    setCurrentScheme(savedScheme);
    applyColorScheme(savedScheme);
  }, []);

  // 选择配色方案
  const selectScheme = (schemeName) => {
    applyColorScheme(schemeName);
    setCurrentScheme(schemeName);
    setPreviewScheme(null);
  };

  // 预览配色方案
  const previewColorScheme = (schemeName) => {
    if (schemeName !== currentScheme) {
      setPreviewScheme(schemeName);
      applyColorScheme(schemeName);
    }
  };

  // 停止预览，恢复当前方案
  const stopPreview = () => {
    if (previewScheme) {
      applyColorScheme(currentScheme);
      setPreviewScheme(null);
    }
  };

  // 配色方案卡片组件
  const SchemeCard = ({ schemeName, scheme }) => {
    const isSelected = currentScheme === schemeName;
    const isPreviewing = previewScheme === schemeName;

    return (
      <Card
        className={`scheme-card ${isSelected ? 'selected' : ''} ${isPreviewing ? 'previewing' : ''}`}
        styles={{ body: { padding: '12px' } }}
        hoverable
        onMouseEnter={() => previewColorScheme(schemeName)}
        onMouseLeave={stopPreview}
        onClick={() => selectScheme(schemeName)}
      >
        {/* 配色预览条 */}
        <div className="color-preview">
          <div
            className="color-block primary"
            style={{ background: scheme.primary }}
          />
          <div
            className="color-block light"
            style={{ background: scheme.primaryLight }}
          />
          <div
            className="color-block dark"
            style={{ background: scheme.primaryDark }}
          />
          <div
            className="color-block gradient"
            style={{ background: scheme.gradient }}
          />
        </div>

        {/* 方案信息 */}
        <div className="scheme-info">
          <div className="scheme-name">
            {scheme.name}
            {isSelected && (
              <CheckOutlined className="selected-icon" />
            )}
          </div>
          <div className="scheme-description">
            {scheme.description}
          </div>
        </div>

        {/* 预览指示器 */}
        {isPreviewing && (
          <div className="preview-indicator">
            <EyeOutlined />
            <span>预览中</span>
          </div>
        )}
      </Card>
    );
  };

  // 下拉菜单内容
  const dropdownContent = (
    <div className="color-theme-dropdown" onMouseLeave={stopPreview}>
      <div className="dropdown-header">
        <h4>选择配色主题</h4>
        <div className="current-scheme">
          当前：{colorSchemes[currentScheme]?.name}
        </div>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      <div className="schemes-grid">
        <Row gutter={[8, 8]}>
          {Object.entries(colorSchemes).map(([schemeName, scheme]) => (
            <Col span={12} key={schemeName}>
              <SchemeCard schemeName={schemeName} scheme={scheme} />
            </Col>
          ))}
        </Row>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      <div className="dropdown-footer">
        <div className="footer-tip">
          <span>💡 悬浮预览，点击应用</span>
        </div>
      </div>
    </div>
  );

  return (
    <Dropdown
      popupRender={() => dropdownContent}
      trigger={['click']}
      placement={placement}
      overlayClassName="color-theme-selector-overlay"
    >
      <Tooltip title="配色主题">
        <Button
          type="text"
          icon={<BgColorsOutlined />}
          className={`color-theme-selector-btn ${isDark ? 'dark' : 'light'}`}
          size="large"
        >
          <span className="current-scheme-indicator">
            <div
              className="scheme-dot"
              style={{ background: colorSchemes[currentScheme]?.primary }}
            />
          </span>
        </Button>
      </Tooltip>
    </Dropdown>
  );
};

export default ColorThemeSelector;