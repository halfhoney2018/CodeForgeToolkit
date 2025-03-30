import { useState, useCallback } from 'react';
import { Message } from '@arco-design/web-react';

// 定义颜色格式
export interface RGB {
  r: number;  // 0-255
  g: number;  // 0-255
  b: number;  // 0-255
  a?: number; // 0-1
}

export interface HSL {
  h: number;  // 0-360
  s: number;  // 0-100
  l: number;  // 0-100
  a?: number; // 0-1
}

export interface CMYK {
  c: number;  // 0-100
  m: number;  // 0-100
  y: number;  // 0-100
  k: number;  // 0-100
}

export interface HSV {
  h: number;  // 0-360
  s: number;  // 0-100
  v: number;  // 0-100
  a?: number; // 0-1
}

export type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'cmyk' | 'hsv';

export interface ColorPalette {
  id: string;
  name: string;
  colors: ColorScheme[];
}

export interface ColorScheme {
  id: string;
  name: string;
  hex: string;
  rgb: RGB;
  hsl: HSL;
}

export interface ColorHistoryItem {
  id: string;
  hex: string;
  timestamp: number;
}

/**
 * 颜色工具自定义Hook
 */
const useColorTool = () => {
  // 状态
  const [currentColor, setCurrentColor] = useState<string>('#1890ff'); // 默认色值
  const [savedColors, setSavedColors] = useState<ColorScheme[]>([]);
  const [colorHistory, setColorHistory] = useState<ColorHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * 验证HEX色值
   */
  const isValidHex = useCallback((hex: string): boolean => {
    return /^#?([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(hex);
  }, []);
  
  /**
   * 格式化HEX色值
   */
  const formatHex = useCallback((hex: string): string => {
    // 移除#号前缀
    hex = hex.replace('#', '');
    
    // 将3位HEX扩展为6位
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    // 将4位HEX(带透明度)扩展为8位
    if (hex.length === 4) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    // 添加#前缀
    return '#' + hex;
  }, []);
  
  /**
   * HEX转RGB
   */
  const hexToRgb = useCallback((hex: string): RGB => {
    if (!isValidHex(hex)) {
      throw new Error('无效的HEX颜色值');
    }
    
    // 格式化HEX
    hex = formatHex(hex);
    
    // 移除#前缀
    hex = hex.replace('#', '');
    
    let r, g, b, a;
    
    if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      return { r, g, b };
    } else if (hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      a = parseInt(hex.substring(6, 8), 16) / 255;
      return { r, g, b, a };
    }
    
    throw new Error('无效的HEX颜色值');
  }, [isValidHex, formatHex]);
  
  /**
   * RGB转HEX
   */
  const rgbToHex = useCallback((rgb: RGB): string => {
    const { r, g, b, a } = rgb;
    
    // 验证RGB值范围
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      throw new Error('RGB值必须在0-255范围内');
    }
    
    if (a !== undefined && (a < 0 || a > 1)) {
      throw new Error('透明度值必须在0-1范围内');
    }
    
    // 转换为16进制
    const hexR = r.toString(16).padStart(2, '0');
    const hexG = g.toString(16).padStart(2, '0');
    const hexB = b.toString(16).padStart(2, '0');
    
    if (a !== undefined) {
      const hexA = Math.round(a * 255).toString(16).padStart(2, '0');
      return `#${hexR}${hexG}${hexB}${hexA}`;
    }
    
    return `#${hexR}${hexG}${hexB}`;
  }, []);
  
  /**
   * RGB转HSL
   */
  const rgbToHsl = useCallback((rgb: RGB): HSL => {
    let { r, g, b, a } = rgb;
    
    // 归一化RGB值到0-1
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;
    
    if (delta !== 0) {
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      
      switch (max) {
        case r:
          h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
          break;
        case g:
          h = ((b - r) / delta + 2) * 60;
          break;
        case b:
          h = ((r - g) / delta + 4) * 60;
          break;
      }
    }
    
    // 转换为HSL格式
    h = Math.round(h);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    if (a !== undefined) {
      return { h, s, l, a };
    }
    
    return { h, s, l };
  }, []);
  
  /**
   * HSL转RGB
   */
  const hslToRgb = useCallback((hsl: HSL): RGB => {
    const { h, s, l, a } = hsl;
    
    // 验证HSL值范围
    if (h < 0 || h > 360) {
      throw new Error('色相值必须在0-360范围内');
    }
    
    if (s < 0 || s > 100 || l < 0 || l > 100) {
      throw new Error('饱和度和亮度值必须在0-100范围内');
    }
    
    if (a !== undefined && (a < 0 || a > 1)) {
      throw new Error('透明度值必须在0-1范围内');
    }
    
    // 归一化s和l到0-1
    const normalizedS = s / 100;
    const normalizedL = l / 100;
    
    const c = (1 - Math.abs(2 * normalizedL - 1)) * normalizedS;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = normalizedL - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    // 转换回RGB格式
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    if (a !== undefined) {
      return { r, g, b, a };
    }
    
    return { r, g, b };
  }, []);
  
  /**
   * RGB转CMYK
   */
  const rgbToCmyk = useCallback((rgb: RGB): CMYK => {
    const { r, g, b } = rgb;
    
    // 归一化RGB值到0-1
    const normalizedR = r / 255;
    const normalizedG = g / 255;
    const normalizedB = b / 255;
    
    // 计算黑色分量
    const k = 1 - Math.max(normalizedR, normalizedG, normalizedB);
    
    // 特殊情况处理: 如果k为1(黑色)，则其他分量全为0
    if (k === 1) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }
    
    // 计算其他分量
    const c = (1 - normalizedR - k) / (1 - k) * 100;
    const m = (1 - normalizedG - k) / (1 - k) * 100;
    const y = (1 - normalizedB - k) / (1 - k) * 100;
    
    // 转换为0-100范围并取整
    return {
      c: Math.round(c),
      m: Math.round(m),
      y: Math.round(y),
      k: Math.round(k * 100)
    };
  }, []);
  
  /**
   * CMYK转RGB
   */
  const cmykToRgb = useCallback((cmyk: CMYK): RGB => {
    const { c, m, y, k } = cmyk;
    
    // 验证CMYK值范围
    if (c < 0 || c > 100 || m < 0 || m > 100 || y < 0 || y > 100 || k < 0 || k > 100) {
      throw new Error('CMYK值必须在0-100范围内');
    }
    
    // 归一化CMYK值到0-1
    const normalizedC = c / 100;
    const normalizedM = m / 100;
    const normalizedY = y / 100;
    const normalizedK = k / 100;
    
    // 计算RGB值
    const r = Math.round(255 * (1 - normalizedC) * (1 - normalizedK));
    const g = Math.round(255 * (1 - normalizedM) * (1 - normalizedK));
    const b = Math.round(255 * (1 - normalizedY) * (1 - normalizedK));
    
    return { r, g, b };
  }, []);
  
  /**
   * RGB转HSV
   */
  const rgbToHsv = useCallback((rgb: RGB): HSV => {
    const { r, g, b, a } = rgb;
    
    // 归一化RGB值到0-1
    const normalizedR = r / 255;
    const normalizedG = g / 255;
    const normalizedB = b / 255;
    
    const max = Math.max(normalizedR, normalizedG, normalizedB);
    const min = Math.min(normalizedR, normalizedG, normalizedB);
    const delta = max - min;
    
    let h = 0;
    let s = max === 0 ? 0 : delta / max;
    let v = max;
    
    if (delta !== 0) {
      switch (max) {
        case normalizedR:
          h = ((normalizedG - normalizedB) / delta + (normalizedG < normalizedB ? 6 : 0)) * 60;
          break;
        case normalizedG:
          h = ((normalizedB - normalizedR) / delta + 2) * 60;
          break;
        case normalizedB:
          h = ((normalizedR - normalizedG) / delta + 4) * 60;
          break;
      }
    }
    
    // 转换为HSV格式
    h = Math.round(h);
    s = Math.round(s * 100);
    v = Math.round(v * 100);
    
    if (a !== undefined) {
      return { h, s, v, a };
    }
    
    return { h, s, v };
  }, []);
  
  /**
   * HSV转RGB
   */
  const hsvToRgb = useCallback((hsv: HSV): RGB => {
    const { h, s, v, a } = hsv;
    
    // 验证HSV值范围
    if (h < 0 || h > 360) {
      throw new Error('色相值必须在0-360范围内');
    }
    
    if (s < 0 || s > 100 || v < 0 || v > 100) {
      throw new Error('饱和度和明度值必须在0-100范围内');
    }
    
    // 归一化s和v到0-1
    const normalizedS = s / 100;
    const normalizedV = v / 100;
    
    const c = normalizedV * normalizedS;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = normalizedV - c;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    // 转换回RGB格式
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    if (a !== undefined) {
      return { r, g, b, a };
    }
    
    return { r, g, b };
  }, []);
  
  /**
   * 解析CSS颜色字符串
   */
  const parseColorString = useCallback((colorStr: string): { format: ColorFormat, value: any } => {
    try {
      // 检查HEX格式
      if (colorStr.startsWith('#')) {
        if (isValidHex(colorStr)) {
          const hex = formatHex(colorStr);
          hexToRgb(hex); // 验证有效性
          return { format: 'hex', value: hex };
        }
        throw new Error('无效的HEX颜色值');
      }
      
      // 检查RGB/RGBA格式
      if (colorStr.startsWith('rgb')) {
        const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*(?:\.\d+)?))?\)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);
          const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : undefined;
          
          if (a !== undefined) {
            return { format: 'rgba', value: { r, g, b, a } };
          }
          return { format: 'rgb', value: { r, g, b } };
        }
        throw new Error('无效的RGB/RGBA颜色值');
      }
      
      // 检查HSL/HSLA格式
      if (colorStr.startsWith('hsl')) {
        const hslMatch = colorStr.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*(\d*(?:\.\d+)?))?\)/);
        if (hslMatch) {
          const h = parseInt(hslMatch[1]);
          const s = parseInt(hslMatch[2]);
          const l = parseInt(hslMatch[3]);
          const a = hslMatch[4] ? parseFloat(hslMatch[4]) : undefined;
          
          if (a !== undefined) {
            return { format: 'hsla', value: { h, s, l, a } };
          }
          return { format: 'hsl', value: { h, s, l } };
        }
        throw new Error('无效的HSL/HSLA颜色值');
      }
      
      throw new Error('不支持的颜色格式');
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(`解析颜色失败: ${err.message}`);
      } else {
        throw new Error('解析颜色失败');
      }
    }
  }, [isValidHex, formatHex, hexToRgb]);
  
  /**
   * 生成互补色
   */
  const getComplementaryColor = useCallback((hex: string): string => {
    try {
      // HEX转RGB
      const rgb = hexToRgb(hex);
      
      // RGB转HSL
      const hsl = rgbToHsl(rgb);
      
      // 计算互补色色相 (增加180度)
      hsl.h = (hsl.h + 180) % 360;
      
      // HSL转回RGB
      const complementaryRgb = hslToRgb(hsl);
      
      // RGB转回HEX
      return rgbToHex(complementaryRgb);
    } catch (err: any) {
      setError(`生成互补色失败: ${err.message}`);
      return hex;
    }
  }, [hexToRgb, rgbToHsl, hslToRgb, rgbToHex]);
  
  /**
   * 生成单色方案
   */
  const getMonochromaticColors = useCallback((hex: string, count: number = 5): string[] => {
    try {
      // HEX转RGB
      const rgb = hexToRgb(hex);
      
      // RGB转HSL
      const hsl = rgbToHsl(rgb);
      
      // 生成不同亮度的颜色
      const colors: string[] = [];
      const step = 100 / (count + 1);
      
      for (let i = 0; i < count; i++) {
        const newHsl = { ...hsl };
        newHsl.l = Math.max(0, Math.min(100, (i + 1) * step));
        const newRgb = hslToRgb(newHsl);
        colors.push(rgbToHex(newRgb));
      }
      
      return colors;
    } catch (err: any) {
      setError(`生成单色方案失败: ${err.message}`);
      return [hex];
    }
  }, [hexToRgb, rgbToHsl, hslToRgb, rgbToHex]);
  
  /**
   * 生成三色方案
   */
  const getTriadicColors = useCallback((hex: string): string[] => {
    try {
      // HEX转RGB
      const rgb = hexToRgb(hex);
      
      // RGB转HSL
      const hsl = rgbToHsl(rgb);
      
      // 计算三色方案(相隔120度)
      const colors = [hex];
      
      for (let i = 1; i <= 2; i++) {
        const newHsl = { ...hsl };
        newHsl.h = (hsl.h + i * 120) % 360;
        const newRgb = hslToRgb(newHsl);
        colors.push(rgbToHex(newRgb));
      }
      
      return colors;
    } catch (err: any) {
      setError(`生成三色方案失败: ${err.message}`);
      return [hex];
    }
  }, [hexToRgb, rgbToHsl, hslToRgb, rgbToHex]);
  
  /**
   * 生成类似色方案
   */
  const getAnalogousColors = useCallback((hex: string, count: number = 5, angle: number = 30): string[] => {
    try {
      // HEX转RGB
      const rgb = hexToRgb(hex);
      
      // RGB转HSL
      const hsl = rgbToHsl(rgb);
      
      // 生成类似色
      const colors: string[] = [hex];
      const halfCount = Math.floor(count / 2);
      
      for (let i = 1; i <= halfCount; i++) {
        // 顺时针旋转
        const clockwiseHsl = { ...hsl };
        clockwiseHsl.h = (hsl.h + i * angle) % 360;
        const clockwiseRgb = hslToRgb(clockwiseHsl);
        colors.push(rgbToHex(clockwiseRgb));
        
        // 逆时针旋转
        const counterClockwiseHsl = { ...hsl };
        counterClockwiseHsl.h = (hsl.h - i * angle + 360) % 360;
        const counterClockwiseRgb = hslToRgb(counterClockwiseHsl);
        colors.unshift(rgbToHex(counterClockwiseRgb));
      }
      
      // 如果需要奇数个颜色，移除第一个元素
      if (count % 2 === 0 && colors.length > count) {
        colors.shift();
      }
      
      return colors.slice(0, count);
    } catch (err: any) {
      setError(`生成类似色方案失败: ${err.message}`);
      return [hex];
    }
  }, [hexToRgb, rgbToHsl, hslToRgb, rgbToHex]);
  
  /**
   * 设置当前颜色
   */
  const setColor = useCallback((color: string) => {
    try {
      if (isValidHex(color)) {
        const formattedHex = formatHex(color);
        setCurrentColor(formattedHex);
        
        // 添加到历史记录
        const historyItem: ColorHistoryItem = {
          id: Date.now().toString(),
          hex: formattedHex,
          timestamp: Date.now()
        };
        
        setColorHistory(prev => [historyItem, ...prev.slice(0, 19)]);
        setError(null);
      } else {
        setError('无效的颜色值');
      }
    } catch (err: any) {
      setError(`设置颜色失败: ${err.message}`);
    }
  }, [isValidHex, formatHex]);
  
  /**
   * 保存当前颜色
   */
  const saveCurrentColor = useCallback((name: string = '') => {
    try {
      const rgb = hexToRgb(currentColor);
      const hsl = rgbToHsl(rgb);
      
      const colorName = name || `颜色 ${savedColors.length + 1}`;
      
      const newColor: ColorScheme = {
        id: Date.now().toString(),
        name: colorName,
        hex: currentColor,
        rgb,
        hsl
      };
      
      setSavedColors(prev => [...prev, newColor]);
      Message.success('颜色已保存');
    } catch (err: any) {
      setError(`保存颜色失败: ${err.message}`);
      Message.error('保存颜色失败');
    }
  }, [currentColor, savedColors, hexToRgb, rgbToHsl]);
  
  /**
   * 删除保存的颜色
   */
  const deleteSavedColor = useCallback((id: string) => {
    setSavedColors(prev => prev.filter(color => color.id !== id));
    Message.success('颜色已删除');
  }, []);
  
  /**
   * 清空历史记录
   */
  const clearHistory = useCallback(() => {
    setColorHistory([]);
    Message.success('历史记录已清空');
  }, []);
  
  /**
   * 导出颜色方案
   */
  const exportColorScheme = useCallback(() => {
    try {
      const schemeData = JSON.stringify(savedColors);
      const blob = new Blob([schemeData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `color-scheme-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      Message.success('颜色方案已导出');
    } catch (err: any) {
      setError(`导出颜色方案失败: ${err.message}`);
      Message.error('导出失败');
    }
  }, [savedColors]);
  
  /**
   * 导入颜色方案
   */
  const importColorScheme = useCallback((jsonData: string) => {
    try {
      const importedColors = JSON.parse(jsonData) as ColorScheme[];
      
      if (!Array.isArray(importedColors)) {
        throw new Error('无效的颜色方案数据');
      }
      
      setSavedColors(prev => [...prev, ...importedColors]);
      Message.success(`成功导入 ${importedColors.length} 个颜色`);
    } catch (err: any) {
      setError(`导入颜色方案失败: ${err.message}`);
      Message.error('导入失败');
    }
  }, []);
  
  return {
    currentColor,
    setColor,
    savedColors,
    colorHistory,
    error,
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    hslToRgb,
    rgbToCmyk,
    cmykToRgb,
    rgbToHsv,
    hsvToRgb,
    parseColorString,
    getComplementaryColor,
    getMonochromaticColors,
    getTriadicColors,
    getAnalogousColors,
    saveCurrentColor,
    deleteSavedColor,
    clearHistory,
    exportColorScheme,
    importColorScheme
  };
};

export default useColorTool;
