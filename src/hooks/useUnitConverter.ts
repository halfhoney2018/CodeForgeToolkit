import { useState, useCallback } from 'react';
import { Message } from '@arco-design/web-react';
import { ColorFormat } from './useColorTool';

// 转换类型枚举
export enum ConversionType {
  CSS = 'css',
  COLOR = 'color',
  TIME = 'time',
  FILE_SIZE = 'fileSize'
}

// CSS单位类型
export type CSSUnitType = 'px' | 'rem' | 'em' | 'vw' | 'vh' | '%' | 'pt';

// 时间单位类型
export type TimeUnitType = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

// 文件大小单位类型
export type FileSizeUnitType = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB';

// 转换历史记录项
export interface ConversionHistoryItem {
  id: string;
  type: ConversionType;
  from: string;
  to: string;
  inputValue: number | string;
  outputValue: number | string;
  timestamp: number;
}

// CSS单位转换配置
export interface CSSConversionConfig {
  baseSize: number; // 基础字体大小，用于rem/em转换
  viewportWidth: number; // 视口宽度，用于vw转换
  viewportHeight: number; // 视口高度，用于vh转换
}

/**
 * 单位转换工具自定义Hook
 */
const useUnitConverter = () => {
  // 状态
  const [conversionType, setConversionType] = useState<ConversionType>(ConversionType.CSS);
  const [cssFromUnit, setCssFromUnit] = useState<CSSUnitType>('px');
  const [cssToUnit, setCssToUnit] = useState<CSSUnitType>('rem');
  const [cssValue, setCssValue] = useState<number>(16);
  const [cssResult, setCssResult] = useState<number>(1);
  const [cssConfig, setCssConfig] = useState<CSSConversionConfig>({
    baseSize: 16, // 默认基础字体大小为16px
    viewportWidth: 1920, // 默认视口宽度
    viewportHeight: 1080, // 默认视口高度
  });

  // 颜色转换状态
  const [colorFromFormat, setColorFromFormat] = useState<ColorFormat>('hex');
  const [colorToFormat, setColorToFormat] = useState<ColorFormat>('rgb');
  const [colorValue, setColorValue] = useState<string>('#336699');
  const [colorResult, setColorResult] = useState<string>('rgb(51, 102, 153)');

  // 时间转换状态
  const [timeFromUnit, setTimeFromUnit] = useState<TimeUnitType>('second');
  const [timeToUnit, setTimeToUnit] = useState<TimeUnitType>('minute');
  const [timeValue, setTimeValue] = useState<number>(60);
  const [timeResult, setTimeResult] = useState<number>(1);

  // 文件大小转换状态
  const [fileSizeFromUnit, setFileSizeFromUnit] = useState<FileSizeUnitType>('MB');
  const [fileSizeToUnit, setFileSizeToUnit] = useState<FileSizeUnitType>('GB');
  const [fileSizeValue, setFileSizeValue] = useState<number>(1024);
  const [fileSizeResult, setFileSizeResult] = useState<number>(1);

  // 历史记录
  const [conversionHistory, setConversionHistory] = useState<ConversionHistoryItem[]>([]);

  // === CSS单位转换 ===

  /**
   * 将任意CSS单位转换为像素
   */
  const toPx = useCallback((value: number, unit: CSSUnitType): number => {
    switch (unit) {
      case 'px':
        return value;
      case 'rem':
        return value * cssConfig.baseSize;
      case 'em':
        return value * cssConfig.baseSize;
      case 'vw':
        return (value / 100) * cssConfig.viewportWidth;
      case 'vh':
        return (value / 100) * cssConfig.viewportHeight;
      case '%':
        return (value / 100) * cssConfig.baseSize;
      case 'pt':
        return value * 1.333; // 1pt ≈ 1.333px
      default:
        return value;
    }
  }, [cssConfig]);

  /**
   * 从像素转换为目标CSS单位
   */
  const fromPx = useCallback((pxValue: number, toUnit: CSSUnitType): number => {
    switch (toUnit) {
      case 'px':
        return pxValue;
      case 'rem':
        return pxValue / cssConfig.baseSize;
      case 'em':
        return pxValue / cssConfig.baseSize;
      case 'vw':
        return (pxValue / cssConfig.viewportWidth) * 100;
      case 'vh':
        return (pxValue / cssConfig.viewportHeight) * 100;
      case '%':
        return (pxValue / cssConfig.baseSize) * 100;
      case 'pt':
        return pxValue / 1.333; // 1px ≈ 0.75pt
      default:
        return pxValue;
    }
  }, [cssConfig]);

  /**
   * 执行CSS单位转换
   */
  const convertCssUnits = useCallback((
    value: number,
    fromUnit: CSSUnitType,
    toUnit: CSSUnitType
  ): number => {
    // 先转换为像素
    const pxValue = toPx(value, fromUnit);
    // 再从像素转换为目标单位
    return fromPx(pxValue, toUnit);
  }, [toPx, fromPx]);

  /**
   * 更新CSS配置
   */
  const updateCssConfig = useCallback((config: Partial<CSSConversionConfig>) => {
    setCssConfig(prev => ({
      ...prev,
      ...config
    }));
  }, []);

  // === 时间单位转换 ===

  /**
   * 将时间单位转换为毫秒
   */
  const toMilliseconds = useCallback((value: number, unit: TimeUnitType): number => {
    switch (unit) {
      case 'millisecond':
        return value;
      case 'second':
        return value * 1000;
      case 'minute':
        return value * 60 * 1000;
      case 'hour':
        return value * 60 * 60 * 1000;
      case 'day':
        return value * 24 * 60 * 60 * 1000;
      case 'week':
        return value * 7 * 24 * 60 * 60 * 1000;
      case 'month':
        return value * 30 * 24 * 60 * 60 * 1000; // 假设一个月为30天
      case 'year':
        return value * 365 * 24 * 60 * 60 * 1000; // 假设一年为365天
      default:
        return value;
    }
  }, []);

  /**
   * 从毫秒转换为目标时间单位
   */
  const fromMilliseconds = useCallback((msValue: number, toUnit: TimeUnitType): number => {
    switch (toUnit) {
      case 'millisecond':
        return msValue;
      case 'second':
        return msValue / 1000;
      case 'minute':
        return msValue / (60 * 1000);
      case 'hour':
        return msValue / (60 * 60 * 1000);
      case 'day':
        return msValue / (24 * 60 * 60 * 1000);
      case 'week':
        return msValue / (7 * 24 * 60 * 60 * 1000);
      case 'month':
        return msValue / (30 * 24 * 60 * 60 * 1000); // 假设一个月为30天
      case 'year':
        return msValue / (365 * 24 * 60 * 60 * 1000); // 假设一年为365天
      default:
        return msValue;
    }
  }, []);

  /**
   * 执行时间单位转换
   */
  const convertTimeUnits = useCallback((
    value: number,
    fromUnit: TimeUnitType,
    toUnit: TimeUnitType
  ): number => {
    // 先转换为毫秒
    const msValue = toMilliseconds(value, fromUnit);
    // 再从毫秒转换为目标单位
    return fromMilliseconds(msValue, toUnit);
  }, [toMilliseconds, fromMilliseconds]);

  // === 文件大小单位转换 ===

  /**
   * 将文件大小单位转换为字节
   */
  const toBytes = useCallback((value: number, unit: FileSizeUnitType): number => {
    switch (unit) {
      case 'B':
        return value;
      case 'KB':
        return value * 1024;
      case 'MB':
        return value * 1024 * 1024;
      case 'GB':
        return value * 1024 * 1024 * 1024;
      case 'TB':
        return value * 1024 * 1024 * 1024 * 1024;
      case 'PB':
        return value * 1024 * 1024 * 1024 * 1024 * 1024;
      default:
        return value;
    }
  }, []);

  /**
   * 从字节转换为目标文件大小单位
   */
  const fromBytes = useCallback((byteValue: number, toUnit: FileSizeUnitType): number => {
    switch (toUnit) {
      case 'B':
        return byteValue;
      case 'KB':
        return byteValue / 1024;
      case 'MB':
        return byteValue / (1024 * 1024);
      case 'GB':
        return byteValue / (1024 * 1024 * 1024);
      case 'TB':
        return byteValue / (1024 * 1024 * 1024 * 1024);
      case 'PB':
        return byteValue / (1024 * 1024 * 1024 * 1024 * 1024);
      default:
        return byteValue;
    }
  }, []);

  /**
   * 执行文件大小单位转换
   */
  const convertFileSizeUnits = useCallback((
    value: number,
    fromUnit: FileSizeUnitType,
    toUnit: FileSizeUnitType
  ): number => {
    // 先转换为字节
    const byteValue = toBytes(value, fromUnit);
    // 再从字节转换为目标单位
    return fromBytes(byteValue, toUnit);
  }, [toBytes, fromBytes]);

  /**
   * 执行单位转换操作
   */
  const performConversion = useCallback(() => {
    try {
      switch (conversionType) {
        case ConversionType.CSS:
          const cssResultValue = convertCssUnits(cssValue, cssFromUnit, cssToUnit);
          setCssResult(cssResultValue);
          addToHistory(
            ConversionType.CSS,
            `${cssValue}${cssFromUnit}`,
            `${cssResultValue.toFixed(4)}${cssToUnit}`,
            cssValue,
            cssResultValue
          );
          break;
          
        case ConversionType.TIME:
          const timeResultValue = convertTimeUnits(timeValue, timeFromUnit, timeToUnit);
          setTimeResult(timeResultValue);
          addToHistory(
            ConversionType.TIME,
            `${timeValue} ${timeFromUnit}`,
            `${timeResultValue.toFixed(2)} ${timeToUnit}`,
            timeValue,
            timeResultValue
          );
          break;
          
        case ConversionType.FILE_SIZE:
          const fileSizeResultValue = convertFileSizeUnits(fileSizeValue, fileSizeFromUnit, fileSizeToUnit);
          setFileSizeResult(fileSizeResultValue);
          addToHistory(
            ConversionType.FILE_SIZE,
            `${fileSizeValue} ${fileSizeFromUnit}`,
            `${fileSizeResultValue.toFixed(2)} ${fileSizeToUnit}`,
            fileSizeValue,
            fileSizeResultValue
          );
          break;
          
        default:
          break;
      }
    } catch (error: any) {
      Message.error(`转换失败: ${error.message}`);
    }
  }, [
    conversionType,
    cssValue, cssFromUnit, cssToUnit, convertCssUnits,
    timeValue, timeFromUnit, timeToUnit, convertTimeUnits,
    fileSizeValue, fileSizeFromUnit, fileSizeToUnit, convertFileSizeUnits
  ]);

  /**
   * 添加到历史记录
   */
  const addToHistory = useCallback((
    type: ConversionType,
    from: string,
    to: string,
    inputValue: number | string,
    outputValue: number | string
  ) => {
    const historyItem: ConversionHistoryItem = {
      id: Date.now().toString(),
      type,
      from,
      to,
      inputValue,
      outputValue,
      timestamp: Date.now()
    };
    
    setConversionHistory(prev => [historyItem, ...prev.slice(0, 19)]);
  }, []);

  /**
   * 从历史记录加载
   */
  const loadFromHistory = useCallback((item: ConversionHistoryItem) => {
    setConversionType(item.type);
    
    switch (item.type) {
      case ConversionType.CSS:
        if (typeof item.inputValue === 'number') {
          setCssValue(item.inputValue);
        }
        performConversion();
        break;
        
      case ConversionType.TIME:
        if (typeof item.inputValue === 'number') {
          setTimeValue(item.inputValue);
        }
        performConversion();
        break;
        
      case ConversionType.FILE_SIZE:
        if (typeof item.inputValue === 'number') {
          setFileSizeValue(item.inputValue);
        }
        performConversion();
        break;
        
      default:
        break;
    }
    
    Message.success('已从历史记录加载');
  }, [performConversion]);

  /**
   * 清空历史记录
   */
  const clearHistory = useCallback(() => {
    setConversionHistory([]);
    Message.success('历史记录已清空');
  }, []);

  /**
   * 检查转换单位是否相同
   */
  const isSameUnit = useCallback((): boolean => {
    switch (conversionType) {
      case ConversionType.CSS:
        return cssFromUnit === cssToUnit;
      case ConversionType.TIME:
        return timeFromUnit === timeToUnit;
      case ConversionType.FILE_SIZE:
        return fileSizeFromUnit === fileSizeToUnit;
      default:
        return false;
    }
  }, [
    conversionType, 
    cssFromUnit, cssToUnit,
    timeFromUnit, timeToUnit,
    fileSizeFromUnit, fileSizeToUnit
  ]);

  // 返回所有功能
  return {
    // 通用
    conversionType,
    setConversionType,
    isSameUnit,
    performConversion,
    conversionHistory,
    loadFromHistory,
    clearHistory,
    
    // CSS单位转换
    cssFromUnit,
    setCssFromUnit,
    cssToUnit,
    setCssToUnit,
    cssValue,
    setCssValue,
    cssResult,
    cssConfig,
    updateCssConfig,
    convertCssUnits,
    
    // 颜色转换 (将集成到现有的颜色工具)
    colorFromFormat,
    setColorFromFormat,
    colorToFormat,
    setColorToFormat,
    colorValue,
    setColorValue,
    colorResult,
    setColorResult,
    
    // 时间单位转换
    timeFromUnit,
    setTimeFromUnit,
    timeToUnit,
    setTimeToUnit,
    timeValue,
    setTimeValue,
    timeResult,
    convertTimeUnits,
    
    // 文件大小单位转换
    fileSizeFromUnit,
    setFileSizeFromUnit,
    fileSizeToUnit,
    setFileSizeToUnit,
    fileSizeValue,
    setFileSizeValue,
    fileSizeResult,
    convertFileSizeUnits
  };
};

export default useUnitConverter;
