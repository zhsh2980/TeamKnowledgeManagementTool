import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Badge, Tooltip, Space, Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileTextOutlined,
  CloudUploadOutlined,
  SearchOutlined,
  DashboardOutlined,
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
  BookOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { clearAuth, getCurrentUser } from '../../utils/auth';
import CommandPalette from '../CommandPalette/CommandPalette';
import ThemeSwitcher from '../ThemeSwitcher';
import ColorThemeSelector from '../ColorThemeSelector';
import './MainLayout.css';

const { Header, Sider, Content, Footer } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [commandPaletteVisible, setCommandPaletteVisible] = useState(false);
  const [notificationCount, setNotificationCount] = useState(5);
  const [isUrgentNotification, setIsUrgentNotification] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();

  // 根据用户角色生成菜单
  const getMenuItems = () => {
    const baseItems = [
      {
        key: '/',
        icon: <HomeOutlined />,
        label: '首页',
        onClick: () => navigate('/')
      },
      {
        key: '/documents',
        icon: <FileTextOutlined />,
        label: '文档列表',
        onClick: () => navigate('/documents')
      },
      {
        key: '/upload',
        icon: <CloudUploadOutlined />,
        label: '上传文档',
        onClick: () => navigate('/upload')
      },
      {
        key: '/search',
        icon: <SearchOutlined />,
        label: '智能搜索',
        onClick: () => navigate('/search')
      }
    ];

    // 管理员特有菜单
    if (currentUser?.role === 'admin') {
      baseItems.push({
        type: 'divider'
      });
      baseItems.push({
        key: '/admin',
        icon: <DashboardOutlined />,
        label: '管理面板',
        onClick: () => navigate('/admin'),
        className: 'admin-menu-item'
      });
    }

    return baseItems;
  };

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

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
    // 触发认证状态改变事件
    window.dispatchEvent(new Event('authStateChanged'));
  };

  // 获取当前页面标题
  const getPageTitle = () => {
    const path = location.pathname;
    const titleMap = {
      '/': '首页',
      '/documents': '文档列表',
      '/upload': '上传文档',
      '/search': '智能搜索',
      '/admin': '管理面板'
    };
    return titleMap[path] || '团队知识库';
  };

  return (
    <Layout className="main-layout-sidebar">
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="layout-sidebar"
        width={260}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
      >
        {/* Logo区域 */}
        <div
          className="sidebar-logo"
          style={collapsed ? {
            padding: '0 !important',
            margin: '0 !important',
            justifyContent: 'center !important',
            alignItems: 'center !important',
            display: 'flex !important',
            width: '80px !important',
            height: '64px',
            position: 'relative'
          } : {}}
        >
          <BookOutlined
            className="logo-icon"
            style={collapsed ? {
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              margin: '0',
              padding: '0',
              fontSize: '24px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            } : {}}
          />
          {!collapsed && (
            <span className="logo-text">团队知识库</span>
          )}
        </div>


        {/* 导航菜单 */}
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          className="sidebar-menu"
        />

      </Sider>

      <Layout>
        {/* 顶部栏 */}
        <Header className="layout-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="trigger-btn"
            />
            <h2 className="page-title">{getPageTitle()}</h2>
          </div>

          <div className="header-right">
            <Space size="large">
              {/* 配色主题选择器 */}
              <ColorThemeSelector />

              {/* 主题切换器 */}
              <ThemeSwitcher />

              {/* 通知图标 */}
              <Tooltip
                title={`通知中心${notificationCount > 0 ? ` (${notificationCount}条新消息)` : ''}`}
                placement="bottom"
              >
                <div className="notification-container">
                  <Badge
                    count={notificationCount}
                    size="small"
                    className={`notification-badge ${isUrgentNotification ? 'urgent' : ''}`}
                    offset={[-6, 6]}
                    overflowCount={99}
                  >
                    <Button
                      type="text"
                      shape="circle"
                      icon={<BellOutlined />}
                      className="header-icon-btn notification-btn"
                      aria-label={`通知中心${notificationCount > 0 ? `, ${notificationCount}条未读消息` : ', 无未读消息'}`}
                      aria-describedby="notification-description"
                      onClick={() => {
                        // 点击通知时的处理逻辑
                        console.log('打开通知中心');
                        // 可以在这里添加打开通知面板的逻辑
                        // 演示：点击后重置通知数量
                        setNotificationCount(0);
                        setIsUrgentNotification(false);
                      }}
                    />
                    {/* 屏幕阅读器友好的描述 */}
                    <span id="notification-description" className="sr-only">
                      {isUrgentNotification ? '包含紧急通知' : '常规通知'}
                    </span>
                  </Badge>
                </div>
              </Tooltip>

              {/* 用户下拉菜单 */}
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'user-info',
                      label: (
                        <div style={{ padding: '8px 0' }}>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>
                            {currentUser?.username}
                          </div>
                          <div style={{ fontSize: 12, color: '#666' }}>
                            {currentUser?.role === 'admin' ? '管理员' : '普通用户'}
                          </div>
                        </div>
                      ),
                      disabled: true
                    },
                    { type: 'divider' },
                    {
                      key: 'command',
                      icon: <AppstoreOutlined />,
                      label: '命令面板',
                      extra: '⌘K',
                      onClick: () => setCommandPaletteVisible(true)
                    },
                    {
                      key: 'notification-demo',
                      icon: <BellOutlined />,
                      label: '通知演示',
                      children: [
                        {
                          key: 'normal-notification',
                          label: '普通通知 (3条)',
                          onClick: () => {
                            setNotificationCount(3);
                            setIsUrgentNotification(false);
                          }
                        },
                        {
                          key: 'urgent-notification',
                          label: '紧急通知 (8条)',
                          onClick: () => {
                            setNotificationCount(8);
                            setIsUrgentNotification(true);
                          }
                        },
                        {
                          key: 'clear-notification',
                          label: '清空通知',
                          onClick: () => {
                            setNotificationCount(0);
                            setIsUrgentNotification(false);
                          }
                        }
                      ]
                    },
                    {
                      key: 'settings',
                      icon: <SettingOutlined />,
                      label: '系统设置'
                    },
                    {
                      key: 'help',
                      icon: <QuestionCircleOutlined />,
                      label: '帮助中心'
                    },
                    { type: 'divider' },
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: '退出登录',
                      danger: true,
                      onClick: handleLogout
                    }
                  ]
                }}
                placement="bottomRight"
                arrow
              >
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar icon={<UserOutlined />} />
                  <span className="header-username">{currentUser?.username}</span>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>

        {/* 内容区 */}
        <Content className="layout-content">
          <div className="content-wrapper">
            {children}
          </div>
        </Content>

        {/* 底部 */}
        <Footer className="layout-footer">
          <div className="footer-content">
            <span>团队知识库管理系统 ©2025</span>
            <span className="footer-divider">|</span>
            <span>Powered by Professional Team</span>
          </div>
        </Footer>
      </Layout>

      {/* 命令面板 */}
      <CommandPalette
        visible={commandPaletteVisible}
        onClose={() => setCommandPaletteVisible(false)}
      />
    </Layout>
  );
};

export default MainLayout;