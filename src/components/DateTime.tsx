import React, { useState, useEffect } from 'react';
import { Typography, Space } from '@arco-design/web-react';
import { IconClockCircle } from '@arco-design/web-react/icon';
import dayjs from 'dayjs';

const { Text } = Typography;

/**
 * 日期时间显示组件
 * 实时展示当前日期和时间
 */
const DateTime: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(dayjs());

  // 使用useEffect设置定时器，每秒更新一次时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    // 清除定时器
    return () => clearInterval(timer);
  }, []);

  return (
    <Space className="datetime-display" style={{ fontSize: '14px' }}>
      <IconClockCircle />
      <Text>{currentTime.format('YYYY-MM-DD HH:mm:ss')}</Text>
    </Space>
  );
};

export default DateTime;
