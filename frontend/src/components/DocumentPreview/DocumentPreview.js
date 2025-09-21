import React, { useState, useEffect } from 'react';
import { Modal, Spin, Button, Tag, Space, Tooltip, message, Typography } from 'antd';
import {
  DownloadOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileMarkdownOutlined,
  CloseOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateLeftOutlined,
  RotateRightOutlined
} from '@ant-design/icons';
import { documentService } from '../../services/api';
import './DocumentPreview.css';

const { Title, Text, Paragraph } = Typography;

const DocumentPreview = ({ document, visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  // 获取文件图标
  const getFileIcon = (fileName) => {
    if (!fileName) return <FileTextOutlined />;

    const ext = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: <FilePdfOutlined style={{ color: '#ff4d4f' }} />,
      doc: <FileWordOutlined style={{ color: '#1890ff' }} />,
      docx: <FileWordOutlined style={{ color: '#1890ff' }} />,
      xls: <FileExcelOutlined style={{ color: '#52c41a' }} />,
      xlsx: <FileExcelOutlined style={{ color: '#52c41a' }} />,
      ppt: <FilePptOutlined style={{ color: '#fa8c16' }} />,
      pptx: <FilePptOutlined style={{ color: '#fa8c16' }} />,
      md: <FileMarkdownOutlined style={{ color: '#722ed1' }} />,
      jpg: <FileImageOutlined style={{ color: '#13c2c2' }} />,
      jpeg: <FileImageOutlined style={{ color: '#13c2c2' }} />,
      png: <FileImageOutlined style={{ color: '#13c2c2' }} />,
      gif: <FileImageOutlined style={{ color: '#13c2c2' }} />,
      svg: <FileImageOutlined style={{ color: '#13c2c2' }} />
    };

    return iconMap[ext] || <FileTextOutlined />;
  };

  // 判断是否可预览
  const isPreviewable = (fileName) => {
    if (!fileName) return false;
    const ext = fileName.split('.').pop().toLowerCase();
    const previewableExts = ['txt', 'md', 'json', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'xml', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'pdf'];
    return previewableExts.includes(ext);
  };

  // 加载预览内容
  const loadPreview = async () => {
    if (!document || !isPreviewable(document.file_name)) {
      return;
    }

    setLoading(true);
    try {
      const ext = document.file_name.split('.').pop().toLowerCase();

      // 根据文件类型处理预览
      if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) {
        // 图片预览
        setPreviewContent({
          type: 'image',
          url: `/api/documents/${document.id}/preview`
        });
      } else if (ext === 'pdf') {
        // PDF预览
        setPreviewContent({
          type: 'pdf',
          url: `/api/documents/${document.id}/preview`
        });
      } else {
        // 文本文件预览
        const response = await documentService.preview(document.id);
        if (response.success) {
          setPreviewContent({
            type: 'text',
            content: response.data.content,
            language: ext
          });
        }
      }
    } catch (error) {
      console.error('预览失败:', error);
      message.error('文档预览失败');
    } finally {
      setLoading(false);
    }
  };

  // 下载文档
  const handleDownload = async () => {
    try {
      await documentService.download(document.id);
      message.success('下载成功');
    } catch (error) {
      message.error('下载失败');
    }
  };

  // 处理缩放
  const handleZoom = (delta) => {
    setZoom(prev => Math.min(200, Math.max(50, prev + delta)));
  };

  // 处理旋转
  const handleRotate = (delta) => {
    setRotation(prev => (prev + delta) % 360);
  };

  // 渲染预览内容
  const renderPreviewContent = () => {
    if (!previewContent) {
      return (
        <div className="preview-empty">
          <FileTextOutlined style={{ fontSize: 48, color: '#94a3b8' }} />
          <Text type="secondary">此文档不支持预览</Text>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            style={{ marginTop: 16 }}
          >
            下载文档
          </Button>
        </div>
      );
    }

    switch (previewContent.type) {
      case 'image':
        return (
          <div className="preview-image-container">
            <img
              src={previewContent.url}
              alt={document.title}
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease'
              }}
            />
          </div>
        );

      case 'pdf':
        return (
          <iframe
            src={previewContent.url}
            className="preview-pdf"
            title={document.title}
            style={{ transform: `scale(${zoom / 100})` }}
          />
        );

      case 'text':
        return (
          <div className="preview-text-container">
            {previewContent.language === 'md' ? (
              <div className="markdown-preview">
                <Paragraph>
                  <pre>{previewContent.content}</pre>
                </Paragraph>
              </div>
            ) : (
              <pre className={`language-${previewContent.language}`}>
                <code>{previewContent.content}</code>
              </pre>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // 加载预览
  useEffect(() => {
    if (visible && document) {
      loadPreview();
    } else {
      setPreviewContent(null);
      setZoom(100);
      setRotation(0);
    }
  }, [visible, document]);

  if (!document) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={fullscreen ? '100vw' : '80vw'}
      style={{ top: fullscreen ? 0 : 20 }}
      className={`document-preview-modal ${fullscreen ? 'fullscreen' : ''}`}
      footer={null}
      closable={false}
      maskClosable={!fullscreen}
    >
      <div className="preview-container">
        {/* 头部工具栏 */}
        <div className="preview-header">
          <div className="preview-header-left">
            <div className="preview-icon">
              {getFileIcon(document.file_name)}
            </div>
            <div className="preview-info">
              <Title level={4} style={{ margin: 0 }}>
                {document.title}
              </Title>
              <Space size="small">
                <Text type="secondary">{document.file_name}</Text>
                <Text type="secondary">•</Text>
                <Text type="secondary">
                  {(document.file_size / 1024).toFixed(2)} KB
                </Text>
                {document.tags && (
                  <>
                    <Text type="secondary">•</Text>
                    {document.tags.split(',').map(tag => (
                      <Tag key={tag} size="small">
                        {tag}
                      </Tag>
                    ))}
                  </>
                )}
              </Space>
            </div>
          </div>

          <div className="preview-header-right">
            <Space>
              {/* 缩放控制 */}
              {previewContent && ['image', 'pdf'].includes(previewContent.type) && (
                <>
                  <Tooltip title="缩小">
                    <Button
                      icon={<ZoomOutOutlined />}
                      onClick={() => handleZoom(-10)}
                    />
                  </Tooltip>
                  <span className="zoom-indicator">{zoom}%</span>
                  <Tooltip title="放大">
                    <Button
                      icon={<ZoomInOutlined />}
                      onClick={() => handleZoom(10)}
                    />
                  </Tooltip>
                </>
              )}

              {/* 旋转控制 */}
              {previewContent && previewContent.type === 'image' && (
                <>
                  <Tooltip title="向左旋转">
                    <Button
                      icon={<RotateLeftOutlined />}
                      onClick={() => handleRotate(-90)}
                    />
                  </Tooltip>
                  <Tooltip title="向右旋转">
                    <Button
                      icon={<RotateRightOutlined />}
                      onClick={() => handleRotate(90)}
                    />
                  </Tooltip>
                </>
              )}

              {/* 下载按钮 */}
              <Tooltip title="下载">
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                >
                  下载
                </Button>
              </Tooltip>

              {/* 全屏按钮 */}
              <Tooltip title={fullscreen ? '退出全屏' : '全屏'}>
                <Button
                  icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                  onClick={() => setFullscreen(!fullscreen)}
                />
              </Tooltip>

              {/* 关闭按钮 */}
              <Tooltip title="关闭">
                <Button
                  icon={<CloseOutlined />}
                  onClick={onClose}
                />
              </Tooltip>
            </Space>
          </div>
        </div>

        {/* 预览内容区域 */}
        <div className="preview-body">
          <Spin spinning={loading} size="large">
            {renderPreviewContent()}
          </Spin>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentPreview;