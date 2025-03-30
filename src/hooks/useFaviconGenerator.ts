import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

// ICO尺寸类型
export type IconSize = 16 | 32 | 48 | 64 | 128 | 256;

// 图标历史记录项
export interface IconHistoryItem {
  id: string;
  originalFile?: File;
  icoFile?: File;
  originalSize: number;
  icoSize: number;
  sizes: IconSize[];
  timestamp: number;
  name?: string;
}

// 图标生成选项
export interface IconOptions {
  sizes: IconSize[];
  name: string;
}

/**
 * 网站图标(Favicon)生成Hook
 */
const useFaviconGenerator = () => {
  // 状态
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [icoFile, setIcoFile] = useState<File | null>(null);
  const [icoPreview, setIcoPreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [iconSizes, setIconSizes] = useState<IconSize[]>([16, 32, 48]);
  const [iconPreviews, setIconPreviews] = useState<Record<IconSize, string>>({} as Record<IconSize, string>);
  const [history, setHistory] = useState<IconHistoryItem[]>([]);
  
  // Canvas引用
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  /**
   * 加载图片文件
   */
  const loadImage = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);
      setError(null);
      setSourceImage(file);
      
      // 创建预览
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      
      setIcoFile(null);
      setIcoPreview('');
      setIconPreviews({} as Record<IconSize, string>);
      setIsProcessing(false);
    } catch (err) {
      setError('加载图片时出错：' + (err instanceof Error ? err.message : String(err)));
      setIsProcessing(false);
    }
  }, []);
  
  /**
   * 创建单一尺寸的图标预览
   */
  const createSizedIcon = useCallback(async (size: IconSize): Promise<Blob> => {
    if (!sourceImage || !imagePreview) {
      throw new Error('请先加载图片');
    }
    
    // 创建临时canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法创建Canvas上下文');
    }
    
    // 设置canvas尺寸
    canvas.width = size;
    canvas.height = size;
    
    // 加载图片
    const img = new Image();
    
    // 等待图片加载完成的Promise
    const imageLoaded = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('加载图片时出错'));
    });
    
    img.src = imagePreview;
    await imageLoaded;
    
    // 绘制调整大小后的图片
    ctx.drawImage(img, 0, 0, size, size);
    
    // 将canvas转换为Blob
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('生成图标失败'));
          }
        },
        'image/png'
      );
    });
  }, [sourceImage, imagePreview]);
  
  /**
   * 预览所有选定尺寸的图标
   */
  const previewIcons = useCallback(async () => {
    if (!sourceImage) {
      setError('请先加载图片');
      return;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      const previews: Record<IconSize, string> = {} as Record<IconSize, string>;
      
      // 为每个尺寸创建预览
      for (const size of iconSizes) {
        const iconBlob = await createSizedIcon(size);
        const iconUrl = URL.createObjectURL(iconBlob);
        previews[size] = iconUrl;
      }
      
      setIconPreviews(previews);
      setIsProcessing(false);
    } catch (err) {
      setError('预览图标时出错：' + (err instanceof Error ? err.message : String(err)));
      setIsProcessing(false);
    }
  }, [sourceImage, iconSizes, createSizedIcon]);
  
  /**
   * 生成ICO文件
   * ICO文件格式复杂，这里使用简化的方法创建
   * 实际生产环境可能需要专门的库处理ICO格式
   */
  const generateIcoFile = useCallback(async (options: IconOptions) => {
    if (!sourceImage) {
      setError('请先加载图片');
      return null;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // 收集所有尺寸的图标为PNG Blob
      const iconBlobs: Blob[] = [];
      
      for (const size of options.sizes) {
        const iconBlob = await createSizedIcon(size);
        iconBlobs.push(iconBlob);
      }
      
      // 在实际应用中，这里应该有转换为ICO格式的代码
      // 由于浏览器环境不容易直接生成ICO格式，我们这里模拟创建一个包含多个PNG的ZIP包
      
      // 为了演示，我们将最大尺寸的PNG作为"ICO文件"
      const largestSize = Math.max(...options.sizes) as IconSize;
      const largestIconIndex = options.sizes.indexOf(largestSize);
      const icoBlob = iconBlobs[largestIconIndex];
      
      // 创建模拟的ICO文件
      const fileName = options.name || 'favicon';
      const icoFile = new File([icoBlob], `${fileName}.ico`, {
        type: 'image/x-icon'
      });
      
      setIcoFile(icoFile);
      setIcoPreview(URL.createObjectURL(icoBlob));
      
      // 添加历史记录
      const historyItem: IconHistoryItem = {
        id: uuidv4(),
        originalFile: sourceImage,
        icoFile: icoFile,
        originalSize: sourceImage.size,
        icoSize: icoBlob.size,
        sizes: options.sizes,
        timestamp: Date.now(),
        name: icoFile.name
      };
      
      setHistory(prev => [historyItem, ...prev]);
      setIsProcessing(false);
      return icoFile;
    } catch (err) {
      setError('生成ICO文件时出错：' + (err instanceof Error ? err.message : String(err)));
      setIsProcessing(false);
      return null;
    }
  }, [sourceImage, createSizedIcon]);
  
  /**
   * 清空历史记录
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);
  
  /**
   * 从历史记录中恢复图标
   */
  const restoreFromHistory = useCallback((item: IconHistoryItem) => {
    if (item.originalFile) {
      setSourceImage(item.originalFile);
      setImagePreview(URL.createObjectURL(item.originalFile));
    }
    
    if (item.icoFile) {
      setIcoFile(item.icoFile);
      setIcoPreview(URL.createObjectURL(item.icoFile));
    }
    
    setIconSizes(item.sizes);
  }, []);
  
  /**
   * 重置所有状态
   */
  const reset = useCallback(() => {
    setSourceImage(null);
    setImagePreview('');
    setIcoFile(null);
    setIcoPreview('');
    setIsProcessing(false);
    setError(null);
    setIconSizes([16, 32, 48]);
    setIconPreviews({} as Record<IconSize, string>);
  }, []);
  
  /**
   * 创建网页包
   * 生成包含所有必要图标的ZIP文件和相关HTML代码
   */
  const createWebPackage = useCallback(async () => {
    if (!sourceImage || !iconPreviews || Object.keys(iconPreviews).length === 0) {
      setError('请先预览图标');
      return null;
    }
    
    // 在实际应用中，这里应该创建一个包含所有图标文件和HTML示例代码的ZIP包
    // 由于浏览器环境不容易直接创建ZIP，这里我们返回HTML代码作为文本
    
    const htmlCode = `
<!-- 在HTML的<head>部分添加下面的代码 -->
<link rel="icon" type="image/x-icon" href="favicon.ico">
${iconSizes.map(size => `<link rel="icon" type="image/png" sizes="${size}x${size}" href="favicon-${size}x${size}.png">`).join('\n')}
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
<!-- 针对Chrome for Android的主题颜色 -->
<meta name="theme-color" content="#ffffff">
    `;
    
    return htmlCode;
  }, [sourceImage, iconPreviews, iconSizes]);
  
  return {
    // 状态
    sourceImage,
    imagePreview,
    icoFile,
    icoPreview,
    isProcessing,
    error,
    iconSizes,
    setIconSizes,
    iconPreviews,
    history,
    
    // 方法
    loadImage,
    previewIcons,
    generateIcoFile,
    createWebPackage,
    clearHistory,
    restoreFromHistory,
    reset,
    
    // Canvas引用
    canvasRef
  };
};

export default useFaviconGenerator;
