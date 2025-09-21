import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Input,
  Row,
  Col,
  Spin,
  Empty,
  Segmented,
  Tooltip,
  Avatar,
  Dropdown,
  Badge,
  Typography
} from 'antd';
import {
  DownloadOutlined,
  DeleteOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FileMarkdownOutlined,
  SearchOutlined,
  UploadOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  MoreOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CloudDownloadOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { documentService } from '../services/api';
import { formatFileSize, formatDate } from '../utils/format';
import './DocumentList.css';

const { Search } = Input;
const { Text, Paragraph } = Typography;

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: viewMode === 'grid' ? 12 : 10,
    total: 0
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // 根据文件扩展名获取图标
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconProps = { style: { fontSize: 32 } };

    switch(ext) {
      case 'pdf':
        return <FilePdfOutlined {...iconProps} style={{ ...iconProps.style, color: '#ff4d4f' }} />;
      case 'doc':
      case 'docx':
        return <FileWordOutlined {...iconProps} style={{ ...iconProps.style, color: '#1890ff' }} />;
      case 'xls':
      case 'xlsx':
        return <FileExcelOutlined {...iconProps} style={{ ...iconProps.style, color: '#52c41a' }} />;
      case 'ppt':
      case 'pptx':
        return <FilePptOutlined {...iconProps} style={{ ...iconProps.style, color: '#fa8c16' }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <FileImageOutlined {...iconProps} style={{ ...iconProps.style, color: '#722ed1' }} />;
      case 'md':
        return <FileMarkdownOutlined {...iconProps} style={{ ...iconProps.style, color: '#13c2c2' }} />;
      case 'txt':
        return <FileTextOutlined {...iconProps} style={{ ...iconProps.style, color: '#595959' }} />;
      default:
        return <FileOutlined {...iconProps} style={{ ...iconProps.style, color: '#8c8c8c' }} />;
    }
  };

  // 获取文档列表
  const fetchDocuments = async (params = {}) => {
    setLoading(true);
    try {
      const response = await documentService.list({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchKeyword,
        tags: selectedTags.join(','),
        ...params
      });

      if (response.success) {
        setDocuments(response.data.documents);
        setPagination({
          ...pagination,
          total: response.data.total,
          current: response.data.page
        });
      } else {
        message.error(response.message || '获取文档列表失败');
      }
    } catch (error) {
      console.error('获取文档列表错误:', error);
      message.error('获取文档列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 切换视图模式
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    const newPageSize = mode === 'grid' ? 12 : 10;
    setPagination({ ...pagination, pageSize: newPageSize });
    fetchDocuments({ page: 1, limit: newPageSize });
  };

  // 下载文档
  const handleDownload = async (doc) => {
    try {
      const blob = await documentService.download(doc.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.file_name);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      message.success('下载成功');
    } catch (error) {
      console.error('下载错误:', error);
      message.error(error.response?.data?.message || '下载失败');
    }
  };

  // 删除文档
  const handleDelete = async (id) => {
    try {
      const response = await documentService.delete(id);
      if (response.success) {
        message.success('删除成功');
        fetchDocuments();
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      console.error('删除错误:', error);
      message.error(error.response?.data?.message || '删除失败');
    }
  };

  // 搜索
  const handleSearch = (value) => {
    setSearchKeyword(value);
    fetchDocuments({ search: value, page: 1 });
  };

  // 处理标签点击
  const handleTagClick = (tag) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      fetchDocuments({ tags: newTags.join(','), page: 1 });
    }
  };

  // 清除标签筛选
  const clearTagFilter = () => {
    setSelectedTags([]);
    fetchDocuments({ tags: '', page: 1 });
  };

  // 渲染卡片视图的单个文档
  const renderDocumentCard = (doc) => {
    const menuItems = [
      {
        key: 'download',
        icon: <DownloadOutlined />,
        label: '下载文档',
        onClick: () => handleDownload(doc)
      }
    ];

    if (doc.upload_user_id === currentUser.id || currentUser.role === 'admin') {
      menuItems.push({
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除文档',
        danger: true,
        onClick: () => {
          Popconfirm.confirm({
            title: '确定要删除这个文档吗？',
            onConfirm: () => handleDelete(doc.id),
            okText: '确定',
            cancelText: '取消'
          });
        }
      });
    }

    return (
      <Col xs={24} sm={12} md={8} lg={6} key={doc.id}>
        <Card
          className="document-card"
          hoverable
          cover={
            <div className="document-card-cover">
              {getFileIcon(doc.file_name)}
              {doc.is_public === 0 && (
                <Badge className="private-badge" count="私有" />
              )}
            </div>
          }
          actions={[
            <Tooltip title="预览">
              <Button type="text" icon={<EyeOutlined />} />
            </Tooltip>,
            <Tooltip title="下载">
              <Button
                type="text"
                icon={<CloudDownloadOutlined />}
                onClick={() => handleDownload(doc)}
              />
            </Tooltip>,
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          ]}
        >
          <Card.Meta
            title={
              <Tooltip title={doc.title} placement="topLeft">
                <Text ellipsis className="document-card-title">
                  {doc.title}
                </Text>
              </Tooltip>
            }
            description={
              <div className="document-card-content">
                <Paragraph
                  ellipsis={{ rows: 2 }}
                  className="document-description"
                >
                  {doc.description || '暂无描述'}
                </Paragraph>

                <div className="document-tags">
                  {doc.tags && doc.tags.split(',').slice(0, 3).map(tag => (
                    <Tag
                      key={tag}
                      color="blue"
                      onClick={() => handleTagClick(tag.trim())}
                      style={{ cursor: 'pointer' }}
                    >
                      {tag.trim()}
                    </Tag>
                  ))}
                </div>

                <div className="document-meta">
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <div className="meta-item">
                      <UserOutlined />
                      <Text type="secondary" className="meta-text">
                        {doc.upload_username}
                      </Text>
                    </div>
                    <div className="meta-item">
                      <ClockCircleOutlined />
                      <Text type="secondary" className="meta-text">
                        {formatDate(doc.created_at)}
                      </Text>
                    </div>
                    <div className="meta-item-row">
                      <span className="meta-size">{formatFileSize(doc.file_size)}</span>
                      <span className="meta-downloads">
                        <DownloadOutlined /> {doc.download_count}
                      </span>
                    </div>
                  </Space>
                </div>
              </div>
            }
          />
        </Card>
      </Col>
    );
  };

  // 表格列定义（列表视图）
  const columns = [
    {
      title: '文档标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          {getFileIcon(record.file_name)}
          <div>
            <Text strong>{text}</Text>
            {record.is_public === 0 && (
              <Tag color="orange" style={{ marginLeft: 8 }}>私有</Tag>
            )}
            {record.description && (
              <div>
                <Text type="secondary" ellipsis style={{ maxWidth: 300 }}>
                  {record.description}
                </Text>
              </div>
            )}
          </div>
        </Space>
      )
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags) => {
        if (!tags) return null;
        return (
          <div className="table-tags">
            {tags.split(',').map(tag => (
              <Tag
                key={tag}
                color="blue"
                style={{ cursor: 'pointer' }}
                onClick={() => handleTagClick(tag.trim())}
              >
                {tag.trim()}
              </Tag>
            ))}
          </div>
        );
      }
    },
    {
      title: '文件信息',
      key: 'fileInfo',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{formatFileSize(record.file_size)}</Text>
          <Text type="secondary">
            <DownloadOutlined /> {record.download_count} 次下载
          </Text>
        </Space>
      )
    },
    {
      title: '上传者',
      dataIndex: 'upload_username',
      key: 'upload_username',
      width: 120,
      render: (username) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{username}</Text>
        </Space>
      )
    },
    {
      title: '上传时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => formatDate(date)
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="下载">
            <Button
              type="primary"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          {(record.upload_user_id === currentUser.id || currentUser.role === 'admin') && (
            <Popconfirm
              title="确定要删除这个文档吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="删除">
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  // 处理表格变化
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
    fetchDocuments({
      page: newPagination.current,
      limit: newPagination.pageSize
    });
  };

  // 处理卡片分页变化
  const handleCardPaginationChange = (page, pageSize) => {
    setPagination({ ...pagination, current: page, pageSize });
    fetchDocuments({ page, limit: pageSize });
  };

  return (
    <div className="document-list-container">
      <Card className="document-list-header">
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              <Row gutter={16}>
                <Col span={14}>
                  <Search
                    placeholder="搜索文档标题、描述或标签"
                    onSearch={handleSearch}
                    enterButton={<SearchOutlined />}
                    size="large"
                    className="document-search"
                  />
                </Col>
                <Col span={10}>
                  <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Segmented
                      value={viewMode}
                      onChange={handleViewModeChange}
                      options={[
                        { label: '网格', value: 'grid', icon: <AppstoreOutlined /> },
                        { label: '列表', value: 'list', icon: <UnorderedListOutlined /> }
                      ]}
                    />
                    <Link to="/upload">
                      <Button type="primary" icon={<UploadOutlined />}>
                        上传文档
                      </Button>
                    </Link>
                  </Space>
                </Col>
              </Row>

              {selectedTags.length > 0 && (
                <div className="selected-tags">
                  <Space>
                    <Text type="secondary">筛选标签：</Text>
                    {selectedTags.map(tag => (
                      <Tag
                        key={tag}
                        color="blue"
                        closable
                        onClose={() => {
                          const newTags = selectedTags.filter(t => t !== tag);
                          setSelectedTags(newTags);
                          fetchDocuments({ tags: newTags.join(','), page: 1 });
                        }}
                      >
                        {tag}
                      </Tag>
                    ))}
                    <Button size="small" onClick={clearTagFilter}>清除筛选</Button>
                  </Space>
                </div>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      <div className="document-list-content">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : documents.length === 0 ? (
          <Card className="empty-container">
            <Empty
              description="暂无文档"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Link to="/upload">
                <Button type="primary" icon={<UploadOutlined />}>
                  立即上传
                </Button>
              </Link>
            </Empty>
          </Card>
        ) : viewMode === 'grid' ? (
          <>
            <Row gutter={[16, 16]} className="document-grid">
              {documents.map(renderDocumentCard)}
            </Row>
            <div className="pagination-container">
              <Card>
                <Row justify="end">
                  <Col>
                    <Space>
                      <Text type="secondary">
                        共 {pagination.total} 个文档
                      </Text>
                      <Button
                        disabled={pagination.current === 1}
                        onClick={() => handleCardPaginationChange(pagination.current - 1, pagination.pageSize)}
                      >
                        上一页
                      </Button>
                      <Text>
                        {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
                      </Text>
                      <Button
                        disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                        onClick={() => handleCardPaginationChange(pagination.current + 1, pagination.pageSize)}
                      >
                        下一页
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </div>
          </>
        ) : (
          <Card className="document-table-container">
            <Table
              columns={columns}
              dataSource={documents}
              rowKey="id"
              pagination={pagination}
              onChange={handleTableChange}
              scroll={{ x: 1200 }}
              className="document-table"
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default DocumentList;