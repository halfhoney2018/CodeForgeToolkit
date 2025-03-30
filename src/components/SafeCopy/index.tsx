import React from 'react';
import { Button, Message, Tooltip } from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';

interface SafeCopyProps {
  text: string;
  tip?: string;
  size?: 'mini' | 'small' | 'default' | 'large';
  className?: string;
}

/**
 * 安全复制组件 - 带成功提示的复制按钮
 * @param text 要复制的文本
 * @param tip 提示文本
 * @param size 按钮大小
 * @param className 自定义类名
 * @returns 复制按钮组件
 */
const SafeCopy: React.FC<SafeCopyProps> = ({
  text,
  tip = '复制',
  size = 'small',
  className = '',
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      Message.success('复制成功');
    } catch (err) {
      Message.error('复制失败，请手动选择并复制');
      console.error('复制失败:', err);
    }
  };

  return (
    <Tooltip content={tip}>
      <Button
        type="text"
        size={size}
        icon={<IconCopy />}
        onClick={handleCopy}
        className={className}
      />
    </Tooltip>
  );
};

export default SafeCopy;
