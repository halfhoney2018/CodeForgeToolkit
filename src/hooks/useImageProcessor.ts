import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';

// 图片格式类型
export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'svg+xml' | 'gif';

// 文件扩展名映射
const formatToExtension: Record<ImageFormat, string> = {
  'png': 'png',
  'jpeg': 'jpg',
  'webp': 'webp',
  'svg+xml': 'svg',
  'gif': 'gif'
};

// 图片处理历史记录项
export interface ImageHistoryItem {
  id: string;
  originalFile?: File;
  processedFile?: File;
  originalSize: number;
  processedSize: number;
  operation: string;
  timestamp: number;
  name?: string;
  format?: ImageFormat;
  actions?: {
    type: string;
    params: any;
  }[];
}

// 裁剪区域
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 调整大小选项
export interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
}

// 压缩选项
export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
}

/**
 * 图片处理Hook
 */
const useImageProcessor = () => {
  // 状态
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [processedImageFile, setProcessedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [processedImagePreview, setProcessedImagePreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<ImageFormat>('png');

  // 图片处理的临时canvas引用
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  /**
   * 加载图片文件
   */
  const loadImage = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);
      setError(null);
      setImageFile(file);
      
      // 创建预览
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      
      // 获取图片尺寸
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({
          width: img.width,
          height: img.height
        });
      };
      img.src = preview;
      
      setProcessedImageFile(null);
      setProcessedImagePreview('');
      setCropArea(null);
      setIsProcessing(false);
    } catch (err) {
      setError('加载图片时出错：' + (err instanceof Error ? err.message : String(err)));
      setIsProcessing(false);
    }
  }, []);
  
  /**
   * 转换图片格式
   */
  const convertFormat = useCallback(async (format: ImageFormat = 'png') => {
    if (!imageFile) {
      setError('请先加载图片');
      return null;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // 创建临时canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法创建Canvas上下文');
      }
      
      // 加载图片
      const img = new Image();
      
      // 等待图片加载完成的Promise
      const imageLoaded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('加载图片时出错'));
      });
      
      img.src = imagePreview;
      await imageLoaded;
      
      // 设置canvas尺寸
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 绘制图片
      ctx.drawImage(img, 0, 0);
      
      // 将canvas转换为Blob
      let quality = 0.92;
      if (format === 'jpeg') {
        quality = 0.9;
      } else if (format === 'webp') {
        quality = 0.8;
      }
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('转换图片格式失败'));
            }
          },
          `image/${format}`,
          quality
        );
      });
      
      // 创建文件
      const fileName = imageFile.name.split('.')[0] || 'image';
      let fileExt = formatToExtension[format];
      
      const convertedFile = new File([blob], `${fileName}.${fileExt}`, {
        type: `image/${format}`
      });
      
      // 创建预览
      const preview = URL.createObjectURL(convertedFile);
      setProcessedImageFile(convertedFile);
      setProcessedImagePreview(preview);
      setSelectedFormat(format);
      
      // 添加历史记录
      const historyItem: ImageHistoryItem = {
        id: uuidv4(),
        originalFile: imageFile,
        processedFile: convertedFile,
        originalSize: imageFile.size,
        processedSize: convertedFile.size,
        operation: `转换为${format === 'jpeg' ? 'JPG' : format.toUpperCase()}格式`,
        timestamp: Date.now(),
        name: convertedFile.name,
        format
      };
      
      setHistory(prev => [historyItem, ...prev]);
      setIsProcessing(false);
      return convertedFile;
    } catch (err) {
      setError('转换图片格式时出错：' + (err instanceof Error ? err.message : String(err)));
      setIsProcessing(false);
      return null;
    }
  }, [imageFile, imagePreview]);
  
  /**
   * 压缩图片
   */
  const compressImage = useCallback(async (options: CompressionOptions) => {
    if (!imageFile) {
      setError('请先加载图片');
      return null;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // 默认压缩配置
      const compressionOptions: CompressionOptions = {
        maxSizeMB: options.maxSizeMB || 1,
        maxWidthOrHeight: options.maxWidthOrHeight || 1920,
        useWebWorker: options.useWebWorker !== undefined ? options.useWebWorker : true,
        quality: options.quality || 0.8
      };
      
      // 使用browser-image-compression库压缩图片
      const compressedFile = await imageCompression(imageFile, compressionOptions);
      
      // 创建预览
      const preview = URL.createObjectURL(compressedFile);
      setProcessedImageFile(compressedFile);
      setProcessedImagePreview(preview);
      
      // 添加历史记录
      const historyItem: ImageHistoryItem = {
        id: uuidv4(),
        originalFile: imageFile,
        processedFile: compressedFile,
        originalSize: imageFile.size,
        processedSize: compressedFile.size,
        operation: '压缩图片',
        timestamp: Date.now(),
        name: compressedFile.name,
        actions: [{
          type: 'compress',
          params: compressionOptions
        }]
      };
      
      setHistory(prev => [historyItem, ...prev]);
      setIsProcessing(false);
      return compressedFile;
    } catch (err) {
      setError('压缩图片时出错：' + (err instanceof Error ? err.message : String(err)));
      setIsProcessing(false);
      return null;
    }
  }, [imageFile]);
  
  /**
   * 调整图片大小
   */
  const resizeImage = useCallback(async (options: ResizeOptions) => {
    if (!imageFile) {
      setError('请先加载图片');
      return null;
    }
    
    if (!options.width && !options.height) {
      setError('请指定宽度或高度');
      return null;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // 创建临时canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法创建Canvas上下文');
      }
      
      // 加载图片
      const img = new Image();
      
      // 等待图片加载完成的Promise
      const imageLoaded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('加载图片时出错'));
      });
      
      img.src = imagePreview;
      await imageLoaded;
      
      // 计算新尺寸
      let newWidth = options.width || 0;
      let newHeight = options.height || 0;
      
      if (options.maintainAspectRatio) {
        const aspectRatio = img.width / img.height;
        
        if (options.width && !options.height) {
          newHeight = Math.round(options.width / aspectRatio);
        } else if (!options.width && options.height) {
          newWidth = Math.round(options.height * aspectRatio);
        } else if (options.width && options.height) {
          // 如果同时指定了宽度和高度，以宽度为准
          newHeight = Math.round(options.width / aspectRatio);
        }
      }
      
      // 设置canvas尺寸
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // 绘制调整大小后的图片
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // 将canvas转换为Blob
      const format = selectedFormat || 'png';
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('调整图片大小失败'));
            }
          },
          `image/${format}`,
          0.92
        );
      });
      
      // 创建文件
      const fileName = imageFile.name.split('.')[0] || 'image';
      let fileExt = formatToExtension[format];
      
      const resizedFile = new File([blob], `${fileName}_resized.${fileExt}`, {
        type: `image/${format}`
      });
      
      // 创建预览
      const preview = URL.createObjectURL(resizedFile);
      setProcessedImageFile(resizedFile);
      setProcessedImagePreview(preview);
      
      // 添加历史记录
      const historyItem: ImageHistoryItem = {
        id: uuidv4(),
        originalFile: imageFile,
        processedFile: resizedFile,
        originalSize: imageFile.size,
        processedSize: resizedFile.size,
        operation: '调整图片大小',
        timestamp: Date.now(),
        name: resizedFile.name,
        actions: [{
          type: 'resize',
          params: {
            width: newWidth,
            height: newHeight,
            maintainAspectRatio: options.maintainAspectRatio
          }
        }]
      };
      
      setHistory(prev => [historyItem, ...prev]);
      setIsProcessing(false);
      return resizedFile;
    } catch (err) {
      setError('调整图片大小时出错：' + (err instanceof Error ? err.message : String(err)));
      setIsProcessing(false);
      return null;
    }
  }, [imageFile, imagePreview, selectedFormat]);
  
  /**
   * 裁剪图片
   */
  const cropImage = useCallback(async (area: CropArea) => {
    if (!imageFile) {
      setError('请先加载图片');
      return null;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // 创建临时canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法创建Canvas上下文');
      }
      
      // 加载图片
      const img = new Image();
      
      // 等待图片加载完成的Promise
      const imageLoaded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('加载图片时出错'));
      });
      
      img.src = imagePreview;
      await imageLoaded;
      
      // 设置canvas尺寸为裁剪区域大小
      canvas.width = area.width;
      canvas.height = area.height;
      
      // 绘制裁剪区域
      ctx.drawImage(
        img,
        area.x, area.y, area.width, area.height, // 源图像的裁剪区域
        0, 0, area.width, area.height // 目标图像的绘制区域
      );
      
      // 将canvas转换为Blob
      const format = selectedFormat || 'png';
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('裁剪图片失败'));
            }
          },
          `image/${format}`,
          0.92
        );
      });
      
      // 创建文件
      const fileName = imageFile.name.split('.')[0] || 'image';
      let fileExt = formatToExtension[format];
      
      const croppedFile = new File([blob], `${fileName}_cropped.${fileExt}`, {
        type: `image/${format}`
      });
      
      // 创建预览
      const preview = URL.createObjectURL(croppedFile);
      setProcessedImageFile(croppedFile);
      setProcessedImagePreview(preview);
      
      // 添加历史记录
      const historyItem: ImageHistoryItem = {
        id: uuidv4(),
        originalFile: imageFile,
        processedFile: croppedFile,
        originalSize: imageFile.size,
        processedSize: croppedFile.size,
        operation: '裁剪图片',
        timestamp: Date.now(),
        name: croppedFile.name,
        actions: [{
          type: 'crop',
          params: area
        }]
      };
      
      setHistory(prev => [historyItem, ...prev]);
      setIsProcessing(false);
      return croppedFile;
    } catch (err) {
      setError('裁剪图片时出错：' + (err instanceof Error ? err.message : String(err)));
      setIsProcessing(false);
      return null;
    }
  }, [imageFile, imagePreview, selectedFormat]);
  
  /**
   * 编码图片为Base64
   */
  const encodeToBase64 = useCallback(async () => {
    const file = processedImageFile || imageFile;
    if (!file) {
      setError('请先加载图片');
      return null;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // 读取文件为DataURL
      const reader = new FileReader();
      
      // 等待文件读取完成的Promise
      const fileRead = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('读取文件失败'));
          }
        };
        reader.onerror = () => reject(new Error('读取文件时出错'));
      });
      
      reader.readAsDataURL(file);
      const dataUrl = await fileRead;
      
      // 从DataURL中提取Base64字符串
      const base64String = dataUrl.split(',')[1];
      
      // 创建Blob和File对象
      const blob = new Blob([base64String], { type: 'text/plain' });
      const base64File = new File([blob], `${file.name}.base64.txt`, {
        type: 'text/plain'
      });
      
      // 添加历史记录
      const historyItem: ImageHistoryItem = {
        id: uuidv4(),
        originalFile: file,
        processedFile: base64File,
        originalSize: file.size,
        processedSize: base64String.length,
        operation: '编码为Base64',
        timestamp: Date.now(),
        name: base64File.name
      };
      
      setHistory(prev => [historyItem, ...prev]);
      setIsProcessing(false);
      return { base64String, dataUrl };
    } catch (err) {
      setError('编码为Base64时出错：' + (err instanceof Error ? err.message : String(err)));
      setIsProcessing(false);
      return null;
    }
  }, [imageFile, processedImageFile]);
  
  /**
   * 解码Base64为图片
   */
  const decodeFromBase64 = useCallback(async (base64String: string, fileName = 'decoded_image', format: ImageFormat = 'png') => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // 如果是DataURL，提取Base64部分
      if (base64String.startsWith('data:')) {
        const parts = base64String.split(',');
        if (parts.length !== 2) {
          throw new Error('无效的DataURL格式');
        }
        
        // 从DataURL中提取MIME类型
        const mimeMatch = parts[0].match(/data:(image\/[^;]+);/);
        if (mimeMatch && mimeMatch[1]) {
          const mime = mimeMatch[1];
          if (mime === 'image/jpeg') {
            format = 'jpeg';
          } else if (mime === 'image/png') {
            format = 'png';
          } else if (mime === 'image/webp') {
            format = 'webp';
          } else if (mime === 'image/svg+xml') {
            format = 'svg+xml';
          } else if (mime === 'image/gif') {
            format = 'gif';
          }
        }
        
        base64String = parts[1];
      }
      
      // 创建完整的DataURL
      const dataUrl = `data:image/${format};base64,${base64String}`;
      
      // 加载图片来验证Base64是否有效
      const img = new Image();
      
      // 等待图片加载完成的Promise
      const imageLoaded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('无效的Base64图片数据'));
      });
      
      img.src = dataUrl;
      await imageLoaded;
      
      // 将DataURL转换为Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // 确定文件扩展名
      let fileExt = formatToExtension[format];
      
      // 创建文件
      const decodedFile = new File([blob], `${fileName}.${fileExt}`, {
        type: `image/${format}`
      });
      
      // 创建预览
      const preview = URL.createObjectURL(decodedFile);
      setImageFile(decodedFile);
      setImagePreview(preview);
      setProcessedImageFile(null);
      setProcessedImagePreview('');
      setSelectedFormat(format);
      
      // 获取图片尺寸
      setOriginalDimensions({
        width: img.width,
        height: img.height
      });
      
      // 添加历史记录
      const historyItem: ImageHistoryItem = {
        id: uuidv4(),
        processedFile: decodedFile,
        originalSize: base64String.length,
        processedSize: decodedFile.size,
        operation: '解码Base64为图片',
        timestamp: Date.now(),
        name: decodedFile.name,
        format
      };
      
      setHistory(prev => [historyItem, ...prev]);
      setIsProcessing(false);
      return decodedFile;
    } catch (err) {
      setError('解码Base64时出错：' + (err instanceof Error ? err.message : String(err)));
      setIsProcessing(false);
      return null;
    }
  }, []);
  
  /**
   * 清空历史记录
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);
  
  /**
   * 从历史记录中恢复图片
   */
  const restoreFromHistory = useCallback((item: ImageHistoryItem) => {
    if (item.processedFile) {
      setImageFile(item.processedFile);
      setImagePreview(URL.createObjectURL(item.processedFile));
      setProcessedImageFile(null);
      setProcessedImagePreview('');
      
      if (item.format) {
        setSelectedFormat(item.format);
      }
    } else if (item.originalFile) {
      setImageFile(item.originalFile);
      setImagePreview(URL.createObjectURL(item.originalFile));
      setProcessedImageFile(null);
      setProcessedImagePreview('');
    }
  }, []);
  
  /**
   * 重置所有状态
   */
  const reset = useCallback(() => {
    setImageFile(null);
    setProcessedImageFile(null);
    setImagePreview('');
    setProcessedImagePreview('');
    setIsProcessing(false);
    setError(null);
    setCropArea(null);
    setOriginalDimensions(null);
    setSelectedFormat('png');
  }, []);
  
  return {
    // 状态
    imageFile,
    processedImageFile,
    imagePreview,
    processedImagePreview,
    isProcessing,
    error,
    cropArea,
    setCropArea,
    originalDimensions,
    history,
    selectedFormat,
    setSelectedFormat,
    
    // 方法
    loadImage,
    convertFormat,
    compressImage,
    resizeImage,
    cropImage,
    encodeToBase64,
    decodeFromBase64,
    clearHistory,
    restoreFromHistory,
    reset,
    
    // Canvas引用
    canvasRef
  };
};

export default useImageProcessor;
