import React from 'react';
import { Radio, RadioGroupProps } from '@arco-design/web-react';

interface Algorithm {
  value: string;
  label: string;
  description?: string;
}

interface AlgorithmSelectorProps extends Omit<RadioGroupProps, 'options'> {
  algorithms: Algorithm[];
  value?: string;
  onChange?: (value: string) => void;
  type?: 'radio' | 'button';
  direction?: 'horizontal' | 'vertical';
}

/**
 * 加密算法选择器组件
 * @param algorithms 算法列表
 * @param value 选中的算法值
 * @param onChange 变更回调函数
 * @param type 选择器类型：单选框或按钮
 * @param direction 排列方向：水平或垂直
 * @returns 算法选择器组件
 */
const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  algorithms,
  value,
  onChange,
  type = 'radio',
  direction = 'horizontal',
  ...rest
}) => {
  const RadioGroup = Radio.Group;
  
  return (
    <RadioGroup
      direction={direction}
      type={type}
      value={value}
      onChange={onChange}
      {...rest}
    >
      {algorithms.map((algorithm) => (
        <Radio key={algorithm.value} value={algorithm.value}>
          {algorithm.label}
          {algorithm.description && (
            <span style={{ fontSize: '12px', color: 'var(--color-text-3)', marginLeft: '4px' }}>
              ({algorithm.description})
            </span>
          )}
        </Radio>
      ))}
    </RadioGroup>
  );
};

export default AlgorithmSelector;
