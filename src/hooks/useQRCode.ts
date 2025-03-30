import { useState, useCallback, useRef } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';
import { Message } from '@arco-design/web-react';

// 定义二维码格式类型
export type QRContentType = 'text' | 'url' | 'email' | 'tel' | 'sms' | 'wifi' | 'vcard' | 'geo' | 'custom';

// 二维码选项接口
export interface QROptions {
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  scale: number;
  width: number;
  color: {
    dark: string;
    light: string;
  };
  logo?: {
    src: string;
    size: number;
    borderSize: number;
    borderRadius: number;
    bgColor: string;
  };
}

// WiFi选项接口
export interface WiFiOptions {
  ssid: string;
  password: string;
  encryption: 'WEP' | 'WPA' | 'none';
  hidden: boolean;
}

// vCard选项接口
export interface VCardOptions {
  name: string;
  company?: string;
  title?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  note?: string;
}

// 地理位置选项接口
export interface GeoOptions {
  latitude: number;
  longitude: number;
  altitude?: number;
}

// 历史记录项接口
export interface QRHistoryItem {
  id: string;
  content: string;
  type: QRContentType;
  timestamp: number;
  dataUrl?: string;
}

/**
 * 自定义Hook - 二维码生成与解析
 */
const useQRCode = () => {
  // 状态管理
  const [qrContent, setQrContent] = useState<string>('');
  const [qrContentType, setQrContentType] = useState<QRContentType>('text');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrHistory, setQrHistory] = useState<QRHistoryItem[]>([]);

  // 二维码选项
  const [qrOptions, setQrOptions] = useState<QROptions>({
    errorCorrectionLevel: 'M',
    margin: 4,
    scale: 4,
    width: 300,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });

  // 引用
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  /**
   * 格式化二维码内容
   */
  const formatQRContent = useCallback((
    content: string,
    type: QRContentType,
    options?: WiFiOptions | VCardOptions | GeoOptions
  ): string => {
    switch (type) {
      case 'url':
        // 检查URL是否有http前缀
        if (content && !content.match(/^https?:\/\//i)) {
          return `http://${content}`;
        }
        return content;
      
      case 'email':
        // 邮件格式
        return `mailto:${content}`;
      
      case 'tel':
        // 电话格式
        return `tel:${content}`;
      
      case 'sms':
        // 短信格式
        return `sms:${content}`;
      
      case 'wifi':
        // WiFi网络格式
        if (options && 'ssid' in options) {
          const wifi = options as WiFiOptions;
          return `WIFI:S:${wifi.ssid};T:${wifi.encryption};P:${wifi.password};H:${wifi.hidden ? 'true' : 'false'};;`;
        }
        return content;
      
      case 'vcard':
        // vCard格式
        if (options && 'name' in options) {
          const vcard = options as VCardOptions;
          let vcardStr = 'BEGIN:VCARD\nVERSION:3.0\n';
          vcardStr += `FN:${vcard.name}\n`;
          if (vcard.company) vcardStr += `ORG:${vcard.company}\n`;
          if (vcard.title) vcardStr += `TITLE:${vcard.title}\n`;
          if (vcard.phone) vcardStr += `TEL:${vcard.phone}\n`;
          if (vcard.email) vcardStr += `EMAIL:${vcard.email}\n`;
          if (vcard.address) vcardStr += `ADR:;;${vcard.address};;;\n`;
          if (vcard.website) vcardStr += `URL:${vcard.website}\n`;
          if (vcard.note) vcardStr += `NOTE:${vcard.note}\n`;
          vcardStr += 'END:VCARD';
          return vcardStr;
        }
        return content;
      
      case 'geo':
        // 地理位置格式
        if (options && 'latitude' in options) {
          const geo = options as GeoOptions;
          return `geo:${geo.latitude},${geo.longitude}${geo.altitude ? ',' + geo.altitude : ''}`;
        }
        return content;
      
      default:
        return content;
    }
  }, []);

  /**
   * 生成二维码
   */
  const generateQRCode = useCallback(async (
    content: string,
    type: QRContentType = 'text',
    options?: WiFiOptions | VCardOptions | GeoOptions
  ): Promise<string | null> => {
    try {
      // 检查输入内容
      if (!content.trim()) {
        setQrError('请输入内容');
        return null;
      }

      // 格式化内容
      const formattedContent = formatQRContent(content, type, options);
      setQrContent(formattedContent);
      setQrContentType(type);

      // 配置QR码选项
      const qrOpts: QRCode.QRCodeToDataURLOptions = {
        errorCorrectionLevel: qrOptions.errorCorrectionLevel,
        margin: qrOptions.margin,
        scale: qrOptions.scale,
        width: qrOptions.width,
        color: {
          dark: qrOptions.color.dark,
          light: qrOptions.color.light
        }
      };

      // 生成二维码
      const dataUrl = await QRCode.toDataURL(formattedContent, qrOpts);
      setQrDataUrl(dataUrl);

      // 添加到历史记录
      addToHistory(formattedContent, type, dataUrl);

      setQrError(null);
      return dataUrl;
    } catch (err: any) {
      const errorMessage = `生成二维码失败: ${err.message}`;
      setQrError(errorMessage);
      Message.error(errorMessage);
      return null;
    }
  }, [formatQRContent, qrOptions]);

  /**
   * 从图片解析二维码
   */
  const parseQRFromImage = useCallback(async (imageFile: File): Promise<string | null> => {
    try {
      // 读取图片文件
      const imageData = await readImageFile(imageFile);
      if (!imageData) {
        throw new Error('图片加载失败');
      }

      // 使用jsQR解析
      const code = jsQR(
        imageData.data,
        imageData.width,
        imageData.height
      );

      if (code && code.data) {
        setQrContent(code.data);
        // 自动检测内容类型
        const detectedType = detectQRContentType(code.data);
        setQrContentType(detectedType);
        setQrError(null);

        // 保存到历史记录
        const imageUrl = URL.createObjectURL(imageFile);
        addToHistory(code.data, detectedType, imageUrl);

        return code.data;
      } 
      
      // 如果jsQR失败，尝试使用ZXing
      try {
        if (!codeReaderRef.current) {
          const hints = new Map();
          hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
          codeReaderRef.current = new BrowserMultiFormatReader(hints);
        }

        const imageUrl = URL.createObjectURL(imageFile);
        const img = document.createElement('img');
        img.src = imageUrl;
        
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const result = await codeReaderRef.current.decodeFromImage(img);
        if (result && result.getText()) {
          const resultText = result.getText();
          setQrContent(resultText);
          const detectedType = detectQRContentType(resultText);
          setQrContentType(detectedType);
          setQrError(null);

          // 保存到历史记录
          addToHistory(resultText, detectedType, imageUrl);
          return resultText;
        }
      } catch (zxingErr) {
        // ZXing 也失败了
      }

      // 如果所有解码方法都失败
      throw new Error('无法识别图片中的二维码');
    } catch (err: any) {
      const errorMessage = `解析二维码失败: ${err.message}`;
      setQrError(errorMessage);
      Message.error(errorMessage);
      return null;
    }
  }, []);

  /**
   * 读取图片文件并获取像素数据
   */
  const readImageFile = useCallback(async (file: File): Promise<ImageData | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          resolve(imageData);
        } catch (e) {
          resolve(null);
        }
      };

      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  }, []);

  /**
   * 检测二维码内容类型
   */
  const detectQRContentType = useCallback((content: string): QRContentType => {
    // URL检测
    if (/^(https?:\/\/)/i.test(content)) {
      return 'url';
    }
    
    // 邮件检测
    if (/^mailto:/i.test(content)) {
      return 'email';
    }
    
    // 电话检测
    if (/^tel:/i.test(content)) {
      return 'tel';
    }
    
    // 短信检测
    if (/^sms:/i.test(content)) {
      return 'sms';
    }
    
    // WiFi检测
    if (/^WIFI:S:/i.test(content)) {
      return 'wifi';
    }
    
    // vCard检测
    if (/^BEGIN:VCARD/i.test(content)) {
      return 'vcard';
    }
    
    // 地理位置检测
    if (/^geo:/i.test(content)) {
      return 'geo';
    }
    
    // 默认为文本
    return 'text';
  }, []);

  /**
   * 添加到历史记录
   */
  const addToHistory = useCallback((content: string, type: QRContentType, dataUrl?: string) => {
    const historyItem: QRHistoryItem = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: Date.now(),
      dataUrl
    };
    
    setQrHistory(prev => [historyItem, ...prev.slice(0, 19)]);
  }, []);

  /**
   * 从历史记录加载
   */
  const loadFromHistory = useCallback((historyItem: QRHistoryItem) => {
    setQrContent(historyItem.content);
    setQrContentType(historyItem.type);
    setQrDataUrl(historyItem.dataUrl || '');
    
    // 尝试重新生成二维码
    if (!historyItem.dataUrl) {
      generateQRCode(historyItem.content, historyItem.type);
    }
    
    Message.success('已从历史记录加载');
  }, [generateQRCode]);

  /**
   * 清空历史记录
   */
  const clearHistory = useCallback(() => {
    setQrHistory([]);
    Message.success('历史记录已清空');
  }, []);

  /**
   * 更新二维码选项
   */
  const updateQROptions = useCallback((options: Partial<QROptions>) => {
    setQrOptions(prev => ({
      ...prev,
      ...options
    }));
    
    // 如果有内容，重新生成二维码
    if (qrContent) {
      generateQRCode(qrContent, qrContentType);
    }
  }, [qrContent, qrContentType, generateQRCode]);

  /**
   * 导出二维码为PNG图片
   */
  const exportQRAsPNG = useCallback((filename?: string) => {
    try {
      if (!qrDataUrl) {
        throw new Error('请先生成二维码');
      }
      
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = filename || `qrcode-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      Message.success('二维码已导出为PNG图片');
      return true;
    } catch (err: any) {
      setQrError(`导出二维码失败: ${err.message}`);
      Message.error('导出失败');
      return false;
    }
  }, [qrDataUrl]);

  /**
   * 导出二维码为SVG图片
   */
  const exportQRAsSVG = useCallback(async (filename?: string) => {
    try {
      if (!qrContent) {
        throw new Error('请先生成二维码');
      }
      
      // 配置QR码选项
      const qrOpts: QRCode.QRCodeToDataURLOptions = {
        errorCorrectionLevel: qrOptions.errorCorrectionLevel,
        margin: qrOptions.margin,
        scale: qrOptions.scale,
        width: qrOptions.width,
        color: {
          dark: qrOptions.color.dark,
          light: qrOptions.color.light
        }
      };
      
      // 生成SVG
      const svgString = await QRCode.toString(qrContent, {
        ...qrOpts,
        type: 'svg'
      });
      
      // 创建Blob并下载
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `qrcode-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      Message.success('二维码已导出为SVG图片');
      return true;
    } catch (err: any) {
      setQrError(`导出二维码失败: ${err.message}`);
      Message.error('导出失败');
      return false;
    }
  }, [qrContent, qrOptions]);

  /**
   * 解码自定义格式内容
   */
  const decodeQRContent = useCallback((content: string): { type: QRContentType, data: any } => {
    const type = detectQRContentType(content);
    
    switch (type) {
      case 'url':
        return { 
          type, 
          data: { url: content }
        };
      
      case 'email':
        const emailMatch = content.match(/^mailto:(.+)$/i);
        return { 
          type, 
          data: { email: emailMatch ? emailMatch[1] : content }
        };
      
      case 'tel':
        const telMatch = content.match(/^tel:(.+)$/i);
        return { 
          type, 
          data: { phone: telMatch ? telMatch[1] : content }
        };
      
      case 'sms':
        const smsMatch = content.match(/^sms:(.+)$/i);
        return { 
          type, 
          data: { phone: smsMatch ? smsMatch[1] : content }
        };
      
      case 'wifi':
        // 解析Wi-Fi QR码内容
        const ssidMatch = content.match(/S:([^;]+)/);
        const securityMatch = content.match(/T:([^;]+)/);
        const passwordMatch = content.match(/P:([^;]+)/);
        const hiddenMatch = content.match(/H:([^;]+)/);
        
        return {
          type,
          data: {
            ssid: ssidMatch ? ssidMatch[1] : '',
            encryption: securityMatch ? securityMatch[1] as 'WEP' | 'WPA' | 'none' : 'WPA',
            password: passwordMatch ? passwordMatch[1] : '',
            hidden: hiddenMatch ? hiddenMatch[1] === 'true' : false
          }
        };
      
      case 'vcard':
        // 解析vCard格式
        const nameMatch = content.match(/FN:([^\n]+)/);
        const orgMatch = content.match(/ORG:([^\n]+)/);
        const titleMatch = content.match(/TITLE:([^\n]+)/);
        const phoneVcardMatch = content.match(/TEL:([^\n]+)/);
        const emailVcardMatch = content.match(/EMAIL:([^\n]+)/);
        const addressMatch = content.match(/ADR:;;([^;][^\n]*)/);
        const urlMatch = content.match(/URL:([^\n]+)/);
        const noteMatch = content.match(/NOTE:([^\n]+)/);
        
        return {
          type,
          data: {
            name: nameMatch ? nameMatch[1] : '',
            company: orgMatch ? orgMatch[1] : '',
            title: titleMatch ? titleMatch[1] : '',
            phone: phoneVcardMatch ? phoneVcardMatch[1] : '',
            email: emailVcardMatch ? emailVcardMatch[1] : '',
            address: addressMatch ? addressMatch[1] : '',
            website: urlMatch ? urlMatch[1] : '',
            note: noteMatch ? noteMatch[1] : ''
          }
        };
      
      case 'geo':
        // 解析地理位置
        const geoMatch = content.match(/geo:([^,]+),([^,]+)(?:,([^,]+))?/);
        
        return {
          type,
          data: {
            latitude: geoMatch ? parseFloat(geoMatch[1]) : 0,
            longitude: geoMatch ? parseFloat(geoMatch[2]) : 0,
            altitude: geoMatch && geoMatch[3] ? parseFloat(geoMatch[3]) : undefined
          }
        };
      
      default:
        return { 
          type, 
          data: { text: content }
        };
    }
  }, [detectQRContentType]);

  // 返回所有功能
  return {
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
    detectQRContentType,
    decodeQRContent,
    loadFromHistory,
    clearHistory,
    updateQROptions,
    exportQRAsPNG,
    exportQRAsSVG,
    formatQRContent
  };
};

export default useQRCode;
