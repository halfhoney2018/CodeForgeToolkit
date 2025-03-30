import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Space,
  Input,
  Button,
  Typography,
  List,
  Tag,
  Divider,
  Form,
  Switch,
  Grid,
  Message,
  Badge,
  Tabs,
  InputNumber,
  Empty
} from '@arco-design/web-react';
import {
  IconDelete,
  IconCopy,
  IconSend,
  IconRefresh,
  IconPlus,
  IconClose,
  IconHistory,
  IconLink,
  IconClose as IconDisconnect
} from '@arco-design/web-react/icon';
import useWebSocketTester, { ConnectionStatus, MessageType } from '../../hooks/useWebSocketTester';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Row, Col } = Grid;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

/**
 * 格式化时间戳
 * @param timestamp 时间戳
 * @returns 格式化后的时间字符串
 */
const formatTime = (timestamp: number): string => {
  return dayjs(timestamp).format('HH:mm:ss');
};

/**
 * WebSocket 测试工具组件
 */
const WebSocketTester: React.FC = () => {
  // 从 hook 获取状态和方法
  const {
    url,
    message,
    status,
    messages,
    connectionHistory,
    autoScroll,
    headers,
    keepAlive,
    heartbeatMessage,
    heartbeatInterval,
    setUrl,
    setMessage,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
    clearConnectionHistory,
    selectFromHistory,
    setAutoScroll,
    addHeader,
    removeHeader,
    setKeepAlive,
    setHeartbeatMessage,
    setHeartbeatInterval
  } = useWebSocketTester();

  // 消息列表容器 ref
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // 当前标签页
  const [activeTab, setActiveTab] = useState<string>('connection');
  
  // 自定义请求头表单
  const [headerKey, setHeaderKey] = useState<string>('');
  const [headerValue, setHeaderValue] = useState<string>('');
  
  // 显示连接历史
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // 按键发送处理
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 添加自定义请求头
  const handleAddHeader = () => {
    if (headerKey && headerValue) {
      addHeader(headerKey, headerValue);
      setHeaderKey('');
      setHeaderValue('');
    } else {
      Message.error('请输入有效的请求头名称和值');
    }
  };

  // 获取连接状态标签
  const getStatusBadge = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return <Badge status="success" text="已连接" />;
      case ConnectionStatus.CONNECTING:
        return <Badge status="processing" text="连接中" />;
      case ConnectionStatus.ERROR:
        return <Badge status="error" text="连接错误" />;
      default:
        return <Badge status="default" text="未连接" />;
    }
  };

  // 获取消息类型标签
  const getMessageTag = (type: MessageType) => {
    switch (type) {
      case MessageType.SENT:
        return <Tag color="blue">发送</Tag>;
      case MessageType.RECEIVED:
        return <Tag color="green">接收</Tag>;
      case MessageType.SYSTEM:
        return <Tag color="gray">系统</Tag>;
      default:
        return null;
    }
  };

  // 自动滚动消息列表到底部
  useEffect(() => {
    if (autoScroll && messagesContainerRef.current && messages.length > 0) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, autoScroll]);

  return (
    <Card bordered={false} style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title heading={5}>WebSocket 测试工具</Title>
        
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          <TabPane key="connection" title="连接">
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* 连接表单 */}
              <Form layout="vertical">
                <Row gutter={8}>
                  <Col span={20}>
                    <FormItem 
                      label="服务器地址" 
                      extra="WebSocket URL (如: ws://example.com:8080/path)"
                    >
                      <Input
                        placeholder="ws://example.com:8080/path"
                        value={url}
                        onChange={setUrl}
                        disabled={status === ConnectionStatus.CONNECTED || status === ConnectionStatus.CONNECTING}
                        addAfter={
                          <Space>
                            {showHistory ? (
                              <Button
                                type="text"
                                icon={<IconClose />}
                                onClick={() => setShowHistory(false)}
                                size="mini"
                              />
                            ) : (
                              <Button
                                type="text"
                                icon={<IconHistory />}
                                onClick={() => setShowHistory(true)}
                                size="mini"
                                disabled={connectionHistory.length === 0}
                              />
                            )}
                          </Space>
                        }
                      />
                    </FormItem>
                    
                    {/* 连接历史下拉列表 */}
                    {showHistory && connectionHistory.length > 0 && (
                      <div 
                        style={{ 
                          border: '1px solid var(--color-border-2)',
                          borderRadius: '4px',
                          marginTop: '-16px',
                          marginBottom: '16px',
                          maxHeight: '150px',
                          overflowY: 'auto'
                        }}
                      >
                        <List
                          size="small"
                          dataSource={connectionHistory}
                          render={(item) => (
                            <List.Item
                              key={item.id}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                selectFromHistory(item.url);
                                setShowHistory(false);
                              }}
                              actions={[
                                <Button
                                  key="delete"
                                  type="text"
                                  size="mini"
                                  icon={<IconDelete />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    clearConnectionHistory();
                                  }}
                                />
                              ]}
                            >
                              <Text>{item.url}</Text>
                            </List.Item>
                          )}
                        />
                      </div>
                    )}
                  </Col>
                  <Col span={4}>
                    <FormItem label=" ">
                      {status === ConnectionStatus.CONNECTED || status === ConnectionStatus.CONNECTING ? (
                        <Button 
                          type="primary" 
                          status="danger"
                          icon={<IconDisconnect />}
                          style={{ width: '100%' }}
                          onClick={disconnect}
                        >
                          断开
                        </Button>
                      ) : (
                        <Button 
                          type="primary" 
                          icon={<IconLink />}
                          style={{ width: '100%' }}
                          onClick={connect}
                          disabled={!url}
                        >
                          连接
                        </Button>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                
                {/* 连接状态 */}
                <Row style={{ marginBottom: '16px' }}>
                  <Col span={12}>
                    <Space>
                      <Text>状态:</Text>
                      {getStatusBadge()}
                    </Space>
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Space>
                      <Button 
                        type="text" 
                        icon={<IconDelete />}
                        onClick={clearMessages}
                        disabled={messages.length === 0}
                      >
                        清空消息
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Form>
              
              {/* 心跳设置 */}
              <div style={{ 
                marginTop: 16, 
                border: '1px solid var(--color-border-2)', 
                borderRadius: 4
              }}>
                <div
                  onClick={() => setActiveTab(activeTab === 'advanced' ? 'connection' : 'advanced')}
                  style={{ 
                    width: '100%', 
                    textAlign: 'left', 
                    padding: '10px 16px',
                    borderBottom: activeTab === 'advanced' ? '1px solid var(--color-border-2)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Space>
                    <IconRefresh />
                    <Typography.Text>高级选项</Typography.Text>
                    {activeTab === 'advanced' ? '▲' : '▼'}
                  </Space>
                </div>
                
                {activeTab === 'advanced' && (
                  <div style={{ padding: '12px 16px' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <FormItem label="保持连接">
                        <Switch
                          checked={keepAlive}
                          onChange={setKeepAlive}
                        />
                      </FormItem>
                      
                      {keepAlive && (
                        <>
                          <FormItem label="心跳消息">
                            <Input
                              placeholder="心跳消息内容"
                              value={heartbeatMessage}
                              onChange={setHeartbeatMessage}
                            />
                          </FormItem>
                          
                          <FormItem label="心跳间隔 (秒)">
                            <InputNumber
                              min={1}
                              max={600}
                              value={heartbeatInterval}
                              onChange={value => setHeartbeatInterval(value as number)}
                              style={{ width: '100%' }}
                            />
                          </FormItem>
                        </>
                      )}
                      
                      <FormItem label="自动滚动到最新消息">
                        <Switch
                          checked={autoScroll}
                          onChange={setAutoScroll}
                        />
                      </FormItem>
                    </Space>
                  </div>
                )}
              </div>
            </Space>
          </TabPane>
          
          <TabPane key="headers" title="请求头">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form layout="vertical">
                <Row gutter={8}>
                  <Col span={10}>
                    <FormItem label="名称">
                      <Input
                        placeholder="请求头名称"
                        value={headerKey}
                        onChange={setHeaderKey}
                      />
                    </FormItem>
                  </Col>
                  <Col span={10}>
                    <FormItem label="值">
                      <Input
                        placeholder="请求头值"
                        value={headerValue}
                        onChange={setHeaderValue}
                      />
                    </FormItem>
                  </Col>
                  <Col span={4}>
                    <FormItem label=" ">
                      <Button
                        type="primary"
                        icon={<IconPlus />}
                        onClick={handleAddHeader}
                        style={{ width: '100%' }}
                      >
                        添加
                      </Button>
                    </FormItem>
                  </Col>
                </Row>
              </Form>
              
              <Divider style={{ margin: '8px 0' }} />
              
              {/* 请求头列表 */}
              {Object.keys(headers).length > 0 ? (
                <List
                  dataSource={Object.entries(headers)}
                  render={([key, value]) => (
                    <List.Item
                      key={key}
                      actions={[
                        <Button
                          key="delete"
                          type="text"
                          icon={<IconDelete />}
                          onClick={() => removeHeader(key)}
                        />
                      ]}
                    >
                      <Space>
                        <Text style={{ fontWeight: 'bold' }}>{key}:</Text>
                        <Text>{value}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无自定义请求头" />
              )}
            </Space>
          </TabPane>
        </Tabs>
        
        <Divider style={{ margin: '8px 0' }} />
        
        {/* 消息列表 */}
        <div
          ref={messagesContainerRef}
          style={{
            height: '300px',
            overflowY: 'auto',
            border: '1px solid var(--color-border-2)',
            borderRadius: '4px',
            padding: '8px',
            backgroundColor: 'var(--color-bg-2)'
          }}
        >
          {messages.length > 0 ? (
            <List
              dataSource={messages}
              render={(item) => (
                <List.Item
                  key={item.id}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: item.type === MessageType.SENT 
                      ? 'var(--color-bg-1)' 
                      : item.type === MessageType.RECEIVED
                        ? 'var(--color-bg-3)'
                        : 'transparent'
                  }}
                  actions={[
                    <Button
                      key="copy"
                      size="mini"
                      type="text"
                      icon={<IconCopy />}
                      onClick={() => {
                        navigator.clipboard.writeText(item.content).then(
                          () => Message.success('已复制到剪贴板'),
                          () => Message.error('复制失败')
                        );
                      }}
                    />
                  ]}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      {getMessageTag(item.type)}
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {formatTime(item.timestamp)}
                      </Text>
                    </Space>
                    <Paragraph
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        margin: 0,
                        fontSize: '14px'
                      }}
                    >
                      {item.content}
                    </Paragraph>
                  </Space>
                </List.Item>
              )}
            />
          ) : (
            <Empty description="暂无消息记录" />
          )}
        </div>
        
        {/* 消息发送 */}
        <Row gutter={8}>
          <Col span={20}>
            <Input.TextArea
              placeholder="输入要发送的消息，Ctrl+Enter 发送"
              value={message}
              onChange={setMessage}
              style={{ minHeight: '80px' }}
              disabled={status !== ConnectionStatus.CONNECTED}
              onKeyPress={handleKeyPress}
            />
          </Col>
          <Col span={4}>
            <Button
              type="primary"
              icon={<IconSend />}
              style={{ height: '80px', width: '100%' }}
              disabled={status !== ConnectionStatus.CONNECTED || !message}
              onClick={sendMessage}
            >
              发送
            </Button>
          </Col>
        </Row>
      </Space>
    </Card>
  );
};

export default WebSocketTester;
