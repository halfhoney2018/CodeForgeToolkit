import React, { useCallback, useState } from 'react';
import {
  Button,
  Upload,
  Space,
  Card,
  Checkbox,
  Message,
  Drawer,
  Table,
  Input,
  Typography,
  Grid,
  Spin,
  Divider,
  Modal,
  Empty
} from '@arco-design/web-react';
import { 
  IconUpload, IconFile, IconDelete, IconHistory, 
  IconDownload, IconRefresh, IconPlus 
} from '@arco-design/web-react/icon';
import useFaviconGenerator, { IconSize, IconHistoryItem } from '../../hooks/useFaviconGenerator';
import './FaviconGenerator.css';

const { Row, Col } = Grid;
const { Title, Paragraph, Text } = Typography;
const CheckboxGroup = Checkbox.Group;

/**
 * 网站图标生成工具组件
 */
const FaviconGenerator: React.FC = () => {
  // 使用自定义Hook
  const {
    sourceImage,
    imagePreview,
    icoFile,
    icoPreview,
    isProcessing,
    error,
    iconSizes,
    setIconSizes,
    iconPreviews,
    history,
    loadImage,
    previewIcons,
    generateIcoFile,
    createWebPackage,
    clearHistory,
    restoreFromHistory,
    reset
  } = useFaviconGenerator();

  // 本地状态
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState<boolean>(false);
  const [htmlCodeVisible, setHtmlCodeVisible] = useState<boolean>(false);
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [iconName, setIconName] = useState<string>('favicon');

  // 可选的图标尺寸
  const availableSizes: IconSize[] = [16, 32, 48, 64, 128, 256];

  /**
   * 处理文件上传
   */
  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      Message.error('请上传有效的图片文件');
      return false;
    }
    
    loadImage(file);
    return false; // 阻止Upload组件的默认上传行为
  }, [loadImage]);

  /**
   * 处理拖放文件
   */
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        loadImage(file);
      } else {
        Message.error('请上传有效的图片文件');
      }
    }
  }, [loadImage]);

  /**
   * 生成ICO文件
   */
  const handleGenerateIco = useCallback(async () => {
    if (iconSizes.length === 0) {
      Message.error('请至少选择一个图标尺寸');
      return;
    }

    const result = await generateIcoFile({ sizes: iconSizes, name: iconName });
    if (result) {
      Message.success('图标生成成功');
    }
  }, [generateIcoFile, iconSizes, iconName]);

  /**
   * 下载生成的图标
   */
  const handleDownloadIco = useCallback(() => {
    if (icoFile) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(icoFile);
      a.download = icoFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, [icoFile]);

  /**
   * 导出网页包
   */
  const handleExportWebPackage = useCallback(async () => {
    const code = await createWebPackage();
    if (code) {
      setHtmlCode(code);
      setHtmlCodeVisible(true);
    }
  }, [createWebPackage]);

  /**
   * 复制HTML代码到剪贴板
   */
  const handleCopyHtml = useCallback(() => {
    navigator.clipboard.writeText(htmlCode)
      .then(() => {
        Message.success('HTML代码已复制到剪贴板');
      })
      .catch(err => {
        Message.error('复制失败: ' + err.message);
      });
  }, [htmlCode]);

  /**
   * 处理尺寸变化
   */
  const handleSizeChange = useCallback((values: any[]) => {
    setIconSizes(values as IconSize[]);
  }, [setIconSizes]);

  /**
   * 计算时间标签
   */
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  /**
   * 历史记录表格列
   */
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: IconHistoryItem) => name || `图标-${record.id.slice(0, 8)}`
    },
    {
      title: '原始大小',
      dataIndex: 'originalSize',
      key: 'originalSize',
      render: (size: number) => `${(size / 1024).toFixed(2)} KB`
    },
    {
      title: 'ICO大小',
      dataIndex: 'icoSize',
      key: 'icoSize',
      render: (size: number) => `${(size / 1024).toFixed(2)} KB`
    },
    {
      title: '尺寸',
      dataIndex: 'sizes',
      key: 'sizes',
      render: (sizes: IconSize[]) => sizes.map(s => `${s}x${s}`).join(', ')
    },
    {
      title: '创建时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time: number) => formatTime(time)
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: IconHistoryItem) => (
        <Space>
          <Button
            type="text"
            size="small"
            onClick={() => restoreFromHistory(record)}
          >
            恢复
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="favicon-generator-container">
      <Card
        title={
          <Title heading={5}>
            <span className="favicon-title">网站图标生成器 (Favicon/ICO)</span>
          </Title>
        }
        extra={
          <Space>
            <Button
              type="text"
              icon={<IconRefresh />}
              onClick={reset}
              disabled={isProcessing}
            >
              重置
            </Button>
            <Button
              type="text"
              icon={<IconHistory />}
              onClick={() => setHistoryDrawerVisible(true)}
            >
              历史记录
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              className="file-upload-area"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {!sourceImage ? (
                <div className="upload-placeholder">
                  <Upload
                    drag
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={handleFileUpload}
                  >
                    <div className="upload-content">
                      <div className="icon">
                        <IconUpload style={{ fontSize: 50 }} />
                      </div>
                      <Paragraph>点击或拖拽图片到此处</Paragraph>
                      <Paragraph type="secondary">
                        推荐上传高质量、简洁的图片，最好是正方形的PNG格式
                      </Paragraph>
                    </div>
                  </Upload>
                </div>
              ) : (
                <div className="image-preview-container">
                  <div className="image-preview">
                    <img src={imagePreview} alt="预览" />
                  </div>
                  <div className="image-info">
                    <Paragraph>
                      文件名: {sourceImage.name}
                    </Paragraph>
                    <Paragraph>
                      大小: {(sourceImage.size / 1024).toFixed(2)} KB
                    </Paragraph>
                    <Button
                      type="primary"
                      status="danger"
                      size="small"
                      icon={<IconDelete />}
                      onClick={reset}
                    >
                      移除
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="生成选项">
              {isProcessing ? (
                <div className="processing-indicator">
                  <Spin tip="处理中..." />
                </div>
              ) : (
                <>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Paragraph>选择图标尺寸（像素）：</Paragraph>
                    <CheckboxGroup
                      options={availableSizes.map(size => ({ 
                        label: `${size}x${size}`, 
                        value: size 
                      }))}
                      value={iconSizes}
                      onChange={handleSizeChange}
                    />
                    <Divider />
                    <Input
                      prefix={<IconFile />}
                      placeholder="图标名称"
                      value={iconName}
                      onChange={setIconName}
                      addAfter=".ico"
                    />
                    <Space>
                      <Button
                        type="primary"
                        disabled={!sourceImage || isProcessing}
                        onClick={previewIcons}
                      >
                        预览图标
                      </Button>
                      <Button 
                        type="primary"
                        disabled={!sourceImage || isProcessing || Object.keys(iconPreviews).length === 0}
                        onClick={handleGenerateIco}
                      >
                        生成ICO
                      </Button>
                    </Space>
                  </Space>
                </>
              )}
            </Card>
          </Col>
        </Row>

        {error && (
          <Row style={{ marginTop: 16 }}>
            <Col span={24}>
              <div className="error-message">
                {error}
              </div>
            </Col>
          </Row>
        )}

        {Object.keys(iconPreviews).length > 0 && (
          <Row style={{ marginTop: 16 }}>
            <Col span={24}>
              <Card title="图标预览">
                <div className="icon-preview-grid">
                  {Object.entries(iconPreviews).map(([size, url]) => (
                    <div key={size} className="icon-preview-item">
                      <img src={url} alt={`${size}x${size}`} />
                      <Paragraph className="icon-size-label">
                        {size}x{size}
                      </Paragraph>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {icoFile && (
          <Row style={{ marginTop: 16 }}>
            <Col span={24}>
              <Card title="生成结果">
                <div className="result-container">
                  <div className="ico-preview">
                    <img src={icoPreview} alt="ICO预览" />
                  </div>
                  <div className="ico-info">
                    <Paragraph>
                      文件名: {icoFile.name}
                    </Paragraph>
                    <Paragraph>
                      大小: {(icoFile.size / 1024).toFixed(2)} KB
                    </Paragraph>
                    <Space>
                      <Button
                        type="primary"
                        icon={<IconDownload />}
                        onClick={handleDownloadIco}
                      >
                        下载ICO文件
                      </Button>
                      <Button
                        type="primary"
                        status="warning"
                        icon={<IconPlus />}
                        onClick={handleExportWebPackage}
                      >
                        获取HTML代码
                      </Button>
                    </Space>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </Card>

      {/* 历史记录抽屉 */}
      <Drawer
        width={800}
        title="历史记录"
        visible={historyDrawerVisible}
        onCancel={() => setHistoryDrawerVisible(false)}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button
              status="danger"
              disabled={history.length === 0}
              onClick={clearHistory}
            >
              清空历史记录
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          data={history}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          noDataElement={<Empty description="暂无历史记录" />}
        />
      </Drawer>

      {/* HTML代码模态框 */}
      <Modal
        title="HTML代码"
        visible={htmlCodeVisible}
        onCancel={() => setHtmlCodeVisible(false)}
        footer={
          <Button type="primary" onClick={handleCopyHtml}>
            复制HTML代码
          </Button>
        }
      >
        <div className="html-code-container">
          <pre className="html-code">{htmlCode}</pre>
        </div>
        <div className="html-instructions">
          <Paragraph>
            <Text bold>使用说明：</Text>
          </Paragraph>
          <Paragraph type="secondary">
            1. 下载生成的ICO文件
          </Paragraph>
          <Paragraph type="secondary">
            2. 将上面的HTML代码添加到网站的&lt;head&gt;部分
          </Paragraph>
          <Paragraph type="secondary">
            3. 将ICO文件上传到网站根目录
          </Paragraph>
        </div>
      </Modal>
    </div>
  );
};

export default FaviconGenerator;
