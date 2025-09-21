import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';
import CommandPalette from '../CommandPalette/CommandPalette';
import './MainLayout.css';

const { Content, Footer } = Layout;

const MainLayout = ({ children }) => {
  const [commandPaletteVisible, setCommandPaletteVisible] = useState(false);

  // 监听快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K 打开命令面板
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteVisible(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Layout className="main-layout">
      <AppHeader />
      <Content>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div className="page-content-card">
            {children}
          </div>
        </div>
      </Content>
      <Footer style={{
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        color: '#64748b',
        borderTop: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        团队知识库管理工具 ©2024 Powered by Professional Team
      </Footer>
      <CommandPalette
        visible={commandPaletteVisible}
        onClose={() => setCommandPaletteVisible(false)}
      />
    </Layout>
  );
};

export default MainLayout;