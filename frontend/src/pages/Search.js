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
  Avatar,
  Menu,
  Popover
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
  RiseOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ShareAltOutlined,
  MoreOutlined,
  ClearOutlined,
  HighlightOutlined
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
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const searchInputRef = useRef(null);

  // 高亮搜索关键词
  const highlightKeywords = (text, keywords) => {
    if (!text || !keywords) return text;

    const keywordArray = keywords.split(' ').filter(k => k.trim());
    if (keywordArray.length === 0) return text;

    let highlightedText = text;
    keywordArray.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="search-highlight">$1</mark>');
    });

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  // 计算活跃过滤器数量
  useEffect(() => {
    let count = 0;
    if (filters.fileType) count++;
    if (filters.dateRange && filters.dateRange.length === 2) count++;
    if (filters.uploader) count++;
    if (selectedTags.length > 0) count++;
    setActiveFiltersCount(count);
  }, [filters, selectedTags]);

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
        sortBy: hasSearched ? sortBy : 'download_count',
        sortOrder: hasSearched ? sortOrder : 'desc',
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

  // 清除所有过滤器
  const clearAllFilters = () => {
    setSelectedTags([]);
    setFilters({ fileType: '', dateRange: null, uploader: '' });
    setSortBy('relevance');
    setSortOrder('desc');
    if (searchKeyword) {
      handleSearch(searchKeyword);
    }
  };

  // 排序选项
  const sortOptions = [
    { key: 'relevance', label: '相关性', icon: <HighlightOutlined /> },
    { key: 'created_at', label: '创建时间', icon: <CalendarOutlined /> },
    { key: 'download_count', label: '下载次数', icon: <DownloadOutlined /> },
    { key: 'file_size', label: '文件大小', icon: <FolderOutlined /> },
    { key: 'title', label: '标题', icon: <FileOutlined /> }
  ];

  // 快速操作菜单
  const getQuickActionMenu = (doc) => (
    <Menu>
      <Menu.Item key="preview" icon={<EyeOutlined />} onClick={() => handlePreview(doc)}>
        预览文档
      </Menu.Item>
      <Menu.Item key="download" icon={<DownloadOutlined />} onClick={() => handleDownload(doc)}>
        下载文档
      </Menu.Item>
      <Menu.Item key="share" icon={<ShareAltOutlined />}>
        分享链接
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="info" icon={<FileOutlined />}>
        文档信息
      </Menu.Item>
    </Menu>
  );

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
      tabIndex={0}
      role="article"
      aria-label={`文档: ${item.title}, 上传者: ${item.upload_username}, ${formatFileSize(item.file_size)}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePreview(item);
        }
      }}
      cover={
        <div className="document-card-cover">
          {getFileIcon(item.file_name)}
          <div className="document-card-actions">
            <Tooltip title="预览文档">
              <Button
                type="primary"
                shape="circle"
                icon={<EyeOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(item);
                }}
                className="action-btn preview-btn"
                size="large"
                aria-label={`预览文档: ${item.title}`}
              />
            </Tooltip>
            <Tooltip title="下载文档">
              <Button
                type="primary"
                shape="circle"
                icon={<DownloadOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(item);
                }}
                className="action-btn download-btn"
                size="large"
                aria-label={`下载文档: ${item.title}`}
              />
            </Tooltip>
            <Dropdown
              overlay={getQuickActionMenu(item)}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button
                type="primary"
                shape="circle"
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
                className="action-btn more-btn"
                size="large"
                aria-label={`更多操作: ${item.title}`}
                aria-haspopup="true"
              />
            </Dropdown>
          </div>
          {/* 文件类型标签 */}
          <div className="file-type-badge">
            {item.file_name ? item.file_name.split('.').pop().toUpperCase() : 'FILE'}
          </div>
        </div>
      }
    >
      <Card.Meta
        title={
          <Tooltip title={item.title}>
            <div className="document-title">
              {highlightKeywords(item.title, searchKeyword)}
            </div>
          </Tooltip>
        }
        description={
          <div className="document-meta">
            <Paragraph
              ellipsis={{ rows: 2 }}
              className="document-description"
            >
              {highlightKeywords(item.description || '暂无描述', searchKeyword)}
            </Paragraph>
            <Space direction="vertical" size="small" className="document-info">
              <Space size="small" className="info-row">
                <UserOutlined />
                <Text type="secondary" className="info-text">{item.upload_username}</Text>
                <Divider type="vertical" />
                <CalendarOutlined />
                <Text type="secondary" className="info-text">{formatDate(item.created_at)}</Text>
              </Space>
              <Space size="small" className="info-row">
                <FolderOutlined />
                <Text type="secondary" className="info-text">{formatFileSize(item.file_size)}</Text>
                <Divider type="vertical" />
                <DownloadOutlined />
                <Text type="secondary" className="info-text">{item.download_count} 次下载</Text>
                {item.download_count > 100 && (
                  <Badge
                    count="热门"
                    style={{ backgroundColor: '#ff4d4f', fontSize: '10px', height: '16px', lineHeight: '16px' }}
                  />
                )}
              </Space>
              {item.tags && (
                <div className="document-tags">
                  {item.tags.split(',').slice(0, 3).map(tag => (
                    <Tag
                      key={tag}
                      className="document-tag"
                      color="purple"
                      tabIndex={0}
                      role="button"
                      aria-label={`搜索标签: ${tag.trim()}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTagSelect(tag.trim());
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleTagSelect(tag.trim());
                        }
                      }}
                    >
                      {tag.trim()}
                    </Tag>
                  ))}
                  {item.tags.split(',').length > 3 && (
                    <Tag className="document-tag-more">
                      +{item.tags.split(',').length - 3}
                    </Tag>
                  )}
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
                  <Button
                    type="primary"
                    size="large"
                    icon={loading ? <Spin size="small" /> : <SearchOutlined />}
                    loading={loading}
                    aria-label="执行搜索"
                  >
                    {loading ? '搜索中...' : '搜索'}
                  </Button>
                }
                onSearch={handleSearch}
                className="search-input"
                aria-label="搜索文档"
                disabled={loading}
              />
            </AutoComplete>

            <Button
              className="filter-toggle"
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
              type={showFilters ? "primary" : "default"}
            >
              高级筛选
              {activeFiltersCount > 0 && (
                <Badge
                  count={activeFiltersCount}
                  style={{ backgroundColor: '#667eea', marginLeft: 8 }}
                />
              )}
            </Button>
          </div>

          {/* 高级筛选器 */}
          {showFilters && (
            <Card className="search-filters" title="高级筛选选项">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <div className="filter-group">
                    <label className="filter-label">文件类型</label>
                    <Select
                      placeholder="选择文件类型"
                      style={{ width: '100%' }}
                      allowClear
                      value={filters.fileType}
                      onChange={(value) => setFilters({ ...filters, fileType: value })}
                    >
                      <Option value="pdf">📄 PDF文档</Option>
                      <Option value="doc">📝 Word文档</Option>
                      <Option value="xls">📊 Excel表格</Option>
                      <Option value="ppt">📋 PPT演示</Option>
                      <Option value="image">🖼️ 图片文件</Option>
                      <Option value="markdown">📃 Markdown</Option>
                    </Select>
                  </div>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <div className="filter-group">
                    <label className="filter-label">创建时间</label>
                    <RangePicker
                      placeholder={['开始日期', '结束日期']}
                      style={{ width: '100%' }}
                      value={filters.dateRange}
                      onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <div className="filter-group">
                    <label className="filter-label">上传者</label>
                    <Input
                      placeholder="输入用户名"
                      style={{ width: '100%' }}
                      value={filters.uploader}
                      onChange={(e) => setFilters({ ...filters, uploader: e.target.value })}
                      prefix={<UserOutlined />}
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12} md={4}>
                  <div className="filter-actions">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button
                        type="primary"
                        block
                        onClick={() => handleSearch(searchKeyword)}
                        icon={<SearchOutlined />}
                      >
                        应用筛选
                      </Button>
                      <Button
                        block
                        onClick={() => {
                          setFilters({ fileType: '', dateRange: null, uploader: '' });
                          handleSearch(searchKeyword);
                        }}
                        icon={<ClearOutlined />}
                      >
                        重置筛选
                      </Button>
                    </Space>
                  </div>
                </Col>
              </Row>

              {/* 活跃筛选器显示 */}
              {activeFiltersCount > 0 && (
                <div className="active-filters">
                  <Divider orientation="left">当前筛选条件</Divider>
                  <Space wrap>
                    {filters.fileType && (
                      <Tag
                        closable
                        color="blue"
                        onClose={() => setFilters({ ...filters, fileType: '' })}
                      >
                        文件类型: {filters.fileType}
                      </Tag>
                    )}
                    {filters.dateRange && filters.dateRange.length === 2 && (
                      <Tag
                        closable
                        color="green"
                        onClose={() => setFilters({ ...filters, dateRange: null })}
                      >
                        时间范围: {filters.dateRange[0].format('YYYY-MM-DD')} ~ {filters.dateRange[1].format('YYYY-MM-DD')}
                      </Tag>
                    )}
                    {filters.uploader && (
                      <Tag
                        closable
                        color="orange"
                        onClose={() => setFilters({ ...filters, uploader: '' })}
                      >
                        上传者: {filters.uploader}
                      </Tag>
                    )}
                    {selectedTags.length > 0 && (
                      <Tag
                        closable
                        color="purple"
                        onClose={() => setSelectedTags([])}
                      >
                        标签: {selectedTags.length} 个
                      </Tag>
                    )}
                    <Button
                      type="link"
                      size="small"
                      onClick={clearAllFilters}
                      icon={<ClearOutlined />}
                    >
                      清除全部
                    </Button>
                  </Space>
                </div>
              )}
            </Card>
          )}

          {/* 选中的标签 */}
          {selectedTags.length > 0 && (
            <div className="selected-tags">
              <Space align="center" wrap>
                <Text strong style={{ color: '#667eea' }}>
                  <TagsOutlined /> 已选标签 ({selectedTags.length})：
                </Text>
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
                  type="primary"
                  ghost
                  size="small"
                  onClick={() => {
                    setSelectedTags([]);
                    if (searchKeyword) {
                      handleSearch(searchKeyword);
                    }
                  }}
                  icon={<ClearOutlined />}
                  className="clear-tags-btn"
                >
                  清除标签
                </Button>
              </Space>
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
                        tabIndex={0}
                        role="button"
                        aria-label={`历史搜索: ${history.keyword || history.tags || '标签搜索'}`}
                        onClick={() => handleHistoryClick(history)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleHistoryClick(history);
                          }
                        }}
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
                      tabIndex={0}
                      role="button"
                      aria-label={`${selectedTags.includes(tag.name) ? '取消选择' : '选择'}标签: ${tag.name}, ${tag.count} 个文档`}
                      aria-pressed={selectedTags.includes(tag.name)}
                      onClick={() => handleTagSelect(tag.name)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleTagSelect(tag.name);
                        }
                      }}
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
                <div className="search-loading" role="status" aria-label="正在搜索文档">
                  <Row gutter={[16, 16]}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <Col xs={24} sm={12} md={8} key={i}>
                        <Card className="document-card skeleton-card">
                          <Skeleton.Image style={{ width: '100%', height: 160 }} />
                          <div style={{ padding: '16px' }}>
                            <Skeleton
                              active
                              title={{ width: '80%' }}
                              paragraph={{
                                rows: 3,
                                width: ['100%', '90%', '70%']
                              }}
                            />
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  <div className="loading-message">
                    <Spin size="large" />
                    <Text type="secondary" style={{ marginTop: 16, display: 'block' }}>
                      正在搜索相关文档，请稍候...
                    </Text>
                  </div>
                </div>
              ) : searchResults.length > 0 || (!hasSearched && hotDocuments.length > 0) ? (
                <>
                  <div className="results-header">
                    {hasSearched ? (
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Space size="large">
                            <Text strong style={{ fontSize: 16 }}>
                              找到 <span className="result-count">{pagination.total}</span> 个相关文档
                            </Text>
                            {searchKeyword && (
                              <Text type="secondary">
                                搜索关键词: "{searchKeyword}"
                              </Text>
                            )}
                          </Space>
                        </Col>
                        <Col>
                          <Space>
                            {/* 排序控件 */}
                            <Dropdown
                              overlay={
                                <Menu
                                  selectedKeys={[sortBy]}
                                  onClick={({ key }) => {
                                    setSortBy(key);
                                    handleSearch(searchKeyword);
                                  }}
                                >
                                  {sortOptions.map(option => (
                                    <Menu.Item key={option.key} icon={option.icon}>
                                      {option.label}
                                    </Menu.Item>
                                  ))}
                                </Menu>
                              }
                              trigger={['click']}
                            >
                              <Button icon={<SortAscendingOutlined />}>
                                排序: {sortOptions.find(opt => opt.key === sortBy)?.label}
                              </Button>
                            </Dropdown>

                            <Button
                              icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                              onClick={() => {
                                const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                                setSortOrder(newOrder);
                                handleSearch(searchKeyword);
                              }}
                            >
                              {sortOrder === 'asc' ? '升序' : '降序'}
                            </Button>

                            <Button
                              type="link"
                              icon={<ClockCircleOutlined />}
                              onClick={() => {
                                setSearchKeyword('');
                                setSelectedTags([]);
                                setSearchResults([]);
                                setHasSearched(false);
                                setPagination({ current: 1, pageSize: 12, total: 0 });
                                setSortBy('relevance');
                                setSortOrder('desc');
                              }}
                            >
                              返回热门推荐
                            </Button>
                          </Space>
                        </Col>
                      </Row>
                    ) : (
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Space size="middle">
                            <FireOutlined style={{ fontSize: 20, color: '#667eea' }} />
                            <Text strong style={{ fontSize: 16 }}>
                              热门文档推荐
                            </Text>
                            <Tag color="purple">按下载量排序</Tag>
                          </Space>
                        </Col>
                        <Col>
                          <Text type="secondary" style={{ fontSize: 14 }}>
                            显示最受欢迎的 {hotDocuments.length} 个文档
                          </Text>
                        </Col>
                      </Row>
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