import React from 'react';
import { Card, Space, Button, Typography, Row, Col, message } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { colorSchemes } from '../styles/color-schemes';

const { Title, Text } = Typography;

const ColorSchemeSelector = ({ onSelect }) => {
  const handleSelect = (schemeName) => {
    const scheme = colorSchemes[schemeName];

    // 更新CSS变量
    const root = document.documentElement;
    root.style.setProperty('--primary-color', scheme.primary);
    root.style.setProperty('--primary-light', scheme.primaryLight);
    root.style.setProperty('--primary-dark', scheme.primaryDark);
    root.style.setProperty('--primary-gradient', scheme.gradient);

    // 保存选择
    localStorage.setItem('colorScheme', schemeName);

    message.success(`已切换到 ${scheme.name} 配色方案`);

    if (onSelect) {
      onSelect(schemeName);
    }

    // 刷新页面以应用新主题
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const currentScheme = localStorage.getItem('colorScheme') || 'ocean';

  return (
    <div style={{ padding: '24px', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>
          选择配色方案
        </Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 32 }}>
          选择最适合您企业风格的配色方案
        </Text>

        <Row gutter={[16, 16]}>
          {Object.entries(colorSchemes).map(([key, scheme]) => (
            <Col xs={24} sm={12} md={8} lg={6} key={key}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  border: currentScheme === key ? `2px solid ${scheme.primary}` : '1px solid #e5e7eb',
                  position: 'relative'
                }}
                onClick={() => handleSelect(key)}
              >
                {currentScheme === key && (
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 24,
                    height: 24,
                    background: scheme.primary,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckOutlined style={{ color: 'white', fontSize: 14 }} />
                  </div>
                )}

                <div style={{
                  height: 80,
                  background: scheme.gradient,
                  borderRadius: 8,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: 60,
                    height: 60,
                    background: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Text strong style={{ color: scheme.primary, fontSize: 24 }}>
                      {scheme.name.charAt(0)}
                    </Text>
                  </div>
                </div>

                <Title level={5} style={{ marginBottom: 8 }}>
                  {scheme.name}
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {scheme.description}
                </Text>

                <Space direction="vertical" size={4} style={{ marginTop: 12, width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      background: scheme.primary,
                      borderRadius: 4
                    }} />
                    <Text style={{ fontSize: 11, fontFamily: 'monospace' }}>
                      {scheme.primary}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      background: scheme.primaryLight,
                      borderRadius: 4
                    }} />
                    <Text style={{ fontSize: 11, fontFamily: 'monospace' }}>
                      {scheme.primaryLight}
                    </Text>
                  </div>
                </Space>

                <Button
                  type={currentScheme === key ? 'primary' : 'default'}
                  size="small"
                  style={{
                    marginTop: 12,
                    width: '100%',
                    background: currentScheme === key ? scheme.gradient : undefined
                  }}
                >
                  {currentScheme === key ? '当前使用' : '选择此方案'}
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Space>
            <Button type="primary" size="large" style={{ background: colorSchemes[currentScheme].gradient }}>
              示例按钮
            </Button>
            <Button size="large">
              普通按钮
            </Button>
            <Button type="link" size="large" style={{ color: colorSchemes[currentScheme].primary }}>
              链接按钮
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default ColorSchemeSelector;