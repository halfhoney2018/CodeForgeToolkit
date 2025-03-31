import React from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Empty
} from '@arco-design/web-react';
import {
  IconCommand,
  IconClockCircle
} from '@arco-design/web-react/icon';
import './SSHClient.css';

const { Title, Paragraph } = Typography;

/**
 * SSH客户端组件（开发中）
 */
const SSHClient: React.FC = () => {
  return (
    <div className="ssh-client-container">
      <Card>
        <Title heading={5}>
          <IconCommand style={{ marginRight: 8 }} />
          SSH客户端
        </Title>
        <Paragraph className="desc-text">
          通过WebSocket代理连接到SSH服务器，执行命令并查看输出
        </Paragraph>
        
        <div className="coming-soon-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          textAlign: 'center'
        }}>
          <Empty
            className="coming-soon-empty"
            icon={<IconClockCircle style={{ fontSize: 64, opacity: 0.6 }} />}
            description={
              <Space direction="vertical" size="large" align="center">
                <Title heading={4}>功能正在开发中</Title>
                <Paragraph>
                  SSH客户端功能正在积极开发中，敬请期待！
                </Paragraph>
                <Paragraph type="secondary" style={{ fontSize: 14 }}>
                  由于浏览器安全限制，完整的SSH功能需要配合WebSocket代理服务器实现，
                  我们正在努力为您提供最佳的解决方案。
                </Paragraph>
                <Button type="primary" disabled>
                  即将推出
                </Button>
              </Space>
            }
          />
        </div>
      </Card>
    </div>
  );
};

export default SSHClient;
