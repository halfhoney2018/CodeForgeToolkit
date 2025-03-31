import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Typography,
  Input,
  Button,
  Select,
  Slider,
  Space,
  Divider,
  Message,
  Grid,
  Tooltip,
  Tabs,
  Spin,
  Empty
} from '@arco-design/web-react';
import {
  IconMobile,
  IconDesktop,
  IconRefresh,
  IconLink,
  IconHistory,
  IconDelete,
  IconFullscreen,
  IconFullscreenExit,
  IconPlus,
  IconMinus,
  IconSync,
  IconApps,
  IconCode
} from '@arco-design/web-react/icon';
import useResponsivePreview from '../../hooks/useResponsivePreview';
import './ResponsivePreview.css';

const { Title, Text, Paragraph } = Typography;
const { Row, Col } = Grid;
const { TabPane } = Tabs;
const Option = Select.Option;

/**
 * 响应式设计预览组件
 */
const ResponsivePreview: React.FC = () => {
  const {
    previewState,
    history,
    devices,
    getActiveDevice,
    setUrl,
    setActiveDevice,
    setCustomSize,
    toggleRotateDevice,
    setZoom,
    toggleRulers,
    toggleDeviceFrame,
    handleIframeLoad,
    handleIframeError,
    clearHistory
  } = useResponsivePreview();
  
  const [urlInput, setUrlInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const activeDevice = getActiveDevice();
  
  // 处理URL输入
  const handleUrlSubmit = () => {
    if (!urlInput) {
      Message.warning('请输入URL');
      return;
    }
    setUrl(urlInput);
  };
  
  // 处理全屏切换
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // 根据设备类型过滤设备列表
  const filteredDevices = activeTab === 'all' 
    ? devices 
    : devices.filter(device => device.deviceType === activeTab);
  
  // 渲染设备选择器
  const renderDeviceSelector = () => {
    return (
      <div className="device-selector">
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          <TabPane key="all" title="全部" />
          <TabPane key="mobile" title={<><IconMobile /> 手机</>} />
          <TabPane key="tablet" title={<><IconApps /> 平板</>} />
          <TabPane key="desktop" title={<><IconDesktop /> 桌面</>} />
          <TabPane key="custom" title="自定义" />
        </Tabs>
        
        <div className="device-list">
          {filteredDevices.map(device => (
            <div
              key={device.id}
              className={`device-item ${activeDevice.id === device.id ? 'active' : ''}`}
              onClick={() => setActiveDevice(device.id)}
            >
              <div className="device-icon">
                {device.deviceType === 'mobile' && <IconMobile />}
                {device.deviceType === 'tablet' && <IconApps />}
                {device.deviceType === 'desktop' && <IconDesktop />}
                {device.deviceType === 'custom' && <IconCode />}
              </div>
              <div className="device-info">
                <div className="device-name">{device.name}</div>
                <div className="device-dimensions">
                  {device.width} × {device.height}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // 渲染自定义尺寸控制
  const renderCustomSizeControls = () => {
    return (
      <div className="custom-size-controls">
        <Space>
          <Input
            prefix="宽"
            suffix="px"
            type="number"
            value={previewState.isCustomSize ? previewState.customWidth.toString() : activeDevice.width.toString()}
            onChange={value => {
              const width = parseInt(value as string);
              if (width > 0) {
                setCustomSize(width, previewState.isCustomSize ? previewState.customHeight : activeDevice.height);
              }
            }}
            style={{ width: 120 }}
          />
          <Input
            prefix="高"
            suffix="px"
            type="number"
            value={previewState.isCustomSize ? previewState.customHeight.toString() : activeDevice.height.toString()}
            onChange={value => {
              const height = parseInt(value as string);
              if (height > 0) {
                setCustomSize(previewState.isCustomSize ? previewState.customWidth : activeDevice.width, height);
              }
            }}
            style={{ width: 120 }}
          />
          <Tooltip content="旋转设备">
            <Button
              type="secondary"
              icon={<IconSync />}
              onClick={toggleRotateDevice}
            />
          </Tooltip>
        </Space>
      </div>
    );
  };
  
  // 渲染缩放控制
  const renderZoomControls = () => {
    return (
      <div className="zoom-controls">
        <Space>
          <Button
            type="text"
            icon={<IconMinus />}
            onClick={() => setZoom(Math.max(0.25, previewState.zoom - 0.25))}
            disabled={previewState.zoom <= 0.25}
          />
          <Slider
            value={previewState.zoom * 100}
            min={25}
            max={200}
            step={25}
            onChange={value => setZoom(Number(value) / 100)}
            style={{ width: 120 }}
          />
          <Button
            type="text"
            icon={<IconPlus />}
            onClick={() => setZoom(Math.min(2, previewState.zoom + 0.25))}
            disabled={previewState.zoom >= 2}
          />
          <Text>{Math.round(previewState.zoom * 100)}%</Text>
        </Space>
      </div>
    );
  };
  
  // 渲染工具栏
  const renderToolbar = () => {
    return (
      <div className="preview-toolbar">
        <div className="toolbar-left">
          <Space>
            <div className="url-input-container">
              <Input
                prefix={<IconLink />}
                placeholder="输入网址 (例如: example.com)"
                value={urlInput}
                onChange={setUrlInput}
                onPressEnter={handleUrlSubmit}
                style={{ width: 300 }}
                addAfter={
                  <Button type="primary" onClick={handleUrlSubmit}>
                    预览
                  </Button>
                }
              />
            </div>
            
            <Tooltip content="刷新">
              <Button
                type="secondary"
                icon={<IconRefresh />}
                onClick={() => {
                  if (iframeRef.current) {
                    iframeRef.current.src = previewState.url;
                  }
                }}
                disabled={!previewState.url}
              />
            </Tooltip>
            
            <Tooltip content="历史记录">
              <Select
                placeholder="历史记录"
                style={{ width: 200 }}
                triggerProps={{
                  autoAlignPopupWidth: false,
                  position: 'bl',
                }}
                value={previewState.url}
                onChange={value => {
                  setUrl(value);
                  setUrlInput(value);
                }}
                renderFormat={() => (
                  <Space>
                    <IconHistory />
                    <Text>历史记录</Text>
                  </Space>
                )}
                triggerElement={
                  <Button type="secondary" icon={<IconHistory />} />
                }
              >
                {history.length > 0 ? (
                  <>
                    {history.map(url => (
                      <Option key={url} value={url}>
                        {url}
                      </Option>
                    ))}
                    <Divider style={{ margin: '4px 0' }} />
                    <div className="select-footer">
                      <Button
                        type="text"
                        size="small"
                        status="danger"
                        icon={<IconDelete />}
                        onClick={e => {
                          e.stopPropagation();
                          clearHistory();
                        }}
                      >
                        清空历史
                      </Button>
                    </div>
                  </>
                ) : (
                  <Option value="" disabled>
                    暂无历史记录
                  </Option>
                )}
              </Select>
            </Tooltip>
          </Space>
        </div>
        
        <div className="toolbar-right">
          <Space>
            {renderCustomSizeControls()}
            
            <Divider type="vertical" />
            
            {renderZoomControls()}
            
            <Divider type="vertical" />
            
            <Space>
              <Tooltip content={previewState.showRulers ? '隐藏标尺' : '显示标尺'}>
                <Button
                  type={previewState.showRulers ? 'primary' : 'secondary'}
                  icon={<IconCode />}
                  onClick={toggleRulers}
                />
              </Tooltip>
              
              <Tooltip content={previewState.showDeviceFrame ? '隐藏设备框架' : '显示设备框架'}>
                <Button
                  type={previewState.showDeviceFrame ? 'primary' : 'secondary'}
                  icon={previewState.showDeviceFrame ? <IconApps /> : <IconMobile />}
                  onClick={toggleDeviceFrame}
                />
              </Tooltip>
              
              <Tooltip content={isFullscreen ? '退出全屏' : '全屏预览'}>
                <Button
                  type="secondary"
                  icon={isFullscreen ? <IconFullscreenExit /> : <IconFullscreen />}
                  onClick={toggleFullscreen}
                />
              </Tooltip>
            </Space>
          </Space>
        </div>
      </div>
    );
  };
  
  // 渲染预览区域
  const renderPreviewArea = () => {
    const { width, height } = activeDevice;
    const scaledWidth = width * previewState.zoom;
    const scaledHeight = height * previewState.zoom;
    
    // 设备框架类名
    const deviceFrameClass = previewState.showDeviceFrame 
      ? `device-frame ${activeDevice.deviceType} ${activeDevice.orientation || 'portrait'}`
      : '';
    
    return (
      <div className="preview-area">
        {previewState.url ? (
          <>
            {previewState.isLoading && (
              <div className="loading-overlay">
                <Spin size="large" tip="加载中..." />
              </div>
            )}
            
            {previewState.error && (
              <div className="error-overlay">
                <Empty
                  description={previewState.error}
                  icon={<IconLink style={{ color: 'var(--color-danger-6)' }} />}
                />
              </div>
            )}
            
            <div className="preview-container">
              <div
                className={`preview-device ${deviceFrameClass}`}
                style={{
                  width: scaledWidth,
                  height: scaledHeight
                }}
              >
                <iframe
                  ref={iframeRef}
                  src={previewState.url}
                  width={width.toString()}
                  height={height.toString()}
                  style={{
                    transform: `scale(${previewState.zoom})`,
                    transformOrigin: '0 0',
                  }}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                />
                
                {previewState.showRulers && (
                  <>
                    <div className="ruler horizontal">
                      {Array.from({ length: Math.ceil(width / 100) + 1 }).map((_, i) => (
                        <div key={i} className="ruler-mark">
                          <span className="ruler-text">{i * 100}</span>
                        </div>
                      ))}
                    </div>
                    <div className="ruler vertical">
                      {Array.from({ length: Math.ceil(height / 100) + 1 }).map((_, i) => (
                        <div key={i} className="ruler-mark">
                          <span className="ruler-text">{i * 100}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="empty-preview">
            <Empty
              description="请输入URL开始预览"
              icon={<IconLink style={{ fontSize: 48, opacity: 0.2 }} />}
            />
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="responsive-preview-container" ref={containerRef}>
      <Card bordered={false} className={isFullscreen ? 'fullscreen' : ''}>
        <Title heading={5}>
          <IconDesktop style={{ marginRight: 8 }} />
          响应式设计预览
        </Title>
        <Paragraph className="desc-text">
          模拟不同设备屏幕尺寸（手机/平板/PC），实时查看网页适配效果
        </Paragraph>
        
        <div className="preview-layout">
          <div className="preview-sidebar">
            {renderDeviceSelector()}
          </div>
          
          <div className="preview-main">
            {renderToolbar()}
            {renderPreviewArea()}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResponsivePreview;
