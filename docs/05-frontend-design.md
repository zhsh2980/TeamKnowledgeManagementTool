# 前端组件设计文档

## 1. 前端架构概述

### 1.1 技术栈
- **框架**: React 18.x + TypeScript 5.x
- **UI库**: Ant Design 5.x
- **路由**: React Router 6.x
- **状态管理**: Redux Toolkit + RTK Query
- **构建工具**: Vite
- **样式方案**: CSS Modules + Ant Design

### 1.2 项目结构
```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/         # 通用组件
│   ├── pages/             # 页面组件
│   ├── layouts/           # 布局组件
│   ├── hooks/             # 自定义Hooks
│   ├── services/          # API服务
│   ├── store/             # Redux状态管理
│   ├── types/             # TypeScript类型定义
│   ├── utils/             # 工具函数
│   ├── constants/         # 常量定义
│   ├── assets/            # 静态资源
│   ├── styles/            # 全局样式
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 2. 路由设计

### 2.1 路由结构
```typescript
interface RouteConfig {
  path: string;
  element: React.ComponentType;
  requireAuth?: boolean;
  requiredRole?: 'admin' | 'member';
  title: string;
}

const routes: RouteConfig[] = [
  // 公共路由
  { path: '/login', element: LoginPage, title: '登录' },
  { path: '/register', element: RegisterPage, title: '注册' },

  // 需要认证的路由
  { path: '/', element: Dashboard, requireAuth: true, title: '仪表板' },
  { path: '/documents', element: DocumentList, requireAuth: true, title: '文档列表' },
  { path: '/documents/:id', element: DocumentDetail, requireAuth: true, title: '文档详情' },
  { path: '/upload', element: DocumentUpload, requireAuth: true, title: '上传文档' },
  { path: '/search', element: SearchResults, requireAuth: true, title: '搜索结果' },
  { path: '/profile', element: ProfilePage, requireAuth: true, title: '个人设置' },

  // 管理员路由
  { path: '/admin/users', element: UserManagement, requireAuth: true, requiredRole: 'admin', title: '用户管理' },
  { path: '/admin/tags', element: TagManagement, requireAuth: true, requiredRole: 'admin', title: '标签管理' },
  { path: '/admin/system', element: SystemStats, requireAuth: true, requiredRole: 'admin', title: '系统统计' }
];
```

### 2.2 路由守卫
```typescript
// 路由守卫组件
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
}> = ({ children, requireAuth, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

## 3. 布局组件设计

### 3.1 主布局 (MainLayout)
```typescript
interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <Layout className="main-layout">
      <Header className="header">
        <HeaderComponent user={user} />
      </Header>
      <Layout>
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <SidebarComponent collapsed={collapsed} />
        </Sider>
        <Layout>
          <Content className="main-content">
            <BreadcrumbComponent />
            {children}
          </Content>
          <Footer className="footer">
            <FooterComponent />
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};
```

### 3.2 认证布局 (AuthLayout)
```typescript
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout className="auth-layout">
      <Content className="auth-content">
        <div className="auth-container">
          <div className="auth-logo">
            <img src="/logo.png" alt="知识库管理工具" />
            <h1>团队知识库管理工具</h1>
          </div>
          <div className="auth-form">
            {children}
          </div>
        </div>
      </Content>
    </Layout>
  );
};
```

## 4. 页面组件设计

### 4.1 仪表板页面 (Dashboard)
```typescript
interface DashboardStats {
  totalDocuments: number;
  myDocuments: number;
  recentViews: number;
  popularTags: Array<{ name: string; count: number }>;
}

const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useGetStatsQuery();
  const { data: recentDocuments } = useGetRecentDocumentsQuery({ limit: 5 });

  return (
    <div className="dashboard">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <StatsCards stats={stats} loading={isLoading} />
        </Col>
        <Col span={16}>
          <RecentDocuments documents={recentDocuments} />
        </Col>
        <Col span={8}>
          <PopularTags tags={stats?.popularTags} />
          <QuickActions />
        </Col>
      </Row>
    </div>
  );
};
```

### 4.2 文档列表页面 (DocumentList)
```typescript
interface DocumentListProps {
  searchParams?: URLSearchParams;
}

const DocumentList: React.FC<DocumentListProps> = ({ searchParams }) => {
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  const [filters, setFilters] = useState({
    search: '',
    tags: [],
    mine: false
  });

  const { data, isLoading, error } = useGetDocumentsQuery({
    ...pagination,
    ...filters
  });

  return (
    <div className="document-list">
      <div className="list-header">
        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
        <Button type="primary" href="/upload">
          上传文档
        </Button>
      </div>

      <DocumentGrid
        documents={data?.documents}
        loading={isLoading}
        onDocumentClick={handleDocumentClick}
      />

      <Pagination
        {...pagination}
        total={data?.pagination?.total}
        onChange={setPagination}
      />
    </div>
  );
};
```

### 4.3 文档详情页面 (DocumentDetail)
```typescript
const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: document, isLoading } = useGetDocumentQuery(id!);
  const { user } = useAuth();

  const canEdit = document?.upload_user_id === user?.id || user?.role === 'admin';
  const canDelete = document?.upload_user_id === user?.id || user?.role === 'admin';

  return (
    <div className="document-detail">
      {isLoading ? (
        <DocumentDetailSkeleton />
      ) : (
        <>
          <DocumentHeader
            document={document}
            canEdit={canEdit}
            canDelete={canDelete}
          />
          <DocumentContent document={document} />
          <DocumentSidebar document={document} />
        </>
      )}
    </div>
  );
};
```

### 4.4 文档上传页面 (DocumentUpload)
```typescript
const DocumentUpload: React.FC = () => {
  const [form] = Form.useForm();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tags, setTags] = useState<number[]>([]);

  const { data: availableTags } = useGetTagsQuery();
  const [uploadDocument, { isLoading }] = useUploadDocumentMutation();

  const handleUpload = async (values: UploadFormData) => {
    try {
      const formData = new FormData();
      formData.append('file', values.file);
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('tags', JSON.stringify(tags));
      formData.append('is_public', values.is_public);

      await uploadDocument(formData).unwrap();
      message.success('文档上传成功');
      navigate('/documents');
    } catch (error) {
      message.error('上传失败');
    }
  };

  return (
    <div className="document-upload">
      <Card title="上传文档">
        <Form form={form} onFinish={handleUpload} layout="vertical">
          <FileUploader
            onChange={setUploadProgress}
            accept=".pdf,.doc,.docx,.txt,.md"
            maxSize={100 * 1024 * 1024} // 100MB
          />
          <DocumentInfoForm tags={availableTags} selectedTags={tags} onTagsChange={setTags} />
          <PermissionSettings />
          <UploadActions loading={isLoading} progress={uploadProgress} />
        </Form>
      </Card>
    </div>
  );
};
```

## 5. 通用组件设计

### 5.1 文件上传组件 (FileUploader)
```typescript
interface FileUploaderProps {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onChange?: (progress: number) => void;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  maxSize = 100 * 1024 * 1024,
  multiple = false,
  onChange,
  onSuccess,
  onError
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple,
    fileList,
    accept,
    beforeUpload: (file) => {
      // 文件大小检查
      if (file.size > maxSize) {
        message.error(`文件大小不能超过 ${formatFileSize(maxSize)}`);
        return false;
      }
      return true;
    },
    onChange: (info) => {
      setFileList(info.fileList);

      if (info.file.status === 'uploading') {
        onChange?.(info.file.percent || 0);
      }

      if (info.file.status === 'done') {
        onSuccess?.(info.file.response);
      }

      if (info.file.status === 'error') {
        onError?.(info.file.error);
      }
    }
  };

  return (
    <div className="file-uploader">
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          点击或拖拽文件到这里上传
        </p>
        <p className="ant-upload-hint">
          支持的文件格式：{accept}，最大大小：{formatFileSize(maxSize)}
        </p>
      </Dragger>
    </div>
  );
};
```

### 5.2 搜索组件 (SearchBox)
```typescript
interface SearchBoxProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  showFilters?: boolean;
  availableTags?: Tag[];
  selectedTags?: number[];
  onTagsChange?: (tags: number[]) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder = "搜索文档...",
  onSearch,
  showFilters = true,
  availableTags = [],
  selectedTags = [],
  onTagsChange
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);

  const handleSearch = () => {
    onSearch?.(searchValue);
  };

  return (
    <div className="search-box">
      <Input.Group compact>
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={placeholder}
          onPressEnter={handleSearch}
          style={{ width: 'calc(100% - 80px)' }}
        />
        <Button
          type="primary"
          onClick={handleSearch}
          icon={<SearchOutlined />}
        >
          搜索
        </Button>
      </Input.Group>

      {showFilters && (
        <div className="search-filters">
          <Button
            type="link"
            onClick={() => setFiltersVisible(!filtersVisible)}
            icon={<FilterOutlined />}
          >
            筛选
          </Button>

          <Collapse
            ghost
            activeKey={filtersVisible ? ['filters'] : []}
          >
            <Panel header="" key="filters">
              <TagFilter
                tags={availableTags}
                selectedTags={selectedTags}
                onChange={onTagsChange}
              />
            </Panel>
          </Collapse>
        </div>
      )}
    </div>
  );
};
```

### 5.3 文档卡片组件 (DocumentCard)
```typescript
interface DocumentCardProps {
  document: Document;
  onClick?: (document: Document) => void;
  actions?: React.ReactNode[];
  showTags?: boolean;
  showStats?: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onClick,
  actions,
  showTags = true,
  showStats = true
}) => {
  const handleClick = () => {
    onClick?.(document);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FilePdfOutlined />;
    if (mimeType.includes('word')) return <FileWordOutlined />;
    if (mimeType.includes('text')) return <FileTextOutlined />;
    return <FileOutlined />;
  };

  return (
    <Card
      hoverable
      className="document-card"
      onClick={handleClick}
      actions={actions}
      cover={
        <div className="document-card-cover">
          <div className="file-icon">
            {getFileIcon(document.mime_type)}
          </div>
        </div>
      }
    >
      <Meta
        title={
          <Tooltip title={document.title}>
            <span className="document-title">{document.title}</span>
          </Tooltip>
        }
        description={
          <div className="document-description">
            <Paragraph
              ellipsis={{ rows: 2 }}
              style={{ marginBottom: 8 }}
            >
              {document.description}
            </Paragraph>

            {showTags && document.tags && (
              <div className="document-tags">
                {document.tags.map(tag => (
                  <Tag key={tag.id} color={tag.color}>
                    {tag.name}
                  </Tag>
                ))}
              </div>
            )}

            {showStats && (
              <div className="document-stats">
                <Space size="middle">
                  <span>
                    <EyeOutlined /> {document.view_count}
                  </span>
                  <span>
                    <DownloadOutlined /> {document.download_count}
                  </span>
                  <span>
                    <UserOutlined /> {document.uploader?.username}
                  </span>
                </Space>
              </div>
            )}

            <div className="document-meta">
              <Text type="secondary">
                {formatFileSize(document.file_size)} ·
                {formatDate(document.created_at)}
              </Text>
            </div>
          </div>
        }
      />
    </Card>
  );
};
```

### 5.4 标签管理组件 (TagManager)
```typescript
interface TagManagerProps {
  tags: Tag[];
  selectedTags: number[];
  onChange: (tags: number[]) => void;
  allowCreate?: boolean;
  maxTags?: number;
}

const TagManager: React.FC<TagManagerProps> = ({
  tags,
  selectedTags,
  onChange,
  allowCreate = true,
  maxTags = 10
}) => {
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [createTag] = useCreateTagMutation();

  const handleTagClose = (tagId: number) => {
    const newTags = selectedTags.filter(id => id !== tagId);
    onChange(newTags);
  };

  const handleTagSelect = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      handleTagClose(tagId);
    } else if (selectedTags.length < maxTags) {
      onChange([...selectedTags, tagId]);
    } else {
      message.warning(`最多只能选择 ${maxTags} 个标签`);
    }
  };

  const handleCreateTag = async () => {
    if (inputValue && !tags.find(tag => tag.name === inputValue)) {
      try {
        const newTag = await createTag({ name: inputValue }).unwrap();
        onChange([...selectedTags, newTag.id]);
        setInputValue('');
        setInputVisible(false);
      } catch (error) {
        message.error('创建标签失败');
      }
    }
  };

  return (
    <div className="tag-manager">
      <div className="selected-tags">
        {selectedTags.map(tagId => {
          const tag = tags.find(t => t.id === tagId);
          return tag ? (
            <Tag
              key={tag.id}
              closable
              color={tag.color}
              onClose={() => handleTagClose(tag.id)}
            >
              {tag.name}
            </Tag>
          ) : null;
        })}

        {allowCreate && inputVisible && (
          <Input
            type="text"
            size="small"
            style={{ width: 78 }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleCreateTag}
            onPressEnter={handleCreateTag}
            autoFocus
          />
        )}

        {allowCreate && !inputVisible && selectedTags.length < maxTags && (
          <Tag
            onClick={() => setInputVisible(true)}
            style={{ background: '#fff', borderStyle: 'dashed' }}
          >
            <PlusOutlined /> 新标签
          </Tag>
        )}
      </div>

      <div className="available-tags">
        <Text strong>可选标签：</Text>
        <div style={{ marginTop: 8 }}>
          {tags
            .filter(tag => !selectedTags.includes(tag.id))
            .map(tag => (
              <CheckableTag
                key={tag.id}
                checked={false}
                onChange={() => handleTagSelect(tag.id)}
                style={{
                  color: tag.color,
                  borderColor: tag.color
                }}
              >
                {tag.name}
              </CheckableTag>
            ))}
        </div>
      </div>
    </div>
  );
};
```

### 5.5 权限管理组件 (PermissionManager)
```typescript
interface PermissionManagerProps {
  documentId: number;
  permissions: Permission[];
  onChange?: (permissions: Permission[]) => void;
  canEdit?: boolean;
}

const PermissionManager: React.FC<PermissionManagerProps> = ({
  documentId,
  permissions,
  onChange,
  canEdit = false
}) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const { data: users } = useGetUsersQuery();
  const [grantPermission] = useGrantPermissionMutation();
  const [revokePermission] = useRevokePermissionMutation();

  const handleGrantPermission = async (values: PermissionFormData) => {
    try {
      const newPermission = await grantPermission({
        document_id: documentId,
        user_id: values.user_id,
        permission_type: values.permission_type,
        expires_at: values.expires_at
      }).unwrap();

      onChange?.([...permissions, newPermission]);
      setVisible(false);
      form.resetFields();
      message.success('权限设置成功');
    } catch (error) {
      message.error('权限设置失败');
    }
  };

  const handleRevokePermission = async (permissionId: number) => {
    try {
      await revokePermission(permissionId).unwrap();
      onChange?.(permissions.filter(p => p.id !== permissionId));
      message.success('权限已撤销');
    } catch (error) {
      message.error('撤销权限失败');
    }
  };

  return (
    <div className="permission-manager">
      <div className="permission-list">
        <List
          header={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>文档权限</Text>
              {canEdit && (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => setVisible(true)}
                >
                  添加权限
                </Button>
              )}
            </div>
          }
          dataSource={permissions}
          renderItem={(permission) => (
            <List.Item
              actions={canEdit ? [
                <Button
                  type="link"
                  danger
                  size="small"
                  onClick={() => handleRevokePermission(permission.id)}
                >
                  撤销
                </Button>
              ] : []}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={permission.user.username}
                description={
                  <Space>
                    <Tag color={getPermissionColor(permission.permission_type)}>
                      {getPermissionText(permission.permission_type)}
                    </Tag>
                    {permission.expires_at && (
                      <Text type="secondary">
                        过期时间：{formatDate(permission.expires_at)}
                      </Text>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </div>

      <Modal
        title="设置权限"
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={form.submit}
      >
        <Form form={form} onFinish={handleGrantPermission} layout="vertical">
          <Form.Item
            name="user_id"
            label="用户"
            rules={[{ required: true, message: '请选择用户' }]}
          >
            <Select placeholder="选择用户">
              {users?.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="permission_type"
            label="权限类型"
            rules={[{ required: true, message: '请选择权限类型' }]}
          >
            <Radio.Group>
              <Radio value="read">只读</Radio>
              <Radio value="write">编辑</Radio>
              <Radio value="admin">管理</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="expires_at"
            label="过期时间（可选）"
          >
            <DatePicker showTime placeholder="永不过期" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
```

## 6. 状态管理设计

### 6.1 Redux Store 结构
```typescript
interface RootState {
  auth: AuthState;
  documents: DocumentsState;
  tags: TagsState;
  ui: UIState;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface DocumentsState {
  list: Document[];
  current: Document | null;
  loading: boolean;
  filters: DocumentFilters;
  pagination: PaginationState;
}

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
}
```

### 6.2 RTK Query API
```typescript
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Document', 'Tag', 'User', 'Permission'],
  endpoints: (builder) => ({
    // 文档相关接口
    getDocuments: builder.query<DocumentListResponse, DocumentListParams>({
      query: (params) => ({
        url: '/documents',
        params,
      }),
      providesTags: ['Document'],
    }),

    getDocument: builder.query<Document, string>({
      query: (id) => `/documents/${id}`,
      providesTags: (result, error, id) => [{ type: 'Document', id }],
    }),

    uploadDocument: builder.mutation<Document, FormData>({
      query: (formData) => ({
        url: '/documents',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Document'],
    }),

    // 其他接口...
  }),
});
```

## 7. 自定义Hooks

### 7.1 useAuth Hook
```typescript
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, loading } = useAppSelector(state => state.auth);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch(authSlice.actions.setLoading(true));
      const response = await authApi.login(credentials);
      dispatch(authSlice.actions.loginSuccess(response));
      localStorage.setItem('token', response.token);
      return response;
    } catch (error) {
      dispatch(authSlice.actions.loginFailure());
      throw error;
    } finally {
      dispatch(authSlice.actions.setLoading(false));
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch(authSlice.actions.logout());
    localStorage.removeItem('token');
  }, [dispatch]);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const user = await authApi.getProfile();
        dispatch(authSlice.actions.setUser({ user, token }));
      } catch (error) {
        logout();
      }
    }
  }, [dispatch, logout]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth
  };
};
```

### 7.2 useLocalStorage Hook
```typescript
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
};
```

### 7.3 useDebounce Hook
```typescript
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

## 8. 工具函数

### 8.1 文件处理工具
```typescript
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const getFileIcon = (mimeType: string): React.ReactNode => {
  if (mimeType.includes('pdf')) return <FilePdfOutlined />;
  if (mimeType.includes('word')) return <FileWordOutlined />;
  if (mimeType.includes('excel')) return <FileExcelOutlined />;
  if (mimeType.includes('image')) return <FileImageOutlined />;
  if (mimeType.includes('text')) return <FileTextOutlined />;
  return <FileOutlined />;
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some(type => file.type.includes(type));
};
```

### 8.2 日期处理工具
```typescript
export const formatDate = (date: string | Date, format = 'YYYY-MM-DD HH:mm'): string => {
  return dayjs(date).format(format);
};

export const formatRelativeTime = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

export const isToday = (date: string | Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'day');
};
```

## 9. 样式设计

### 9.1 主题配置
```typescript
export const theme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    borderRadius: 6,
    wireframe: false,
  },
  components: {
    Layout: {
      siderBg: '#001529',
      headerBg: '#ffffff',
    },
    Menu: {
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#000c17',
    },
  },
};
```

### 9.2 全局样式
```css
/* styles/global.css */
.main-layout {
  min-height: 100vh;
}

