import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs, Typography, Checkbox } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  BookOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { saveAuth } from '../utils/auth';
import ThemeSwitcher from '../components/ThemeSwitcher';
import ColorThemeSelector from '../components/ColorThemeSelector';
import './Login.css';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await authService.login(values);
      if (response.success) {
        const { token, user } = response.data;
        saveAuth(token, user, rememberMe);
        message.success('登录成功！');
        navigate('/');
      }
    } catch (error) {
      message.error(error.response?.data?.message || '登录失败');
      loginForm.setFieldsValue({ password: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const response = await authService.register(values);
      if (response.success) {
        message.success('注册成功！请登录');
        setActiveTab('login');
        registerForm.resetFields();
        // 自动填充用户名到登录表单
        loginForm.setFieldsValue({
          email: values.email
        });
      }
    } catch (error) {
      message.error(error.response?.data?.message || '注册失败');
      registerForm.setFieldsValue({
        password: '',
        confirmPassword: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const LoginForm = () => (
    <Form
      form={loginForm}
      name="login"
      onFinish={handleLogin}
      autoComplete="off"
      size="large"
      className="auth-form"
    >
      <Form.Item
        name="email"
        rules={[
          { required: true, message: '请输入用户名或邮箱!' }
        ]}
      >
        <Input
          prefix={<UserOutlined className="input-icon" />}
          placeholder="用户名 / 邮箱"
          className="auth-input"
          autoComplete="username"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: '请输入密码!' }]}
      >
        <Input.Password
          prefix={<LockOutlined className="input-icon" />}
          placeholder="密码"
          className="auth-input"
          autoComplete="current-password"
        />
      </Form.Item>

      <Form.Item className="form-options">
        <div className="remember-forgot">
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="remember-checkbox"
          >
            记住我
          </Checkbox>
          <Link to="/forgot-password" className="forgot-link">
            忘记密码？
          </Link>
        </div>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="auth-submit-btn"
          block
          size="large"
        >
          {loading ? '登录中...' : '立即登录'}
        </Button>
      </Form.Item>
    </Form>
  );

  const RegisterForm = () => (
    <Form
      form={registerForm}
      name="register"
      onFinish={handleRegister}
      autoComplete="off"
      size="large"
      className="auth-form"
    >
      <Form.Item
        name="username"
        rules={[
          { required: true, message: '请输入用户名!' },
          { min: 3, message: '用户名至少3个字符!' },
          { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线!' }
        ]}
      >
        <Input
          prefix={<UserOutlined className="input-icon" />}
          placeholder="用户名"
          className="auth-input"
          autoComplete="username"
        />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          { required: true, message: '请输入邮箱!' },
          { type: 'email', message: '请输入有效的邮箱地址!' }
        ]}
      >
        <Input
          prefix={<MailOutlined className="input-icon" />}
          placeholder="邮箱"
          className="auth-input"
          autoComplete="email"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: '请输入密码!' },
          { min: 6, message: '密码至少6个字符!' }
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="input-icon" />}
          placeholder="密码（至少6位）"
          className="auth-input"
          autoComplete="new-password"
        />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: '请确认密码!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('两次输入的密码不一致!'));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<CheckCircleOutlined className="input-icon" />}
          placeholder="确认密码"
          className="auth-input"
          autoComplete="new-password"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="auth-submit-btn"
          block
          size="large"
        >
          {loading ? '注册中...' : '立即注册'}
        </Button>
      </Form.Item>
    </Form>
  );

  const tabItems = [
    {
      key: 'login',
      label: (
        <span className="tab-label">
          <UserOutlined />
          <span>登录</span>
        </span>
      ),
      children: <LoginForm />,
    },
    {
      key: 'register',
      label: (
        <span className="tab-label">
          <MailOutlined />
          <span>注册</span>
        </span>
      ),
      children: <RegisterForm />,
    },
  ];

  return (
    <div className="login-container">
      {/* 主题控制器 */}
      <div className="login-theme-controls">
        <ColorThemeSelector placement="bottomLeft" />
        <ThemeSwitcher placement="bottomLeft" />
      </div>

      {/* 简洁背景 */}
      <div className="login-background" />

      {/* 居中登录表单 */}
      <div className="login-form-wrapper">
        <div className="login-brand-header">
          <div className="brand-logo">
            <BookOutlined className="logo-icon" />
          </div>
          <Title level={1} className="brand-title">
            知识库管理平台
          </Title>
          <Text className="brand-subtitle">
            企业级文档管理与团队协作解决方案
          </Text>
        </div>

        <Card className="login-card" bordered={false}>
          <div className="login-header">
            <Title level={2} className="login-title">
              {activeTab === 'login' ? '登录' : '注册'}
            </Title>
            <Text className="login-subtitle">
              {activeTab === 'login'
                ? '欢迎回来，请登录您的账户'
                : '创建新账户开始使用'}
            </Text>
          </div>

          <Tabs
            className="login-tabs"
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            centered
          />

          <div className="login-footer">
            <Text type="secondary" className="footer-text">
              {activeTab === 'login' ? (
                <>
                  还没有账户？
                  <a onClick={() => setActiveTab('register')}> 立即注册</a>
                </>
              ) : (
                <>
                  已有账户？
                  <a onClick={() => setActiveTab('login')}> 立即登录</a>
                </>
              )}
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;