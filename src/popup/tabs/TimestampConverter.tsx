import React, { useState } from 'react';
import { 
  Card, 
  Space, 
  Input, 
  Button, 
  Radio, 
  Typography, 
  DatePicker, 
  List, 
  Tag, 
  Badge, 
  Message,
  Divider
} from '@arco-design/web-react';
import { 
  IconSwap, 
  IconCopy, 
  IconDelete, 
  IconRefresh, 
  IconClockCircle 
} from '@arco-design/web-react/icon';
import dayjs, { Dayjs } from 'dayjs';
import { 
  useTimestamp, 
  ConversionDirection, 
  HistoryItem 
} from '../../hooks/useTimestamp';
import SafeCopy from '../../components/SafeCopy';

const { Title, Text } = Typography;
const RadioGroup = Radio.Group;

/**
 * 时间戳转换组件
 * @returns 时间戳转换UI组件
 */
const TimestampConverter: React.FC = () => {
  // 使用时间戳转换hook
  const {
    timestamp,
    dateString,
    selectedDate,
    direction,
    timestampType,
    timezone,
    history,
    currentTimestamp,
    setTimestamp,
    setDate,
    toggleDirection,
    toggleTimezone,
    setTimestampType,
    updateCurrentTimestamp,
    copyToClipboard,
    clearHistory
  } = useTimestamp();
  
  // 悬浮状态控制
  const [hovering, setHovering] = useState(false);
  
  // 获取方向显示文本
  const getDirectionText = (dir: ConversionDirection): string => {
    return dir === 'timestamp-to-date' ? '时间戳→日期' : '日期→时间戳';
  };
  
  // 获取当前方向显示文本
  const directionText = getDirectionText(direction);
  
  // 处理复制成功
  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      Message.success('复制成功');
    } else {
      Message.error('复制失败，请手动选择并复制');
    }
  };
  
  // 格式化历史项显示
  const formatHistoryItem = (item: HistoryItem): string => {
    return `${item.timestamp} ⟷ ${item.date}`;
  };
  
  // DatePicker的onChange事件处理
  const handleDatePickerChange = (dateString: string, date: Dayjs) => {
    // 这里反转参数顺序，以符合我们自定义Hook的期望
    setDate(date, dateString);
  };
  
  return (
    <div className="module-container">
      <Title heading={4}>时间戳转换</Title>
      
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space>
              <Text>转换方向: {directionText}</Text>
              <Button 
                type="secondary" 
                icon={<IconSwap />} 
                onClick={toggleDirection}
                size="small"
              >
                切换
              </Button>
            </Space>
            <Space>
              <Text>时区: </Text>
              <Tag 
                color="arcoblue" 
                icon={<IconClockCircle />}
                style={{ cursor: 'pointer' }}
                onClick={toggleTimezone}
              >
                {timezone === 'local' ? '本地时区' : 'UTC+8'}
              </Tag>
            </Space>
          </div>
        }
        style={{ marginBottom: 20 }}
      >
        {/* 时间戳类型选择 */}
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <RadioGroup
            type="button"
            name="timestampType"
            value={timestampType}
            onChange={setTimestampType}
          >
            <Radio value="13位">13位时间戳 (毫秒)</Radio>
            <Radio value="10位">10位时间戳 (秒)</Radio>
          </RadioGroup>
        </Space>
        
        {/* 当前时间戳显示 */}
        <div 
          style={{ 
            marginBottom: 16, 
            display: 'flex', 
            alignItems: 'center', 
            padding: '8px 12px', 
            backgroundColor: 'var(--color-fill-2)', 
            borderRadius: 4 
          }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <Badge count={<IconClockCircle style={{ color: '#168cff' }} />} dot>
            <Text bold>当前时间戳:</Text>
          </Badge>
          <Text 
            style={{ 
              marginLeft: 12, 
              flex: 1, 
              fontFamily: 'monospace',
              fontSize: 16
            }}
            copyable={false}
          >
            {currentTimestamp}
          </Text>
          {hovering && (
            <Space>
              <Button 
                type="text" 
                icon={<IconRefresh />} 
                onClick={updateCurrentTimestamp}
                size="small"
              />
              <Button 
                type="text" 
                icon={<IconCopy />} 
                onClick={() => handleCopy(currentTimestamp)}
                size="small"
              />
            </Space>
          )}
        </div>
        
        {/* 转换区域 */}
        <div style={{ marginBottom: 16 }}>
          {direction === 'timestamp-to-date' ? (
            <>
              <Text style={{ display: 'block', marginBottom: 8 }}>时间戳:</Text>
              <Space style={{ width: '100%' }}>
                <Input
                  placeholder="请输入时间戳"
                  value={timestamp}
                  onChange={setTimestamp}
                  style={{ flex: 1 }}
                  allowClear
                />
                <Button 
                  type="primary" 
                  onClick={() => setTimestamp(currentTimestamp)}
                >
                  使用当前时间戳
                </Button>
              </Space>
              
              <div style={{ marginTop: 16 }}>
                <Text style={{ display: 'block', marginBottom: 8 }}>转换结果 (日期):</Text>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Input
                    value={dateString}
                    readOnly
                    style={{ flex: 1 }}
                  />
                  {dateString && (
                    <SafeCopy text={dateString} tip="复制日期" className="copy-button" />
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <Text style={{ display: 'block', marginBottom: 8 }}>日期:</Text>
              <DatePicker
                showTime
                style={{ width: '100%', marginBottom: 16 }}
                format="YYYY-MM-DD HH:mm:ss"
                value={selectedDate as any}
                onChange={handleDatePickerChange}
                allowClear
                placeholder="选择或输入日期时间"
              />
              
              <div>
                <Text style={{ display: 'block', marginBottom: 8 }}>转换结果 (时间戳):</Text>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Input
                    value={timestamp}
                    readOnly
                    style={{ flex: 1 }}
                  />
                  {timestamp && (
                    <SafeCopy text={timestamp} tip="复制时间戳" className="copy-button" />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
      
      {/* 历史记录 */}
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
      >
        {history.length > 0 ? (
          <List
            dataSource={history}
            render={(item) => (
              <List.Item
                key={item.id}
                style={{ padding: '8px 0' }}
                extra={
                  <Space>
                    <Tag color={item.direction === 'timestamp-to-date' ? 'green' : 'orange'}>
                      {getDirectionText(item.direction)}
                    </Tag>
                    <SafeCopy text={formatHistoryItem(item)} tip="复制转换记录" />
                  </Space>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Space style={{ marginBottom: 4 }}>
                    <Text bold>时间戳:</Text>
                    <Text code style={{ fontFamily: 'monospace' }}>{item.timestamp}</Text>
                  </Space>
                  <Space>
                    <Text bold>日期:</Text>
                    <Text code>{item.date}</Text>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                    {dayjs(item.createdAt).format('MM-DD HH:mm:ss')}
                  </Text>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <Text type="secondary">还没有转换记录</Text>
          </div>
        )}
      </Card>
      
      <Divider>
        <Text type="secondary" style={{ fontSize: 12 }}>
          支持10位(秒)和13位(毫秒)时间戳互转
        </Text>
      </Divider>
    </div>
  );
};

export default TimestampConverter;
