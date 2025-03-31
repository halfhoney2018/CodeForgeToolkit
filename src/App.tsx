import { useState, useEffect } from 'react';
import { Layout, Menu, Button, ConfigProvider } from '@arco-design/web-react';
import { 
  IconCalendar, IconCode, IconLock, IconIdcard, IconMessage, IconUserAdd, IconImage, IconPalette, IconCode as IconJson,
  IconQrcode, IconSearch, IconSwap, IconEdit, IconSubscribe, IconScan, IconCommand, IconDesktop, IconFile
} from '@arco-design/web-react/icon';
import './App.css';

// 导入功能组件
import IDGenerator from './popup/tabs/IDGenerator';
import TimestampConverter from './popup/tabs/TimestampConverter';
import StringEncoder from './popup/tabs/StringEncoder';
import CryptoTool from './popup/tabs/CryptoTool';
import WebSocketTester from './popup/tabs/WebSocketTester';
import RandomGenerator from './popup/tabs/RandomGenerator';
import ImageConverter from './popup/tabs/ImageConverter';
import ColorTool from './popup/tabs/ColorTool';
import JsonFormatter from './popup/tabs/JsonFormatter';
import QRCodeTool from './popup/tabs/QRCodeTool';
import RegexTool from './popup/tabs/RegexTool';
import UnitConverter from './popup/tabs/UnitConverter';
import ImageProcessor from './popup/tabs/ImageProcessor';
import FaviconGenerator from './popup/tabs/FaviconGenerator';
import IDCardParser from './popup/tabs/IDCardParser';
import PasswordGenerator from './popup/tabs/PasswordGenerator';
import SSHClient from './popup/tabs/SSHClient';
import ResponsivePreview from './popup/tabs/ResponsivePreview';
import FileHasher from './popup/tabs/FileHasher';

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
            {/* <img src="/logo.svg" className="logo-img" alt="Logo" /> */}
            <h2>CodeForge</h2>
            <Button
              shape="circle"
              type="text"
              onClick={toggleTheme}
              className="theme-switch"
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
            <Menu.Item key="idcardparser">
              <IconScan style={{ fontSize: 18, marginRight: 6 }} />
              身份证解析器
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
            <Menu.Item key="fileHasher">
              <IconFile style={{ fontSize: 18, marginRight: 6 }} />
              文件哈希校验
            </Menu.Item>
            <Menu.Item key="websocket">
              <IconMessage style={{ fontSize: 18, marginRight: 6 }} />
              WebSocket测试
            </Menu.Item>
            <Menu.Item key="sshClient">
              <IconCommand style={{ fontSize: 18, marginRight: 6 }} />
              SSH客户端
            </Menu.Item>
            <Menu.Item key="responsivePreview">
              <IconDesktop style={{ fontSize: 18, marginRight: 6 }} />
              响应式设计预览
            </Menu.Item>
            <Menu.Item key="random">
              <IconUserAdd style={{ fontSize: 18, marginRight: 6 }} />
              随机数生成
            </Menu.Item>
            <Menu.Item key="passwordGenerator">
              <IconLock style={{ fontSize: 18, marginRight: 6 }} />
              密码生成器
            </Menu.Item>
            <Menu.Item key="imageConverter">
              <IconImage style={{ fontSize: 18, marginRight: 6 }} />
              图片转换
            </Menu.Item>
            <Menu.Item key="imageProcessor">
              <IconEdit style={{ fontSize: 18, marginRight: 6 }} />
              图片处理工具
            </Menu.Item>
            <Menu.Item key="faviconGenerator">
              <IconSubscribe style={{ fontSize: 18, marginRight: 6 }} />
              网站图标生成
            </Menu.Item>
            <Menu.Item key="colorTool">
              <IconPalette style={{ fontSize: 18, marginRight: 6 }} />
              颜色工具
            </Menu.Item>
            <Menu.Item key="jsonFormatter">
              <IconJson style={{ fontSize: 18, marginRight: 6 }} />
              JSON格式化
            </Menu.Item>
            <Menu.Item key="qrcodeTool">
              <IconQrcode style={{ fontSize: 18, marginRight: 6 }} />
              二维码工具
            </Menu.Item>
            <Menu.Item key="regexTool">
              <IconSearch style={{ fontSize: 18, marginRight: 6 }} />
              正则表达式工具
            </Menu.Item>
            <Menu.Item key="unitConverter">
              <IconSwap style={{ fontSize: 18, marginRight: 6 }} />
              单位转换工具
            </Menu.Item>
          </Menu>
        </Sider>
        <Content className="layout-content">
          {activeTab === 'idgenerator' && <IDGenerator />}
          {activeTab === 'idcardparser' && <IDCardParser />}
          {activeTab === 'timestamp' && <TimestampConverter />}
          {activeTab === 'encoder' && <StringEncoder />}
          {activeTab === 'crypto' && <CryptoTool />}
          {activeTab === 'fileHasher' && <FileHasher />}
          {activeTab === 'websocket' && <WebSocketTester />}
          {activeTab === 'sshClient' && <SSHClient />}
          {activeTab === 'responsivePreview' && <ResponsivePreview />}
          {activeTab === 'random' && <RandomGenerator />}
          {activeTab === 'passwordGenerator' && <PasswordGenerator />}
          {activeTab === 'imageConverter' && <ImageConverter />}
          {activeTab === 'imageProcessor' && <ImageProcessor />}
          {activeTab === 'faviconGenerator' && <FaviconGenerator />}
          {activeTab === 'colorTool' && <ColorTool />}
          {activeTab === 'jsonFormatter' && <JsonFormatter />}
          {activeTab === 'qrcodeTool' && <QRCodeTool />}
          {activeTab === 'regexTool' && <RegexTool />}
          {activeTab === 'unitConverter' && <UnitConverter />}
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
