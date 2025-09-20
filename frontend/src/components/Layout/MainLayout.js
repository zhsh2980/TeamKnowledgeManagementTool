import React from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';

const { Content, Footer } = Layout;

const MainLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content style={{
        padding: '24px',
        background: '#f5f5f5'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: '#fff',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {children}
        </div>
      </Content>
      <Footer style={{
        textAlign: 'center',
        background: '#f5f5f5',
        color: '#666'
      }}>
        团队知识库管理工具 ©2024 Created by AI Assistant
      </Footer>
    </Layout>
  );
};

export default MainLayout;