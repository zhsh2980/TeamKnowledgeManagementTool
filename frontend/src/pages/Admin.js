import React, { useState, useEffect } from 'react';
import {
  Card,
  Statistic,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Button,
  message,
  Spin,
  Typography,
  List,
  Avatar,
  Progress,
  Select,
  Timeline,
  Tooltip
} from 'antd';
import {
  UserOutlined,
  FileOutlined,
  SearchOutlined,
  TeamOutlined,
  BarChartOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
  DownOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FileMarkdownOutlined,
  ClockCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip as ChartTooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import { adminService } from '../services/api';
import { formatDate, formatFileSize } from '../utils/format';
import './Admin.css';

const { Title, Text } = Typography;
const { Option } = Select;

// 图表颜色配置
const CHART_COLORS = {
  primary: '#0F766E',
  secondary: '#14B8A6',
  tertiary: '#0D5953',
  accent: '#10b981',
  warning: '#f59e0b',
  info: '#06b6d4',
  error: '#ef4444'
};

// 饼图颜色
const PIE_COLORS = ['#0F766E', '#14B8A6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    totalSearches: 0,
    totalDownloads: 0,
    userGrowth: 12, // 模拟增长数据
    documentGrowth: 25,
    searchGrowth: -5,
    downloadGrowth: 18
  });
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [popularDocs, setPopularDocs] = useState([]);
  const [userPagination, setUserPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 模拟图表数据
  const [chartData, setChartData] = useState({
    userGrowth: [],
    documentTypes: [],
    dailyActivity: [],
    operationLogs: []
  });

  useEffect(() => {
    loadDashboardData();
    generateChartData();
  }, []);

  // 生成模拟图表数据
  const generateChartData = () => {
    // 用户增长数据
    const userGrowth = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      userGrowth.push({
        date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        users: Math.floor(Math.random() * 5) + 1,
        documents: Math.floor(Math.random() * 10) + 2
      });
    }

    // 文档类型分布
    const documentTypes = [
      { name: 'PDF', value: 35, count: 12 },
      { name: 'Word', value: 25, count: 8 },
      { name: 'Excel', value: 20, count: 6 },
      { name: 'Markdown', value: 10, count: 3 },
      { name: '其他', value: 10, count: 3 }
    ];

    // 每日活动数据
    const dailyActivity = [];
    for (let i = 23; i >= 0; i--) {
      dailyActivity.push({
        hour: `${i}:00`,
        uploads: Math.floor(Math.random() * 10),
        downloads: Math.floor(Math.random() * 15),
        searches: Math.floor(Math.random() * 20)
      });
    }

    // 操作日志
    const operationLogs = [
      { time: '10:32', action: '用户 admin 上传了文档', type: 'upload' },
      { time: '09:45', action: '用户 lisi 下载了文档', type: 'download' },
      { time: '09:12', action: '新用户 testuser 注册', type: 'user' },
      { time: '08:30', action: '用户 bro 搜索了关键词', type: 'search' },
      { time: '昨天', action: '系统自动备份完成', type: 'system' }
    ];

    setChartData({
      userGrowth,
      documentTypes,
      dailyActivity,
      operationLogs
    });
  };

  // 加载仪表板数据
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 并行加载所有数据
      const [statsRes, usersRes, activeUsersRes, popularDocsRes] = await Promise.all([
        adminService.getStatistics(),
        adminService.getUsers({ page: 1, limit: 10 }),
        adminService.getActiveUsers(5),
        adminService.getPopularDocuments(5)
      ]);

      if (statsRes.success) {
        setStatistics({
          ...statsRes.data,
          userGrowth: 12,
          documentGrowth: 25,
          searchGrowth: -5,
          downloadGrowth: 18
        });
      }

      if (usersRes.success) {
        setUsers(usersRes.data.users);
        setUserPagination({
          current: 1,
          pageSize: 10,
          total: usersRes.data.total
        });
      }

      if (activeUsersRes.success) {
        setActiveUsers(activeUsersRes.data);
      }

      if (popularDocsRes.success) {
        setPopularDocs(popularDocsRes.data);
      }
    } catch (error) {
      console.error('加载仪表板数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    generateChartData();
    message.success('数据已刷新');
    setTimeout(() => setRefreshing(false), 1000);
  };

  // 加载用户列表
  const loadUsers = async (page = 1) => {
    try {
      const response = await adminService.getUsers({
        page,
        limit: userPagination.pageSize
      });
      if (response.success) {
        setUsers(response.data.users);
        setUserPagination({
          ...userPagination,
          current: page,
          total: response.data.total
        });
      }
    } catch (error) {
      message.error('加载用户列表失败');
    }
  };

  // 更新用户角色
  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await adminService.updateUserRole(userId, newRole);
      if (response.success) {
        message.success('角色更新成功');
        loadUsers(userPagination.current);
      }
    } catch (error) {
      message.error('角色更新失败');
    }
  };

  // 获取文件图标
  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop().toLowerCase();
    const iconProps = { style: { fontSize: 20 } };

    switch(ext) {
      case 'pdf': return <FilePdfOutlined {...iconProps} style={{ color: '#ff4d4f' }} />;
      case 'doc':
      case 'docx': return <FileWordOutlined {...iconProps} style={{ color: '#1890ff' }} />;
      case 'xls':
      case 'xlsx': return <FileExcelOutlined {...iconProps} style={{ color: '#52c41a' }} />;
      case 'ppt':
      case 'pptx': return <FilePptOutlined {...iconProps} style={{ color: '#fa8c16' }} />;
      case 'md': return <FileMarkdownOutlined {...iconProps} style={{ color: '#13c2c2' }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <FileImageOutlined {...iconProps} style={{ color: '#722ed1' }} />;
      default: return <FileTextOutlined {...iconProps} style={{ color: '#8c8c8c' }} />;
    }
  };

  // 用户表格列
  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <div className="user-info">
          <Avatar icon={<UserOutlined />} />
          <span className="user-name">{text}</span>
        </div>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role, record) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        // 不能修改自己的角色
        if (currentUser.id === record.id) {
          return role === 'admin' ? (
            <div className="role-tag role-admin">
              <CrownOutlined />
              <span>管理员</span>
            </div>
          ) : (
            <div className="role-tag role-user">
              <UserOutlined />
              <span>普通用户</span>
            </div>
          );
        }

        return (
          <Select
            value={role}
            style={{ width: '120px' }}
            onChange={(value) => handleRoleChange(record.id, value)}
            suffixIcon={<DownOutlined />}
          >
            <Option value="user">
              <Space size={4}>
                <UserOutlined style={{ color: '#1890ff' }} />
                <span>普通用户</span>
              </Space>
            </Option>
            <Option value="admin">
              <Space size={4}>
                <CrownOutlined style={{ color: '#faad14' }} />
                <span>管理员</span>
              </Space>
            </Option>
          </Select>
        );
      }
    },
    {
      title: '文档数',
      dataIndex: 'document_count',
      key: 'document_count',
      render: (count) => <Tag color="blue">{count || 0}</Tag>
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDate(date)
    }
  ];

  // 检查当前用户是否是管理员
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  if (currentUser.role !== 'admin') {
    return (
      <div className="admin-forbidden">
        <SafetyCertificateOutlined />
        <Title level={3}>权限不足</Title>
        <Text>您没有权限访问管理员页面</Text>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <Title level={2}>
          <BarChartOutlined /> 管理员仪表板
        </Title>
        <div className="admin-header-actions">
          <Button icon={<SyncOutlined />} onClick={handleRefresh}>
            刷新数据
          </Button>
        </div>
      </div>

      <Spin spinning={loading}>
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} className="statistics-row">
          <Col xs={12} sm={12} md={6}>
            <Card className="admin-card admin-statistic-card stat-users">
              <Statistic
                title="总用户数"
                value={statistics.totalUsers}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#3b82f6' }}
              />
              <div className="statistic-trend trend-up">
                <ArrowUpOutlined />
                <span>{statistics.userGrowth}% 较上周</span>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card className="admin-card admin-statistic-card stat-documents">
              <Statistic
                title="文档总数"
                value={statistics.totalDocuments}
                prefix={<FileOutlined />}
                valueStyle={{ color: '#10b981' }}
              />
              <div className="statistic-trend trend-up">
                <ArrowUpOutlined />
                <span>{statistics.documentGrowth}% 较上周</span>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card className="admin-card admin-statistic-card stat-searches">
              <Statistic
                title="搜索次数"
                value={statistics.totalSearches}
                prefix={<SearchOutlined />}
                valueStyle={{ color: '#f59e0b' }}
              />
              <div className="statistic-trend trend-down">
                <ArrowDownOutlined />
                <span>{Math.abs(statistics.searchGrowth)}% 较上周</span>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card className="admin-card admin-statistic-card stat-downloads">
              <Statistic
                title="下载次数"
                value={statistics.totalDownloads}
                prefix={<FileOutlined />}
                valueStyle={{ color: '#06b6d4' }}
              />
              <div className="statistic-trend trend-up">
                <ArrowUpOutlined />
                <span>{statistics.downloadGrowth}% 较上周</span>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 图表区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {/* 用户与文档增长趋势 */}
          <Col xs={24} lg={16}>
            <Card
              className="admin-card chart-card"
              title="7日增长趋势"
              extra={<Text type="secondary">用户与文档</Text>}
            >
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#999" />
                    <YAxis stroke="#999" />
                    <ChartTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="users"
                      name="新增用户"
                      stroke={CHART_COLORS.primary}
                      fill={CHART_COLORS.secondary}
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="documents"
                      name="新增文档"
                      stroke={CHART_COLORS.accent}
                      fill={CHART_COLORS.accent}
                      fillOpacity={0.4}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* 文档类型分布 */}
          <Col xs={24} lg={8}>
            <Card
              className="admin-card chart-card"
              title="文档类型分布"
              extra={<Text type="secondary">占比统计</Text>}
            >
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.documentTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.documentTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {/* 活跃用户 */}
          <Col xs={24} md={12}>
            <Card
              className="admin-card"
              title="活跃用户"
              extra={<Text type="secondary">最近7天</Text>}
            >
              <List
                className="admin-active-users"
                itemLayout="horizontal"
                dataSource={activeUsers}
                renderItem={(user) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={user.username}
                      description={`${user.document_count || 0} 个文档 · ${user.login_count || 0} 次登录`}
                    />
                    <div>
                      <Progress
                        percent={Math.min((user.document_count || 0) * 10, 100)}
                        size="small"
                        showInfo={false}
                        strokeColor={CHART_COLORS.primary}
                      />
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* 热门文档 */}
          <Col xs={24} md={12}>
            <Card
              className="admin-card"
              title="热门文档"
              extra={<Text type="secondary">下载最多</Text>}
            >
              <List
                className="admin-popular-docs"
                itemLayout="horizontal"
                dataSource={popularDocs}
                renderItem={(doc) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div className="doc-icon">
                          {getFileIcon(doc.file_name)}
                        </div>
                      }
                      title={doc.title}
                      description={
                        <Space>
                          <Text type="secondary">
                            {doc.upload_username || '未知用户'}
                          </Text>
                          <Text type="secondary">
                            {doc.file_size ? formatFileSize(doc.file_size) : '未知大小'}
                          </Text>
                        </Space>
                      }
                    />
                    <Tag color="blue">{doc.download_count || 0} 次下载</Tag>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        {/* 操作日志时间轴 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card
              className="admin-card"
              title="最近操作"
              extra={<Text type="secondary">系统日志</Text>}
            >
              <Timeline className="operation-timeline">
                {chartData.operationLogs.map((log, index) => (
                  <Timeline.Item
                    key={index}
                    color={log.type === 'error' ? 'red' : 'blue'}
                    dot={log.type === 'system' ? <ClockCircleOutlined /> : null}
                  >
                    <div className="operation-title">{log.action}</div>
                    <div className="operation-time">{log.time}</div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>
        </Row>

        {/* 用户管理表格 */}
        <Card className="admin-card" title="用户管理">
          <div className="admin-user-table">
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="id"
              pagination={{
                ...userPagination,
                onChange: loadUsers,
                showSizeChanger: false,
                showTotal: (total) => `共 ${total} 个用户`
              }}
            />
          </div>
        </Card>
      </Spin>

      {/* 刷新按钮 */}
      <Tooltip title="刷新数据">
        <div
          className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
        >
          <ReloadOutlined />
        </div>
      </Tooltip>
    </div>
  );
};

export default AdminDashboard;