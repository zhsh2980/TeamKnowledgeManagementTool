import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';

import Login from './pages/Login';
import Register from './pages/Register';
import DocumentList from './pages/DocumentList';
import Upload from './pages/Upload';
import MainLayout from './components/Layout/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import { isAuthenticated } from './utils/auth';

// 页面组件（临时占位）
const Search = () => <div>搜索页面</div>;
const Admin = () => <div>管理员页面</div>;

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          {/* 公开路由 */}
          <Route
            path="/login"
            element={
              isAuthenticated() ? <Navigate to="/" replace /> : <Login />
            }
          />

          <Route
            path="/register"
            element={
              isAuthenticated() ? <Navigate to="/" replace /> : <Register />
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
  );
}

export default App;