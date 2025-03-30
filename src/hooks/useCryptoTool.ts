import { useState, useCallback } from 'react';
import CryptoJS from 'crypto-js';

// 加密算法类型
export type EncryptionAlgorithm = 
  | 'AES'
  | 'DES'
  | 'TripleDES'
  | 'Rabbit'
  | 'RC4'
  | 'RC4Drop';

// 操作模式
export type OperationMode = 'encrypt' | 'decrypt';

// 加密模式
export type CipherMode = 
  | 'CBC' // Cipher Block Chaining
  | 'CFB' // Cipher Feedback
  | 'CTR' // Counter
  | 'OFB' // Output Feedback
  | 'ECB'; // Electronic Codebook (不推荐用于大多数应用)

// 填充方式
export type PaddingMode = 
  | 'Pkcs7'    // PKCS#7 填充 (推荐)
  | 'AnsiX923' // ANSI X.923 填充
  | 'Iso10126' // ISO 10126 填充
  | 'Iso97971' // ISO/IEC 9797-1 填充
  | 'ZeroPadding' // 零填充
  | 'NoPadding';  // 无填充

// 输出格式
export type OutputFormat = 'Base64' | 'Hex' | 'Utf8';

// 加密/解密的历史记录
export interface CryptoHistoryItem {
  id: string;
  algorithm: EncryptionAlgorithm;
  mode: OperationMode;
  inputText: string;
  outputText: string;
  key: string;
  iv?: string;
  timestamp: number;
  cipherMode: CipherMode;
  paddingMode: PaddingMode;
  outputFormat: OutputFormat;
}

// 加密/解密配置
export interface CryptoConfig {
  algorithm: EncryptionAlgorithm;
  mode: OperationMode;
  key: string;
  iv: string;
  cipherMode: CipherMode;
  paddingMode: PaddingMode;
  outputFormat: OutputFormat;
}

/**
 * 加密解密工具自定义Hook
 * @returns 加密解密方法和状态
 */
