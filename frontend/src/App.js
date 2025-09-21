import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';
import './styles/global.css';
import { ThemeProvider } from './contexts/ThemeContext';

import Login from './pages/Login';
import Register from './pages/Register';
import DocumentList from './pages/DocumentList';
import Upload from './pages/Upload';
import Search from './pages/Search';
import Admin from './pages/Admin';
import MainLayout from './components/Layout/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import { isAuthenticated } from './utils/auth';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // 初始化时检查认证状态
    const checkAuth = () => {
      setAuthenticated(isAuthenticated());
      setIsLoading(false);
    };

    checkAuth();

    // 监听localStorage变化，当退出登录时立即更新状态
    const handleStorageChange = () => {
      setAuthenticated(isAuthenticated());
    };

    window.addEventListener('storage', handleStorageChange);

    // 也监听自定义事件，用于同窗口内的状态更新
    window.addEventListener('authStateChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleStorageChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ConfigProvider locale={zhCN}>
        <Router>
          <Routes>
          {/* 公开路由 */}
          <Route
            path="/login"
            element={
              authenticated ? <Navigate to="/" replace /> : <Login />
            }
          />

          <Route
            path="/register"
            element={
              authenticated ? <Navigate to="/" replace /> : <Register />
            }
          />

          {/* 私有路由 */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout>
                  <DocumentList />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/documents"
            element={
              <PrivateRoute>
                <MainLayout>
                  <DocumentList />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/upload"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Upload />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/search"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Search />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Admin />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* 默认重定向 */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ConfigProvider>
    </ThemeProvider>
  );
}

export default App;