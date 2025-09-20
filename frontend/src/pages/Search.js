import React, { useState, useEffect } from 'react';
import {
  Input,
  Tag,
  Card,
  List,
  Spin,
  Empty,
  Space,
  Button,
  message,
  Typography,
  Row,
  Col
} from 'antd';
import {
  SearchOutlined,
  FileOutlined,
  UserOutlined,
  CalendarOutlined,
  TagsOutlined,
  DownloadOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { searchService, documentService } from '../services/api';
import { formatFileSize, formatDate } from '../utils/format';
import './Search.css';

const { Search: SearchInput } = Input;
const { Title, Text, Paragraph } = Typography;

const SearchPage = () => {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [hotTags, setHotTags] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 加载热门标签
  useEffect(() => {
    loadHotTags();
    loadSearchHistory();
  }, []);

  const loadHotTags = async () => {
    try {
      const response = await searchService.getTags(20);
      if (response.success) {
        setHotTags(response.data);
      }
    } catch (error) {
      console.error('加载热门标签失败:', error);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const response = await searchService.getHistory(5);
      if (response.success) {
        setSearchHistory(response.data);
      }
    } catch (error) {
      console.error('加载搜索历史失败:', error);
    }
  };

  // 搜索文档
  const handleSearch = async (value, page = 1) => {
    if (!value && selectedTags.length === 0) {
      message.warning('请输入搜索关键词或选择标签');
      return;
    }

    setLoading(true);
    setSearchKeyword(value);

    try {
      const params = {
        keyword: value,
        tags: selectedTags.join(','),
        page,
        limit: pagination.pageSize
      };

      console.log('搜索参数:', params);
      const response = await searchService.search(params);
      console.log('搜索响应:', response);

      if (response.success) {
        setSearchResults(response.data.documents);
        setPagination({
          ...pagination,
          current: response.data.page,
          total: response.data.total
        });

        // 重新加载搜索历史
        loadSearchHistory();
      }
    } catch (error) {
      console.error('搜索失败:', error);
      message.error(error.response?.data?.message || '搜索失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 标签点击处理
  const handleTagClick = (tag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newTags);

    // 如果有关键词或标签，立即搜索
    if (searchKeyword || newTags.length > 0) {
      handleSearch(searchKeyword, 1);
    }
  };

  // 历史搜索点击
  const handleHistoryClick = (history) => {
    setSearchKeyword(history.keyword || '');
    const tags = history.tags ? history.tags.split(',').map(t => t.trim()) : [];
    setSelectedTags(tags);
    handleSearch(history.keyword || '', 1);
  };

  // 下载文档
  const handleDownload = async (doc) => {
    try {
      const blob = await documentService.download(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('下载成功');
    } catch (error) {
      console.error('下载错误:', error);
      message.error(error.response?.data?.message || '下载失败');
    }
  };

  // 删除文档
  const handleDelete = async (doc) => {
    try {
      const response = await documentService.delete(doc.id);
      if (response.success) {
        message.success('删除成功');
        handleSearch(searchKeyword, pagination.current);
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 分页变化
  const handlePageChange = (page) => {
    handleSearch(searchKeyword, page);
  };

  // 获取当前用户
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="search-container">
      <Card className="search-header">
        <Title level={3}>文档搜索</Title>

        <SearchInput
          placeholder="输入关键词搜索文档..."
          allowClear
          enterButton={<><SearchOutlined /> 搜索</>}
          size="large"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onSearch={(value) => handleSearch(value, 1)}
          loading={loading}
        />

        {/* 选中的标签 */}
        {selectedTags.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">已选标签：</Text>
            <Space wrap style={{ marginTop: 8 }}>
              {selectedTags.map(tag => (
                <Tag
                  key={tag}
                  closable
                  color="blue"
                  onClose={() => handleTagClick(tag)}
                >
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>
        )}
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={18}>
          {/* 搜索结果 */}
          <Card className="search-results">
            <Spin spinning={loading}>
              <List
                itemLayout="vertical"
                size="large"
                pagination={{
                  ...pagination,
                  onChange: handlePageChange,
                  showSizeChanger: false,
                  showTotal: (total) => `共 ${total} 个文档`
                }}
                dataSource={searchResults}
                locale={{ emptyText: <Empty description="暂无搜索结果" /> }}
                renderItem={(item) => (
                  <List.Item
                    key={item.id}
                    actions={[
                      <Space key="actions">
                        <Button
                          type="link"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownload(item)}
                        >
                          下载
                        </Button>
                        {currentUser.id === item.upload_user_id && (
                          <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(item)}
                          >
                            删除
                          </Button>
                        )}
                      </Space>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<FileOutlined style={{ fontSize: 32 }} />}
                      title={
                        <Space>
                          {item.title}
                          {item.is_public ? (
                            <Tag color="green">公开</Tag>
                          ) : (
                            <Tag color="orange">私有</Tag>
                          )}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Paragraph ellipsis={{ rows: 2 }}>
                            {item.description || '暂无描述'}
                          </Paragraph>
                          <Space wrap>
                            <Text type="secondary">
                              <UserOutlined /> {item.upload_username}
                            </Text>
                            <Text type="secondary">
                              <CalendarOutlined /> {formatDate(item.created_at)}
                            </Text>
                            <Text type="secondary">
                              {formatFileSize(item.file_size)}
                            </Text>
                          </Space>
                          {item.tags && (
                            <Space wrap>
                              <TagsOutlined />
                              {item.tags.split(',').map(tag => (
                                <Tag
                                  key={tag}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleTagClick(tag.trim())}
                                >
                                  {tag.trim()}
                                </Tag>
                              ))}
                            </Space>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Spin>
          </Card>
        </Col>

        <Col xs={24} lg={6}>
          {/* 搜索历史 */}
          {searchHistory.length > 0 && (
            <Card
              title="搜索历史"
              className="search-sidebar"
              bodyStyle={{ padding: 12 }}
            >
              {searchHistory.map((history, index) => (
                <div
                  key={index}
                  className="history-item"
                  onClick={() => handleHistoryClick(history)}
                >
                  <Text ellipsis>
                    {history.keyword || history.tags || '标签搜索'}
                  </Text>
                </div>
              ))}
            </Card>
          )}

          {/* 热门标签 */}
          <Card
            title="热门标签"
            className="search-sidebar"
            style={{ marginTop: searchHistory.length > 0 ? 16 : 0 }}
          >
            <Space wrap>
              {hotTags.map(({ tag, count }) => (
                <Tag
                  key={tag}
                  color={selectedTags.includes(tag) ? 'blue' : 'default'}
                  style={{ cursor: 'pointer', marginBottom: 8 }}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag} ({count})
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SearchPage;