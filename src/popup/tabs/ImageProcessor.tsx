import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Tabs,
  Upload,
  Button,
  Space,
  Message,
  Grid,
  Typography,
  Select,
  Slider,
  InputNumber,
  Switch,
  List,
  Empty,
  Drawer,
  Tag,
  Spin,
  Form
} from '@arco-design/web-react';
import {
  IconUpload,
  IconDownload,
  IconRefresh,
  IconDelete,
  IconHistory,
  IconCopy,
  IconCheck,
  IconScissor,
  IconEdit,
  IconSave
} from '@arco-design/web-react/icon';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import useImageProcessor, {
  CropArea,
  ResizeOptions,
  CompressionOptions
} from '../../hooks/useImageProcessor';
import PageHeader from '../../components/PageHeader';
import './ImageProcessor.css';

const { Row, Col } = Grid;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const Option = Select.Option;
const FormItem = Form.Item;

/**
 * 图片处理工具组件
 */
const ImageProcessor: React.FC = () => {
  // 使用自定义Hook
  const {
    imageFile,
    processedImageFile,
    imagePreview,
    processedImagePreview,
    isProcessing,
    error,
    originalDimensions,
    history,
    selectedFormat,
    setSelectedFormat,
    loadImage,
    convertFormat,
    compressImage,
    resizeImage,
    cropImage,
    encodeToBase64,
    decodeFromBase64,
    clearHistory,
    restoreFromHistory,
    reset
  } = useImageProcessor();

  // 状态
  const [activeTab, setActiveTab] = useState<string>('convert');
  const [historyVisible, setHistoryVisible] = useState<boolean>(false);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [resizeOptions, setResizeOptions] = useState<ResizeOptions>({
    width: undefined,
    height: undefined,
    maintainAspectRatio: true
  });
  const [compressionOptions, setCompressionOptions] = useState<CompressionOptions>({
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    quality: 0.8
  });
  const [base64Input, setBase64Input] = useState<string>('');
  const [base64Output, setBase64Output] = useState<string>('');
  const [base64FileName, setBase64FileName] = useState<string>('decoded_image');
  const [croppingActive, setCroppingActive] = useState<boolean>(false);
  
  // 引用
  const imgRef = useRef<HTMLImageElement | null>(null);
  const uploadRef = useRef<any>(null);
  
  // 文件上传处理
  const handleFileUpload = (file: File) => {
    loadImage(file);
    return false; // 阻止默认上传行为
  };

  // 处理多个文件上传
  const handleFilesUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      loadImage(files[0]);
    }
  };

  // 处理拖放上传
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    handleFilesUpload(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 处理复制粘贴上传
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              loadImage(file);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [loadImage]);

  // 裁剪图片
  const applyCrop = async () => {
    if (completedCrop && imagePreview && originalDimensions) {
      const cropAreaData: CropArea = {
        x: Math.round((completedCrop.x / 100) * originalDimensions.width),
        y: Math.round((completedCrop.y / 100) * originalDimensions.height),
        width: Math.round((completedCrop.width / 100) * originalDimensions.width),
        height: Math.round((completedCrop.height / 100) * originalDimensions.height)
      };
      
      await cropImage(cropAreaData);
      setCroppingActive(false);
    }
  };

  // 下载处理后的图片
  const downloadProcessedImage = () => {
    if (processedImageFile) {
      const url = URL.createObjectURL(processedImageFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = processedImageFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      Message.error('没有处理后的图片可下载');
    }
  };

  // 复制Base64到剪贴板
  const copyBase64ToClipboard = async () => {
    if (base64Output) {
      try {
        await navigator.clipboard.writeText(base64Output);
        Message.success('已复制到剪贴板');
      } catch (err) {
        Message.error('复制失败');
      }
    }
  };

  // 编码为Base64
  const handleEncodeToBase64 = async () => {
    const result = await encodeToBase64();
    if (result) {
      setBase64Output(result.base64String);
    }
  };

  // 解码Base64为图片
  const handleDecodeFromBase64 = async () => {
    if (!base64Input.trim()) {
      Message.error('请输入Base64编码');
      return;
    }
    
    await decodeFromBase64(base64Input, base64FileName, selectedFormat);
    setBase64Input('');
    setActiveTab('convert');
  };

  // 渲染图片上传区域
  const renderImageUploader = () => (
    <div
      className="image-drop-zone"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Upload
        ref={uploadRef}
        drag
        accept="image/*"
        showUploadList={false}
        customRequest={({ file }: any) => {
          if (file instanceof File) {
            handleFileUpload(file);
          }
        }}
        className="image-uploader"
      >
        <div className="upload-content">
          <div className="icon-container">
            <IconUpload className="upload-icon" />
          </div>
          <Title heading={6}>拖拽或点击上传图片</Title>
          <Paragraph className="upload-hint">
            支持PNG、JPG、WebP、SVG、GIF等图片格式
          </Paragraph>
          <Paragraph className="upload-hint">
            或按Ctrl+V粘贴图片
          </Paragraph>
        </div>
      </Upload>
    </div>
  );

  // 渲染图片显示区域
  const renderImagePreview = () => (
    <div className="image-preview-container">
      {imagePreview ? (
        croppingActive ? (
          <div className="crop-container">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
            >
              <img
                ref={imgRef}
                src={imagePreview}
                alt="原始图片"
                className="preview-image"
              />
            </ReactCrop>
            <div className="crop-controls">
              <Space>
                <Button
                  type="primary"
                  icon={<IconCheck />}
                  onClick={applyCrop}
                >
                  应用裁剪
                </Button>
                <Button
                  type="secondary"
                  onClick={() => setCroppingActive(false)}
                >
                  取消
                </Button>
              </Space>
            </div>
          </div>
        ) : (
          <div className="image-container">
            <img
              src={imagePreview}
              alt="原始图片"
              className="preview-image"
            />
            <div className="image-info">
              <Text>原始图片: {imageFile?.name}</Text>
              <Text>大小: {formatFileSize(imageFile?.size || 0)}</Text>
              {originalDimensions && (
                <Text>
                  尺寸: {originalDimensions.width} x {originalDimensions.height}
                </Text>
              )}
            </div>
          </div>
        )
      ) : (
        renderImageUploader()
      )}
    </div>
  );

  // 渲染处理后的图片预览
  const renderProcessedPreview = () => (
    <div className="image-preview-container">
      {processedImagePreview ? (
        <div className="image-container">
          <img
            src={processedImagePreview}
            alt="处理后的图片"
            className="preview-image"
          />
          <div className="image-info">
            <Text>处理后的图片: {processedImageFile?.name}</Text>
            <Text>大小: {formatFileSize(processedImageFile?.size || 0)}</Text>
            {processedImageFile && imageFile && (
              <Text>
                压缩率: {calculateCompressionRatio(imageFile.size, processedImageFile.size)}
              </Text>
            )}
          </div>
          <div className="image-actions">
            <Button
              type="primary"
              icon={<IconDownload />}
              onClick={downloadProcessedImage}
            >
              下载
            </Button>
          </div>
        </div>
      ) : (
        <div className="empty-processed">
          <Empty description="处理后的图片将显示在这里" />
        </div>
      )}
    </div>
  );

  // 文件大小格式化
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 计算压缩率
  const calculateCompressionRatio = (originalSize: number, processedSize: number): string => {
    if (originalSize === 0) return '0%';
    const reduction = originalSize - processedSize;
    const ratio = (reduction / originalSize) * 100;
    return `${ratio.toFixed(2)}%`;
  };

  // 渲染格式转换选项
  const renderFormatOptions = () => (
    <Card title="格式转换" className="tool-card">
      <Form layout="vertical">
        <FormItem label="选择目标格式">
          <Select
            value={selectedFormat}
            onChange={setSelectedFormat}
            style={{ width: '100%' }}
          >
            <Option value="png">PNG</Option>
            <Option value="jpeg">JPG</Option>
            <Option value="webp">WebP</Option>
            <Option value="gif">GIF</Option>
          </Select>
        </FormItem>
        <div className="form-actions">
          <Button
            type="primary"
            disabled={!imageFile}
            loading={isProcessing}
            onClick={() => convertFormat(selectedFormat)}
          >
            转换格式
          </Button>
        </div>
      </Form>
    </Card>
  );

  // 渲染图片压缩选项
  const renderCompressionOptions = () => (
    <Card title="图片压缩" className="tool-card">
      <Form layout="vertical">
        <FormItem label="最大尺寸 (MB)">
          <InputNumber
            min={0.1}
            max={10}
            step={0.1}
            precision={1}
            value={compressionOptions.maxSizeMB}
            onChange={(val: number | undefined) => setCompressionOptions({ ...compressionOptions, maxSizeMB: val || 1 })}
            style={{ width: '100%' }}
          />
        </FormItem>
        <FormItem label="最大宽度或高度 (像素)">
          <InputNumber
            min={100}
            max={8000}
            step={100}
            value={compressionOptions.maxWidthOrHeight}
            onChange={(val: number) => setCompressionOptions({ ...compressionOptions, maxWidthOrHeight: val })}
            style={{ width: '100%' }}
          />
        </FormItem>
        <FormItem label="质量">
          <Slider
            min={0.1}
            max={1}
            step={0.1}
            value={compressionOptions.quality}
            onChange={(val: number) => setCompressionOptions({ ...compressionOptions, quality: val })}
          />
          <div className="quality-labels">
            <span>低质量</span>
            <span>高质量</span>
          </div>
        </FormItem>
        <FormItem>
          <div className="switch-option">
            <div className="switch-label">使用Web Worker</div>
            <Switch
              checked={compressionOptions.useWebWorker}
              onChange={(val: boolean) => setCompressionOptions({ ...compressionOptions, useWebWorker: val })}
            />
          </div>
        </FormItem>
        <div className="form-actions">
          <Button
            type="primary"
            disabled={!imageFile}
            loading={isProcessing}
            onClick={() => compressImage(compressionOptions)}
          >
            压缩图片
          </Button>
        </div>
      </Form>
    </Card>
  );

  // 渲染调整大小选项
  const renderResizeOptions = () => (
    <Card title="调整大小" className="tool-card">
      <Form layout="vertical">
        <FormItem label="宽度 (像素)">
          <InputNumber
            min={1}
            step={1}
            value={resizeOptions.width}
            onChange={(val: number | undefined) => setResizeOptions({ ...resizeOptions, width: val })}
            style={{ width: '100%' }}
            placeholder="原始宽度"
          />
        </FormItem>
        <FormItem label="高度 (像素)">
          <InputNumber
            min={1}
            step={1}
            value={resizeOptions.height}
            onChange={(val: number | undefined) => setResizeOptions({ ...resizeOptions, height: val })}
            style={{ width: '100%' }}
            placeholder="原始高度"
          />
        </FormItem>
        <FormItem>
          <div className="switch-option">
            <div className="switch-label">保持宽高比</div>
            <Switch
              checked={resizeOptions.maintainAspectRatio}
              onChange={(val: boolean) => setResizeOptions({ ...resizeOptions, maintainAspectRatio: val })}
            />
          </div>
        </FormItem>
        <div className="form-actions">
          <Button
            type="primary"
            disabled={!imageFile || (!resizeOptions.width && !resizeOptions.height)}
            loading={isProcessing}
            onClick={() => resizeImage(resizeOptions)}
          >
            调整大小
          </Button>
        </div>
      </Form>
    </Card>
  );

  // 渲染裁剪选项
  const renderCropOptions = () => (
    <Card title="裁剪图片" className="tool-card">
      <div className="crop-instructions">
        <Paragraph>点击"开始裁剪"后，可以在图片上拖动和调整选区</Paragraph>
      </div>
      <div className="form-actions">
        <Button
          type="primary"
          icon={<IconScissor />}
          disabled={!imageFile || croppingActive}
          onClick={() => setCroppingActive(true)}
        >
          开始裁剪
        </Button>
      </div>
    </Card>
  );

  // 渲染Base64编码/解码选项
  const renderBase64Options = () => (
    <Card title="Base64 编码/解码" className="tool-card">
      <Tabs defaultActiveTab="encode">
        <TabPane key="encode" title="编码为Base64">
          <div className="base64-instructions">
            <Paragraph>将图片转换为Base64编码格式，可用于直接嵌入HTML或CSS中</Paragraph>
          </div>
          <div className="form-actions">
            <Button
              type="primary"
              icon={<IconEdit />}
              disabled={!imageFile}
              loading={isProcessing}
              onClick={handleEncodeToBase64}
            >
              编码为Base64
            </Button>
          </div>
          {base64Output && (
            <div className="base64-output">
              <FormItem label="Base64编码">
                <div className="base64-result">
                  <textarea
                    value={base64Output}
                    readOnly
                    className="arco-textarea"
                    rows={5}
                  />
                  <Button
                    type="primary"
                    icon={<IconCopy />}
                    className="copy-button"
                    onClick={copyBase64ToClipboard}
                  >
                    复制
                  </Button>
                </div>
              </FormItem>
            </div>
          )}
        </TabPane>
        <TabPane key="decode" title="解码Base64">
          <Form layout="vertical">
            <FormItem label="输入Base64编码">
              <textarea
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
                placeholder="粘贴Base64编码..."
                className="arco-textarea"
                rows={5}
              />
            </FormItem>
            <FormItem label="文件名 (不含扩展名)">
              <Input
                value={base64FileName}
                onChange={setBase64FileName}
                placeholder="decoded_image"
              />
            </FormItem>
            <FormItem label="目标格式">
              <Select
                value={selectedFormat}
                onChange={setSelectedFormat}
                style={{ width: '100%' }}
              >
                <Option value="png">PNG</Option>
                <Option value="jpeg">JPG</Option>
                <Option value="webp">WebP</Option>
                <Option value="gif">GIF</Option>
              </Select>
            </FormItem>
            <div className="form-actions">
              <Button
                type="primary"
                icon={<IconEdit />}
                disabled={!base64Input}
                loading={isProcessing}
                onClick={handleDecodeFromBase64}
              >
                解码Base64
              </Button>
            </div>
          </Form>
        </TabPane>
      </Tabs>
    </Card>
  );

  // 渲染历史记录抽屉
  const renderHistoryDrawer = () => (
    <Drawer
      width={500}
      title={
        <div className="history-drawer-header">
          <span>历史记录</span>
          {history.length > 0 && (
            <Button
              type="primary"
              status="warning"
              size="small"
              icon={<IconDelete />}
              onClick={clearHistory}
            >
              清空历史
            </Button>
          )}
        </div>
      }
      visible={historyVisible}
      onCancel={() => setHistoryVisible(false)}
      footer={null}
    >
      {history.length > 0 ? (
        <List
          className="history-list"
          dataSource={history}
          render={(item, index) => (
            <List.Item
              key={item.id}
              actions={[
                <Button
                  key="restore"
                  type="text"
                  icon={<IconRefresh />}
                  onClick={() => {
                    restoreFromHistory(item);
                    setHistoryVisible(false);
                  }}
                />
              ]}
            >
              <div className="history-item">
                <div className="history-item-header">
                  <div className="history-item-title">
                    <span className="history-item-index">{index + 1}.</span>
                    <Tag color="arcoblue">{item.operation}</Tag>
                  </div>
                  <Text type="secondary" className="history-item-date">
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </div>
                <div className="history-item-details">
                  <Text>原始大小: {formatFileSize(item.originalSize)}</Text>
                  <Text>处理后大小: {formatFileSize(item.processedSize)}</Text>
                  {item.name && <Text>文件名: {item.name}</Text>}
                </div>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="暂无历史记录" />
      )}
    </Drawer>
  );

  // 主渲染函数
  return (
    <div className="module-container">
      <PageHeader title="图片处理工具" />
      
      <Row gutter={16} className="main-content">
        <Col span={12} className="left-column">
          {renderImagePreview()}
          
          <div className="tool-actions">
            <Space>
              <Button
                type="primary"
                icon={<IconUpload />}
                onClick={() => uploadRef.current?.dom?.click()}
              >
                上传新图片
              </Button>
              {imageFile && (
                <Button
                  type="secondary"
                  icon={<IconHistory />}
                  onClick={() => setHistoryVisible(true)}
                >
                  历史记录
                </Button>
              )}
              {processedImageFile && (
                <Button
                  type="secondary"
                  icon={<IconSave />}
                  onClick={() => {
                    loadImage(processedImageFile);
                  }}
                >
                  使用处理后的图片
                </Button>
              )}
              {imageFile && (
                <Button
                  type="secondary"
                  status="warning"
                  icon={<IconDelete />}
                  onClick={reset}
                >
                  清除
                </Button>
              )}
            </Space>
          </div>
        </Col>
        
        <Col span={12} className="right-column">
          {processedImagePreview ? (
            renderProcessedPreview()
          ) : (
            <div className="tool-selection">
              <Tabs
                activeTab={activeTab}
                onChange={setActiveTab}
              >
                <TabPane key="convert" title="格式转换">
                  {renderFormatOptions()}
                </TabPane>
                <TabPane key="compress" title="图片压缩">
                  {renderCompressionOptions()}
                </TabPane>
                <TabPane key="resize" title="调整大小">
                  {renderResizeOptions()}
                </TabPane>
                <TabPane key="crop" title="裁剪">
                  {renderCropOptions()}
                </TabPane>
                <TabPane key="base64" title="Base64">
                  {renderBase64Options()}
                </TabPane>
              </Tabs>
            </div>
          )}
        </Col>
      </Row>
      
      {isProcessing && (
        <div className="processing-overlay">
          <Spin size="large" tip="处理中..." />
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <Text type="danger">{error}</Text>
        </div>
      )}
      
      {renderHistoryDrawer()}
    </div>
  );
};

// 图片处理工具中用到的Input组件
const Input = (props: any) => {
  const { value, onChange, ...rest } = props;
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
      className="arco-input"
    />
  );
};

export default ImageProcessor;
