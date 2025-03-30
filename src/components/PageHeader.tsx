import React from 'react';
import { Typography } from '@arco-design/web-react';
import DateTime from './DateTime';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
}

/**
 * 页面标题组件
 * 展示页面标题和当前日期时间
 */
const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  return (
    <div className="page-header">
      <DateTime />
      <Title heading={4}>{title}</Title>
    </div>
  );
};

export default PageHeader;
