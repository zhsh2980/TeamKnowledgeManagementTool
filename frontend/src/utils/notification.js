import { message, notification } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';

// 配置全局消息样式
message.config({
  top: 80,
  duration: 3,
  maxCount: 3,
  prefixCls: 'custom-message'
});

// 配置全局通知样式
notification.config({
  placement: 'topRight',
  duration: 4,
  top: 80
});

// 自定义成功消息
export const showSuccess = (content, duration = 3) => {
  message.open({
    type: 'success',
    content,
    duration,
    icon: <CheckCircleOutlined style={{ color: '#10b981' }} />,
    className: 'animate-slideInRight'
  });
};

// 自定义错误消息
export const showError = (content, duration = 4) => {
  message.open({
    type: 'error',
    content,
    duration,
    icon: <CloseCircleOutlined style={{ color: '#ef4444' }} />,
    className: 'animate-shake'
  });
};

// 自定义信息消息
export const showInfo = (content, duration = 3) => {
  message.open({
    type: 'info',
    content,
    duration,
    icon: <InfoCircleOutlined style={{ color: '#0F766E' }} />,
    className: 'animate-slideInRight'
  });
};

// 自定义警告消息
export const showWarning = (content, duration = 3) => {
  message.open({
    type: 'warning',
    content,
    duration,
    icon: <ExclamationCircleOutlined style={{ color: '#f59e0b' }} />,
    className: 'animate-slideInRight'
  });
};

// 自定义加载消息
export const showLoading = (content = '加载中...', duration = 0) => {
  return message.open({
    type: 'loading',
    content,
    duration,
    icon: <LoadingOutlined style={{ color: '#0F766E' }} className="animate-spin" />,
    className: 'animate-fadeIn'
  });
};

// 自定义成功通知
export const notifySuccess = (message, description, duration = 4) => {
  notification.success({
    message,
    description,
    duration,
    icon: <CheckCircleOutlined style={{ color: '#10b981' }} />,
    className: 'animate-slideInRight notification-success',
    style: {
      borderLeft: '4px solid #10b981'
    }
  });
};

// 自定义错误通知
export const notifyError = (message, description, duration = 5) => {
  notification.error({
    message,
    description,
    duration,
    icon: <CloseCircleOutlined style={{ color: '#ef4444' }} />,
    className: 'animate-shake notification-error',
    style: {
      borderLeft: '4px solid #ef4444'
    }
  });
};

// 自定义信息通知
export const notifyInfo = (message, description, duration = 4) => {
  notification.info({
    message,
    description,
    duration,
    icon: <InfoCircleOutlined style={{ color: '#0F766E' }} />,
    className: 'animate-slideInRight notification-info',
    style: {
      borderLeft: '4px solid #0F766E'
    }
  });
};

// 自定义警告通知
export const notifyWarning = (message, description, duration = 4) => {
  notification.warning({
    message,
    description,
    duration,
    icon: <ExclamationCircleOutlined style={{ color: '#f59e0b' }} />,
    className: 'animate-slideInRight notification-warning',
    style: {
      borderLeft: '4px solid #f59e0b'
    }
  });
};

// 导出所有方法
export default {
  showSuccess,
  showError,
  showInfo,
  showWarning,
  showLoading,
  notifySuccess,
  notifyError,
  notifyInfo,
  notifyWarning
};