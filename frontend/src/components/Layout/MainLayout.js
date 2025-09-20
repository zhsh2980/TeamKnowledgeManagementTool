import React from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';
import './MainLayout.css';

const { Content, Footer } = Layout;

const MainLayout = ({ children }) => {
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
    </Layout>
  );
};

export default MainLayout;