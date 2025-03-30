import { FC, ReactNode } from 'react';
import { Tooltip, Message } from '@arco-design/web-react';

export interface SafeCopyProps {
  content: string;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  children: ReactNode;
}

/**
 * 安全复制组件，提供复制功能和视觉反馈
 */
const SafeCopy: FC<SafeCopyProps> = ({ content, placement = 'top', children }) => {
  const handleCopy = () => {
    try {
      // 使用 Clipboard API 复制内容
      navigator.clipboard.writeText(content).then(
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
    <Tooltip content="复制到剪贴板" position={placement}>
      <span onClick={handleCopy} style={{ cursor: 'pointer' }}>
        {children}
      </span>
    </Tooltip>
  );
};

export default SafeCopy;
