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
  
  // 打开 GitHub 仓库链接
  const openGitHubRepo = () => {
    window.open('https://github.com/halfhoney2018/CodeForgeToolkit', '_blank');
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
            <div className="header-buttons">
              <Button
                shape="circle"
                type="text"
                onClick={openGitHubRepo}
                className="github-link"
                title="访问 GitHub 仓库"
              >
                <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
              </Button>
              <Button
                shape="circle"
                type="text"
                onClick={toggleTheme}
                className="theme-switch"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </Button>
            </div>
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
