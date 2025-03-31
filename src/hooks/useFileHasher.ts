import { useState, useCallback } from 'react';
import CryptoJS from 'crypto-js';

export type HashAlgorithm = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512';

export interface HashResult {
  fileName: string;
  fileSize: number;
  algorithm: HashAlgorithm;
  hash: string;
  timeElapsed: number;
}

export interface FileHasherState {
  isCalculating: boolean;
  results: HashResult[];
  error: string | null;
  progress: {
    current: number;
    total: number;
    percentage: number;
    currentFile: string;
    currentAlgorithm: HashAlgorithm | null;
    currentChunk: number;
    totalChunks: number;
  };
}

/**
 * 文件哈希计算Hook
 */
const useFileHasher = () => {
  const [state, setState] = useState<FileHasherState>({
    isCalculating: false,
    results: [],
    error: null,
    progress: {
      current: 0,
      total: 0,
      percentage: 0,
      currentFile: '',
      currentAlgorithm: null,
      currentChunk: 0,
      totalChunks: 0
    }
  });

  /**
   * 分块计算文件哈希值
   * @param file 文件对象
   * @param algorithm 哈希算法
   */
  const calculateHash = useCallback(async (file: File, algorithm: HashAlgorithm): Promise<HashResult> => {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      // 更新当前处理的文件和算法
      setState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          currentFile: file.name,
          currentAlgorithm: algorithm,
          currentChunk: 0,
          totalChunks: 0
        }
      }));
      
      // 分块大小：2MB
      const chunkSize = 2 * 1024 * 1024;
      const chunks = Math.ceil(file.size / chunkSize);
      const spark = getHasher(algorithm);
      
      setState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          totalChunks: chunks
        }
      }));
      
      let currentChunk = 0;
      
      const processChunk = (start: number) => {
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
          if (!e.target || !e.target.result) {
            reject(new Error('文件读取失败'));
            return;
          }
          
          try {
            // 更新当前处理的块
            currentChunk++;
            setState(prev => ({
              ...prev,
              progress: {
                ...prev.progress,
                currentChunk
              }
            }));
            
            // 将当前块添加到哈希计算中
            const wordArray = CryptoJS.lib.WordArray.create(e.target.result as ArrayBuffer);
            spark.update(wordArray);
            
            // 如果还有更多块，继续处理
            if (end < file.size) {
              processChunk(end);
            } else {
              // 所有块处理完成，获取最终哈希值
              const hash = spark.finalize().toString();
              const endTime = performance.now();
              
              resolve({
                fileName: file.name,
                fileSize: file.size,
                algorithm,
                hash,
                timeElapsed: endTime - startTime
              });
            }
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => {
          reject(new Error('文件读取错误'));
        };
        
        reader.readAsArrayBuffer(chunk);
      };
      
      // 开始处理第一个块
      processChunk(0);
    });
  }, []);
  
  /**
   * 获取对应算法的哈希计算器
   * @param algorithm 哈希算法
   */
  const getHasher = (algorithm: HashAlgorithm) => {
    switch (algorithm) {
      case 'MD5':
        return CryptoJS.algo.MD5.create();
      case 'SHA1':
        return CryptoJS.algo.SHA1.create();
      case 'SHA256':
        return CryptoJS.algo.SHA256.create();
      case 'SHA512':
        return CryptoJS.algo.SHA512.create();
      default:
        throw new Error('不支持的哈希算法');
    }
  };

  /**
   * 处理文件哈希计算
   * @param files 文件列表
   * @param algorithms 要计算的哈希算法列表
   */
  const processFiles = useCallback(async (files: File[], algorithms: HashAlgorithm[]) => {
    if (files.length === 0 || algorithms.length === 0) {
      setState(prev => ({
        ...prev,
        error: '请选择文件和至少一种哈希算法'
      }));
      return;
    }
    
    // 计算总任务数：文件数 × 算法数
    const totalTasks = files.length * algorithms.length;
    
    setState(prev => ({
      ...prev,
      isCalculating: true,
      error: null,
      progress: {
        current: 0,
        total: totalTasks,
        percentage: 0,
        currentFile: '',
        currentAlgorithm: null,
        currentChunk: 0,
        totalChunks: 0
      }
    }));
    
    try {
      const results: HashResult[] = [];
      let completedTasks = 0;
      
      // 为每个文件计算所有选定的哈希算法
      for (const file of files) {
        for (const algorithm of algorithms) {
          const result = await calculateHash(file, algorithm);
          results.push(result);
          
          // 更新进度
          completedTasks++;
          setState(prev => ({
            ...prev,
            progress: {
              ...prev.progress,
              current: completedTasks,
              percentage: Math.round((completedTasks / totalTasks) * 100)
            }
          }));
        }
      }
      
      setState(prev => ({
        ...prev,
        isCalculating: false,
        results: [...results, ...prev.results],
        progress: {
          current: totalTasks,
          total: totalTasks,
          percentage: 100,
          currentFile: '',
          currentAlgorithm: null,
          currentChunk: 0,
          totalChunks: 0
        }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isCalculating: false,
        error: error instanceof Error ? error.message : '计算哈希时发生错误'
      }));
    }
  }, [calculateHash]);

  /**
   * 清除所有结果
   */
  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      results: [],
      error: null,
      progress: {
        current: 0,
        total: 0,
        percentage: 0,
        currentFile: '',
        currentAlgorithm: null,
        currentChunk: 0,
        totalChunks: 0
      }
    }));
  }, []);

  /**
   * 删除单个结果
   * @param index 结果索引
   */
  const removeResult = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      results: prev.results.filter((_, i) => i !== index)
    }));
  }, []);

  /**
   * 验证哈希值
   * @param hash 要验证的哈希值
   * @param resultIndex 结果索引
   */
  const verifyHash = useCallback((hash: string, resultIndex: number): boolean => {
    if (resultIndex < 0 || resultIndex >= state.results.length) {
      return false;
    }
    
    return state.results[resultIndex].hash.toLowerCase() === hash.toLowerCase();
  }, [state.results]);

  return {
    state,
    processFiles,
    clearResults,
    removeResult,
    verifyHash
  };
};

export default useFileHasher;
