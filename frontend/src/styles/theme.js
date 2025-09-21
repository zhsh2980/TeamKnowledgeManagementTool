// Ant Design 主题配置
const theme = {
  token: {
    // 品牌色 - 深邃海洋风格
    colorPrimary: '#0F766E',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#DC2626',
    colorInfo: '#0891B2',

    // 中性色
    colorTextBase: '#111827',
    colorBgBase: '#FFFFFF',

    // 圆角
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // 字体
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
                  'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue',
                  Helvetica, Arial, sans-serif`,
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeXL: 20,

    // 控件尺寸
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,

    // 间距
    padding: 16,
    paddingLG: 24,
    paddingXL: 32,
    paddingSM: 12,
    paddingXS: 8,

    // 阴影
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    boxShadowSecondary: '0 4px 12px rgba(0, 0, 0, 0.12)',

    // 动画
    motionDurationFast: '0.15s',
    motionDurationMid: '0.3s',
    motionDurationSlow: '0.5s',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // 线条
    lineWidth: 1,
    lineType: 'solid',
    lineWidthBold: 2,

    // 其他
    colorLink: '#0F766E',
    colorLinkHover: '#14B8A6',
    colorLinkActive: '#0D5953',
  },

  components: {
    // 按钮组件定制
    Button: {
      colorPrimary: '#0F766E',
      borderRadius: 8,
      controlHeight: 40,
      paddingContentHorizontal: 24,
      fontWeight: 500,
      primaryShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
    },

    // 输入框定制
    Input: {
      controlHeight: 40,
      borderRadius: 8,
      paddingBlock: 10,
      paddingInline: 12,
      colorBorder: '#E5E7EB',
      hoverBorderColor: '#9CA3AF',
      activeBorderColor: '#0F766E',
      activeShadow: '0 0 0 2px rgba(15, 118, 110, 0.15)',
    },

    // 卡片定制
    Card: {
      borderRadiusLG: 16,
      boxShadowTertiary: '0 2px 8px rgba(0, 0, 0, 0.08)',
      paddingLG: 24,
      colorBorderSecondary: '#E5E7EB',
    },

    // 表格定制
    Table: {
      borderRadius: 12,
      headerBg: '#F9FAFB',
      headerColor: '#111827',
      headerSortActiveBg: '#F3F4F6',
      bodySortBg: '#FAFAFB',
      rowHoverBg: 'rgba(79, 70, 229, 0.04)',
      rowSelectedBg: 'rgba(79, 70, 229, 0.08)',
      rowSelectedHoverBg: 'rgba(79, 70, 229, 0.12)',
      headerBorderRadius: 12,
      fontWeightStrong: 600,
    },

    // 选择器定制
    Select: {
      controlHeight: 40,
      borderRadius: 8,
      optionSelectedBg: 'rgba(15, 118, 110, 0.1)',
      optionSelectedColor: '#0F766E',
      optionActiveBg: '#F9FAFB',
    },

    // 标签定制
    Tag: {
      defaultBg: '#F3F4F6',
      defaultColor: '#374151',
      borderRadiusSM: 999,
    },

    // 消息提示定制
    Message: {
      contentBg: '#FFFFFF',
      borderRadius: 12,
    },

    // 弹出确认框定制
    Modal: {
      borderRadiusLG: 16,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      paddingContentHorizontal: 24,
    },

    // 菜单定制
    Menu: {
      itemBorderRadius: 8,
      itemHoverBg: 'rgba(15, 118, 110, 0.05)',
      itemSelectedBg: 'rgba(15, 118, 110, 0.1)',
      itemSelectedColor: '#0F766E',
      itemMarginInline: 8,
      itemMarginBlock: 4,
      subMenuItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(15, 118, 110, 0.2)',
    },

    // 布局定制
    Layout: {
      bodyBg: '#F9FAFB',
      headerBg: '#FFFFFF',
      headerHeight: 64,
      headerPadding: '0 32px',
      siderBg: '#FFFFFF',
      triggerBg: '#0F766E',
      triggerColor: '#FFFFFF',
    },

    // 表单定制
    Form: {
      labelColor: '#374151',
      labelFontSize: 14,
      verticalLabelPadding: '0 0 8px',
      itemMarginBottom: 24,
    },

    // 分页器定制
    Pagination: {
      borderRadius: 8,
      itemActiveBg: '#0F766E',
      itemBg: '#FFFFFF',
      itemLinkBg: '#FFFFFF',
      itemInputBg: '#FFFFFF',
      itemSize: 32,
    },

    // 步骤条定制
    Steps: {
      iconSize: 32,
      iconTop: 0,
      dotSize: 8,
      controlHeight: 32,
      descriptionMaxWidth: 160,
    },

    // 徽标数定制
    Badge: {
      dotSize: 8,
      textFontSize: 12,
      textFontWeight: 500,
    },

    // 开关定制
    Switch: {
      trackHeight: 22,
      trackMinWidth: 44,
      innerMinMargin: 2,
      innerMaxMargin: 2,
      handleSize: 18,
      handleBg: '#FFFFFF',
    },

    // 单选框定制
    Radio: {
      size: 20,
      radioSize: 20,
      dotSize: 8,
      wrapperMarginInlineEnd: 16,
    },

    // 复选框定制
    Checkbox: {
      size: 16,
      borderRadius: 4,
    },

    // 下拉菜单定制
    Dropdown: {
      paddingBlock: 8,
      borderRadius: 12,
    },

    // 工具提示定制
    Tooltip: {
      borderRadius: 8,
      colorBgDefault: '#1F2937',
    },

    // 时间选择器定制
    DatePicker: {
      controlHeight: 40,
      borderRadius: 8,
    },
  },

  // 算法配置
  algorithm: undefined, // 将在组件中根据主题模式动态设置
};

// 深色模式主题配置
const darkTheme = {
  ...theme,
  token: {
    ...theme.token,
    colorTextBase: '#F1F5F9',
    colorBgBase: '#0F172A',
    colorBorder: '#334155',
    colorBorderSecondary: '#1E293B',
    colorBgContainer: '#1E293B',
    colorBgElevated: '#334155',
    colorBgLayout: '#0F172A',
    colorBgSpotlight: 'rgba(255, 255, 255, 0.1)',
    colorText: '#F1F5F9',
    colorTextSecondary: '#94A3B8',
    colorTextTertiary: '#64748B',
    colorTextQuaternary: '#475569',
  },
  components: {
    ...theme.components,
    Layout: {
      ...theme.components.Layout,
      bodyBg: '#0F172A',
      headerBg: '#1E293B',
      siderBg: '#1E293B',
    },
    Card: {
      ...theme.components.Card,
      colorBgContainer: '#1E293B',
    },
    Table: {
      ...theme.components.Table,
      headerBg: '#334155',
      colorBgContainer: '#1E293B',
    },
    Input: {
      ...theme.components.Input,
      colorBgContainer: 'rgba(255, 255, 255, 0.05)',
      colorBorder: '#334155',
    },
    Select: {
      ...theme.components.Select,
      colorBgContainer: 'rgba(255, 255, 255, 0.05)',
    },
  },
};

export { theme as lightTheme, darkTheme };