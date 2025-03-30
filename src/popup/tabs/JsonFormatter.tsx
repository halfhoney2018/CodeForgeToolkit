import React, { useState, useRef } from 'react';
import {
  Space,
  Button,
  Typography,
  Tabs,
  Input,
  Message,
  Drawer,
  List,
  Empty,
  Divider,
  Switch,
  InputNumber,
  Tooltip,
  Modal,
  Radio
} from '@arco-design/web-react';
import {
  IconCode,
  IconCopy,
  IconDelete,
  IconHistory,
  IconSave,
  IconExport,
  IconImport,
  IconBulb,
  IconClockCircle,
  IconPlus,
  IconMinus,
  IconSettings
} from '@arco-design/web-react/icon';
import AceEditor from 'react-ace';
import { JSONTree } from 'react-json-tree';

// Ace编辑器需要的模式和主题
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';

import useJsonFormatter from '../../hooks/useJsonFormatter';
import PageHeader from '../../components/PageHeader';
import SafeCopy from '../../components/SafeCopy';
import './JsonFormatter.css';

const { Text } = Typography;
const FormItem = Space;
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;

// JSON树形展示主题
const jsonTreeTheme = {
  scheme: 'arco',
  author: 'codeforge',
  base00: '#f7f8fa', // 背景色
  base01: '#e5e6eb', // 边框色
  base02: '#c9cdd4', // 行号背景
  base03: '#86909c', // 注释
  base04: '#4e5969', // 次要文字
  base05: '#1d2129', // 主要文字
  base06: '#f2f3f5', // 高亮背景
  base07: '#ffffff', // 选中项
  base08: '#f53f3f', // 错误、删除
  base09: '#ff7d00', // 数值、常量
  base0A: '#ffb400', // 类、属性
  base0B: '#00b42a', // 字符串
  base0C: '#14c9c9', // 支持类型
  base0D: '#165dff', // 键名
  base0E: '#722ed1', // 关键字
  base0F: '#eb0aa4'  // 弃用
};

// JSON树形展示暗色主题
const jsonTreeDarkTheme = {
  scheme: 'arco-dark',
  author: 'codeforge',
  base00: '#232324', // 背景色
  base01: '#333335', // 边框色
  base02: '#424243', // 行号背景
  base03: '#86909c', // 注释
  base04: '#c9cdd4', // 次要文字
  base05: '#f2f3f5', // 主要文字
  base06: '#17171a', // 高亮背景
  base07: '#1d1d1f', // 选中项
  base08: '#f53f3f', // 错误、删除
  base09: '#ff7d00', // 数值、常量
  base0A: '#ffb400', // 类、属性
  base0B: '#00b42a', // 字符串
  base0C: '#14c9c9', // 支持类型
  base0D: '#4080ff', // 键名
  base0E: '#722ed1', // 关键字
  base0F: '#eb0aa4'  // 弃用
};

/**
 * JSON格式化工具组件
 */
