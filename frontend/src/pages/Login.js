import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Tabs, Typography, Divider, Checkbox } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  BookOutlined,
  GithubOutlined,
  GoogleOutlined,
  WechatOutlined,
  SafetyOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  ApiOutlined,
  CloudOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { saveAuth } from '../utils/auth';
import './Login.css';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  // 动态背景切换
  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundIndex(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
      {/* 动态背景层 */}
      <div className="login-background">
        <div className={`bg-gradient bg-gradient-${backgroundIndex}`} />
        <div className="bg-pattern" />
        <div className="floating-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
          <div className="shape shape-4" />
          <div className="shape shape-5" />
          <div className="shape shape-6" />
        </div>
      </div>

      {/* 左侧品牌展示区 */}
      <div className="login-brand">
        <div className="brand-content">
          <div className="brand-logo">
            <BookOutlined className="logo-icon" />
            <div className="logo-shine" />
          </div>
          <Title level={1} className="brand-title">
            知识库管理平台
          </Title>
          <Text className="brand-subtitle">
            企业级文档管理与团队协作解决方案
          </Text>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <RocketOutlined className="feature-icon" />
              </div>
              <div className="feature-content">
                <Text strong>极速搜索</Text>
                <Text className="feature-desc">智能索引，毫秒响应</Text>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <SafetyOutlined className="feature-icon" />
              </div>
              <div className="feature-content">
                <Text strong>安全可靠</Text>
                <Text className="feature-desc">企业级加密保护</Text>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <TeamOutlined className="feature-icon" />
              </div>
              <div className="feature-content">
                <Text strong>团队协作</Text>
                <Text className="feature-desc">实时同步共享</Text>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <CloudOutlined className="feature-icon" />
              </div>
              <div className="feature-content">
                <Text strong>云端存储</Text>
                <Text className="feature-desc">随时随地访问</Text>
              </div>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">活跃用户</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50K+</div>
              <div className="stat-label">文档数量</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">稳定性</div>
            </div>
          </div>

          <div className="brand-footer">
            <Text className="copyright">© 2024 Knowledge Base Pro</Text>
            <Text className="version">v2.0.0</Text>
          </div>
        </div>
      </div>

      {/* 右侧登录表单区 */}
      <div className="login-form-wrapper">
        <Card className="login-card" bordered={false}>
          <div className="login-header">
            <div className="header-icon">
              <ApiOutlined />
            </div>
            <Title level={2} className="login-title">
              {activeTab === 'login' ? '欢迎回来' : '创建账户'}
            </Title>
            <Text className="login-subtitle">
              {activeTab === 'login'
                ? '登录到您的账户继续'
                : '注册新账户开始使用'}
            </Text>
          </div>

          <Tabs
            className="login-tabs"
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            centered
          />

          <Divider className="social-divider">
            <Text className="divider-text">或使用第三方登录</Text>
          </Divider>

          <div className="social-login">
            <Button
              className="social-btn github-btn"
              icon={<GithubOutlined />}
              disabled
            >
              GitHub
            </Button>
            <Button
              className="social-btn google-btn"
              icon={<GoogleOutlined />}
              disabled
            >
              Google
            </Button>
            <Button
              className="social-btn wechat-btn"
              icon={<WechatOutlined />}
              disabled
            >
              微信
            </Button>
          </div>

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
            <Text type="secondary" className="terms-text">
              使用即表示您同意我们的
              <Link to="/terms"> 服务条款</Link> 和
              <Link to="/privacy"> 隐私政策</Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;