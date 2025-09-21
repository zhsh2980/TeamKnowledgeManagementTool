import React, { useState, useEffect, useRef } from 'react';
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
  Col,
  Dropdown,
  Select,
  DatePicker,
  Badge,
  Tooltip,
  Skeleton,
  AutoComplete,
  Divider,
  Avatar
} from 'antd';
import {
  SearchOutlined,
  FileOutlined,
  UserOutlined,
  CalendarOutlined,
  TagsOutlined,
  DownloadOutlined,
  EyeOutlined,
  StarOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  FireOutlined,
  HistoryOutlined,
  FolderOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileMarkdownOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { searchService, documentService } from '../services/api';
import { formatFileSize, formatDate } from '../utils/format';
import DocumentPreview from '../components/DocumentPreview';
import './Search.css';
import './SearchBoxFix.css';

const { Search: SearchInput } = Input;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const SearchPage = () => {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [hotTags, setHotTags] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [hotDocuments, setHotDocuments] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    fileType: '',
    dateRange: null,
    uploader: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0
  });
  const searchInputRef = useRef(null);

  // 文件类型图标映射
  const getFileIcon = (fileName) => {
    if (!fileName) return <FileOutlined />;
    const ext = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 32 }} />,
      doc: <FileWordOutlined style={{ color: '#1890ff', fontSize: 32 }} />,
      docx: <FileWordOutlined style={{ color: '#1890ff', fontSize: 32 }} />,
      xls: <FileExcelOutlined style={{ color: '#52c41a', fontSize: 32 }} />,
      xlsx: <FileExcelOutlined style={{ color: '#52c41a', fontSize: 32 }} />,
      ppt: <FilePptOutlined style={{ color: '#fa8c16', fontSize: 32 }} />,
      pptx: <FilePptOutlined style={{ color: '#fa8c16', fontSize: 32 }} />,
      md: <FileMarkdownOutlined style={{ color: '#722ed1', fontSize: 32 }} />,
      jpg: <FileImageOutlined style={{ color: '#13c2c2', fontSize: 32 }} />,
      jpeg: <FileImageOutlined style={{ color: '#13c2c2', fontSize: 32 }} />,
      png: <FileImageOutlined style={{ color: '#13c2c2', fontSize: 32 }} />,
      gif: <FileImageOutlined style={{ color: '#13c2c2', fontSize: 32 }} />
    };
    return iconMap[ext] || <FileTextOutlined style={{ fontSize: 32 }} />;
  };

  // 加载热门标签和热门文档
  useEffect(() => {
    loadHotTags();
    loadSearchHistory();
    loadHotDocuments();
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
      const response = await searchService.getHistory(8);
      if (response.success) {
        setSearchHistory(response.data);
      }
    } catch (error) {
      console.error('加载搜索历史失败:', error);
    }
  };

  const loadHotDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentService.getList({
        page: 1,
        limit: 12,
        sortBy: 'download_count',
        sortOrder: 'desc'
      });
      if (response.success) {
        setHotDocuments(response.data.documents);
      }
    } catch (error) {
      console.error('加载热门文档失败:', error);
    } finally {
      setLoading(false);
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
    setHasSearched(true);

    try {
      const params = {
        keyword: value,
        tags: selectedTags.join(','),
        page,
        limit: pagination.pageSize,
        ...filters
      };

      const response = await searchService.search(params);

      if (response.success) {
        setSearchResults(response.data.documents);
        setPagination({
          ...pagination,
          current: response.data.page,
          total: response.data.total
        });

        // 更新搜索历史
        if (value) {
          loadSearchHistory();
        }
      }
    } catch (error) {
      message.error('搜索失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理标签选择
  const handleTagSelect = (tag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newTags);
    if (searchKeyword || newTags.length > 0) {
      handleSearch(searchKeyword);
    }
  };

  // 处理搜索历史点击
  const handleHistoryClick = (history) => {
    setSearchKeyword(history.keyword);
    const tags = history.tags ? history.tags.split(',').map(t => t.trim()) : [];
    setSelectedTags(tags);
    handleSearch(history.keyword);
  };

  // 处理文档下载
  const handleDownload = async (doc) => {
    try {
      await documentService.download(doc.id);
      message.success('下载成功');
    } catch (error) {
      message.error('下载失败');
    }
  };

  // 处理文档预览
  const handlePreview = (doc) => {
    setPreviewDocument(doc);
    setShowPreview(true);
  };

  // 渲染搜索建议
  const renderSearchSuggestions = () => {
    return suggestions.map((item, index) => ({
      value: item,
      label: (
        <div className="search-suggestion-item">
          <SearchOutlined />
          <span>{item}</span>
        </div>
      )
    }));
  };

  // 渲染文档卡片
  const renderDocumentCard = (item) => (
    <Card
      className="document-card"
      hoverable
      cover={
        <div className="document-card-cover">
          {getFileIcon(item.file_name)}
          <div className="document-card-actions">
            <Tooltip title="预览">
              <Button
                type="primary"
                shape="circle"
                icon={<EyeOutlined />}
                onClick={() => handlePreview(item)}
              />
            </Tooltip>
            <Tooltip title="下载">
              <Button
                type="primary"
                shape="circle"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(item)}
              />
            </Tooltip>
          </div>
        </div>
      }
    >
      <Card.Meta
        title={
          <Tooltip title={item.title}>
            <div className="document-title">{item.title}</div>
          </Tooltip>
        }
        description={
          <div className="document-meta">
            <Paragraph
              ellipsis={{ rows: 2 }}
              className="document-description"
            >
              {item.description || '暂无描述'}
            </Paragraph>
            <Space direction="vertical" size="small" className="document-info">
              <Space size="small">
                <UserOutlined />
                <Text type="secondary">{item.upload_username}</Text>
                <Divider type="vertical" />
                <CalendarOutlined />
                <Text type="secondary">{formatDate(item.created_at)}</Text>
              </Space>
              <Space size="small">
                <FolderOutlined />
                <Text type="secondary">{formatFileSize(item.file_size)}</Text>
                <Divider type="vertical" />
                <DownloadOutlined />
                <Text type="secondary">{item.download_count} 次</Text>
              </Space>
              {item.tags && (
                <div className="document-tags">
                  {item.tags.split(',').map(tag => (
                    <Tag
                      key={tag}
                      className="document-tag"
                      color="purple"
                    >
                      {tag.trim()}
                    </Tag>
                  ))}
                </div>
              )}
            </Space>
          </div>
        }
      />
    </Card>
  );

  return (
    <div className="search-page">
      {/* 搜索背景装饰 */}
      <div className="search-background">
        <div className="search-pattern" />
        <div className="search-gradient" />
      </div>

      {/* 搜索头部 */}
      <div className="search-hero">
        <div className="search-hero-content">
          <Title level={1} className="search-hero-title">
            <ThunderboltOutlined /> 智能文档搜索
          </Title>
          <Text className="search-hero-subtitle">
            快速查找团队知识库中的文档资源
          </Text>

          <div className="search-box-container">
            <AutoComplete
              ref={searchInputRef}
              className="search-autocomplete"
              value={searchKeyword}
              onChange={setSearchKeyword}
              options={renderSearchSuggestions()}
              onSearch={(value) => {
                // 模拟搜索建议
                if (value) {
                  setSuggestions([
                    `${value} 文档`,
                    `${value} 教程`,
                    `${value} 指南`
                  ]);
                } else {
                  setSuggestions([]);
                }
              }}
              onSelect={(value) => handleSearch(value)}
            >
              <Input.Search
                size="large"
                placeholder="输入关键词搜索文档..."
                enterButton={
                  <Button type="primary" size="large" icon={<SearchOutlined />}>
                    搜索
                  </Button>
                }
                onSearch={handleSearch}
                className="search-input"
              />
            </AutoComplete>

            <Button
              className="filter-toggle"
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
            >
              高级筛选
              {(filters.fileType || filters.dateRange || filters.uploader) && (
                <Badge dot status="processing" />
              )}
            </Button>
          </div>

          {/* 高级筛选器 */}
          {showFilters && (
            <Card className="search-filters">
              <Space size="large" wrap>
                <Select
                  placeholder="文件类型"
                  style={{ width: 150 }}
                  allowClear
                  value={filters.fileType}
                  onChange={(value) => setFilters({ ...filters, fileType: value })}
                >
                  <Option value="pdf">PDF文档</Option>
                  <Option value="doc">Word文档</Option>
                  <Option value="xls">Excel表格</Option>
                  <Option value="ppt">PPT演示</Option>
                  <Option value="image">图片文件</Option>
                  <Option value="markdown">Markdown</Option>
                </Select>

                <RangePicker
                  placeholder={['开始日期', '结束日期']}
                  value={filters.dateRange}
                  onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                />

                <Input
                  placeholder="上传者"
                  style={{ width: 150 }}
                  value={filters.uploader}
                  onChange={(e) => setFilters({ ...filters, uploader: e.target.value })}
                  prefix={<UserOutlined />}
                />

                <Button
                  type="primary"
                  onClick={() => handleSearch(searchKeyword)}
                >
                  应用筛选
                </Button>

                <Button
                  onClick={() => {
                    setFilters({ fileType: '', dateRange: null, uploader: '' });
                    handleSearch(searchKeyword);
                  }}
                >
                  重置
                </Button>
              </Space>
            </Card>
          )}

          {/* 选中的标签 */}
          {selectedTags.length > 0 && (
            <div className="selected-tags">
              <Text strong>已选标签：</Text>
              {selectedTags.map(tag => (
                <Tag
                  key={tag}
                  closable
                  color="purple"
                  onClose={() => handleTagSelect(tag)}
                  className="selected-tag"
                >
                  {tag}
                </Tag>
              ))}
              <Button
                type="link"
                size="small"
                onClick={() => {
                  setSelectedTags([]);
                  handleSearch(searchKeyword);
                }}
              >
                清除全部
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="search-container">
        <Row gutter={24}>
          {/* 侧边栏 */}
          <Col xs={24} lg={6}>
            <div className="search-sidebar">
              {/* 搜索历史 */}
              {searchHistory.length > 0 && (
                <Card
                  className="sidebar-card history-card"
                  title={
                    <Space>
                      <HistoryOutlined />
                      <span>搜索历史</span>
                    </Space>
                  }
                  size="small"
                >
                  <div className="history-list">
                    {searchHistory.map((history, index) => (
                      <div
                        key={index}
                        className="history-item"
                        onClick={() => handleHistoryClick(history)}
                      >
                        <ClockCircleOutlined />
                        <span className="history-text">
                          {history.keyword || history.tags || '标签搜索'}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* 热门标签 */}
              <Card
                className="sidebar-card tags-card"
                title={
                  <Space>
                    <FireOutlined />
                    <span>热门标签</span>
                  </Space>
                }
                size="small"
              >
                <div className="tag-cloud">
                  {hotTags.map(tag => (
                    <Tag
                      key={tag.name}
                      className={`tag-item ${selectedTags.includes(tag.name) ? 'tag-selected' : ''}`}
                      onClick={() => handleTagSelect(tag.name)}
                      color={selectedTags.includes(tag.name) ? 'purple' : 'default'}
                    >
                      <span className="tag-name">{tag.name}</span>
                      <Badge
                        count={tag.count}
                        overflowCount={99}
                        style={{
                          backgroundColor: selectedTags.includes(tag.name) ? '#fff' : '#722ed1',
                          color: selectedTags.includes(tag.name) ? '#722ed1' : '#fff'
                        }}
                      />
                    </Tag>
                  ))}
                </div>
              </Card>

              {/* 搜索统计 */}
              <Card
                className="sidebar-card stats-card"
                title={
                  <Space>
                    <RiseOutlined />
                    <span>搜索趋势</span>
                  </Space>
                }
                size="small"
              >
                <div className="search-stats">
                  <div className="stat-item">
                    <Text type="secondary">今日搜索</Text>
                    <Text strong className="stat-value">128</Text>
                  </div>
                  <div className="stat-item">
                    <Text type="secondary">热门文档</Text>
                    <Text strong className="stat-value">1,024</Text>
                  </div>
                  <div className="stat-item">
                    <Text type="secondary">活跃用户</Text>
                    <Text strong className="stat-value">56</Text>
                  </div>
                </div>
              </Card>
            </div>
          </Col>

          {/* 搜索结果 */}
          <Col xs={24} lg={18}>
            <Card className="search-results-card">
              {loading ? (
                <div className="search-loading">
                  <Row gutter={[16, 16]}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <Col xs={24} sm={12} md={8} key={i}>
                        <Card className="document-card skeleton-card">
                          <Skeleton active />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              ) : searchResults.length > 0 || (!hasSearched && hotDocuments.length > 0) ? (
                <>
                  <div className="results-header">
                    {hasSearched ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong>
                          找到 <span className="result-count">{pagination.total}</span> 个相关文档
                        </Text>
                        <Button
                          type="link"
                          icon={<ClockCircleOutlined />}
                          onClick={() => {
                            setSearchKeyword('');
                            setSelectedTags([]);
                            setSearchResults([]);
                            setHasSearched(false);
                            setPagination({ current: 1, pageSize: 12, total: 0 });
                          }}
                        >
                          返回热门推荐
                        </Button>
                      </div>
                    ) : (
                      <Space size="middle">
                        <FireOutlined style={{ fontSize: 20, color: '#667eea' }} />
                        <Text strong style={{ fontSize: 16 }}>
                          热门文档推荐
                        </Text>
                        <Tag color="purple">按下载量排序</Tag>
                      </Space>
                    )}
                  </div>
                  <List
                    grid={{
                      gutter: 16,
                      xs: 1,
                      sm: 2,
                      md: 2,
                      lg: 3,
                      xl: 3,
                      xxl: 4
                    }}
                    dataSource={hasSearched ? searchResults : hotDocuments}
                    renderItem={renderDocumentCard}
                    pagination={hasSearched ? {
                      ...pagination,
                      onChange: (page) => handleSearch(searchKeyword, page),
                      showSizeChanger: false,
                      showTotal: (total) => `共 ${total} 个文档`
                    } : false}
                  />
                </>
              ) : (
                <Empty
                  className="search-empty"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="empty-content">
                      <Title level={4}>{hasSearched ? '暂无搜索结果' : '暂无文档'}</Title>
                      <Text type="secondary">
                        {hasSearched
                          ? '试试其他关键词或标签'
                          : '暂时没有可用的文档'}
                      </Text>
                    </div>
                  }
                >
                  {hotTags.length > 0 && (
                    <div className="empty-suggestions">
                      <Text>推荐搜索：</Text>
                      <Space wrap>
                        {hotTags.slice(0, 5).map(tag => (
                          <Tag
                            key={tag.name}
                            className="suggestion-tag"
                            color="purple"
                            onClick={() => handleTagSelect(tag.name)}
                          >
                            {tag.name}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  )}
                </Empty>
              )}
            </Card>
          </Col>
        </Row>
      </div>

      {/* 文档预览模态框 */}
      <DocumentPreview
        document={previewDocument}
        visible={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
};

export default SearchPage;