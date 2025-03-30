import { useState, useCallback, useEffect } from 'react';
import { Message } from '@arco-design/web-react';

// 定义正则表达式匹配项接口
export interface RegexMatch {
  index: number;
  text: string;
  groups: string[];
  start: number;
  end: number;
}

// 定义正则表达式标志接口
export interface RegexFlags {
  global: boolean;
  multiline: boolean;
  ignoreCase: boolean;
  sticky: boolean;
  unicode: boolean;
  dotAll: boolean;
}

// 定义正则表达式模板接口
export interface RegexTemplate {
  id: string;
  name: string;
  description: string;
  pattern: string;
  flags: RegexFlags;
  example: string;
  category: string;
}

// 定义历史记录项接口
export interface RegexHistoryItem {
  id: string;
  pattern: string;
  flags: RegexFlags;
  timestamp: number;
  testString?: string;
}

// 默认的正则表达式标志
const defaultFlags: RegexFlags = {
  global: true,
  multiline: false,
  ignoreCase: false,
  sticky: false,
  unicode: false,
  dotAll: false,
};

// 常用的正则表达式模板
const regexTemplates: RegexTemplate[] = [
  {
    id: 'email',
    name: '电子邮件',
    description: '匹配电子邮件地址',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: { ...defaultFlags },
    example: 'test@example.com',
    category: '常用验证',
  },
  {
    id: 'url',
    name: '网址URL',
    description: '匹配网址',
    pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
    flags: { ...defaultFlags },
    example: 'https://www.example.com',
    category: '常用验证',
  },
  {
    id: 'phone-cn',
    name: '中国手机号',
    description: '匹配中国大陆手机号',
    pattern: '1[3-9]\\d{9}',
    flags: { ...defaultFlags },
    example: '13812345678',
    category: '常用验证',
  },
  {
    id: 'date-iso',
    name: 'ISO日期',
    description: '匹配ISO 8601日期格式',
    pattern: '\\d{4}-\\d{2}-\\d{2}',
    flags: { ...defaultFlags },
    example: '2023-01-31',
    category: '日期时间',
  },
  {
    id: 'date-time',
    name: '日期时间',
    description: '匹配常见的日期时间格式',
    pattern: '\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}\\s\\d{1,2}:\\d{1,2}(?::\\d{1,2})?',
    flags: { ...defaultFlags },
    example: '2023-01-31 12:30:45',
    category: '日期时间',
  },
  {
    id: 'ipv4',
    name: 'IPv4地址',
    description: '匹配IPv4地址',
    pattern: '(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)',
    flags: { ...defaultFlags },
    example: '192.168.1.1',
    category: '网络',
  },
  {
    id: 'mac-address',
    name: 'MAC地址',
    description: '匹配MAC地址',
    pattern: '([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})',
    flags: { ...defaultFlags },
    example: '00:1B:44:11:3A:B7',
    category: '网络',
  },
  {
    id: 'password-strong',
    name: '强密码',
    description: '最少8位，包含大小写字母、数字和特殊字符',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    flags: { ...defaultFlags, global: false },
    example: 'Pass@word123',
    category: '安全',
  },
  {
    id: 'html-tag',
    name: 'HTML标签',
    description: '匹配HTML标签',
    pattern: '<([a-z]+)([^<]+)*(?:>(.*?)<\\/\\1>|\\s+\\/>)',
    flags: { ...defaultFlags },
    example: '<div class="container">内容</div>',
    category: '开发',
  },
  {
    id: 'css-color-hex',
    name: 'CSS十六进制颜色',
    description: '匹配CSS中的十六进制颜色值',
    pattern: '#(?:[0-9a-fA-F]{3}){1,2}',
    flags: { ...defaultFlags },
    example: '#FFF #123456',
    category: '开发',
  },
  {
    id: 'json-property',
    name: 'JSON属性',
    description: '匹配JSON中的属性名和值',
    pattern: '"([^"]+)":\\s*("[^"]*"|\\d+|true|false|null|\\{[^}]*\\}|\\[[^\\]]*\\])',
    flags: { ...defaultFlags },
    example: '"name": "John", "age": 30',
    category: '开发',
  },
  {
    id: 'id-card-cn',
    name: '中国身份证号',
    description: '匹配18位身份证号',
    pattern: '[1-9]\\d{5}(?:19|20)\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])\\d{3}[0-9Xx]',
    flags: { ...defaultFlags },
    example: '110101199001011234',
    category: '常用验证',
  },
  {
    id: 'zip-code-cn',
    name: '中国邮政编码',
    description: '匹配中国邮政编码',
    pattern: '[1-9]\\d{5}',
    flags: { ...defaultFlags },
    example: '100101',
    category: '常用验证',
  },
  {
    id: 'username',
    name: '用户名',
    description: '字母开头，允许5-16位字母、数字和下划线',
    pattern: '^[a-zA-Z][a-zA-Z0-9_]{4,15}$',
    flags: { ...defaultFlags, global: false },
    example: 'user_123',
    category: '常用验证',
  },
];

