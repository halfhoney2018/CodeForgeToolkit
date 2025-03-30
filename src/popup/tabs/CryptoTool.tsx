import React, { useState } from 'react';
import { 
  Card, 
  Space, 
  Input, 
  Button, 
  Typography, 
  List, 
  Tag, 
  Divider,
  Tooltip,
  Select,
  Alert,
  Tabs,
  Radio,
  Switch,
  Form,
  Grid,
  Message
} from '@arco-design/web-react';
import { 
  IconDelete, 
  IconRefresh,
  IconLock,
  IconUnlock,
  IconInfo,
  IconCopy,
  IconSettings,
  IconHistory
} from '@arco-design/web-react/icon';
import useCryptoTool, { 
  EncryptionAlgorithm, 
  OperationMode, 
  CryptoHistoryItem
} from '../../hooks/useCryptoTool';
import SafeCopy from '../../components/SafeCopy';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Row, Col } = Grid;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

/**
 * 加密解密工具组件
 * @returns 加密解密工具UI组件
 */
const CryptoTool: React.FC = () => {
  // 使用加密解密工具Hook
  const {
    inputText,
    outputText,
    algorithm,
    mode,
    key,
    iv,
    autoGenerateKey,
    autoGenerateIv,
    cipherMode,
    paddingMode,
    outputFormat,
    history,
    error,
    algorithmInfo,
    
    setInputText,
    setAlgorithm,
    setMode,
    setKey,
    setIv,
    setAutoGenerateKey,
    setAutoGenerateIv,
    setCipherMode,
    setPaddingMode,
    setOutputFormat,
    
    processCrypto,
    clearHistory,
    clearAll,
    copyToClipboard,
    resetConfig,
    getCurrentAlgorithmInfo,
    loadFromHistory,
    generateRandomKey,
    generateRandomIv
  } = useCryptoTool();
  
  // 当前标签页
  const [activeTab, setActiveTab] = useState<string>('crypto');
  
  // 高级选项显示状态
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  
  // 处理输入变化
  const handleInputChange = (value: string) => {
    setInputText(value);
  };
  
  // 处理算法变化
  const handleAlgorithmChange = (value: EncryptionAlgorithm) => {
    setAlgorithm(value);
  };
  
  // 处理模式变化
  const handleModeChange = (value: OperationMode) => {
    setMode(value);
  };
  
  // 处理密钥变化
  const handleKeyChange = (value: string) => {
    setKey(value);
  };
  
  // 处理IV变化
  const handleIvChange = (value: string) => {
    setIv(value);
  };
  
  // 处理自动生成密钥开关
  const handleAutoKeyChange = (checked: boolean) => {
    setAutoGenerateKey(checked);
    if (checked) {
      // 自动生成新密钥
      const newKey = generateRandomKey(getCurrentAlgorithmInfo().defaultKeySize);
      setKey(newKey);
    }
  };
  
  // 处理自动生成IV开关
  const handleAutoIvChange = (checked: boolean) => {
    setAutoGenerateIv(checked);
    if (checked) {
      // 自动生成新IV
      const newIv = generateRandomIv();
      setIv(newIv);
    }
  };
  
  // 获取当前算法信息
  const currentAlgoInfo = getCurrentAlgorithmInfo();
  
  // 算法是否需要IV
  const needsIv = currentAlgoInfo.needsIV && cipherMode !== 'ECB';
  
  // 处理加密/解密操作
  const handleProcess = () => {
    processCrypto();
  };
  
  // 处理复制结果
  const handleCopy = async (text: string) => {
    if (!text) {
      Message.warning('没有可复制的内容');
      return;
    }
    
    const success = await copyToClipboard(text);
    if (success) {
      Message.success('复制成功');
    } else {
      Message.error('复制失败，请手动选择并复制');
    }
  };
  
  // 获取模式图标
  const getModeIcon = (opMode: OperationMode) => {
    return opMode === 'encrypt' ? <IconLock /> : <IconUnlock />;
  };
  
  // 格式化历史记录时间
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };
  
  // 获取算法描述
  const getAlgorithmDescription = (algo: EncryptionAlgorithm): string => {
    return algorithmInfo[algo].name;
  };
  
  // 算法选项
  const algorithmOptions = Object.keys(algorithmInfo).map(algo => ({
    label: algorithmInfo[algo as EncryptionAlgorithm].name,
    value: algo
  }));
  
  // 处理从历史记录加载配置
  const handleLoadFromHistory = (item: CryptoHistoryItem) => {
    loadFromHistory(item);
    setActiveTab('crypto');
    Message.success('已加载配置');
  };
  
  // 生成新密钥
  const handleGenerateNewKey = () => {
    const newKey = generateRandomKey(currentAlgoInfo.defaultKeySize);
    setKey(newKey);
    Message.success('已生成新密钥');
  };
  
  // 生成新IV
  const handleGenerateNewIv = () => {
    const newIv = generateRandomIv();
    setIv(newIv);
    Message.success('已生成新IV');
  };
  
  // 支持按 Enter 键直接处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleProcess();
    }
  };
  
  return (
    <div className="module-container">
      <Title heading={4}>加密解密工具</Title>
      
      <Tabs 
        activeTab={activeTab} 
        onChange={setActiveTab}
      >
        <TabPane 
          key="crypto" 
          title={
            <span>
              <IconLock /> 加密/解密
            </span>
          }
        >
          <Card style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* 操作模式选择 */}
              <div className="crypto-mode-selector">
                <RadioGroup
                  type="button"
                  value={mode}
                  onChange={handleModeChange}
                  style={{ marginBottom: 16 }}
                >
                  <Radio value="encrypt">
                    <IconLock /> 加密
                  </Radio>
                  <Radio value="decrypt">
                    <IconUnlock /> 解密
                  </Radio>
                </RadioGroup>
              </div>
              
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  {/* 基本配置 */}
                  <Card
                    title={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <IconSettings style={{ marginRight: 8 }} /> 基本配置
                      </div>
                    }
                    bordered={false}
                    style={{ marginBottom: 16 }}
                  >
                    <Form layout="vertical">
                      <FormItem label="加密算法">
                        <Select
                          placeholder="选择加密算法"
                          value={algorithm}
                          onChange={handleAlgorithmChange}
                          style={{ width: '100%' }}
                        >
                          {algorithmOptions.map(option => (
                            <Select.Option key={option.value} value={option.value}>
                              {option.label}
                            </Select.Option>
                          ))}
                        </Select>
                        <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                          {currentAlgoInfo.description}
                        </Text>
                      </FormItem>
                      
                      <FormItem label={
                        <Space>
                          <span>密钥</span>
                          <Tooltip content="密钥用于加密和解密，必须保持一致">
                            <IconInfo style={{ cursor: 'pointer', color: 'var(--color-text-3)' }} />
                          </Tooltip>
                          <Switch
                            size="small"
                            checked={autoGenerateKey}
                            onChange={handleAutoKeyChange}
                            style={{ marginLeft: 8 }}
                          />
                          <Text type="secondary">自动生成</Text>
                        </Space>
                      }>
                        <Input.Password
                          placeholder="输入加密密钥"
                          value={key}
                          onChange={handleKeyChange}
                          disabled={autoGenerateKey}
                          addAfter={
                            <Button
                              type="text"
                              icon={<IconRefresh />}
                              onClick={handleGenerateNewKey}
                              size="mini"
                            />
                          }
                        />
                      </FormItem>
                      
                      {needsIv && (
                        <FormItem label={
                          <Space>
                            <span>初始化向量 (IV)</span>
                            <Tooltip content="IV用于增加加密的随机性，对于同一密钥不同IV会产生不同密文">
                              <IconInfo style={{ cursor: 'pointer', color: 'var(--color-text-3)' }} />
                            </Tooltip>
                            <Switch
                              size="small"
                              checked={autoGenerateIv}
                              onChange={handleAutoIvChange}
                              style={{ marginLeft: 8 }}
                            />
                            <Text type="secondary">自动生成</Text>
                          </Space>
                        }>
                          <Input.Password
                            placeholder="输入初始化向量"
                            value={iv}
                            onChange={handleIvChange}
                            disabled={autoGenerateIv}
                            addAfter={
                              <Button
                                type="text"
                                icon={<IconRefresh />}
                                onClick={handleGenerateNewIv}
                                size="mini"
                              />
                            }
                          />
                        </FormItem>
                      )}
                      
                      {/* 高级选项按钮和面板 */}
                      <div style={{ 
                        marginTop: 16, 
                        border: '1px solid var(--color-border-2)', 
                        borderRadius: 4
                      }}>
                        <Button
                          type="text"
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          style={{ 
                            width: '100%', 
                            textAlign: 'left', 
                            padding: '10px 16px',
                            borderBottom: showAdvanced ? '1px solid var(--color-border-2)' : 'none'
                          }}
                        >
                          <Space>
                            <IconSettings />
                            <Typography.Text>高级选项</Typography.Text>
                            {showAdvanced ? '▲' : '▼'}
                          </Space>
                        </Button>
                        
                        {showAdvanced && (
                          <div style={{ padding: '12px 16px' }}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <FormItem label="加密模式">
                                <Select
                                  placeholder="选择加密模式"
                                  value={cipherMode}
                                  onChange={value => setCipherMode(value)}
                                  style={{ width: '100%' }}
                                >
                                  <Select.Option value="CBC">CBC (密码块链接)</Select.Option>
                                  <Select.Option value="CFB">CFB (密码反馈)</Select.Option>
                                  <Select.Option value="OFB">OFB (输出反馈)</Select.Option>
                                  <Select.Option value="CTR">CTR (计数器)</Select.Option>
                                  <Select.Option value="ECB">ECB (电子密码本) - 不推荐</Select.Option>
                                </Select>
                              </FormItem>
                              
                              <FormItem label="填充方式">
                                <Select
                                  placeholder="选择填充方式"
                                  value={paddingMode}
                                  onChange={value => setPaddingMode(value)}
                                  style={{ width: '100%' }}
                                >
                                  <Select.Option value="Pkcs7">PKCS#7 (推荐)</Select.Option>
                                  <Select.Option value="AnsiX923">ANSI X.923</Select.Option>
                                  <Select.Option value="Iso10126">ISO 10126</Select.Option>
                                  <Select.Option value="Iso97971">ISO/IEC 9797-1</Select.Option>
                                  <Select.Option value="ZeroPadding">零填充</Select.Option>
                                  <Select.Option value="NoPadding">无填充</Select.Option>
                                </Select>
                              </FormItem>
                              
                              <FormItem label="输出格式">
                                <Select
                                  placeholder="选择输出格式"
                                  value={outputFormat}
                                  onChange={value => setOutputFormat(value)}
                                  style={{ width: '100%' }}
                                >
                                  <Select.Option value="Base64">Base64 (推荐)</Select.Option>
                                  <Select.Option value="Hex">十六进制</Select.Option>
                                </Select>
                              </FormItem>
                            </Space>
                          </div>
                        )}
                      </div>
                    </Form>
                  </Card>
                </Col>
                
                <Col span={12}>
                  {/* 输入区域 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>输入:</Text>
                      <Space>
                        <Button 
                          type="text" 
                          size="mini" 
                          onClick={clearAll}
                          icon={<IconDelete />}
                        >
                          清空
                        </Button>
                      </Space>
                    </div>
                    <TextArea
                      placeholder={mode === 'encrypt' ? "输入要加密的文本..." : "输入要解密的文本..."}
                      value={inputText}
                      onChange={handleInputChange}
                      style={{ minHeight: 120 }}
                      onKeyDown={handleKeyDown}
                      allowClear
                    />
                    <Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
                      提示: 按 Ctrl+Enter 快速执行
                    </Text>
                  </div>
                  
                  {/* 操作按钮区域 */}
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                    <Space>
                      <Tooltip content={mode === 'encrypt' ? '执行加密' : '执行解密'}>
                        <Button 
                          type="primary" 
                          icon={getModeIcon(mode)} 
                          onClick={handleProcess}
                          status={mode === 'encrypt' ? 'success' : 'warning'}
                        >
                          {mode === 'encrypt' ? '加密' : '解密'}
                        </Button>
                      </Tooltip>
                      
                      <Button 
                        type="secondary" 
                        onClick={resetConfig}
                      >
                        重置配置
                      </Button>
                    </Space>
                  </div>
                  
                  {/* 输出区域 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>输出:</Text>
                      {outputText && (
                        <Button
                          type="text"
                          size="mini"
                          icon={<IconCopy />}
                          onClick={() => handleCopy(outputText)}
                        >
                          复制结果
                        </Button>
                      )}
                    </div>
                    
                    {error ? (
                      <Alert
                        type="error"
                        content={error}
                        style={{ marginBottom: 16 }}
                        closable
                      />
                    ) : (
                      outputText ? (
                        <div 
                          style={{ 
                            padding: '8px 12px', 
                            border: '1px solid var(--color-border-2)', 
                            borderRadius: 4,
                            minHeight: 120,
                            maxHeight: 200,
                            overflowY: 'auto',
                            backgroundColor: 'var(--color-fill-2)',
                            wordBreak: 'break-all',
                            fontFamily: 'monospace'
                          }}
                        >
                          {outputText}
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: '8px 12px',
                            border: '1px dashed var(--color-border-2)',
                            borderRadius: 4,
                            minHeight: 120,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Text type="secondary">结果将显示在这里</Text>
                        </div>
                      )
                    )}
                  </div>
                </Col>
              </Row>
            </Space>
          </Card>
        </TabPane>
        
        <TabPane 
          key="history" 
          title={
            <span>
              <IconHistory /> 历史记录
            </span>
          }
        >
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>历史记录</span>
                {history.length > 0 && (
                  <Button 
                    type="text" 
                    status="danger" 
                    icon={<IconDelete />} 
                    onClick={clearHistory}
                    size="mini"
                  >
                    清空
                  </Button>
                )}
              </div>
            }
            style={{ marginBottom: 16 }}
          >
            {history.length > 0 ? (
              <List
                dataSource={history}
                render={(item: CryptoHistoryItem) => (
                  <List.Item
                    key={item.id}
                    style={{ padding: '12px 0' }}
                    extra={
                      <Space>
                        <Tag color={item.mode === 'encrypt' ? 'green' : 'orange'}>
                          {item.mode === 'encrypt' ? '加密' : '解密'}
                        </Tag>
                        <Tag color="arcoblue">
                          {getAlgorithmDescription(item.algorithm)}
                        </Tag>
                        <Space size={0}>
                          <Button
                            type="text"
                            size="mini"
                            icon={<IconRefresh />}
                            onClick={() => handleLoadFromHistory(item)}
                          />
                          <SafeCopy text={item.outputText} tip="复制结果" />
                        </Space>
                      </Space>
                    }
                    actions={[
                      <Text type="secondary" key="time">
                        {formatTime(item.timestamp)}
                      </Text>
                    ]}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Paragraph
                          ellipsis={{ rows: 1 }}
                          style={{ marginBottom: 4 }}
                        >
                          <Text bold>输入:</Text> {item.inputText}
                        </Paragraph>
                        <Paragraph
                          ellipsis={{ rows: 1 }}
                        >
                          <Text bold>输出:</Text> 
                          <Text code style={{ fontFamily: 'monospace' }}>
                            {item.outputText}
                          </Text>
                        </Paragraph>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            密钥: {item.key.substring(0, 8)}... | 
                            {item.iv ? ` IV: ${item.iv.substring(0, 8)}... |` : ''} 
                            模式: {item.cipherMode}
                          </Text>
                        </div>
                      </Space>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <Text type="secondary">还没有加密/解密记录</Text>
              </div>
            )}
          </Card>
        </TabPane>
      </Tabs>
      
      <Divider>
        <Text type="secondary" style={{ fontSize: 12 }}>
          支持多种加密算法和模式，加密内容仅在本地处理
        </Text>
      </Divider>
    </div>
  );
};

export default CryptoTool;
