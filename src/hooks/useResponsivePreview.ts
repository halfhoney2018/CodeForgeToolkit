import { useState, useCallback } from 'react';

// 预设设备尺寸
export interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'custom';
  userAgent?: string;
  orientation?: 'portrait' | 'landscape';
}

// 预览状态
export interface PreviewState {
  url: string;
  activeDeviceId: string;
  isLoading: boolean;
  error: string | null;
  isCustomSize: boolean;
  customWidth: number;
  customHeight: number;
  zoom: number;
  showRulers: boolean;
  showDeviceFrame: boolean;
  rotateDevice: boolean;
}

// 预设设备列表
export const DEVICE_PRESETS: DevicePreset[] = [
  // 手机设备
  {
    id: 'iphone-se',
    name: 'iPhone SE',
    width: 375,
    height: 667,
    deviceType: 'mobile',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    orientation: 'portrait'
  },
  {
    id: 'iphone-12',
    name: 'iPhone 12/13',
    width: 390,
    height: 844,
    deviceType: 'mobile',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    orientation: 'portrait'
  },
  {
    id: 'iphone-12-pro-max',
    name: 'iPhone 12/13 Pro Max',
    width: 428,
    height: 926,
    deviceType: 'mobile',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    orientation: 'portrait'
  },
  {
    id: 'samsung-galaxy-s21',
    name: 'Samsung Galaxy S21',
    width: 360,
    height: 800,
    deviceType: 'mobile',
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    orientation: 'portrait'
  },
  {
    id: 'pixel-5',
    name: 'Google Pixel 5',
    width: 393,
    height: 851,
    deviceType: 'mobile',
    userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    orientation: 'portrait'
  },
  
  // 平板设备
  {
    id: 'ipad',
    name: 'iPad',
    width: 768,
    height: 1024,
    deviceType: 'tablet',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    orientation: 'portrait'
  },
  {
    id: 'ipad-pro',
    name: 'iPad Pro 12.9"',
    width: 1024,
    height: 1366,
    deviceType: 'tablet',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    orientation: 'portrait'
  },
  {
    id: 'galaxy-tab-s7',
    name: 'Samsung Galaxy Tab S7',
    width: 800,
    height: 1280,
    deviceType: 'tablet',
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36',
    orientation: 'portrait'
  },
  
  // 桌面设备
  {
    id: 'laptop',
    name: '笔记本电脑',
    width: 1366,
    height: 768,
    deviceType: 'desktop',
    orientation: 'landscape'
  },
  {
    id: 'desktop',
    name: '桌面显示器',
    width: 1920,
    height: 1080,
    deviceType: 'desktop',
    orientation: 'landscape'
  },
  {
    id: 'macbook-pro',
    name: 'MacBook Pro',
    width: 1440,
    height: 900,
    deviceType: 'desktop',
    orientation: 'landscape'
  },
  
  // 常用断点
  {
    id: 'breakpoint-xs',
    name: '超小断点 (XS)',
    width: 320,
    height: 568,
    deviceType: 'custom',
    orientation: 'portrait'
  },
  {
    id: 'breakpoint-sm',
    name: '小断点 (SM)',
    width: 576,
    height: 768,
    deviceType: 'custom',
    orientation: 'portrait'
  },
  {
    id: 'breakpoint-md',
    name: '中断点 (MD)',
    width: 768,
    height: 1024,
    deviceType: 'custom',
    orientation: 'portrait'
  },
  {
    id: 'breakpoint-lg',
    name: '大断点 (LG)',
    width: 992,
    height: 1200,
    deviceType: 'custom',
    orientation: 'landscape'
  },
  {
    id: 'breakpoint-xl',
    name: '超大断点 (XL)',
    width: 1200,
    height: 1400,
    deviceType: 'custom',
    orientation: 'landscape'
  },
  {
    id: 'breakpoint-xxl',
    name: '超超大断点 (XXL)',
    width: 1400,
    height: 1600,
    deviceType: 'custom',
    orientation: 'landscape'
  }
];

// 默认预览状态
const DEFAULT_PREVIEW_STATE: PreviewState = {
  url: '',
  activeDeviceId: 'iphone-12',
  isLoading: false,
  error: null,
  isCustomSize: false,
  customWidth: 375,
  customHeight: 667,
  zoom: 1,
  showRulers: true,
  showDeviceFrame: true,
  rotateDevice: false
};

/**
 * 响应式设计预览Hook
 */
