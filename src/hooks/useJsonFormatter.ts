import { useState, useCallback } from 'react';
import { Message } from '@arco-design/web-react';

// 定义JSON操作的类型
export type JsonOperation = 'format' | 'minify' | 'validate' | 'repair';

// 定义JSON格式化配置
export interface FormatConfig {
  indentSize: number;
  sortKeys: boolean;
  escapeUnicode: boolean;
}

// 定义JSON历史记录项
export interface JsonHistoryItem {
  id: string;
  content: string;
  type: JsonOperation;
  timestamp: number;
  name?: string;
}

/**
 * JSON格式化工具自定义Hook
 */
const useJsonFormatter = () => {
  // 状态
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [formatConfig, setFormatConfig] = useState<FormatConfig>({
    indentSize: 2,
    sortKeys: false,
    escapeUnicode: false,
  });
  const [jsonHistory, setJsonHistory] = useState<JsonHistoryItem[]>([]);
  const [savedSnippets, setSavedSnippets] = useState<JsonHistoryItem[]>([]);

  /**
   * 验证JSON字符串
   */
  const validateJson = useCallback((jsonString: string): boolean => {
    try {
      if (!jsonString.trim()) {
        setJsonError('JSON不能为空');
        return false;
      }
      
      JSON.parse(jsonString);
      setJsonError(null);
      return true;
    } catch (err: any) {
      setJsonError(`JSON验证失败: ${err.message}`);
      return false;
    }
  }, []);

  /**
   * Unicode转义处理
   */
  const escapeUnicodeReplacer = useCallback((_key: string, value: any): any => {
    if (typeof value === 'string') {
      return value.replace(/[^\x00-\x7F]/g, char => {
        const hex = char.charCodeAt(0).toString(16);
        return '\\u' + '0000'.substring(0, 4 - hex.length) + hex;
      });
    }
    return value;
  }, []);

  /**
   * 对象递归排序键
   */
  const sortJsonKeys = useCallback((obj: any): any => {
    // 如果不是对象或为null，直接返回
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    // 如果是数组，则递归排序每个元素
    if (Array.isArray(obj)) {
      return obj.map(item => sortJsonKeys(item));
    }
    
    // 如果是对象，则获取所有键并排序
    const keys = Object.keys(obj).sort();
    const sorted: Record<string, any> = {};
    
    // 按排序后的键创建新对象
    for (const k of keys) {
      sorted[k] = sortJsonKeys(obj[k]);
    }
    
    return sorted;
  }, []);

  /**
   * 添加到历史记录
   */
  const addToHistory = useCallback((content: string, type: JsonOperation) => {
    const historyItem: JsonHistoryItem = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: Date.now()
    };
    
    setJsonHistory(prev => [historyItem, ...prev.slice(0, 19)]);
  }, []);

  /**
   * 格式化JSON字符串
   */
  const formatJson = useCallback((jsonString: string, config: FormatConfig = formatConfig): string => {
    try {
      if (!validateJson(jsonString)) {
        return jsonString;
      }

      const parsed = JSON.parse(jsonString);
      
      // 处理键排序
      let result = parsed;
      if (config.sortKeys) {
        result = sortJsonKeys(parsed);
      }
      
      // 转换为格式化后的字符串
      const formatted = JSON.stringify(
        result,
        config.escapeUnicode ? escapeUnicodeReplacer : undefined,
        config.indentSize
      );
      
      // 添加到历史记录
      addToHistory(jsonString, 'format');
      
      return formatted;
    } catch (err: any) {
      setJsonError(`格式化失败: ${err.message}`);
      return jsonString;
    }
  }, [formatConfig, validateJson, sortJsonKeys, escapeUnicodeReplacer, addToHistory]);

  /**
   * 压缩JSON字符串
   */
  const minifyJson = useCallback((jsonString: string): string => {
    try {
      if (!validateJson(jsonString)) {
        return jsonString;
      }

      const parsed = JSON.parse(jsonString);
      const minified = JSON.stringify(parsed);
      
      // 添加到历史记录
      addToHistory(jsonString, 'minify');
      
      return minified;
    } catch (err: any) {
      setJsonError(`压缩失败: ${err.message}`);
      return jsonString;
    }
  }, [validateJson, addToHistory]);

  /**
   * 修复常见的JSON错误
   */
  const repairJson = useCallback((jsonString: string): string => {
    try {
      // 尝试修复常见的JSON格式错误
      
      // 1. 修复单引号替换为双引号
      let repairedJson = jsonString.replace(/'/g, '"');
      
      // 2. 修复缺少引号的键名
      repairedJson = repairedJson.replace(/(\{|\,)\s*(\w+)\s*\:/g, '$1"$2":');
      
      // 3. 修复结尾多余的逗号
      repairedJson = repairedJson.replace(/,(\s*[\}\]])/g, '$1');
      
      // 4. 修复布尔值和null值格式
      repairedJson = repairedJson
        .replace(/:\s*True\s*(,|}|])/gi, ':true$1')
        .replace(/:\s*False\s*(,|}|])/gi, ':false$1')
        .replace(/:\s*None\s*(,|}|])/gi, ':null$1')
        .replace(/:\s*Null\s*(,|}|])/gi, ':null$1');
      
      // 验证修复后的JSON
      try {
        JSON.parse(repairedJson);
        setJsonError(null);
        
        // 添加到历史记录
        addToHistory(jsonString, 'repair');
        
        return repairedJson;
      } catch (err) {
        // 如果修复后仍然不是有效的JSON，则返回原始输入
        setJsonError('修复后仍有语法错误，可能需要手动调整');
        return jsonString;
      }
    } catch (err: any) {
      setJsonError(`修复尝试失败: ${err.message}`);
      return jsonString;
    }
  }, [addToHistory]);

  /**
   * 保存JSON代码片段
   */
  const saveJsonSnippet = useCallback((content: string, name: string = '') => {
    try {
      const snippetName = name.trim() || `Snippet ${savedSnippets.length + 1}`;
      
      const snippet: JsonHistoryItem = {
        id: Date.now().toString(),
        content,
        type: 'format',
        timestamp: Date.now(),
        name: snippetName
      };
      
      setSavedSnippets(prev => [...prev, snippet]);
      Message.success('JSON代码片段已保存');
      return true;
    } catch (err: any) {
      setJsonError(`保存代码片段失败: ${err.message}`);
      Message.error('保存代码片段失败');
      return false;
    }
  }, [savedSnippets]);

  /**
   * 删除保存的代码片段
   */
  const deleteJsonSnippet = useCallback((id: string) => {
    setSavedSnippets(prev => prev.filter(snippet => snippet.id !== id));
    Message.success('代码片段已删除');
  }, []);

  /**
   * 从代码片段加载
   */
  const loadFromSnippet = useCallback((snippet: JsonHistoryItem) => {
    setJsonInput(snippet.content);
    setJsonOutput(formatJson(snippet.content));
    Message.success('已加载代码片段');
  }, [formatJson]);

  /**
   * 从历史记录加载
   */
  const loadFromHistory = useCallback((historyItem: JsonHistoryItem) => {
    setJsonInput(historyItem.content);
    setJsonOutput(formatJson(historyItem.content));
    Message.success('已从历史记录加载');
  }, [formatJson]);

  /**
   * 清空历史记录
   */
  const clearHistory = useCallback(() => {
    setJsonHistory([]);
    Message.success('历史记录已清空');
  }, []);

  /**
   * 导出所有保存的代码片段
   */
  const exportSnippets = useCallback(() => {
    try {
      const snippetsData = JSON.stringify(savedSnippets);
      const blob = new Blob([snippetsData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `json-snippets-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      Message.success('代码片段已导出');
      return true;
    } catch (err: any) {
      setJsonError(`导出代码片段失败: ${err.message}`);
      Message.error('导出失败');
      return false;
    }
  }, [savedSnippets]);

  /**
   * 导入代码片段
   */
  const importSnippets = useCallback((jsonData: string) => {
    try {
      const importedSnippets = JSON.parse(jsonData) as JsonHistoryItem[];
      
      if (!Array.isArray(importedSnippets)) {
        throw new Error('无效的代码片段数据');
      }
      
      setSavedSnippets(prev => [...prev, ...importedSnippets]);
      Message.success(`成功导入 ${importedSnippets.length} 个代码片段`);
      return true;
    } catch (err: any) {
      setJsonError(`导入代码片段失败: ${err.message}`);
      Message.error('导入失败');
      return false;
    }
  }, []);

  /**
   * 更新格式化配置
   */
  const updateFormatConfig = useCallback((config: Partial<FormatConfig>) => {
    setFormatConfig(prev => ({
      ...prev,
      ...config
    }));
  }, []);

  // 返回所有功能
  return {
    jsonInput,
    setJsonInput,
    jsonOutput,
    setJsonOutput,
    jsonError,
    formatConfig,
    updateFormatConfig,
    validateJson,
    formatJson,
    minifyJson,
    repairJson,
    jsonHistory,
    savedSnippets,
    saveJsonSnippet,
    deleteJsonSnippet,
    loadFromSnippet,
    loadFromHistory,
    clearHistory,
    exportSnippets,
    importSnippets
  };
};

export default useJsonFormatter;
