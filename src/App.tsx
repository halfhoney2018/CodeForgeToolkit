import { useState, useEffect } from 'react';
import { Layout, Menu, Button, ConfigProvider } from '@arco-design/web-react';
import { 
  IconCalendar, IconCode, IconLock, IconIdcard, IconMessage 
} from '@arco-design/web-react/icon';
import './App.css';

// 导入身份证生成器组件
import IDGenerator from './popup/tabs/IDGenerator';

// 占位符组件 - 后面会实现具体功能
const TimestampConverter = () => <div className="module-container">时间戳转换功能开发中...</div>;
const StringEncoder = () => <div className="module-container">字符串编码功能开发中...</div>;
const CryptoTool = () => <div className="module-container">加密解密功能开发中...</div>;
const WebSocketTester = () => <div className="module-container">WebSocket测试功能开发中...</div>;

const { Sider, Content } = Layout;

/**
 * 应用主组件
 * @returns App组件
 */
function App() {
  // 控制当前标签页
  const [activeTab, setActiveTab] = useState('idgenerator');
  // 控制暗黑/亮色主题
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // 从 Chrome 存储加载用户偏好
  useEffect(() => {
    if (chrome?.storage?.local) {
      chrome.storage.local.get(['theme'], (result) => {
        if (result.theme) {
          setIsDarkMode(result.theme === 'dark');
        }
      });
    }
  }, []);
  
  // 保存主题偏好到 Chrome 存储
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (chrome?.storage?.local) {
      chrome.storage.local.set({ theme: newTheme ? 'dark' : 'light' });
    }
  };
  
  return (
    <ConfigProvider
      theme={{
        mode: isDarkMode ? 'dark' : 'light',
      }}
    >
      <Layout className="layout-container">
        <Sider
          collapsed={false}
          collapsible={false}
          width={220}
          className="layout-sider"
        >
          <div className="logo">
            <h2>CodeForge Toolkit</h2>
            <Button
              shape="circle"
              type="text"
              onClick={toggleTheme}
              className="theme-toggle"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </Button>
          </div>
          <Menu
            defaultSelectedKeys={['idgenerator']}
            selectedKeys={[activeTab]}
            style={{ width: '100%' }}
            onClickMenuItem={(key) => setActiveTab(key)}
          >
            <Menu.Item key="idgenerator">
              <IconIdcard style={{ fontSize: 18, marginRight: 6 }} />
              身份证生成器
            </Menu.Item>
            <Menu.Item key="timestamp">
              <IconCalendar style={{ fontSize: 18, marginRight: 6 }} />
              时间戳转换
            </Menu.Item>
            <Menu.Item key="encoder">
              <IconCode style={{ fontSize: 18, marginRight: 6 }} />
              字符串编码
            </Menu.Item>
            <Menu.Item key="crypto">
              <IconLock style={{ fontSize: 18, marginRight: 6 }} />
              加密解密
            </Menu.Item>
            <Menu.Item key="websocket">
              <IconMessage style={{ fontSize: 18, marginRight: 6 }} />
              WebSocket测试
            </Menu.Item>
          </Menu>
        </Sider>
        <Content className="layout-content">
          {activeTab === 'idgenerator' && <IDGenerator />}
          {activeTab === 'timestamp' && <TimestampConverter />}
          {activeTab === 'encoder' && <StringEncoder />}
          {activeTab === 'crypto' && <CryptoTool />}
          {activeTab === 'websocket' && <WebSocketTester />}
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
