import React, { useState, useRef } from 'react';
import {
  Card,
  Space,
  Button,
  Typography,
  Tabs,
  Message,
  Input,
  List,
  Tag,
  Empty
} from '@arco-design/web-react';
import {
  IconUpload,
  IconDownload,
  IconCopy,
  IconDelete,
  IconSwap,
  IconRefresh,
  IconClose
} from '@arco-design/web-react/icon';
import useImageConverter, { ConversionHistory } from '../../hooks/useImageConverter';
import SafeCopy from '../../components/SafeCopy';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const TabPane = Tabs.TabPane;

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

// 格式化日期时间
const formatTime = (timestamp: number): string => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 图片Base64转换组件
 */
const ImageConverter: React.FC = () => {
  // 状态
  const [activeTab, setActiveTab] = useState<string>('toBase64');
  const [base64Input, setBase64Input] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 使用自定义Hook
  const {
    base64String,
    imagePreviewUrl,
    selectedFile,
    conversionHistory,
    isConverting,
    error,
    convertImageToBase64,
    convertBase64ToImage,
    downloadImage,
    loadFromHistory,
    clearCurrent,
    clearHistory
  } = useImageConverter();
  
  // 处理图片上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        Message.error('请选择图片文件');
        return;
      }
      
      // 检查文件大小 (限制为 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Message.error('图片大小不能超过 5MB');
        return;
      }
      
      convertImageToBase64(file);
    }
  };
  
  // 处理拖放上传
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      if (!file.type.startsWith('image/')) {
        Message.error('请选择图片文件');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        Message.error('图片大小不能超过 5MB');
        return;
      }
      
      convertImageToBase64(file);
    }
  };
  
  // 处理Base64转图片
  const handleBase64Convert = () => {
    if (!base64Input.trim()) {
      Message.warning('请输入Base64字符串');
      return;
    }
    
    convertBase64ToImage(base64Input.trim());
  };
  
  // 从历史记录中加载
  const handleLoadFromHistory = (item: ConversionHistory) => {
    loadFromHistory(item);
    
    if (item.type === 'fromBase64' && item.base64String) {
      setBase64Input(item.base64String);
    }
    
    setActiveTab(item.type);
  };
  
  // 获取历史记录标签
  const getHistoryTypeTag = (type: 'toBase64' | 'fromBase64') => {
    if (type === 'toBase64') {
      return <Tag color="blue">图片→Base64</Tag>;
    }
    return <Tag color="green">Base64→图片</Tag>;
  };
  
  return (
    <div className="module-container">
      <Title heading={4}>图片Base64转换</Title>
      
      <Card bordered={false}>
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          {/* 图片转Base64 */}
          <TabPane key="toBase64" title="图片转Base64">
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* 图片上传区域 */}
              <div
                style={{
                  border: '1px dashed var(--color-border-2)',
                  borderRadius: '4px',
                  padding: '20px',
                  textAlign: 'center',
                  marginBottom: '16px',
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-bg-2)'
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <Space direction="vertical">
                  <IconUpload style={{ fontSize: 36, color: 'var(--color-text-3)' }} />
                  <Text>点击或拖拽图片到此区域</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    支持JPG、PNG、GIF等常见图片格式，大小限制5MB
                  </Text>
                </Space>
              </div>
              
              {/* 图片预览 */}
              {imagePreviewUrl && activeTab === 'toBase64' && (
                <div 
                  style={{ 
                    marginBottom: '16px',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border-2)',
                    backgroundColor: 'var(--color-bg-2)'
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                      <img 
                        src={imagePreviewUrl} 
                        alt="预览" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px',
                          objectFit: 'contain'
                        }} 
                      />
                    </div>
                    
                    {selectedFile && (
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: '12px' }}>
                          {selectedFile.name} ({formatFileSize(selectedFile.size)})
                        </Text>
                      </Space>
                    )}
                  </Space>
                </div>
              )}
              
              {/* Base64结果 */}
              {base64String && activeTab === 'toBase64' && (
                <Card title="转换结果" style={{ marginBottom: '16px' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ position: 'relative' }}>
                      <TextArea
                        placeholder="转换后的Base64字符串将显示在这里"
                        value={base64String}
                        readOnly
                        style={{ 
                          minHeight: '100px', 
                          maxHeight: '200px', 
                          marginBottom: '8px',
                          fontFamily: 'monospace'
                        }}
                      />
                      
                      <div style={{ position: 'absolute', top: 8, right: 8 }}>
                        <SafeCopy text={base64String} />
                      </div>
                    </div>
                    
                    <Space>
                      <Button
                        type="primary"
                        icon={<IconCopy />}
                        onClick={() => {
                          navigator.clipboard.writeText(base64String)
                            .then(() => Message.success('Base64已复制到剪贴板'))
                            .catch(() => Message.error('复制失败，请手动复制'));
                        }}
                      >
                        复制Base64
                      </Button>
                      
                      <Button
                        type="secondary"
                        icon={<IconRefresh />}
                        onClick={clearCurrent}
                      >
                        清除
                      </Button>
                    </Space>
                  </Space>
                </Card>
              )}
              
              {/* 无内容提示 */}
              {!imagePreviewUrl && activeTab === 'toBase64' && (
                <Empty description="请选择一张图片开始转换" />
              )}
              
              {/* 错误提示 */}
              {error && activeTab === 'toBase64' && (
                <div style={{ color: 'var(--color-danger)', marginTop: '16px' }}>
                  {error}
                </div>
              )}
            </Space>
          </TabPane>
          
          {/* Base64转图片 */}
          <TabPane key="fromBase64" title="Base64转图片">
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* Base64输入 */}
              <Card title="输入Base64字符串">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ position: 'relative' }}>
                    <TextArea
                      placeholder="在此粘贴Base64字符串（可以包含或不包含data:image前缀）"
                      value={base64Input}
                      onChange={setBase64Input}
                      style={{ 
                        minHeight: '100px', 
                        fontFamily: 'monospace' 
                      }}
                    />
                    
                    {base64Input && (
                      <Button
                        size="mini"
                        shape="circle"
                        type="text"
                        icon={<IconClose />}
                        style={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={() => setBase64Input('')}
                      />
                    )}
                  </div>
                  
                  <Button
                    type="primary"
                    icon={<IconSwap />}
                    onClick={handleBase64Convert}
                    disabled={!base64Input.trim()}
                    loading={isConverting}
                  >
                    转换为图片
                  </Button>
                </Space>
              </Card>
              
              {/* 图片预览 */}
              {imagePreviewUrl && activeTab === 'fromBase64' && (
                <Card title="图片预览" style={{ marginTop: '16px' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <img
                        src={imagePreviewUrl}
                        alt="Base64图片预览"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '300px',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                    
                    <Space>
                      <Button
                        type="primary"
                        icon={<IconDownload />}
                        onClick={downloadImage}
                      >
                        下载图片
                      </Button>
                      
                      <Button
                        type="secondary"
                        icon={<IconRefresh />}
                        onClick={() => {
                          clearCurrent();
                          setBase64Input('');
                        }}
                      >
                        清除
                      </Button>
                    </Space>
                  </Space>
                </Card>
              )}
              
              {/* 无内容提示 */}
              {!imagePreviewUrl && activeTab === 'fromBase64' && (
                <Empty 
                  style={{ marginTop: '16px' }} 
                  description="转换后的图片将显示在这里" 
                />
              )}
              
              {/* 错误提示 */}
              {error && activeTab === 'fromBase64' && (
                <div style={{ color: 'var(--color-danger)', marginTop: '16px' }}>
                  {error}
                </div>
              )}
            </Space>
          </TabPane>
          
          {/* 历史记录 */}
          <TabPane key="history" title="历史记录">
            <Space direction="vertical" style={{ width: '100%' }}>
              {conversionHistory.length > 0 ? (
                <>
                  <Button
                    type="text"
                    icon={<IconDelete />}
                    onClick={clearHistory}
                    style={{ marginBottom: '16px' }}
                  >
                    清空历史记录
                  </Button>
                  
                  <List
                    dataSource={conversionHistory}
                    render={(item) => (
                      <List.Item
                        key={item.id}
                        style={{ padding: '8px' }}
                        actions={[
                          <Button
                            key="load"
                            type="text"
                            size="small"
                            onClick={() => handleLoadFromHistory(item)}
                          >
                            加载
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <Space>
                              {getHistoryTypeTag(item.type)}
                              <Text style={{ fontSize: '14px' }}>
                                {item.filename || (item.type === 'fromBase64' ? 'Base64图片' : '')}
                              </Text>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size={1}>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {formatTime(item.timestamp)}
                              </Text>
                              {item.fileSize && (
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  {formatFileSize(item.fileSize)}
                                </Text>
                              )}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </>
              ) : (
                <Empty description="暂无转换历史记录" />
              )}
            </Space>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ImageConverter;
