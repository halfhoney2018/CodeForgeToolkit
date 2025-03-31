import { useState, useCallback } from 'react';

export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilarCharacters: boolean;
  excludeAmbiguous: boolean;
  avoidSequential: boolean;
  avoidRepeating: boolean;
  customCharacters?: string;
}

export interface GeneratedPassword {
  password: string;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  entropy: number;
  timestamp: number;
}

export interface PasswordHistory {
  id: string;
  password: string;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  entropy: number;
  timestamp: number;
  options: PasswordOptions;
}

const DEFAULT_OPTIONS: PasswordOptions = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeSimilarCharacters: false,
  excludeAmbiguous: false,
  avoidSequential: false,
  avoidRepeating: false,
};

// 字符集定义
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~';
const SIMILAR_CHARS = 'il1Lo0O';
const AMBIGUOUS_CHARS = '{}[]()/\\\'"`~,;:.<>';

// 顺序字符模式
const SEQUENTIAL_PATTERNS = [
  'abcdefghijklmnopqrstuvwxyz',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '0123456789',
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
  'QWERTYUIOP',
  'ASDFGHJKL',
  'ZXCVBNM',
];

/**
 * 密码生成器Hook
 */
const usePasswordGenerator = () => {
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS);
  const [generatedPassword, setGeneratedPassword] = useState<GeneratedPassword | null>(null);
  const [history, setHistory] = useState<PasswordHistory[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * 生成随机密码
   */
  const generatePassword = useCallback(() => {
    setLoading(true);
    
    try {
      // 构建字符集
      let charset = '';
      
      if (options.includeLowercase) {
        charset += LOWERCASE_CHARS;
      }
      
      if (options.includeUppercase) {
        charset += UPPERCASE_CHARS;
      }
      
      if (options.includeNumbers) {
        charset += NUMBER_CHARS;
      }
      
      if (options.includeSymbols) {
        charset += SYMBOL_CHARS;
      }
      
      // 处理自定义字符集
      if (options.customCharacters && options.customCharacters.length > 0) {
        charset = options.customCharacters;
      }
      
      // 排除相似字符
      if (options.excludeSimilarCharacters) {
        for (const char of SIMILAR_CHARS) {
          charset = charset.replace(new RegExp(char, 'g'), '');
        }
      }
      
      // 排除歧义字符
      if (options.excludeAmbiguous) {
        for (const char of AMBIGUOUS_CHARS) {
          charset = charset.replace(new RegExp('\\' + char, 'g'), '');
        }
      }
      
      // 确保字符集不为空
      if (charset.length === 0) {
        throw new Error('字符集为空，请选择至少一种字符类型');
      }
      
      // 生成密码
      let password = '';
      let isValid = false;
      
      // 最多尝试100次生成有效密码
      let attempts = 0;
      while (!isValid && attempts < 100) {
        password = '';
        for (let i = 0; i < options.length; i++) {
          const randomIndex = Math.floor(Math.random() * charset.length);
          password += charset[randomIndex];
        }
        
        // 验证密码是否符合要求
        isValid = validatePassword(password);
        attempts++;
      }
      
      if (!isValid) {
        throw new Error('无法生成符合所有条件的密码，请尝试放宽限制');
      }
      
      // 计算密码强度和熵
      const strength = calculatePasswordStrength(password);
      const entropy = calculateEntropy(password);
      
      const newPassword: GeneratedPassword = {
        password,
        strength,
        entropy,
        timestamp: Date.now(),
      };
      
      setGeneratedPassword(newPassword);
      
      // 添加到历史记录
      const passwordHistory: PasswordHistory = {
        id: generateId(),
        ...newPassword,
        options: { ...options },
      };
      
      setHistory(prev => [passwordHistory, ...prev].slice(0, 20)); // 保留最近20条记录
      
      return newPassword;
    } catch (error) {
      console.error('密码生成错误:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);
  
  /**
   * 验证密码是否符合要求
   */
  const validatePassword = useCallback((password: string): boolean => {
    // 检查是否包含所需字符类型
    if (options.includeLowercase && !/[a-z]/.test(password)) {
      return false;
    }
    
    if (options.includeUppercase && !/[A-Z]/.test(password)) {
      return false;
    }
    
    if (options.includeNumbers && !/[0-9]/.test(password)) {
      return false;
    }
    
    if (options.includeSymbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/~]/.test(password)) {
      return false;
    }
    
    // 检查是否避免连续字符
    if (options.avoidSequential) {
      for (const pattern of SEQUENTIAL_PATTERNS) {
        for (let i = 0; i < pattern.length - 2; i++) {
          const seq = pattern.substring(i, i + 3);
          if (password.includes(seq)) {
            return false;
          }
        }
      }
    }
    
    // 检查是否避免重复字符
    if (options.avoidRepeating) {
      for (let i = 0; i < password.length - 2; i++) {
        if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
          return false;
        }
      }
    }
    
    return true;
  }, [options]);
  
  /**
   * 计算密码强度
   */
  const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' | 'very-strong' => {
    const length = password.length;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);
    
    const charTypes = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
    
    if (length < 8) {
      return 'weak';
    } else if (length < 12) {
      return charTypes >= 3 ? 'medium' : 'weak';
    } else if (length < 16) {
      return charTypes >= 3 ? 'strong' : 'medium';
    } else {
      return charTypes >= 3 ? 'very-strong' : 'strong';
    }
  };
  
  /**
   * 计算密码熵（信息熵）
   */
  const calculateEntropy = (password: string): number => {
    let charset = 0;
    
    if (/[a-z]/.test(password)) charset += 26;
    if (/[A-Z]/.test(password)) charset += 26;
    if (/[0-9]/.test(password)) charset += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charset += 33;
    
    return Math.round(Math.log2(Math.pow(charset, password.length)));
  };
  
  /**
   * 生成唯一ID
   */
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  /**
   * 更新选项
   */
  const updateOptions = useCallback((newOptions: Partial<PasswordOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);
  
  /**
   * 重置选项为默认值
   */
  const resetOptions = useCallback(() => {
    setOptions(DEFAULT_OPTIONS);
  }, []);
  
  /**
   * 清空历史记录
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);
  
  /**
   * 从历史记录中重新生成密码
   */
  const regenerateFromHistory = useCallback((id: string) => {
    const historyItem = history.find(item => item.id === id);
    if (historyItem) {
      setOptions(historyItem.options);
      generatePassword();
    }
  }, [history, generatePassword]);
  
  return {
    options,
    generatedPassword,
    history,
    loading,
    generatePassword,
    updateOptions,
    resetOptions,
    clearHistory,
    regenerateFromHistory,
  };
};

export default usePasswordGenerator;