/**
 * 正则表达式工具自定义Hook
 */
const useRegexTool = () => {
  // 状态
  const [pattern, setPattern] = useState<string>('');
  const [flags, setFlags] = useState<RegexFlags>({ ...defaultFlags });
  const [testString, setTestString] = useState<string>('');
  const [matches, setMatches] = useState<RegexMatch[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [regexHistory, setRegexHistory] = useState<RegexHistoryItem[]>([]);
  const [highlightedText, setHighlightedText] = useState<string>('');
  const [templates] = useState<RegexTemplate[]>(regexTemplates);

  /**
   * 构建正则表达式对象
   */
  const buildRegex = useCallback((patternStr: string, flagsObj: RegexFlags): RegExp | null => {
    try {
      if (!patternStr) {
        setIsValid(true);
        setError(null);
        return null;
      }

      // 构建标志字符串
      let flagsStr = '';
      if (flagsObj.global) flagsStr += 'g';
      if (flagsObj.multiline) flagsStr += 'm';
      if (flagsObj.ignoreCase) flagsStr += 'i';
      if (flagsObj.sticky) flagsStr += 'y';
      if (flagsObj.unicode) flagsStr += 'u';
      if (flagsObj.dotAll) flagsStr += 's';

      // 创建正则表达式对象
      const regex = new RegExp(patternStr, flagsStr);
      setIsValid(true);
      setError(null);
      return regex;
    } catch (err: any) {
      setIsValid(false);
      setError(`正则表达式语法错误: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * 测试正则表达式
   */
  const testRegex = useCallback(() => {
    const regex = buildRegex(pattern, flags);
    if (!regex || !testString) {
      setMatches([]);
      setHighlightedText('');
      return;
    }

    // 重置标志，确保我们能获取所有匹配项
    const regexWithGlobal = flags.global 
      ? regex 
      : new RegExp(regex.source, regex.flags + 'g');
    
    const matchResults: RegexMatch[] = [];
    let match;
    
    while ((match = regexWithGlobal.exec(testString)) !== null) {
      // 避免无限循环
      if (match.index === regexWithGlobal.lastIndex) {
        regexWithGlobal.lastIndex++;
      }
      
      matchResults.push({
        index: matchResults.length,
        text: match[0],
        groups: match.slice(1),
        start: match.index,
        end: match.index + match[0].length
      });
      
      // 如果不是全局模式，只获取第一个匹配项
      if (!flags.global) break;
    }
    
    setMatches(matchResults);
    
    // 构建高亮文本
    if (matchResults.length > 0) {
      let result = '';
      let lastEnd = 0;
      
      matchResults.forEach(match => {
        // 添加匹配前的文本
        result += testString.substring(lastEnd, match.start);
        // 添加匹配的文本（带高亮标记）
        result += `<mark class="regex-match">${testString.substring(match.start, match.end)}</mark>`;
        lastEnd = match.end;
      });
      
      // 添加最后一个匹配之后的文本
      result += testString.substring(lastEnd);
      setHighlightedText(result);
    } else {
      setHighlightedText('');
    }
    
    // 添加到历史记录
    addToHistory();
    
  }, [pattern, flags, testString, buildRegex]);

  /**
   * 添加到历史记录
   */
  const addToHistory = useCallback(() => {
    if (!pattern) return;
    
    const historyItem: RegexHistoryItem = {
      id: Date.now().toString(),
      pattern,
      flags: { ...flags },
      timestamp: Date.now(),
      testString
    };
    
    setRegexHistory(prev => {
      // 检查是否已存在相同的模式和标志
      const exists = prev.some(item => 
        item.pattern === pattern && 
        Object.entries(item.flags).every(([key, value]) => 
          flags[key as keyof RegexFlags] === value
        )
      );
      
      if (exists) return prev;
      
      return [historyItem, ...prev.slice(0, 19)];
    });
  }, [pattern, flags, testString]);

  /**
   * 从历史记录加载
   */
  const loadFromHistory = useCallback((item: RegexHistoryItem) => {
    setPattern(item.pattern);
    setFlags(item.flags);
    if (item.testString) {
      setTestString(item.testString);
    }
    
    Message.success('已从历史记录加载');
  }, []);

  /**
   * 清空历史记录
   */
  const clearHistory = useCallback(() => {
    setRegexHistory([]);
    Message.success('历史记录已清空');
  }, []);

  /**
   * 从模板加载
   */
  const loadFromTemplate = useCallback((template: RegexTemplate) => {
    setPattern(template.pattern);
    setFlags(template.flags);
    setTestString(template.example);
    
    Message.success(`已加载"${template.name}"模板`);
  }, []);

  /**
   * 导出正则表达式
   */
  const exportRegex = useCallback((format: 'js' | 'python' | 'php' | 'csharp' | 'java') => {
    if (!pattern) {
      Message.error('请先输入正则表达式');
      return '';
    }
    
    // 构建标志字符串
    let flagsStr = '';
    if (flags.global) flagsStr += 'g';
    if (flags.multiline) flagsStr += 'm';
    if (flags.ignoreCase) flagsStr += 'i';
    if (flags.sticky) flagsStr += 'y';
    if (flags.unicode) flagsStr += 'u';
    if (flags.dotAll) flagsStr += 's';
    
    let code = '';
    
    switch (format) {
      case 'js':
        code = `const regex = /${pattern}/${flagsStr};`;
        break;
      case 'python':
        const pyFlags = [];
        if (flags.ignoreCase) pyFlags.push('re.IGNORECASE');
        if (flags.multiline) pyFlags.push('re.MULTILINE');
        if (flags.dotAll) pyFlags.push('re.DOTALL');
        
        const pyFlagsStr = pyFlags.length ? ', ' + pyFlags.join(' | ') : '';
        code = `import re\nregex = re.compile(r'${pattern}'${pyFlagsStr})`;
        break;
      case 'php':
        const phpFlags = [];
        if (flags.ignoreCase) phpFlags.push('i');
        if (flags.multiline) phpFlags.push('m');
        if (flags.dotAll) phpFlags.push('s');
        
        const phpFlagsStr = phpFlags.length ? phpFlags.join('') : '';
        code = `$regex = '/${pattern}/${phpFlagsStr}';`;
        break;
      case 'csharp':
        const csFlags = [];
        if (flags.ignoreCase) csFlags.push('RegexOptions.IgnoreCase');
        if (flags.multiline) csFlags.push('RegexOptions.Multiline');
        
        const csFlagsStr = csFlags.length ? ', ' + csFlags.join(' | ') : '';
        code = `using System.Text.RegularExpressions;\nRegex regex = new Regex(@"${pattern}"${csFlagsStr});`;
        break;
      case 'java':
        const javaFlags = [];
        if (flags.ignoreCase) javaFlags.push('Pattern.CASE_INSENSITIVE');
        if (flags.multiline) javaFlags.push('Pattern.MULTILINE');
        if (flags.dotAll) javaFlags.push('Pattern.DOTALL');
        
        const javaFlagsStr = javaFlags.length ? ', ' + javaFlags.join(' | ') : '';
        code = `import java.util.regex.Pattern;\nimport java.util.regex.Matcher;\n\nPattern pattern = Pattern.compile("${pattern}"${javaFlagsStr});`;
        break;
    }
    
    try {
      navigator.clipboard.writeText(code);
      Message.success(`已复制${format.toUpperCase()}代码到剪贴板`);
    } catch (err) {
      console.error('复制失败', err);
    }
    
    return code;
  }, [pattern, flags]);

  /**
   * 分享正则表达式（生成URL）
   */
  const shareRegex = useCallback(() => {
    if (!pattern) {
      Message.error('请先输入正则表达式');
      return '';
    }
    
    try {
      // 构建包含当前正则表达式的URL参数
      const queryParams = new URLSearchParams();
      queryParams.set('pattern', pattern);
      
      // 添加标志
      Object.entries(flags).forEach(([key, value]) => {
        if (value) {
          queryParams.set(`flag_${key}`, 'true');
        }
      });
      
      // 如果有测试字符串，也添加
      if (testString) {
        queryParams.set('test', testString);
      }
      
      const shareUrl = `${window.location.origin}${window.location.pathname}?${queryParams.toString()}#regexTool`;
      
      // 复制到剪贴板
      navigator.clipboard.writeText(shareUrl);
      Message.success('已复制分享链接到剪贴板');
      
      return shareUrl;
    } catch (err) {
      console.error('分享链接生成失败', err);
      Message.error('分享链接生成失败');
      return '';
    }
  }, [pattern, flags, testString]);

  /**
   * 从URL参数加载
   */
  const loadFromUrl = useCallback((url: string) => {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      
      // 获取模式
      const patternFromUrl = params.get('pattern');
      if (patternFromUrl) {
        setPattern(patternFromUrl);
      }
      
      // 获取标志
      const newFlags = { ...defaultFlags };
      Object.keys(newFlags).forEach(key => {
        const flagValue = params.get(`flag_${key}`);
        if (flagValue === 'true') {
          newFlags[key as keyof RegexFlags] = true;
        } else if (flagValue === 'false') {
          newFlags[key as keyof RegexFlags] = false;
        }
      });
      setFlags(newFlags);
      
      // 获取测试字符串
      const testStringFromUrl = params.get('test');
      if (testStringFromUrl) {
        setTestString(testStringFromUrl);
      }
      
      return true;
    } catch (err) {
      console.error('从URL加载失败', err);
      Message.error('无效的分享链接');
      return false;
    }
  }, []);

  /**
   * 获取指定标志的正则表达式语法解释
   */
  const getRegexInfo = useCallback((patternText: string): string => {
    if (!patternText) return '';
    
    // 简单的正则表达式语法说明
    const syntaxInfo: { [key: string]: string } = {
      '^': '匹配输入的开始',
      '$': '匹配输入的结束',
      '.': '匹配除换行符外的任何单个字符',
      '|': '匹配"|"前或后的表达式',
      '\\d': '匹配数字',
      '\\D': '匹配非数字',
      '\\w': '匹配字母、数字或下划线',
      '\\W': '匹配非字母、数字、下划线',
      '\\s': '匹配空白字符',
      '\\S': '匹配非空白字符',
      '[abc]': '匹配方括号内的任意字符',
      '[^abc]': '匹配除方括号内字符外的任意字符',
      '\\b': '匹配单词边界',
      '\\B': '匹配非单词边界',
      '*': '匹配前面的表达式0次或多次',
      '+': '匹配前面的表达式1次或多次',
      '?': '匹配前面的表达式0次或1次',
      '{n}': '匹配前面的表达式恰好n次',
      '{n,}': '匹配前面的表达式至少n次',
      '{n,m}': '匹配前面的表达式n到m次',
      '(x)': '捕获组，匹配x并记住匹配项',
      '(?:x)': '非捕获组，匹配x但不记住匹配项',
      '(?=x)': '正向先行断言，匹配后面是x的位置',
      '(?!x)': '负向先行断言，匹配后面不是x的位置',
      '(?<=x)': '正向后行断言，匹配前面是x的位置',
      '(?<!x)': '负向后行断言，匹配前面不是x的位置',
    };
    
    // 标志说明
    const flagsInfo: { [key: string]: string } = {
      'g': '全局匹配，查找所有匹配项',
      'i': '忽略大小写',
      'm': '多行匹配，使"^"和"$"匹配每一行的开头和结尾',
      's': '点号匹配所有字符，包括换行符',
      'u': 'Unicode模式，处理Unicode代码点',
      'y': '粘性匹配，从lastIndex位置开始匹配',
    };
    
    // 解析模式中的特殊字符
    let explanation = '';
    for (const [pattern, description] of Object.entries(syntaxInfo)) {
      if (patternText.includes(pattern)) {
        explanation += `${pattern}: ${description}\n`;
      }
    }
    
    // 添加标志说明
    let flagsExplanation = '当前标志:\n';
    let hasFlagInfo = false;
    
    for (const [flag, isActive] of Object.entries(flags)) {
      if (isActive) {
        const flagChar = flag.charAt(0); // 获取标志的第一个字符
        if (flagsInfo[flagChar]) {
          flagsExplanation += `${flagChar}: ${flagsInfo[flagChar]}\n`;
          hasFlagInfo = true;
        }
      }
    }
    
    return explanation + (hasFlagInfo ? flagsExplanation : '');
  }, [flags]);

  // 检测URL参数并加载
  useEffect(() => {
    if (window.location.hash === '#regexTool' && window.location.search) {
      loadFromUrl(window.location.href);
    }
  }, [loadFromUrl]);

  return {
    pattern,
    setPattern,
    flags,
    setFlags,
    testString,
    setTestString,
    matches,
    isValid,
    error,
    highlightedText,
    regexHistory,
    templates,
    testRegex,
    loadFromHistory,
    clearHistory,
    loadFromTemplate,
    exportRegex,
    shareRegex,
    loadFromUrl,
    getRegexInfo
  };
};

export default useRegexTool;