.main-content {
  margin: 24px;
  padding: 24px;
  background: #fff;
  min-height: 280px;
}

.document-card {
  margin-bottom: 16px;
  transition: all 0.3s;
}

.document-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.search-box .search-filters {
  margin-top: 16px;
}

.file-uploader .ant-upload-drag {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  background: #fafafa;
  padding: 20px;
  text-align: center;
  transition: border-color 0.3s;
}

.file-uploader .ant-upload-drag:hover {
  border-color: #1890ff;
}

.tag-manager .selected-tags {
  margin-bottom: 16px;
}

.tag-manager .available-tags {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.permission-list .ant-list-header {
  padding: 8px 0;
}

@media (max-width: 768px) {
  .main-content {
    margin: 12px;
    padding: 12px;
  }

  .document-card {
    margin-bottom: 12px;
  }
}
```

## 10. 性能优化

### 10.1 代码分割
```typescript
// 路由级别的代码分割
const DocumentList = lazy(() => import('../pages/DocumentList'));
const DocumentDetail = lazy(() => import('../pages/DocumentDetail'));
const DocumentUpload = lazy(() => import('../pages/DocumentUpload'));

// 组件级别的代码分割
const HeavyComponent = lazy(() => import('../components/HeavyComponent'));

// Suspense包装
<Suspense fallback={<Spin size="large" />}>
  <Routes>
    <Route path="/documents" element={<DocumentList />} />
    <Route path="/documents/:id" element={<DocumentDetail />} />
    <Route path="/upload" element={<DocumentUpload />} />
  </Routes>
</Suspense>
```

### 10.2 虚拟滚动
```typescript
// 大列表虚拟滚动
import { FixedSizeList as List } from 'react-window';

const VirtualDocumentList: React.FC<{ documents: Document[] }> = ({ documents }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <DocumentCard document={documents[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={documents.length}
      itemSize={200}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### 10.3 图片懒加载
```typescript
const LazyImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef}>
      {inView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
        />
      )}
    </div>
  );
};
```

## 11. 测试策略

### 11.1 单元测试
```typescript
// 组件测试示例
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentCard } from '../DocumentCard';

describe('DocumentCard', () => {
  const mockDocument = {
    id: 1,
    title: 'Test Document',
    description: 'Test Description',
    mime_type: 'application/pdf',
    file_size: 1024000,
    view_count: 10,
    download_count: 5,
    tags: [{ id: 1, name: 'Test Tag', color: '#1890ff' }],
    uploader: { id: 1, username: 'testuser' },
    created_at: '2023-12-01T10:00:00Z'
  };

  it('renders document information correctly', () => {
    render(<DocumentCard document={mockDocument} />);

    expect(screen.getByText('Test Document')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Tag')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = jest.fn();
    render(<DocumentCard document={mockDocument} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('img'));
    expect(handleClick).toHaveBeenCalledWith(mockDocument);
  });
});
```

### 11.2 集成测试
```typescript
// API集成测试
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { DocumentList } from '../DocumentList';

const server = setupServer(
  rest.get('/api/v1/documents', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          documents: [mockDocument],
          pagination: { page: 1, limit: 20, total: 1, pages: 1 }
        }
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('loads and displays documents', async () => {
  render(
    <Provider store={store}>
      <DocumentList />
    </Provider>
  );

  await waitFor(() => {
    expect(screen.getByText('Test Document')).toBeInTheDocument();
  });
});
```

## 12. 部署配置

### 12.1 Vite配置
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          router: ['react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
  },
});
```

### 12.2 环境变量配置
```typescript
// .env.development
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_UPLOAD_MAX_SIZE=104857600
VITE_SUPPORTED_FILE_TYPES=.pdf,.doc,.docx,.txt,.md

// .env.production
VITE_API_BASE_URL=/api/v1
VITE_UPLOAD_MAX_SIZE=104857600
VITE_SUPPORTED_FILE_TYPES=.pdf,.doc,.docx,.txt,.md
```