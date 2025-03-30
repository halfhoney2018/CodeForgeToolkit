import React, { useState, useRef, ChangeEvent } from 'react';
import {
  Card,
  Tabs,
  Grid,
  Space,
  Button,
  Input,
  Radio,
  Drawer,
  Message,
  Typography,
  List,
  Empty,
  Form,
  Switch,
  Select,
  Divider,
  Popover
} from '@arco-design/web-react';
import {
  IconQrcode,
  IconScan,
  IconUpload,
  IconDownload,
  IconDelete,
  IconHistory,
  IconSettings,
  IconCopy,
  IconRefresh,
  IconNav,
  IconCode,
  IconEmail,
  IconPhone,
  IconMessage,
  IconWifi,
  IconUser,
  IconLocation
} from '@arco-design/web-react/icon';
import { HexColorPicker } from 'react-colorful';
import useQRCode, { WiFiOptions, VCardOptions, GeoOptions } from '../../hooks/useQRCode';
import PageHeader from '../../components/PageHeader';
import SafeCopy from '../../components/SafeCopy';
import './QRCodeTool.css';

const { Row, Col } = Grid;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;

/**
 * 二维码生成工具组件
 */
const QRCodeTool: React.FC = () => {
  // 使用自定义Hook
  const {
    qrContent,
    setQrContent,
    qrContentType,
    setQrContentType,
    qrDataUrl,
    qrError,
    qrOptions,
    qrHistory,
    canvasRef,
    generateQRCode,
    parseQRFromImage,
    loadFromHistory,
    clearHistory,
    updateQROptions,
    exportQRAsPNG,
    exportQRAsSVG
  } = useQRCode();

  // 状态
  const [activeTab, setActiveTab] = useState<string>('generate');
  const [historyVisible, setHistoryVisible] = useState<boolean>(false);
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [foregroundColor, setForegroundColor] = useState<string>(qrOptions.color.dark);
  const [backgroundColor, setBackgroundColor] = useState<string>(qrOptions.color.light);

  // 各类型输入状态
  const [wifiOptions, setWifiOptions] = useState<WiFiOptions>({
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false
  });
  const [vcardOptions, setVcardOptions] = useState<VCardOptions>({
    name: '',
    company: '',
    title: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    note: ''
  });
  const [geoOptions, setGeoOptions] = useState<GeoOptions>({
    latitude: 0,
    longitude: 0
  });

  // 引用
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrImageRef = useRef<HTMLImageElement>(null);

  // 生成二维码
  const handleGenerateQRCode = () => {
    let content = qrContent;
    let options: WiFiOptions | VCardOptions | GeoOptions | undefined;

    switch (qrContentType) {
      case 'wifi':
        options = wifiOptions;
        break;
      case 'vcard':
        options = vcardOptions;
        break;
      case 'geo':
        options = geoOptions;
        break;
      default:
        break;
    }

    generateQRCode(content, qrContentType, options);
  };

  // 处理文件上传
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseQRFromImage(file);
    }
    // 重置input以允许选择相同文件
    if (e.target) {
      e.target.value = '';
    }
  };

  // 触发文件选择器
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 更新颜色
  const handleColorChange = (color: string, type: 'dark' | 'light') => {
    if (type === 'dark') {
      setForegroundColor(color);
    } else {
      setBackgroundColor(color);
    }
  };

  // 应用颜色设置
  const applyColorSettings = () => {
    updateQROptions({
      color: {
        dark: foregroundColor,
        light: backgroundColor
      }
    });
  };

  // 渲染颜色选择
  const renderColorPicker = (type: 'dark' | 'light') => {
    const color = type === 'dark' ? foregroundColor : backgroundColor;
    
    return (
      <Popover
        title={type === 'dark' ? '前景色' : '背景色'}
        content={
          <div className="color-picker-container">
            <HexColorPicker 
              color={color} 
              onChange={(value) => handleColorChange(value, type)} 
            />
            <div className="color-picker-footer">
              <Input 
                value={color} 
                onChange={(value) => handleColorChange(value, type)} 
                style={{ width: '100px', marginRight: '8px' }} 
              />
              <Button type="primary" size="small" onClick={applyColorSettings}>
                应用
              </Button>
            </div>
          </div>
        }
        trigger="click"
        position="top"
      >
        <div 
          className="color-preview" 
          style={{ 
            backgroundColor: color,
            border: '1px solid #d9d9d9',
            cursor: 'pointer'
          }}
        />
      </Popover>
    );
  };

  // 渲染不同内容类型的输入表单
  const renderContentTypeForm = () => {
    switch (qrContentType) {
      case 'url':
        return (
          <FormItem label="网址">
            <Input
              placeholder="请输入URL (http://example.com)"
              value={qrContent}
              onChange={setQrContent}
              prefix={<IconNav />}
            />
          </FormItem>
        );
      
      case 'email':
        return (
          <FormItem label="邮箱地址">
            <Input
              placeholder="请输入邮箱地址"
              value={qrContent}
              onChange={setQrContent}
              prefix={<IconEmail />}
            />
          </FormItem>
        );
      
      case 'tel':
        return (
          <FormItem label="电话号码">
            <Input
              placeholder="请输入电话号码"
              value={qrContent}
              onChange={setQrContent}
              prefix={<IconPhone />}
            />
          </FormItem>
        );
      
      case 'sms':
        return (
          <FormItem label="短信号码">
            <Input
              placeholder="请输入短信接收号码"
              value={qrContent}
              onChange={setQrContent}
              prefix={<IconMessage />}
            />
          </FormItem>
        );
      
      case 'wifi':
        return (
          <>
            <FormItem label="Wi-Fi名称 (SSID)">
              <Input
                placeholder="请输入Wi-Fi名称"
                value={wifiOptions.ssid}
                onChange={(value) => setWifiOptions({ ...wifiOptions, ssid: value })}
                prefix={<IconWifi />}
              />
            </FormItem>
            <FormItem label="密码">
              <Input.Password
                placeholder="请输入Wi-Fi密码"
                value={wifiOptions.password}
                onChange={(value) => setWifiOptions({ ...wifiOptions, password: value })}
              />
            </FormItem>
            <FormItem label="加密类型">
              <Select
                value={wifiOptions.encryption}
                onChange={(value) => setWifiOptions({ ...wifiOptions, encryption: value })}
              >
                <Option value="WPA">WPA/WPA2</Option>
                <Option value="WEP">WEP</Option>
                <Option value="none">无加密</Option>
              </Select>
            </FormItem>
            <FormItem>
              <div className="switch-item">
                <Text>隐藏网络</Text>
                <Switch
                  checked={wifiOptions.hidden}
                  onChange={(checked) => setWifiOptions({ ...wifiOptions, hidden: checked })}
                />
              </div>
            </FormItem>
          </>
        );
      
      case 'vcard':
        return (
          <>
            <FormItem label="姓名" required>
              <Input
                placeholder="请输入姓名"
                value={vcardOptions.name}
                onChange={(value) => setVcardOptions({ ...vcardOptions, name: value })}
                prefix={<IconUser />}
              />
            </FormItem>
            <Row gutter={16}>
              <Col span={12}>
                <FormItem label="公司">
                  <Input
                    placeholder="请输入公司名称"
                    value={vcardOptions.company}
                    onChange={(value) => setVcardOptions({ ...vcardOptions, company: value })}
                  />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="职位">
                  <Input
                    placeholder="请输入职位"
                    value={vcardOptions.title}
                    onChange={(value) => setVcardOptions({ ...vcardOptions, title: value })}
                  />
                </FormItem>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <FormItem label="电话">
                  <Input
                    placeholder="请输入电话号码"
                    value={vcardOptions.phone}
                    onChange={(value) => setVcardOptions({ ...vcardOptions, phone: value })}
                    prefix={<IconPhone />}
                  />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="邮箱">
                  <Input
                    placeholder="请输入邮箱地址"
                    value={vcardOptions.email}
                    onChange={(value) => setVcardOptions({ ...vcardOptions, email: value })}
                    prefix={<IconEmail />}
                  />
                </FormItem>
              </Col>
            </Row>
            <FormItem label="地址">
              <Input
                placeholder="请输入地址"
                value={vcardOptions.address}
                onChange={(value) => setVcardOptions({ ...vcardOptions, address: value })}
              />
            </FormItem>
            <FormItem label="网站">
              <Input
                placeholder="请输入网站地址"
                value={vcardOptions.website}
                onChange={(value) => setVcardOptions({ ...vcardOptions, website: value })}
                prefix={<IconNav />}
              />
            </FormItem>
            <FormItem label="备注">
              <Input.TextArea
                placeholder="请输入备注信息"
                value={vcardOptions.note}
                onChange={(value) => setVcardOptions({ ...vcardOptions, note: value })}
                rows={3}
              />
            </FormItem>
          </>
        );
      
      case 'geo':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <FormItem label="纬度" required>
                  <Input
                    placeholder="请输入纬度"
                    value={geoOptions.latitude.toString()}
                    onChange={(value) => setGeoOptions({ 
                      ...geoOptions, 
                      latitude: value ? parseFloat(value) : 0 
                    })}
                    prefix={<IconLocation />}
                  />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="经度" required>
                  <Input
                    placeholder="请输入经度"
                    value={geoOptions.longitude.toString()}
                    onChange={(value) => setGeoOptions({ 
                      ...geoOptions, 
                      longitude: value ? parseFloat(value) : 0 
                    })}
                    prefix={<IconLocation />}
                  />
                </FormItem>
              </Col>
            </Row>
          </>
        );
      
      case 'custom':
        return (
          <FormItem label="自定义内容">
            <Input.TextArea
              placeholder="请输入自定义内容"
              value={qrContent}
              onChange={setQrContent}
              rows={6}
            />
          </FormItem>
        );
      
      default:
        return (
          <FormItem label="文本内容">
            <Input.TextArea
              placeholder="请输入文本内容"
              value={qrContent}
              onChange={setQrContent}
              rows={4}
            />
          </FormItem>
        );
    }
  };

  // 渲染生成选项卡
  const renderGenerateTab = () => (
    <div className="qrcode-container">
      <Row gutter={24}>
        <Col span={14}>
          <Card className="qrcode-card">
            <div className="qrcode-type-selector">
              <Text className="form-label">内容类型：</Text>
              <RadioGroup
                value={qrContentType}
                onChange={setQrContentType}
                type="button"
              >
                <Radio value="text">文本</Radio>
                <Radio value="url">URL</Radio>
                <Radio value="email">邮件</Radio>
                <Radio value="tel">电话</Radio>
                <Radio value="sms">短信</Radio>
                <Radio value="wifi">Wi-Fi</Radio>
                <Radio value="vcard">名片</Radio>
                <Radio value="geo">位置</Radio>
                <Radio value="custom">自定义</Radio>
              </RadioGroup>
            </div>

            <Form layout="vertical" className="qrcode-form">
              {renderContentTypeForm()}
              
              <FormItem>
                <Space>
                  <Button
                    type="primary"
                    icon={<IconQrcode />}
                    onClick={handleGenerateQRCode}
                  >
                    生成二维码
                  </Button>
                  <Button
                    type="secondary"
                    icon={<IconSettings />}
                    onClick={() => setSettingsVisible(true)}
                  >
                    高级设置
                  </Button>
                  <Button
                    type="outline"
                    icon={<IconHistory />}
                    onClick={() => setHistoryVisible(true)}
                  >
                    历史记录
                  </Button>
                </Space>
              </FormItem>
            </Form>
          </Card>
        </Col>
        <Col span={10}>
          <Card className="qrcode-result-card">
            <div className="qrcode-result">
              {qrDataUrl ? (
                <>
                  <div className="qrcode-image-container">
                    <img
                      ref={qrImageRef}
                      src={qrDataUrl}
                      alt="二维码"
                      className="qrcode-image"
                    />
                  </div>
                  <div className="qrcode-actions">
                    <Space>
                      <SafeCopy
                        text={qrContent}
                        tip="内容已复制到剪贴板"
                      />
                      <Button
                        type="outline"
                        icon={<IconDownload />}
                        onClick={() => exportQRAsPNG()}
                      >
                        导出PNG
                      </Button>
                      <Button
                        type="outline"
                        icon={<IconCode />}
                        onClick={() => exportQRAsSVG()}
                      >
                        导出SVG
                      </Button>
                    </Space>
                  </div>
                </>
              ) : (
                <div className="qrcode-placeholder">
                  <IconQrcode style={{ fontSize: 48, color: '#e5e6eb' }} />
                  <Text type="secondary">生成的二维码将显示在这里</Text>
                </div>
              )}
              {qrError && (
                <div className="qrcode-error">
                  <Text type="error">{qrError}</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // 渲染扫描选项卡
  const renderScanTab = () => (
    <div className="qrcode-scan-container">
      <Card className="qrcode-upload-card">
        <div className="qrcode-upload-area">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileUpload}
          />
          <Button
            type="primary"
            size="large"
            icon={<IconUpload />}
            onClick={triggerFileInput}
          >
            选择图片
          </Button>
          <Text type="secondary" style={{ marginTop: 16 }}>
            选择包含二维码的图片进行解析
          </Text>
        </div>
        
        {qrContent && (
          <div className="qrcode-result-container">
            <Divider>解析结果</Divider>
            <div className="qrcode-scan-result">
              <Title heading={6}>类型: {qrContentType.toUpperCase()}</Title>
              <div className="qrcode-content-box">
                <pre>{qrContent}</pre>
              </div>
              <div className="qrcode-scan-actions">
                <Space>
                  <SafeCopy
                    text={qrContent}
                    tip="内容已复制到剪贴板"
                  />
                  {qrDataUrl && (
                    <Button
                      type="outline"
                      icon={<IconQrcode />}
                      onClick={() => setActiveTab('generate')}
                    >
                      转到生成器
                    </Button>
                  )}
                </Space>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  // 渲染设置抽屉
  const renderSettingsDrawer = () => (
    <Drawer
      width={400}
      title="二维码设置"
      visible={settingsVisible}
      onCancel={() => setSettingsVisible(false)}
      footer={null}
    >
      <Form layout="vertical">
        <FormItem label="容错级别">
          <Select
            value={qrOptions.errorCorrectionLevel}
            onChange={(value) => updateQROptions({ errorCorrectionLevel: value })}
          >
            <Option value="L">低 (7%)</Option>
            <Option value="M">中 (15%)</Option>
            <Option value="Q">高 (25%)</Option>
            <Option value="H">最高 (30%)</Option>
          </Select>
        </FormItem>
        
        <FormItem label="边距大小">
          <Select
            value={qrOptions.margin}
            onChange={(value) => updateQROptions({ margin: value })}
          >
            <Option value={0}>无边距</Option>
            <Option value={1}>1 单位</Option>
            <Option value={2}>2 单位</Option>
            <Option value={4}>4 单位 (标准)</Option>
            <Option value={8}>8 单位</Option>
          </Select>
        </FormItem>
        
        <FormItem label="缩放大小">
          <Select
            value={qrOptions.scale}
            onChange={(value) => updateQROptions({ scale: value })}
          >
            <Option value={2}>2 倍</Option>
            <Option value={4}>4 倍</Option>
            <Option value={6}>6 倍</Option>
            <Option value={8}>8 倍</Option>
            <Option value={10}>10 倍</Option>
          </Select>
        </FormItem>
        
        <FormItem label="颜色设置">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className="color-setting-item">
              <Text>前景色</Text>
              {renderColorPicker('dark')}
            </div>
            <div className="color-setting-item">
              <Text>背景色</Text>
              {renderColorPicker('light')}
            </div>
          </Space>
        </FormItem>

        <FormItem>
          <Button 
            type="primary"
            onClick={() => {
              setSettingsVisible(false);
              if (qrContent) {
                handleGenerateQRCode();
              }
            }}
          >
            应用设置
          </Button>
        </FormItem>
      </Form>
    </Drawer>
  );

  // 渲染历史记录抽屉
  const renderHistoryDrawer = () => (
    <Drawer
      width={400}
      title="历史记录"
      visible={historyVisible}
      onCancel={() => setHistoryVisible(false)}
      footer={null}
    >
      {qrHistory.length > 0 ? (
        <>
          <Button
            type="primary"
            status="danger"
            icon={<IconDelete />}
            onClick={clearHistory}
            style={{ marginBottom: 16 }}
          >
            清空历史
          </Button>
          <List className="qrcode-history-list">
            {qrHistory.map(item => (
              <List.Item
                key={item.id}
                actions={[
                  <Button
                    type="text"
                    icon={<IconCopy />}
                    onClick={() => {
                      navigator.clipboard.writeText(item.content);
                      Message.success('已复制内容');
                    }}
                  />,
                  <Button
                    type="text"
                    icon={<IconRefresh />}
                    onClick={() => {
                      loadFromHistory(item);
                      setHistoryVisible(false);
                    }}
                  />
                ]}
              >
                <div className="qrcode-history-item">
                  {item.dataUrl && (
                    <div className="qrcode-history-image">
                      <img src={item.dataUrl} alt="二维码" width={40} height={40} />
                    </div>
                  )}
                  <div className="qrcode-history-info">
                    <div className="qrcode-history-content">
                      <Text type="secondary">{item.type.toUpperCase()}</Text>
                      <Text ellipsis>{item.content}</Text>
                    </div>
                    <Text type="secondary">
                      {new Date(item.timestamp).toLocaleString()}
                    </Text>
                  </div>
                </div>
              </List.Item>
            ))}
          </List>
        </>
      ) : (
        <Empty description="暂无历史记录" />
      )}
    </Drawer>
  );

  return (
    <div className="module-container">
      <PageHeader title="二维码工具" />
      
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        type="card"
        style={{ marginTop: 16 }}
      >
        <TabPane key="generate" title={
          <span>
            <IconQrcode style={{ marginRight: 6 }}/>
            生成二维码
          </span>
        }>
          {renderGenerateTab()}
        </TabPane>
        <TabPane key="scan" title={
          <span>
            <IconScan style={{ marginRight: 6 }}/>
            扫描二维码
          </span>
        }>
          {renderScanTab()}
        </TabPane>
      </Tabs>

      {renderSettingsDrawer()}
      {renderHistoryDrawer()}
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default QRCodeTool;
