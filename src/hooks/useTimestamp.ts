import { useState, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 扩展dayjs功能
dayjs.extend(utc);
dayjs.extend(timezone);

// 转换类型定义
export type TimestampType = '10位' | '13位';
export type ConversionDirection = 'timestamp-to-date' | 'date-to-timestamp';
export type TimezoneType = 'local' | 'utc+8';

// 历史记录项定义
export interface HistoryItem {
  id: string;
  timestamp: string;
  date: string;
  direction: ConversionDirection;
  createdAt: number;
}

/**
 * 时间戳转换工具Hook
 * @returns 时间戳转换相关状态和方法
 */
export const useTimestamp = () => {
  // 状态定义
  const [timestamp, setTimestamp] = useState<string>('');
  const [dateString, setDateString] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [direction, setDirection] = useState<ConversionDirection>('timestamp-to-date');
  const [timestampType, setTimestampType] = useState<TimestampType>('13位');
  const [timezone, setTimezone] = useState<TimezoneType>('local');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentTimestamp, setCurrentTimestamp] = useState<string>('');
  
  // 更新当前时间戳
  const updateCurrentTimestamp = useCallback(() => {
    const now = Date.now();
    setCurrentTimestamp(timestampType === '10位' 
      ? Math.floor(now / 1000).toString() 
      : now.toString());
  }, [timestampType]);
  
  // 初始化和定时器设置
  useEffect(() => {
    updateCurrentTimestamp();
    
    // 每秒更新当前时间戳
    const timer = setInterval(updateCurrentTimestamp, 1000);
    return () => clearInterval(timer);
  }, [updateCurrentTimestamp]);
  
  // 从 Chrome 存储加载历史记录
  useEffect(() => {
    if (chrome?.storage?.local) {
      chrome.storage.local.get(['timestampHistory'], (result) => {
        if (result.timestampHistory) {
          setHistory(JSON.parse(result.timestampHistory));
        }
      });
    }
  }, []);
  
  // 保存历史记录到 Chrome 存储
  const saveHistory = useCallback((newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    
    if (chrome?.storage?.local) {
      chrome.storage.local.set({ 
        timestampHistory: JSON.stringify(newHistory)
      });
    }
  }, []);
  
  // 添加新的历史记录
  const addToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'createdAt'>) => {
    // 创建新的历史记录项
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: Date.now()
    };
    
    // 保留最近5条记录
    const newHistory = [newItem, ...history].slice(0, 5);
    saveHistory(newHistory);
  }, [history, saveHistory]);
  
  // 清除历史记录
  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);
  
  // 复制到剪贴板
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  }, []);
  
  // 时间戳转日期字符串
  const timestampToDate = useCallback((ts: string): string => {
    if (!ts || !/^\d+$/.test(ts)) return '';
    
    let timestamp = parseInt(ts, 10);
    
    // 根据时间戳类型处理
    if (timestampType === '10位' && ts.length <= 10) {
      timestamp *= 1000; // 转换为毫秒
    }
    
    // 创建日期对象
    let date = dayjs(timestamp);
    
    // 应用时区
    if (timezone === 'utc+8') {
      date = date.tz('Asia/Shanghai');
    }
    
    return date.format('YYYY-MM-DD HH:mm:ss');
  }, [timestampType, timezone]);
  
  // 日期字符串转时间戳
  const dateToTimestamp = useCallback((dateStr: string): string => {
    if (!dateStr) return '';
    
    // 解析日期字符串
    let date = dayjs(dateStr);
    
    if (!date.isValid()) return '';
    
    // 应用时区
    if (timezone === 'utc+8') {
      date = dayjs.tz(dateStr, 'Asia/Shanghai');
    }
    
    // 根据时间戳类型输出
    const ms = date.valueOf();
    return timestampType === '10位' 
      ? Math.floor(ms / 1000).toString() 
      : ms.toString();
  }, [timestampType, timezone]);
  
  // 处理时间戳输入变化
  const handleTimestampChange = useCallback((value: string) => {
    setTimestamp(value);
    if (direction === 'timestamp-to-date') {
      const date = timestampToDate(value);
      setDateString(date);
      
      // 更新日期选择器
      if (date) {
        setSelectedDate(dayjs(date));
      }
      
      // 添加到历史记录
      if (value && date) {
        addToHistory({
          timestamp: value,
          date,
          direction: 'timestamp-to-date'
        });
      }
    }
  }, [direction, timestampToDate, addToHistory]);
  
  // 处理日期输入变化
  const handleDateChange = useCallback((date: dayjs.Dayjs | null, dateStr: string) => {
    setSelectedDate(date);
    setDateString(dateStr);
    
    if (direction === 'date-to-timestamp' && date) {
      const ts = dateToTimestamp(dateStr);
      setTimestamp(ts);
      
      // 添加到历史记录
      if (ts && dateStr) {
        addToHistory({
          timestamp: ts,
          date: dateStr,
          direction: 'date-to-timestamp'
        });
      }
    }
  }, [direction, dateToTimestamp, addToHistory]);
  
  // 处理方向变化
  const toggleDirection = useCallback(() => {
    setDirection(prev => 
      prev === 'timestamp-to-date' ? 'date-to-timestamp' : 'timestamp-to-date'
    );
    
    // 清空输入
    setTimestamp('');
    setDateString('');
    setSelectedDate(null);
  }, []);
  
  // 处理时区变化
  const toggleTimezone = useCallback(() => {
    setTimezone(prev => prev === 'local' ? 'utc+8' : 'local');
  }, []);
  
  // 处理时间戳类型变化
  const handleTimestampTypeChange = useCallback((type: TimestampType) => {
    setTimestampType(type);
    updateCurrentTimestamp();
    
    // 如果有已转换的结果，重新计算
    if (direction === 'timestamp-to-date' && timestamp) {
      handleTimestampChange(timestamp);
    } else if (direction === 'date-to-timestamp' && dateString) {
      const ts = dateToTimestamp(dateString);
      setTimestamp(ts);
    }
  }, [direction, timestamp, dateString, dateToTimestamp, handleTimestampChange, updateCurrentTimestamp]);
  
  return {
    // 状态
    timestamp,
    dateString,
    selectedDate,
    direction,
    timestampType,
    timezone,
    history,
    currentTimestamp,
    
    // 方法
    setTimestamp: handleTimestampChange,
    setDate: handleDateChange,
    toggleDirection,
    toggleTimezone,
    setTimestampType: handleTimestampTypeChange,
    updateCurrentTimestamp,
    copyToClipboard,
    clearHistory
  };
};
