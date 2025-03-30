/**
 * React 19 兼容层 - 解决第三方组件库中ref处理方式的兼容性问题
 * 
 * 在 React 19 中，element.ref 访问方式被移除，ref 现在是一个常规 prop
 * 这个兼容层提供了警告抑制方法，用于解决Arco Design组件库中的ref警告
 */

/**
 * 全局修复函数 - 抑制React 19中关于ref的警告消息
 * 
 * 此函数通过重写console.error方法，过滤掉特定的ref相关警告
 * "IDGenerator.tsx:179 Accessing element.ref was removed in React 19. ref is now a regular prop."
 */
export const fixReact19RefWarning = (): void => {
  // 保存原始的console.error方法
  const originalConsoleError = console.error;
  
  // 重写console.error，过滤掉React 19中关于ref的警告
  console.error = function(...args: any[]): void {
    // 检查是否是React 19中关于ref的警告
    if (
      args.length > 0 && 
      typeof args[0] === 'string' && 
      (
        args[0].includes('Accessing element.ref was removed in React 19') ||
        args[0].includes('ref is now a regular prop')
      )
    ) {
      // 抑制这些特定的警告
      return;
    }
    
    // 对于其他错误，使用原始的console.error方法
    originalConsoleError.apply(console, args);
  };
  
  // 输出日志，表明已应用兼容性修复
  console.log('React 19 ref warning suppression applied');
};
