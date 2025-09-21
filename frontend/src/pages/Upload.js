import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Upload,
  Button,
  Switch,
  message,
  Space,
  Tag
} from 'antd';
import {
  InboxOutlined,
  UploadOutlined,
  FileOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../services/api';
import './Upload.css';

const { TextArea } = Input;
const { Dragger } = Upload;

const UploadDocument = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const navigate = useNavigate();

  // 处理文件上传前的验证
  const beforeUpload = (file) => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('文件大小不能超过10MB！');
      return false;
    }

    // 支持的文件类型
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'text/x-markdown',
      'application/x-markdown',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];

    // 获取文件扩展名
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'md', 'xls', 'xlsx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'gif'];

    // 检查文件类型或扩展名
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      message.error('不支持的文件类型！');
      return false;
    }

    setFileList([file]);

    // 自动填充文档标题（去除扩展名）
    const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    form.setFieldsValue({ title: fileNameWithoutExt });

    return false; // 阻止自动上传
  };

  // 处理文件移除
  const onRemove = () => {
    setFileList([]);
    form.setFieldsValue({ title: '' }); // 清空标题
  };

  // 添加标签
  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  // 移除标签
  const handleRemoveTag = (removedTag) => {
    setTags(tags.filter(tag => tag !== removedTag));
  };

  // 提交表单
  const onFinish = async (values) => {
    if (fileList.length === 0) {
      message.error('请选择要上传的文件');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', fileList[0]);
    formData.append('title', values.title);
    formData.append('description', values.description || '');
    formData.append('tags', tags.join(','));
    formData.append('is_public', values.is_public ? '1' : '0');

    try {
      const response = await documentService.upload(formData);
      if (response.success) {
        message.success('文档上传成功');
        navigate('/documents');
      } else {
        message.error(response.message || '上传失败');
      }
    } catch (error) {
      console.error('上传错误:', error);
      message.error(error.response?.data?.message || '上传失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <Card title="上传文档" className="upload-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ is_public: false }}
        >
          <Form.Item
            name="file"
            label="选择文件"
            required
          >
            <Dragger
              fileList={fileList}
              beforeUpload={beforeUpload}
              onRemove={onRemove}
              maxCount={1}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持PDF、Word、Excel、PPT、TXT、Markdown、图片等格式，文件大小不超过10MB
              </p>
            </Dragger>
          </Form.Item>

          {fileList.length > 0 && (
            <div className="file-info">
              <FileOutlined />
              <span className="file-name">{fileList[0].name}</span>
              <span className="file-size">
                {(fileList[0].size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          )}

          <Form.Item
            name="title"
            label="文档标题"
            rules={[{ required: true, message: '请输入文档标题' }]}
          >
            <Input placeholder="请输入文档标题" maxLength={255} />
          </Form.Item>

          <Form.Item
            name="description"
            label="文档描述"
          >
            <TextArea
              placeholder="请输入文档描述（可选）"
              rows={4}
              maxLength={500}
            />
          </Form.Item>

          <Form.Item label="标签">
            <div className="tag-input-container">
              <Input
                placeholder="输入标签后按回车"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onPressEnter={handleAddTag}
              />
              <Button onClick={handleAddTag} type="default">添加</Button>
            </div>
            <div className="tags-display">
              {tags.map(tag => (
                <Tag
                  key={tag}
                  closable
                  onClose={() => handleRemoveTag(tag)}
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </Form.Item>

          <Form.Item
            name="is_public"
            label="是否公开"
            valuePropName="checked"
          >
            <div className="switch-container">
              <Switch checkedChildren="公开" unCheckedChildren="私有" />
              <span className="switch-description">
                公开文档所有用户均可查看和下载
              </span>
            </div>
          </Form.Item>

          <Form.Item>
            <div className="form-buttons">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<UploadOutlined />}
                size="large"
              >
                上传文档
              </Button>
              <Button
                onClick={() => navigate('/documents')}
                size="large"
              >
                取消
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UploadDocument;