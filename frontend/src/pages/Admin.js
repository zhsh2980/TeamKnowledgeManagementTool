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
  Select
} from 'antd';
import {
  UserOutlined,
  FileOutlined,
  SearchOutlined,
  TeamOutlined,
  BarChartOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
  DownOutlined
} from '@ant-design/icons';
import { adminService } from '../services/api';
import { formatDate, formatFileSize } from '../utils/format';
import './Admin.css';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    totalSearches: 0,
    totalDownloads: 0
  });
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [popularDocs, setPopularDocs] = useState([]);
  const [userPagination, setUserPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

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
        setStatistics(statsRes.data);
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
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text>{text}</Text>
        </Space>
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
            <Tag icon={<CrownOutlined />} color="gold" style={{ width: '120px', textAlign: 'center' }}>管理员</Tag>
          ) : (
            <Tag icon={<UserOutlined />} color="blue" style={{ width: '120px', textAlign: 'center' }}>普通用户</Tag>
          );
        }

        return (
          <Select
            value={role}
            style={{ width: '120px' }}
            onChange={(value) => handleRoleChange(record.id, value)}
            suffixIcon={<DownOutlined style={{ color: '#1890ff', pointerEvents: 'none' }} />}
            dropdownStyle={{ minWidth: '140px' }}
            placeholder="选择角色"
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
          >
            <Option value="user">
              <Space size={4}>
                <UserOutlined style={{ color: '#1890ff' }} />
                <span style={{ color: '#000' }}>普通用户</span>
              </Space>
            </Option>
            <Option value="admin">
              <Space size={4}>
                <CrownOutlined style={{ color: '#faad14' }} />
                <span style={{ color: '#000' }}>管理员</span>
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
      render: (count) => <Tag>{count || 0}</Tag>
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
        <SafetyCertificateOutlined style={{ fontSize: 64, color: '#ff4d4f' }} />
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
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
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
                      avatar={<FileOutlined style={{ fontSize: 24 }} />}
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

        {/* 用户管理表格 */}
        <Card className="admin-card" title="用户管理" style={{ marginTop: 24 }}>
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
    </div>
  );
};

export default AdminDashboard;