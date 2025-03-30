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
  Modal
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
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import useJsonFormatter from '../../hooks/useJsonFormatter';
import PageHeader from '../../components/PageHeader';
import SafeCopy from '../../components/SafeCopy';
import './JsonFormatter.css';

const { Text } = Typography;
const FormItem = Space;
const TabPane = Tabs.TabPane;

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
  const [historyVisible, setHistoryVisible] = useState<boolean>(false);
  const [snippetsVisible, setSnippetsVisible] = useState<boolean>(false);
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [saveModalVisible, setSaveModalVisible] = useState<boolean>(false);
  const [snippetName, setSnippetName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        <CodeMirror
          value={jsonInput}
          height="300px"
          extensions={[json()]}
          onChange={(value) => setJsonInput(value)}
          theme="light"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            foldGutter: true,
          }}
        />
        <div className="json-actions">
          <Space>
            <Button type="primary" icon={<IconCode />} onClick={handleFormat}>格式化</Button>
            <Button type="secondary" icon={<IconMinus />} onClick={handleMinify}>压缩</Button>
            <Button type="outline" icon={<IconBulb />} onClick={handleRepair}>修复</Button>
            <Button type="outline" status="warning" onClick={handleValidate}>验证</Button>
            <Button icon={<IconSave />} onClick={handleSaveSnippet}>保存代码片段</Button>
          </Space>
        </div>
      </div>

      <Divider className="json-divider" />

      <div className="json-output-container">
        <div className="json-panel-header">
          <Text>输出结果</Text>
          <SafeCopy text={jsonOutput} tip="已复制到剪贴板" />
        </div>
        <CodeMirror
          value={jsonOutput}
          height="300px"
          extensions={[json()]}
          readOnly={true}
          theme="light"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: false,
            foldGutter: true,
          }}
        />
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
