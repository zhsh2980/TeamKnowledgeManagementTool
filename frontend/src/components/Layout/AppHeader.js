import React from 'react';
import { Layout, Menu, Dropdown, Button, Avatar, message } from 'antd';
import { UserOutlined, LogoutOutlined, SearchOutlined, UploadOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, clearAuth, isAdmin } from '../../utils/auth';

const { Header } = Layout;

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const handleLogout = () => {
    clearAuth();
    message.success('退出登录成功');
    // 触发自定义事件通知App组件更新认证状态
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    navigate('/login');
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人信息',
      },
      ...(isAdmin() ? [{
        key: 'admin',
        icon: <SettingOutlined />,
        label: '管理员面板',
        onClick: () => navigate('/admin'),
      }] : []),
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  };

  const mainMenuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate('/'),
    },
    {
      key: '/upload',
      icon: <UploadOutlined />,
      label: '上传文档',
      onClick: () => navigate('/upload'),
    },
    {
      key: '/search',
      icon: <SearchOutlined />,
      label: '搜索',
      onClick: () => navigate('/search'),
    },
  ];

  return (
    <Header style={{
      padding: '0 24px',
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginRight: '32px',
          color: '#1890ff'
        }}>
          团队知识库
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={mainMenuItems}
          style={{
            border: 'none',
            flex: 1,
            minWidth: '300px'
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        {user && (
          <Dropdown menu={userMenu} placement="bottomRight">
            <Button
              type="text"
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '40px',
                padding: '0 12px'
              }}
            >
              <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: '8px' }} />
              <span>{user.username}</span>
              {isAdmin() && <span style={{ marginLeft: '4px', color: '#1890ff' }}>(管理员)</span>}
            </Button>
          </Dropdown>
        )}
      </div>
    </Header>
  );
};

export default AppHeader;