export const useCryptoTool = () => {
  // 输入文本
  const [inputText, setInputText] = useState<string>('');
  // 输出文本
  const [outputText, setOutputText] = useState<string>('');
  // 当前加密/解密算法
  const [algorithm, setAlgorithm] = useState<EncryptionAlgorithm>('AES');
  // 操作模式：加密/解密
  const [mode, setMode] = useState<OperationMode>('encrypt');
  // 密钥
  const [key, setKey] = useState<string>('');
  // 初始化向量 (IV)
  const [iv, setIv] = useState<string>('');
  // 是否自动生成密钥
  const [autoGenerateKey, setAutoGenerateKey] = useState<boolean>(false);
  // 是否自动生成IV
  const [autoGenerateIv, setAutoGenerateIv] = useState<boolean>(false);
  // 加密模式
  const [cipherMode, setCipherMode] = useState<CipherMode>('CBC');
  // 填充方式
  const [paddingMode, setPaddingMode] = useState<PaddingMode>('Pkcs7');
  // 输出格式
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('Base64');
  // 历史记录
  const [history, setHistory] = useState<CryptoHistoryItem[]>([]);
  // 错误信息
  const [error, setError] = useState<string | null>(null);

  // 算法配置信息
  const algorithmInfo = {
    AES: {
      name: 'AES (高级加密标准)',
      description: '最常用的对称加密算法，安全且高效，密钥长度可以是128, 192或256位',
      keySizes: [128, 192, 256],
      needsIV: true,
      defaultKeySize: 256
    },
    DES: {
      name: 'DES (数据加密标准)',
      description: '早期的加密标准，现已不推荐用于安全敏感场景，密钥长度仅56位',
      keySizes: [56],
      needsIV: true,
      defaultKeySize: 56
    },
    TripleDES: {
      name: '3DES (三重DES)',
      description: 'DES的增强版，使用三个密钥依次加密，比DES更安全，但比AES慢',
      keySizes: [168],
      needsIV: true,
      defaultKeySize: 168
    },
    Rabbit: {
      name: 'Rabbit 流密码',
      description: '高速流密码算法，设计用于需要高性能的应用场景',
      keySizes: [128],
      needsIV: true,
      defaultKeySize: 128
    },
    RC4: {
      name: 'RC4 流密码',
      description: '简单快速的流密码，但存在已知安全问题，不推荐用于新应用',
      keySizes: [40, 128, 256],
      needsIV: false,
      defaultKeySize: 128
    },
    RC4Drop: {
      name: 'RC4Drop 流密码',
      description: 'RC4的变种，丢弃初始输出流以增强安全性',
      keySizes: [40, 128, 256],
      needsIV: false,
      defaultKeySize: 128
    }
  };

  // 生成随机密钥
  const generateRandomKey = useCallback((bits: number = 256): string => {
    return CryptoJS.lib.WordArray.random(bits / 8).toString();
  }, []);

  // 生成随机IV
  const generateRandomIv = useCallback((): string => {
    return CryptoJS.lib.WordArray.random(16).toString();
  }, []);

  // 根据算法和模式执行加密/解密
  const processCrypto = useCallback(() => {
    if (!inputText.trim()) {
      setError('请输入需要处理的文本');
      return;
    }

    if (!key && !autoGenerateKey) {
      setError('请输入密钥或启用自动生成');
      return;
    }

    // 如果需要IV但没有提供且未自动生成
    const currentAlgoInfo = algorithmInfo[algorithm];
    if (currentAlgoInfo.needsIV && cipherMode !== 'ECB' && !iv && !autoGenerateIv) {
      setError('当前算法和模式需要初始化向量(IV)');
      return;
    }

    setError(null);

    try {
      // 使用当前密钥或自动生成密钥
      const currentKey = autoGenerateKey 
        ? generateRandomKey(currentAlgoInfo.defaultKeySize) 
        : key;

      // 使用当前IV或自动生成IV
      const currentIv = autoGenerateIv 
        ? generateRandomIv() 
        : iv;

      // 准备CryptoJS配置
      const cryptoConfig: any = {
        mode: CryptoJS.mode[cipherMode],
        padding: CryptoJS.pad[paddingMode]
      };

      // 对于需要IV的算法和模式，添加IV配置
      if (currentAlgoInfo.needsIV && cipherMode !== 'ECB') {
        cryptoConfig.iv = CryptoJS.enc.Utf8.parse(currentIv);
      }

      let result;
      let resultString = ''; // 定义在更外层作用域，用于保存解密的结果

      // 执行加密或解密操作
      if (mode === 'encrypt') {
        // 加密操作
        switch (algorithm) {
          case 'AES':
            result = CryptoJS.AES.encrypt(
              inputText, 
              CryptoJS.enc.Utf8.parse(currentKey), 
              cryptoConfig
            );
            break;
          case 'DES':
            result = CryptoJS.DES.encrypt(
              inputText, 
              CryptoJS.enc.Utf8.parse(currentKey), 
              cryptoConfig
            );
            break;
          case 'TripleDES':
            result = CryptoJS.TripleDES.encrypt(
              inputText, 
              CryptoJS.enc.Utf8.parse(currentKey), 
              cryptoConfig
            );
            break;
          case 'Rabbit':
            result = CryptoJS.Rabbit.encrypt(
              inputText, 
              CryptoJS.enc.Utf8.parse(currentKey), 
              cryptoConfig
            );
            break;
          case 'RC4':
            result = CryptoJS.RC4.encrypt(
              inputText, 
              CryptoJS.enc.Utf8.parse(currentKey), 
              cryptoConfig
            );
            break;
          case 'RC4Drop':
            result = CryptoJS.RC4Drop.encrypt(
              inputText, 
              CryptoJS.enc.Utf8.parse(currentKey), 
              cryptoConfig
            );
            break;
          default:
            throw new Error('不支持的加密算法');
        }

        // 根据输出格式转换结果
        let outputResult = '';
        if (outputFormat === 'Base64') {
          outputResult = result.toString();
        } else if (outputFormat === 'Hex') {
          outputResult = result.ciphertext.toString(CryptoJS.enc.Hex);
        }

        setOutputText(outputResult);

        // 如果使用了自动生成，则更新状态
        if (autoGenerateKey) {
          setKey(currentKey);
        }
        if (autoGenerateIv) {
          setIv(currentIv);
        }
      } else {
        // 解密操作
        try {
          let decrypted;

          // 根据输入格式准备密文
          let ciphertext;
          if (outputFormat === 'Base64') {
            // 对于Base64格式，直接使用输入文本
            ciphertext = inputText;
          } else if (outputFormat === 'Hex') {
            // 对于Hex格式，需要创建CipherParams对象
            const cipherParams = CryptoJS.lib.CipherParams.create({
              ciphertext: CryptoJS.enc.Hex.parse(inputText)
            });
            ciphertext = cipherParams;
          }

          // 执行解密
          switch (algorithm) {
            case 'AES':
              decrypted = CryptoJS.AES.decrypt(
                ciphertext!, 
                CryptoJS.enc.Utf8.parse(currentKey), 
                cryptoConfig
              );
              break;
            case 'DES':
              decrypted = CryptoJS.DES.decrypt(
                ciphertext!, 
                CryptoJS.enc.Utf8.parse(currentKey), 
                cryptoConfig
              );
              break;
            case 'TripleDES':
              decrypted = CryptoJS.TripleDES.decrypt(
                ciphertext!, 
                CryptoJS.enc.Utf8.parse(currentKey), 
                cryptoConfig
              );
              break;
            case 'Rabbit':
              decrypted = CryptoJS.Rabbit.decrypt(
                ciphertext!, 
                CryptoJS.enc.Utf8.parse(currentKey), 
                cryptoConfig
              );
              break;
            case 'RC4':
              decrypted = CryptoJS.RC4.decrypt(
                ciphertext!, 
                CryptoJS.enc.Utf8.parse(currentKey), 
                cryptoConfig
              );
              break;
            case 'RC4Drop':
              decrypted = CryptoJS.RC4Drop.decrypt(
                ciphertext!, 
                CryptoJS.enc.Utf8.parse(currentKey), 
                cryptoConfig
              );
              break;
            default:
              throw new Error('不支持的解密算法');
          }

          // 将解密结果转换为UTF-8字符串
          resultString = decrypted.toString(CryptoJS.enc.Utf8);
          setOutputText(resultString);
        } catch (decryptError) {
          throw new Error('解密失败：请检查密钥、IV和加密文本是否正确');
        }
      }

      // 添加到历史记录
      const historyItem: CryptoHistoryItem = {
        id: Date.now().toString(),
        algorithm,
        mode,
        inputText,
        outputText: mode === 'encrypt' ? outputText : resultString,
        key: currentKey,
        iv: currentAlgoInfo.needsIV ? currentIv : undefined,
        timestamp: Date.now(),
        cipherMode,
        paddingMode,
        outputFormat
      };

      setHistory(prev => {
        // 保留最新的10条记录
        const updatedHistory = [historyItem, ...prev];
        if (updatedHistory.length > 10) {
          return updatedHistory.slice(0, 10);
        }
        return updatedHistory;
      });

    } catch (err) {
      setError((err as Error).message || '处理失败');
      setOutputText('');
    }
  }, [
    inputText, 
    key, 
    iv, 
    algorithm, 
    mode, 
    autoGenerateKey, 
    autoGenerateIv, 
    cipherMode, 
    paddingMode, 
    outputFormat, 
    generateRandomKey, 
    generateRandomIv
  ]);

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

  // 重置配置为默认值
  const resetConfig = useCallback(() => {
    setAlgorithm('AES');
    setMode('encrypt');
    setKey('');
    setIv('');
    setAutoGenerateKey(false);
    setAutoGenerateIv(false);
    setCipherMode('CBC');
    setPaddingMode('Pkcs7');
    setOutputFormat('Base64');
    setError(null);
  }, []);

  // 获取当前算法信息
  const getCurrentAlgorithmInfo = useCallback(() => {
    return algorithmInfo[algorithm];
  }, [algorithm]);

  // 从历史记录中加载配置
  const loadFromHistory = useCallback((item: CryptoHistoryItem) => {
    setAlgorithm(item.algorithm);
    setMode(item.mode);
    setKey(item.key);
    if (item.iv) setIv(item.iv);
    setCipherMode(item.cipherMode);
    setPaddingMode(item.paddingMode);
    setOutputFormat(item.outputFormat);
    setInputText(item.inputText);
    setOutputText(item.outputText);
    setError(null);
  }, []);

  // 导出当前配置
  const exportConfig = useCallback((): CryptoConfig => {
    return {
      algorithm,
      mode,
      key,
      iv,
      cipherMode,
      paddingMode,
      outputFormat
    };
  }, [algorithm, mode, key, iv, cipherMode, paddingMode, outputFormat]);

  // 导入配置
  const importConfig = useCallback((config: CryptoConfig) => {
    setAlgorithm(config.algorithm);
    setMode(config.mode);
    setKey(config.key);
    setIv(config.iv);
    setCipherMode(config.cipherMode);
    setPaddingMode(config.paddingMode);
    setOutputFormat(config.outputFormat);
  }, []);

  return {
    // 状态
    inputText,
    outputText,
    algorithm,
    mode,
    key,
    iv,
    autoGenerateKey,
    autoGenerateIv,
    cipherMode,
    paddingMode,
    outputFormat,
    history,
    error,
    algorithmInfo,
    
    // 状态更新函数
    setInputText,
    setOutputText,
    setAlgorithm,
    setMode,
    setKey,
    setIv,
    setAutoGenerateKey,
    setAutoGenerateIv,
    setCipherMode,
    setPaddingMode,
    setOutputFormat,
    
    // 操作函数
    processCrypto,
    clearHistory,
    clearAll,
    copyToClipboard,
    resetConfig,
    getCurrentAlgorithmInfo,
    loadFromHistory,
    exportConfig,
    importConfig,
    generateRandomKey,
    generateRandomIv
  };
};

export default useCryptoTool;
