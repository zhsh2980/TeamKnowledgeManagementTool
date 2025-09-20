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
  Empty
} from 'antd';
import {
  DownloadOutlined,
  DeleteOutlined,
  FileOutlined,
  SearchOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { documentService } from '../services/api';
import { formatFileSize, formatDate } from '../utils/format';
import './DocumentList.css';

const { Search } = Input;

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

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

  // 下载文档
  const handleDownload = async (document) => {
    try {
      const response = await documentService.download(document.id);
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('下载成功');
    } catch (error) {
      console.error('下载错误:', error);
      message.error('下载失败');
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

  // 表格列定义
  const columns = [
    {
      title: '文档标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          <FileOutlined />
          <span>{text}</span>
          {record.is_public === 0 && <Tag color="orange">私有</Tag>}
        </Space>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => {
        if (!tags) return null;
        return tags.split(',').map(tag => (
          <Tag
            key={tag}
            color="blue"
            style={{ cursor: 'pointer' }}
            onClick={() => handleTagClick(tag.trim())}
          >
            {tag.trim()}
          </Tag>
        ));
      }
    },
    {
      title: '文件大小',
      dataIndex: 'file_size',
      key: 'file_size',
      render: (size) => formatFileSize(size)
    },
    {
      title: '上传者',
      dataIndex: 'upload_username',
      key: 'upload_username',
      render: (username) => <Tag color="green">{username}</Tag>
    },
    {
      title: '下载次数',
      dataIndex: 'download_count',
      key: 'download_count'
    },
    {
      title: '上传时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDate(date)
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            下载
          </Button>
          {(record.upload_user_id === currentUser.id || currentUser.role === 'admin') && (
            <Popconfirm
              title="确定要删除这个文档吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="primary"
                danger
                size="small"
                icon={<DeleteOutlined />}
              >
                删除
              </Button>
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

  return (
    <div className="document-list-container">
      <Card
        title="文档列表"
        extra={
          <Link to="/upload">
            <Button type="primary" icon={<UploadOutlined />}>
              上传文档
            </Button>
          </Link>
        }
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Search
              placeholder="搜索文档标题"
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              size="large"
            />
          </Col>
          <Col span={12}>
            {selectedTags.length > 0 && (
              <Space>
                <span>筛选标签：</span>
                {selectedTags.map(tag => (
                  <Tag key={tag} color="blue" closable onClose={() => {
                    const newTags = selectedTags.filter(t => t !== tag);
                    setSelectedTags(newTags);
                    fetchDocuments({ tags: newTags.join(','), page: 1 });
                  }}>
                    {tag}
                  </Tag>
                ))}
                <Button size="small" onClick={clearTagFilter}>清除筛选</Button>
              </Space>
            )}
          </Col>
        </Row>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : documents.length === 0 ? (
          <Empty description="暂无文档" />
        ) : (
          <Table
            columns={columns}
            dataSource={documents}
            rowKey="id"
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
          />
        )}
      </Card>
    </div>
  );
};

export default DocumentList;