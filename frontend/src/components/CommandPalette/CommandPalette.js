import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, List, Tag, Badge, Avatar, Typography } from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  TagOutlined,
  UserOutlined,
  ClockCircleOutlined,
  RocketOutlined,
  FolderOutlined,
  SettingOutlined,
  LogoutOutlined,
  DashboardOutlined,
  UploadOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../../services/api';
import './CommandPalette.css';

const { Text } = Typography;

const CommandPalette = ({ visible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('search'); // search | command
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // 命令列表
  const commands = [
    {
      key: 'upload',
      title: '上传文档',
      description: '上传新的文档到知识库',
      icon: <UploadOutlined />,
      action: () => navigate('/upload'),
      category: '操作'
    },
    {
      key: 'documents',
      title: '查看文档',
      description: '浏览所有文档',
      icon: <FileTextOutlined />,
      action: () => navigate('/documents'),
      category: '导航'
    },
    {
      key: 'search',
      title: '高级搜索',
      description: '使用高级搜索功能',
      icon: <SearchOutlined />,
      action: () => navigate('/search'),
      category: '导航'
    },
    {
      key: 'admin',
      title: '管理面板',
      description: '访问管理员控制台',
      icon: <DashboardOutlined />,
      action: () => navigate('/admin'),
      category: '管理'
    },
    {
      key: 'profile',
      title: '个人资料',
      description: '查看和编辑个人信息',
      icon: <UserOutlined />,
      action: () => navigate('/profile'),
      category: '账户'
    },
    {
      key: 'settings',
      title: '设置',
      description: '应用程序设置',
      icon: <SettingOutlined />,
      action: () => navigate('/settings'),
      category: '系统'
    },
    {
      key: 'logout',
      title: '退出登录',
      description: '退出当前账户',
      icon: <LogoutOutlined />,
      action: () => {
        localStorage.removeItem('token');
        navigate('/login');
      },
      category: '账户'
    }
  ];

  // 搜索文档
  const searchDocuments = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await searchService.search({
        keyword: query,
        limit: 5
      });

      if (response.success) {
        const results = response.data.map(doc => ({
          key: `doc-${doc.id}`,
          title: doc.title,
          description: doc.description || '无描述',
          icon: <FileTextOutlined />,
          action: () => navigate(`/documents/${doc.id}`),
          category: '文档',
          meta: {
            tags: doc.tags ? doc.tags.split(',') : [],
            author: doc.upload_username,
            date: new Date(doc.created_at).toLocaleDateString()
          }
        }));
        setSearchResults(results);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (value) => {
    setSearchQuery(value);
    setActiveIndex(0);

    // 检查是否是命令模式
    if (value.startsWith('>')) {
      setMode('command');
      const commandQuery = value.slice(1).toLowerCase();
      const filtered = commands.filter(cmd =>
        cmd.title.toLowerCase().includes(commandQuery) ||
        cmd.description.toLowerCase().includes(commandQuery)
      );
      setSearchResults(filtered);
    } else {
      setMode('search');
      searchDocuments(value);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e) => {
    const totalItems = searchResults.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (searchResults[activeIndex]) {
          searchResults[activeIndex].action();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      default:
        break;
    }
  };

  // 渲染搜索结果项
  const renderItem = (item, index) => {
    const isActive = index === activeIndex;
    const isCommand = mode === 'command';

    return (
      <List.Item
        className={`command-palette-item ${isActive ? 'active' : ''}`}
        onClick={() => {
          item.action();
          onClose();
        }}
        onMouseEnter={() => setActiveIndex(index)}
      >
        <div className="command-palette-item-content">
          <div className="command-palette-item-icon">
            {item.icon}
          </div>
          <div className="command-palette-item-info">
            <div className="command-palette-item-title">
              {item.title}
              {item.category && (
                <Tag className="command-palette-category-tag">
                  {item.category}
                </Tag>
              )}
            </div>
            <div className="command-palette-item-description">
              {item.description}
            </div>
            {item.meta && (
              <div className="command-palette-item-meta">
                {item.meta.author && (
                  <span className="meta-item">
                    <UserOutlined /> {item.meta.author}
                  </span>
                )}
                {item.meta.date && (
                  <span className="meta-item">
                    <ClockCircleOutlined /> {item.meta.date}
                  </span>
                )}
                {item.meta.tags && item.meta.tags.length > 0 && (
                  <span className="meta-tags">
                    {item.meta.tags.slice(0, 3).map(tag => (
                      <Tag key={tag} size="small">
                        {tag}
                      </Tag>
                    ))}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </List.Item>
    );
  };

  // 自动聚焦输入框
  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [visible]);

  // 重置状态
  useEffect(() => {
    if (!visible) {
      setSearchQuery('');
      setSearchResults([]);
      setActiveIndex(0);
      setMode('search');
    }
  }, [visible]);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      className="command-palette-modal"
      width={680}
      closable={false}
      maskClosable={true}
    >
      <div className="command-palette">
        <div className="command-palette-header">
          <Input
            ref={inputRef}
            placeholder='搜索文档或输入 ">" 查看命令...'
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            prefix={
              mode === 'command' ? (
                <RocketOutlined className="command-icon" />
              ) : (
                <SearchOutlined className="search-icon" />
              )
            }
            className="command-palette-input"
            size="large"
          />
        </div>

        <div className="command-palette-body">
          {searchResults.length > 0 ? (
            <List
              ref={listRef}
              className="command-palette-list"
              loading={loading}
              dataSource={searchResults}
              renderItem={renderItem}
            />
          ) : searchQuery && !loading ? (
            <div className="command-palette-empty">
              <Text type="secondary">
                {mode === 'command'
                  ? '未找到匹配的命令'
                  : '未找到相关文档'
                }
              </Text>
            </div>
          ) : !searchQuery ? (
            <div className="command-palette-hints">
              <div className="hint-section">
                <Text strong>快速操作</Text>
                <div className="hint-items">
                  {commands.slice(0, 4).map(cmd => (
                    <div
                      key={cmd.key}
                      className="hint-item"
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                    >
                      {cmd.icon}
                      <span>{cmd.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hint-section">
                <Text type="secondary" className="hint-text">
                  提示：输入 ">" 进入命令模式
                </Text>
              </div>
            </div>
          ) : null}
        </div>

        <div className="command-palette-footer">
          <div className="command-palette-shortcuts">
            <span className="shortcut">
              <kbd>↑↓</kbd> 导航
            </span>
            <span className="shortcut">
              <kbd>Enter</kbd> 选择
            </span>
            <span className="shortcut">
              <kbd>Esc</kbd> 关闭
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CommandPalette;