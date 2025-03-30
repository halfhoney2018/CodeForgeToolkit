import { useState, useCallback } from 'react';
import { Message } from '@arco-design/web-react';

export interface ConversionHistory {
  id: string;
  type: 'toBase64' | 'fromBase64';
  filename?: string;
  timestamp: number;
  base64String?: string;
  fileSize?: number;
  mimeType?: string;
}

/**
 * 图片与Base64互转自定义钩子
 */
const useImageConverter = () => {
  // 状态定义
  const [base64String, setBase64String] = useState<string>('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [conversionHistory, setConversionHistory] = useState<ConversionHistory[]>([]);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * 图片转Base64
   */
  const convertImageToBase64 = useCallback((file: File) => {
    setIsConverting(true);
    setError(null);
    
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const result = reader.result as string;
        // 移除 data:image/xxx;base64, 前缀，只保留纯base64字符串
        const base64 = result.split(',')[1];
        const mimeType = result.split(',')[0].split(':')[1].split(';')[0];
        
        setBase64String(base64);
        setImagePreviewUrl(result);
        setSelectedFile(file);
        
        // 添加到历史记录
        const historyItem: ConversionHistory = {
          id: Date.now().toString(),
          type: 'toBase64',
          filename: file.name,
          timestamp: Date.now(),
          base64String: base64,
          fileSize: file.size,
          mimeType: mimeType
        };
        
        setConversionHistory(prev => [historyItem, ...prev.slice(0, 9)]);
        Message.success('图片已成功转换为Base64');
      } catch (err) {
        setError('转换图片时出错，请确保文件是有效的图片');
        Message.error('转换失败，请确保文件是有效的图片');
        console.error('转换图片出错:', err);
      } finally {
        setIsConverting(false);
      }
    };
    
    reader.onerror = () => {
      setError('读取文件时出错');
      setIsConverting(false);
      Message.error('读取文件失败');
    };
    
    reader.readAsDataURL(file);
  }, []);
  
  /**
   * Base64转图片
   */
  const convertBase64ToImage = useCallback((base64Input: string) => {
    setIsConverting(true);
    setError(null);
    
    try {
      // 检查是否已经包含 data:image 前缀
      let dataUrl = base64Input;
      if (!base64Input.startsWith('data:')) {
        // 默认假设为PNG图片
        dataUrl = `data:image/png;base64,${base64Input}`;
      }
      
      // 尝试创建一个图片元素来验证base64字符串是否有效
      const img = new Image();
      img.onload = () => {
        setImagePreviewUrl(dataUrl);
        setBase64String(base64Input.startsWith('data:') ? base64Input.split(',')[1] : base64Input);
        
        // 添加到历史记录
        const historyItem: ConversionHistory = {
          id: Date.now().toString(),
          type: 'fromBase64',
          timestamp: Date.now(),
          base64String: base64Input,
          mimeType: dataUrl.split(':')[1]?.split(';')[0]
        };
        
        setConversionHistory(prev => [historyItem, ...prev.slice(0, 9)]);
        setIsConverting(false);
        Message.success('Base64已成功转换为图片');
      };
      
      img.onerror = () => {
        setError('无效的Base64图片字符串');
        setIsConverting(false);
        Message.error('转换失败，请确保Base64编码有效');
      };
      
      img.src = dataUrl;
    } catch (err) {
      setError('转换Base64时出错');
      setIsConverting(false);
      Message.error('转换失败，请检查输入的Base64字符串');
      console.error('转换Base64出错:', err);
    }
  }, []);
  
  /**
   * 下载图片
   */
  const downloadImage = useCallback(() => {
    if (!imagePreviewUrl) {
      Message.warning('没有可下载的图片');
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = imagePreviewUrl;
      link.download = selectedFile?.name || `image_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      Message.success('图片下载已开始');
    } catch (err) {
      Message.error('下载图片失败');
      console.error('下载图片出错:', err);
    }
  }, [imagePreviewUrl, selectedFile]);
  
  /**
   * 从历史记录加载
   */
  const loadFromHistory = useCallback((item: ConversionHistory) => {
    if (item.type === 'toBase64' && item.base64String) {
      setBase64String(item.base64String);
      setImagePreviewUrl(`data:${item.mimeType};base64,${item.base64String}`);
    } else if (item.type === 'fromBase64' && item.base64String) {
      convertBase64ToImage(item.base64String);
    }
  }, [convertBase64ToImage]);
  
  /**
   * 清除当前图片和Base64
   */
  const clearCurrent = useCallback(() => {
    setBase64String('');
    setImagePreviewUrl('');
    setSelectedFile(null);
    setError(null);
  }, []);
  
  /**
   * 清空历史记录
   */
  const clearHistory = useCallback(() => {
    setConversionHistory([]);
    Message.success('历史记录已清空');
  }, []);
  
  return {
    base64String,
    imagePreviewUrl,
    selectedFile,
    conversionHistory,
    isConverting,
    error,
    convertImageToBase64,
    convertBase64ToImage,
    downloadImage,
    loadFromHistory,
    clearCurrent,
    clearHistory
  };
};

export default useImageConverter;