const JsonFormatter: React.FC = () => {
  // 使用自定义Hook
  const {
    jsonInput,
    setJsonInput,
    jsonOutput,
    setJsonOutput,
    jsonError,
    formatConfig,
    updateFormatConfig,
    validateJson,
    formatJson,
    minifyJson,
    repairJson,
    jsonHistory,
    savedSnippets,
    saveJsonSnippet,
    deleteJsonSnippet,
    loadFromSnippet,
    loadFromHistory,
    clearHistory,
    exportSnippets,
    importSnippets
  } = useJsonFormatter();

  // 状态
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [viewMode, setViewMode] = useState<'code' | 'tree'>('tree');
  const [historyVisible, setHistoryVisible] = useState<boolean>(false);
  const [snippetsVisible, setSnippetsVisible] = useState<boolean>(false);
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [saveModalVisible, setSaveModalVisible] = useState<boolean>(false);
  const [snippetName, setSnippetName] = useState<string>('');
  const [editorTheme, setEditorTheme] = useState<'light' | 'dark'>('dark');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 尝试解析JSON以用于树形视图
  const getParsedJson = () => {
    try {
      if (!jsonOutput) return null;
      return JSON.parse(jsonOutput);
    } catch (e) {
      return null;
    }
  };

  // 处理格式化
  const handleFormat = () => {
    if (jsonInput.trim()) {
      const formatted = formatJson(jsonInput);
      setJsonOutput(formatted);
    } else {
      Message.warning('请输入JSON内容');
    }
  };

  // 处理压缩
  const handleMinify = () => {
    if (jsonInput.trim()) {
      const minified = minifyJson(jsonInput);
      setJsonOutput(minified);
    } else {
      Message.warning('请输入JSON内容');
    }
  };

  // 处理修复
  const handleRepair = () => {
    if (jsonInput.trim()) {
      const repaired = repairJson(jsonInput);
      setJsonOutput(repaired);
    } else {
      Message.warning('请输入JSON内容');
    }
  };

  // 处理验证
  const handleValidate = () => {
    if (jsonInput.trim()) {
      const isValid = validateJson(jsonInput);
      if (isValid) {
        Message.success('JSON格式有效');
      }
    } else {
      Message.warning('请输入JSON内容');
    }
  };

  // 保存代码片段
  const handleSaveSnippet = () => {
    if (jsonInput.trim()) {
      setSaveModalVisible(true);
    } else {
      Message.warning('请输入JSON内容');
    }
  };

  // 导入文件
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 文件导入处理
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        importSnippets(content);
      } catch (error) {
        Message.error('导入失败，文件格式不正确');
      }
    };
    reader.readAsText(file);

    // 重置input以允许选择相同文件
    if (event.target) {
      event.target.value = '';
    }
  };

  // 确认保存
  const confirmSave = () => {
    saveJsonSnippet(jsonInput, snippetName);
    setSaveModalVisible(false);
    setSnippetName('');
  };

  // 切换主题
  const toggleTheme = () => {
    setEditorTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // 渲染编辑器Tab
  const renderEditorTab = () => (
    <div className="json-editor-container">
      <div className="json-input-container">
        <div className="json-panel-header">
          <Text>输入JSON</Text>
          <Space>
            <Button 
              type="primary" 
              icon={<IconSettings />}
              onClick={() => setSettingsVisible(true)}
            >
              格式化设置
            </Button>
            <Button 
              type="primary" 
              icon={<IconHistory />}
              onClick={() => setHistoryVisible(true)}
            >
              历史记录
            </Button>
            <Button 
              type="primary" 
              icon={<IconSave />}
              onClick={() => setSnippetsVisible(true)}
            >
              代码片段
            </Button>
          </Space>
        </div>
        <AceEditor
          mode="json"
          theme={editorTheme === 'light' ? 'github' : 'monokai'}
          value={jsonInput}
          height="300px"
          onChange={(value) => setJsonInput(value)}
          width="100%"
          fontSize={14}
          showPrintMargin={false}
          showGutter={true}
          highlightActiveLine={true}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: false,
            showLineNumbers: true,
            tabSize: 2,
          }}
        />
        <div className="json-actions">
          <Space>
            <Button type="primary" icon={<IconCode />} onClick={handleFormat}>格式化</Button>
            <Button type="secondary" icon={<IconMinus />} onClick={handleMinify}>压缩</Button>
            <Button type="outline" icon={<IconBulb />} onClick={handleRepair}>修复</Button>
            <Button type="outline" status="warning" onClick={handleValidate}>验证</Button>
            <Button icon={<IconSave />} onClick={handleSaveSnippet}>保存代码片段</Button>
            <Button 
              type={editorTheme === 'dark' ? 'primary' : 'secondary'} 
              onClick={toggleTheme}
            >
              {editorTheme === 'light' ? '暗色主题' : '亮色主题'}
            </Button>
          </Space>
        </div>
      </div>

      <Divider className="json-divider" />

      <div className="json-output-container">
        <div className="json-panel-header">
          <Space>
            <Text>输出结果</Text>
            <RadioGroup 
              type="button" 
              defaultValue="code" 
              value={viewMode}
              onChange={value => setViewMode(value)}
            >
              <Radio value="code">代码视图</Radio>
              <Radio value="tree">树形视图</Radio>
            </RadioGroup>
          </Space>
          <SafeCopy text={jsonOutput} tip="已复制到剪贴板" />
        </div>
        
        {viewMode === 'code' ? (
          <AceEditor
            mode="json"
            theme={editorTheme === 'light' ? 'github' : 'monokai'}
            value={jsonOutput}
            height="300px"
            readOnly={true}
            width="100%"
            fontSize={14}
            showPrintMargin={false}
            showGutter={true}
            highlightActiveLine={false}
            setOptions={{
              enableBasicAutocompletion: false,
              enableLiveAutocompletion: false,
              enableSnippets: false,
              showLineNumbers: true,
              tabSize: 2,
            }}
          />
        ) : (
          <div className={`json-tree-container ${editorTheme === 'dark' ? 'dark' : 'light'}`}>
            {getParsedJson() ? (
              <JSONTree 
                data={getParsedJson()} 
                theme={editorTheme === 'light' ? jsonTreeTheme : jsonTreeDarkTheme}
                invertTheme={false}
                shouldExpandNodeInitially={() => true}
              />
            ) : (
              <Empty description="无效的JSON或尚未生成输出" />
            )}
          </div>
        )}
        
        {jsonError && (
          <div className="json-error">
            <Text type="error">{jsonError}</Text>
          </div>
        )}
      </div>
    </div>
  );

  // 渲染设置抽屉
  const renderSettingsDrawer = () => (
    <Drawer
      width={400}
      title="格式化设置"
      visible={settingsVisible}
      onCancel={() => setSettingsVisible(false)}
      footer={null}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <FormItem>
          <Text>缩进大小:</Text>
          <InputNumber
            min={1}
            max={8}
            value={formatConfig.indentSize}
            onChange={(value) => updateFormatConfig({ indentSize: value as number })}
            style={{ width: 120 }}
          />
        </FormItem>

        <FormItem align="center">
          <Text>键名排序:</Text>
          <Switch
            checked={formatConfig.sortKeys}
            onChange={(checked) => updateFormatConfig({ sortKeys: checked })}
          />
          <Tooltip content="按字母顺序排序JSON对象的键">
            <IconBulb style={{ cursor: 'help' }} />
          </Tooltip>
        </FormItem>

        <FormItem align="center">
          <Text>转义Unicode:</Text>
          <Switch
            checked={formatConfig.escapeUnicode}
            onChange={(checked) => updateFormatConfig({ escapeUnicode: checked })}
          />
          <Tooltip content="将Unicode字符转换为\uXXXX编码格式">
            <IconBulb style={{ cursor: 'help' }} />
          </Tooltip>
        </FormItem>

        <Divider />
        
        <FormItem align="center">
          <Text>编辑器主题:</Text>
          <RadioGroup 
            type="button" 
            value={editorTheme}
            onChange={value => setEditorTheme(value)}
          >
            <Radio value="light">亮色</Radio>
            <Radio value="dark">暗色</Radio>
          </RadioGroup>
        </FormItem>
        
        <FormItem align="center">
          <Text>默认视图:</Text>
          <RadioGroup 
            type="button" 
            value={viewMode}
            onChange={value => setViewMode(value)}
          >
            <Radio value="code">代码视图</Radio>
            <Radio value="tree">树形视图</Radio>
          </RadioGroup>
        </FormItem>
      </Space>
    </Drawer>
  );

  // 渲染历史记录抽屉
  const renderHistoryDrawer = () => (
    <Drawer
      width={400}
      title="历史记录"
      visible={historyVisible}
      onCancel={() => setHistoryVisible(false)}
      footer={null}
    >
      {jsonHistory.length > 0 ? (
        <>
          <Button
            type="primary"
            status="danger"
            icon={<IconDelete />}
            onClick={clearHistory}
            style={{ marginBottom: 16 }}
          >
            清空历史
          </Button>
          <List className="json-history-list">
            {jsonHistory.map(item => (
              <List.Item
                key={item.id}
                actions={[
                  <Button
                    type="text"
                    icon={<IconCopy />}
                    onClick={() => {
                      navigator.clipboard.writeText(item.content);
                      Message.success('已复制JSON');
                    }}
                  />,
                  <Button
                    type="text"
                    icon={<IconPlus />}
                    onClick={() => {
                      loadFromHistory(item);
                      setHistoryVisible(false);
                    }}
                  />
                ]}
              >
                <div className="json-history-item">
                  <div className="json-history-icon">
                    <IconClockCircle />
                  </div>
                  <div className="json-history-info">
                    <Text>{item.content.slice(0, 50)}...</Text>
                    <Text type="secondary">
                      {new Date(item.timestamp).toLocaleString()} | {item.type}
                    </Text>
                  </div>
                </div>
              </List.Item>
            ))}
          </List>
        </>
      ) : (
        <Empty description="暂无历史记录" />
      )}
    </Drawer>
  );

  // 渲染代码片段抽屉
  const renderSnippetsDrawer = () => (
    <Drawer
      width={400}
      title="保存的代码片段"
      visible={snippetsVisible}
      onCancel={() => setSnippetsVisible(false)}
      footer={
        <div className="drawer-footer">
          <Button
            type="primary"
            icon={<IconExport />}
            onClick={exportSnippets}
            disabled={savedSnippets.length === 0}
          >
            导出代码片段
          </Button>
          <Button
            type="primary"
            icon={<IconImport />}
            onClick={handleImportClick}
          >
            导入代码片段
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".json"
            onChange={handleFileImport}
          />
        </div>
      }
    >
      {savedSnippets.length > 0 ? (
        <List className="json-snippets-list">
          {savedSnippets.map(item => (
            <List.Item
              key={item.id}
              actions={[
                <Button
                  type="text"
                  icon={<IconCopy />}
                  onClick={() => {
                    navigator.clipboard.writeText(item.content);
                    Message.success('已复制JSON');
                  }}
                />,
                <Button
                  type="text"
                  icon={<IconPlus />}
                  onClick={() => {
                    loadFromSnippet(item);
                    setSnippetsVisible(false);
                  }}
                />,
                <Button
                  type="text"
                  icon={<IconDelete />}
                  onClick={() => deleteJsonSnippet(item.id)}
                />
              ]}
            >
              <div className="json-snippet-item">
                <div className="json-snippet-icon">
                  <IconSave />
                </div>
                <div className="json-snippet-info">
                  <Text bold>{item.name}</Text>
                  <Text>{item.content.slice(0, 50)}...</Text>
                  <Text type="secondary">
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </div>
              </div>
            </List.Item>
          ))}
        </List>
      ) : (
        <Empty description="暂无保存的代码片段" />
      )}
    </Drawer>
  );

  // 渲染保存代码片段对话框
  const renderSaveModal = () => (
    <Modal
      title="保存代码片段"
      visible={saveModalVisible}
      onOk={confirmSave}
      onCancel={() => setSaveModalVisible(false)}
      autoFocus={false}
      focusLock={true}
    >
      <FormItem>
        <Text>片段名称:</Text>
        <Input
          value={snippetName}
          onChange={setSnippetName}
          placeholder="输入代码片段名称"
          style={{ width: '100%' }}
        />
      </FormItem>
    </Modal>
  );

  return (
    <div className="module-container">
      <PageHeader title="JSON格式化工具" />
      
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        type="card"
        style={{ marginTop: 16 }}
      >
        <TabPane key="editor" title="编辑器">
          {renderEditorTab()}
        </TabPane>
      </Tabs>

      {renderSettingsDrawer()}
      {renderHistoryDrawer()}
      {renderSnippetsDrawer()}
      {renderSaveModal()}
    </div>
  );
};

export default JsonFormatter;
