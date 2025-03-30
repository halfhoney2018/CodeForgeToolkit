import { FC, ReactNode } from 'react';
import { Tooltip, Message } from '@arco-design/web-react';

export interface SafeCopyProps {
  text: string;
  tip?: string;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  children?: ReactNode;
}

/**
 * 安全复制组件，提供复制功能和视觉反馈
 */
const SafeCopy: FC<SafeCopyProps> = ({ 
  text, 
  tip = '复制到剪贴板', 
  placement = 'top', 
  className = '',
  children 
}) => {
  const handleCopy = () => {
    try {
      // 使用 Clipboard API 复制内容
      navigator.clipboard.writeText(text).then(
        () => {
          Message.success('已复制到剪贴板');
        },
        (err) => {
          console.error('复制失败:', err);
          Message.error('复制失败');
        }
      );
    } catch (error) {
      console.error('复制功能不受支持:', error);
      Message.error('复制功能不受支持');
    }
  };

  return (
    <Tooltip content={tip} position={placement}>
      <span onClick={handleCopy} style={{ cursor: 'pointer' }} className={className}>
        {children || (
          <i className="icon-copy" style={{ marginLeft: 4 }}>
            📋
          </i>
        )}
      </span>
    </Tooltip>
  );
};

export default SafeCopy;