const useResponsivePreview = () => {
  const [previewState, setPreviewState] = useState<PreviewState>(DEFAULT_PREVIEW_STATE);
  const [history, setHistory] = useState<string[]>([]);
  const [devices, setDevices] = useState<DevicePreset[]>(DEVICE_PRESETS);
  
  // 获取当前活动设备
  const getActiveDevice = useCallback((): DevicePreset => {
    if (previewState.isCustomSize) {
      return {
        id: 'custom',
        name: '自定义尺寸',
        width: previewState.customWidth,
        height: previewState.customHeight,
        deviceType: 'custom',
        orientation: previewState.customWidth > previewState.customHeight ? 'landscape' : 'portrait'
      };
    }
    
    const activeDevice = devices.find(device => device.id === previewState.activeDeviceId);
    if (!activeDevice) {
      return devices[0];
    }
    
    // 如果需要旋转设备
    if (previewState.rotateDevice) {
      return {
        ...activeDevice,
        width: activeDevice.height,
        height: activeDevice.width,
        orientation: activeDevice.orientation === 'portrait' ? 'landscape' : 'portrait'
      };
    }
    
    return activeDevice;
  }, [previewState, devices]);
  
  // 设置URL
  const setUrl = useCallback((url: string) => {
    if (!url) return;
    
    // 确保URL有效
    try {
      // 如果URL没有协议，添加https://
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      
      // 尝试创建URL对象以验证
      new URL(url);
      
      setPreviewState(prev => ({ ...prev, url, isLoading: true, error: null }));
      
      // 添加到历史记录
      setHistory(prev => {
        const newHistory = prev.filter(item => item !== url);
        return [url, ...newHistory].slice(0, 10);
      });
    } catch (error) {
      setPreviewState(prev => ({ ...prev, error: '无效的URL' }));
    }
  }, []);
  
  // 设置活动设备
  const setActiveDevice = useCallback((deviceId: string) => {
    setPreviewState(prev => ({ 
      ...prev, 
      activeDeviceId: deviceId,
      isCustomSize: false,
      rotateDevice: false
    }));
  }, []);
  
  // 设置自定义尺寸
  const setCustomSize = useCallback((width: number, height: number) => {
    setPreviewState(prev => ({ 
      ...prev, 
      isCustomSize: true,
      customWidth: width,
      customHeight: height
    }));
  }, []);
  
  // 旋转设备
  const toggleRotateDevice = useCallback(() => {
    setPreviewState(prev => ({ ...prev, rotateDevice: !prev.rotateDevice }));
  }, []);
  
  // 设置缩放比例
  const setZoom = useCallback((zoom: number) => {
    setPreviewState(prev => ({ ...prev, zoom }));
  }, []);
  
  // 切换标尺显示
  const toggleRulers = useCallback(() => {
    setPreviewState(prev => ({ ...prev, showRulers: !prev.showRulers }));
  }, []);
  
  // 切换设备框架显示
  const toggleDeviceFrame = useCallback(() => {
    setPreviewState(prev => ({ ...prev, showDeviceFrame: !prev.showDeviceFrame }));
  }, []);
  
  // 添加自定义设备
  const addCustomDevice = useCallback((device: Omit<DevicePreset, 'id'>) => {
    const newDevice: DevicePreset = {
      ...device,
      id: `custom-${Date.now()}`,
    };
    
    setDevices(prev => [...prev, newDevice]);
    return newDevice.id;
  }, []);
  
  // 删除自定义设备
  const removeCustomDevice = useCallback((deviceId: string) => {
    // 只允许删除自定义设备
    if (!deviceId.startsWith('custom-')) return;
    
    setDevices(prev => prev.filter(device => device.id !== deviceId));
    
    // 如果删除的是当前活动设备，切换到默认设备
    if (previewState.activeDeviceId === deviceId) {
      setPreviewState(prev => ({ ...prev, activeDeviceId: 'iphone-12' }));
    }
  }, [previewState.activeDeviceId]);
  
  // 处理iframe加载完成
  const handleIframeLoad = useCallback(() => {
    setPreviewState(prev => ({ ...prev, isLoading: false }));
  }, []);
  
  // 处理iframe加载错误
  const handleIframeError = useCallback(() => {
    setPreviewState(prev => ({ 
      ...prev, 
      isLoading: false, 
      error: '无法加载页面，请检查URL是否正确或网络连接是否正常'
    }));
  }, []);
  
  // 清除历史记录
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);
  
  return {
    previewState,
    history,
    devices,
    getActiveDevice,
    setUrl,
    setActiveDevice,
    setCustomSize,
    toggleRotateDevice,
    setZoom,
    toggleRulers,
    toggleDeviceFrame,
    addCustomDevice,
    removeCustomDevice,
    handleIframeLoad,
    handleIframeError,
    clearHistory
  };
};

export default useResponsivePreview;
