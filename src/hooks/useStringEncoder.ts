import { useState, useCallback } from 'react';
import CryptoJS from 'crypto-js';

export type EncodingType = 
  | 'base64-encode'
  | 'base64-decode'
  | 'url-encode'
  | 'url-decode'
  | 'html-encode'
  | 'html-decode'
  | 'escape-encode'
  | 'escape-decode'
  | 'md5'
  | 'sha1'
  | 'sha256'
  | 'sha512';

export interface EncodingMethod {
  id: EncodingType;
  label: string;
  description: string;
  category: 'encode-decode' | 'hash';
  process: (input: string) => string;
}

export interface EncodingHistory {
  id: string;
  inputText: string;
  outputText: string;
  method: EncodingType;
  timestamp: number;
}

/**
 * 字符串编码/解码自定义Hook
 * @returns 编码/解码方法和状态
 */
export const useStringEncoder = () => {
  // 输入文本
  const [inputText, setInputText] = useState<string>('');
  // 输出文本
  const [outputText, setOutputText] = useState<string>('');
  // 当前选择的编码/解码方法
  const [selectedMethod, setSelectedMethod] = useState<EncodingType>('base64-encode');
  // 编码/解码历史记录
  const [history, setHistory] = useState<EncodingHistory[]>([]);
  // 错误信息
  const [error, setError] = useState<string | null>(null);

  // 所有支持的编码/解码方法定义
  const encodingMethods: EncodingMethod[] = [
    {
      id: 'base64-encode',
      label: 'Base64 编码',
      description: '将文本编码为 Base64 格式',
      category: 'encode-decode',
      process: (input: string) => {
        try {
          return btoa(unescape(encodeURIComponent(input)));
        } catch (err) {
          throw new Error('Base64 编码失败，请检查输入');
        }
      }
    },
    {
      id: 'base64-decode',
      label: 'Base64 解码',
      description: '将 Base64 格式解码为文本',
      category: 'encode-decode',
      process: (input: string) => {
        try {
          return decodeURIComponent(escape(atob(input)));
        } catch (err) {
          throw new Error('Base64 解码失败，请检查输入是否为有效的 Base64 字符串');
        }
      }
    },
    {
      id: 'url-encode',
      label: 'URL 编码',
      description: '将文本编码为 URL 安全格式',
      category: 'encode-decode',
      process: (input: string) => {
        try {
          return encodeURIComponent(input);
        } catch (err) {
          throw new Error('URL 编码失败，请检查输入');
        }
      }
    },
    {
      id: 'url-decode',
      label: 'URL 解码',
      description: '将 URL 编码解码为文本',
      category: 'encode-decode',
      process: (input: string) => {
        try {
          return decodeURIComponent(input);
        } catch (err) {
          throw new Error('URL 解码失败，请检查输入是否为有效的 URL 编码字符串');
        }
      }
    },
    {
      id: 'html-encode',
      label: 'HTML 编码',
      description: '将文本中的特殊字符编码为 HTML 实体',
      category: 'encode-decode',
      process: (input: string) => {
        return input
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }
    },
    {
      id: 'html-decode',
      label: 'HTML 解码',
      description: '将 HTML 实体解码为原始字符',
      category: 'encode-decode',
      process: (input: string) => {
        return input
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
      }
    },
    {
      id: 'escape-encode',
      label: 'Escape 编码',
      description: '将文本编码为转义序列',
      category: 'encode-decode',
      process: (input: string) => {
        try {
          return escape(input);
        } catch (err) {
          throw new Error('Escape 编码失败，请检查输入');
        }
      }
    },
    {
      id: 'escape-decode',
      label: 'Escape 解码',
      description: '将转义序列解码为文本',
      category: 'encode-decode',
      process: (input: string) => {
        try {
          return unescape(input);
        } catch (err) {
          throw new Error('Escape 解码失败，请检查输入是否为有效的转义序列');
        }
      }
    },
    {
      id: 'md5',
      label: 'MD5 哈希',
      description: '计算文本的 MD5 哈希值',
      category: 'hash',
      process: (input: string) => {
        return CryptoJS.MD5(input).toString();
      }
    },
    {
      id: 'sha1',
      label: 'SHA-1 哈希',
      description: '计算文本的 SHA-1 哈希值',
      category: 'hash',
      process: (input: string) => {
        return CryptoJS.SHA1(input).toString();
      }
    },
    {
      id: 'sha256',
      label: 'SHA-256 哈希',
      description: '计算文本的 SHA-256 哈希值',
      category: 'hash',
      process: (input: string) => {
        return CryptoJS.SHA256(input).toString();
      }
    },
    {
      id: 'sha512',
      label: 'SHA-512 哈希',
      description: '计算文本的 SHA-512 哈希值',
      category: 'hash',
      process: (input: string) => {
        return CryptoJS.SHA512(input).toString();
      }
    }
  ];

  // 获取当前选择的编码/解码方法
  const getCurrentMethod = useCallback(() => {
    return encodingMethods.find(method => method.id === selectedMethod) || encodingMethods[0];
  }, [selectedMethod]);

  // 执行编码/解码处理
  const processText = useCallback(() => {
    if (!inputText.trim()) {
      setOutputText('');
      setError(null);
      return;
    }

    const method = getCurrentMethod();
    
    try {
      const result = method.process(inputText);
      setOutputText(result);
      setError(null);
      
      // 添加到历史记录
      const newHistoryItem: EncodingHistory = {
        id: Date.now().toString(),
        inputText,
        outputText: result,
        method: method.id,
        timestamp: Date.now()
      };
      
      setHistory(prev => {
        // 保留最新的 10 条记录
        const updatedHistory = [newHistoryItem, ...prev];
        if (updatedHistory.length > 10) {
          return updatedHistory.slice(0, 10);
        }
        return updatedHistory;
      });
    } catch (err) {
      setError((err as Error).message || '处理失败');
      setOutputText('');
    }
  }, [inputText, getCurrentMethod]);

  // 清空历史记录
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // 清空所有输入和输出
  const clearAll = useCallback(() => {
    setInputText('');
    setOutputText('');
    setError(null);
  }, []);

  // 交换输入和输出
  const swapInputOutput = useCallback(() => {
    if (!outputText) return;
    
    setInputText(outputText);
    setOutputText('');
    setError(null);
  }, [outputText]);

  // 复制到剪贴板
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('复制到剪贴板失败:', err);
      return false;
    }
  }, []);

  return {
    inputText,
    outputText,
    selectedMethod,
    history,
    error,
    encodingMethods,
    setInputText,
    setSelectedMethod,
    processText,
    clearHistory,
    clearAll,
    swapInputOutput,
    copyToClipboard,
    getCurrentMethod
  };
};

export default useStringEncoder;
