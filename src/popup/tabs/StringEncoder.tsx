import React from 'react';
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
  Tabs
} from '@arco-design/web-react';
import { 
  IconSwap, 
  IconDelete, 
  IconRefresh,
  IconSend
} from '@arco-design/web-react/icon';
import useStringEncoder, { EncodingType, EncodingHistory } from '../../hooks/useStringEncoder';
import SafeCopy from '../../components/SafeCopy';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const TabPane = Tabs.TabPane;

/**
 * 字符串编码/解码工具组件
 * @returns 字符串编码/解码UI组件
 */
const StringEncoder: React.FC = () => {
  // 使用字符串编码/解码Hook
  const {
    inputText,
    outputText,
    selectedMethod,
    history,
    error,
    encodingMethods,
    setInputText,
    setSelectedMethod,
    processText,
    clearHistory,
    clearAll,
    swapInputOutput,
    getCurrentMethod
  } = useStringEncoder();
  
  // 处理输入变化
  const handleInputChange = (value: string) => {
    setInputText(value);
  };
  
  // 处理编码方法变化
  const handleMethodChange = (value: EncodingType) => {
    setSelectedMethod(value);
  };
  
  // 处理编码/解码
  const handleProcess = () => {
    processText();
  };
  
  // 获取历史记录项的方法名称
  const getMethodLabel = (methodId: EncodingType): string => {
    const method = encodingMethods.find(m => m.id === methodId);
    return method ? method.label : methodId;
  };
  
  // 格式化历史记录时间
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };
  
  // 对编码方法进行分组
  const encodeMethods = encodingMethods.filter(m => m.category === 'encode-decode');
  const hashMethods = encodingMethods.filter(m => m.category === 'hash');
  
  // 支持按 Enter 键直接处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleProcess();
    }
  };
  
  return (
    <div className="module-container">
      <Title heading={4}>字符串编码工具</Title>
      
      <Tabs defaultActiveTab="encoder">
        <TabPane 
          key="encoder" 
          title={
            <span>
              <IconSend /> 编码/解码
            </span>
          }
        >
          <Card style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* 编码方法选择 */}
              <div>
                <Text style={{ display: 'block', marginBottom: 8 }}>选择编码/解码方法:</Text>
                <Select
                  style={{ width: '100%' }}
                  value={selectedMethod}
                  onChange={handleMethodChange}
                  showSearch
                >
                  <Select.OptGroup label="编码/解码">
                    {encodeMethods.map(method => (
                      <Select.Option key={method.id} value={method.id}>
                        {method.label}
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                  <Select.OptGroup label="哈希函数">
                    {hashMethods.map(method => (
                      <Select.Option key={method.id} value={method.id}>
                        {method.label}
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                </Select>
                <Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
                  {getCurrentMethod().description}
                </Text>
              </div>
              
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
                    {outputText && (
                      <Button
                        type="text"
                        size="mini"
                        onClick={swapInputOutput}
                        icon={<IconSwap />}
                      >
                        使用输出作为输入
                      </Button>
                    )}
                  </Space>
                </div>
                <TextArea
                  placeholder="输入要处理的文本..."
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
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Space>
                  <Tooltip content="执行编码/解码处理">
                    <Button 
                      type="primary" 
                      icon={<IconSend />} 
                      onClick={handleProcess}
                    >
                      执行
                    </Button>
                  </Tooltip>
                </Space>
              </div>
              
              {/* 输出区域 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>输出:</Text>
                  {outputText && (
                    <SafeCopy text={outputText} tip="复制结果" />
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
            </Space>
          </Card>
        </TabPane>
        
        <TabPane 
          key="history" 
          title={
            <span>
              <IconRefresh /> 历史记录
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
                render={(item: EncodingHistory) => (
                  <List.Item
                    key={item.id}
                    style={{ padding: '8px 0' }}
                    extra={
                      <Space>
                        <Tag color="arcoblue">
                          {getMethodLabel(item.method)}
                        </Tag>
                        <SafeCopy text={item.outputText} tip="复制结果" />
                      </Space>
                    }
                    actions={[
                      <Text type="secondary" key="time">
                        {formatTime(item.timestamp)}
                      </Text>
                    ]}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Paragraph
                        ellipsis={{ rows: 1 }}
                        style={{ maxWidth: 200, marginBottom: 4 }}
                      >
                        <Text bold>输入:</Text> {item.inputText}
                      </Paragraph>
                      <Paragraph
                        ellipsis={{ rows: 1 }}
                        style={{ maxWidth: 350 }}
                      >
                        <Text bold>输出:</Text> 
                        <Text code style={{ fontFamily: 'monospace' }}>
                          {item.outputText}
                        </Text>
                      </Paragraph>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <Text type="secondary">还没有编码/解码记录</Text>
              </div>
            )}
          </Card>
        </TabPane>
      </Tabs>
      
      <Divider>
        <Text type="secondary" style={{ fontSize: 12 }}>
          支持多种编码/解码和哈希算法
        </Text>
      </Divider>
    </div>
  );
};

export default StringEncoder;
