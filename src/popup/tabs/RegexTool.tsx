import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Grid,
  Space,
  Button,
  Input,
  Switch,
  Table,
  Tabs,
  Typography,
  Tooltip,
  Message,
  Select,
  Tag,
  Empty,
  Drawer,
  List,
  Divider,
  Badge
} from '@arco-design/web-react';
import {
  IconSearch,
  IconCode,
  IconShareExternal,
  IconHistory,
  IconDelete,
  IconCopy,
  IconRefresh,
  IconCheckCircleFill,
  IconCloseCircleFill,
  IconInfoCircle,
  IconBook
} from '@arco-design/web-react/icon';
import useRegexTool from '../../hooks/useRegexTool';
import PageHeader from '../../components/PageHeader';
import SafeCopy from '../../components/SafeCopy';
import './RegexTool.css';

const { Row, Col } = Grid;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const Option = Select.Option;

/**
 * 正则表达式工具组件
 */
const RegexTool: React.FC = () => {
  // 使用自定义Hook
  const {
    pattern,
    setPattern,
    flags,
    setFlags,
    testString,
    setTestString,
    matches,
    isValid,
    error,
    highlightedText,
    regexHistory,
    templates,
    testRegex,
    loadFromHistory,
    clearHistory,
    loadFromTemplate,
    exportRegex,
    shareRegex,
    getRegexInfo
  } = useRegexTool();

  // 状态
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [historyVisible, setHistoryVisible] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'js' | 'python' | 'php' | 'csharp' | 'java'>('js');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [searchTemplate, setSearchTemplate] = useState<string>('');
  const [infoContent, setInfoContent] = useState<string>('');

  // 引用
  const matchesTableRef = useRef<HTMLDivElement>(null);
  const templateCategoriesRef = useRef<string[]>([]);

  // 获取模板分类列表
  useEffect(() => {
    const categories = new Set<string>();
    templates.forEach(template => {
      categories.add(template.category);
    });
    templateCategoriesRef.current = Array.from(categories);
  }, [templates]);

  // 当模式改变时，更新信息内容
  useEffect(() => {
    setInfoContent(getRegexInfo(pattern));
  }, [pattern, flags, getRegexInfo]);

  // 标志开关变化处理
  const handleFlagChange = (flag: keyof typeof flags, checked: boolean) => {
    setFlags(prev => ({
      ...prev,
      [flag]: checked
    }));
  };

  // 渲染Flag开关
  const renderFlagSwitches = () => (
    <div className="flags-container">
      <div className="flag-switch">
        <Tooltip content="全局匹配，查找所有匹配项">
          <Switch
            checked={flags.global}
            onChange={checked => handleFlagChange('global', checked)}
            size="small"
          />
        </Tooltip>
        <Text className="flag-label">g (全局)</Text>
      </div>
      <div className="flag-switch">
        <Tooltip content="忽略大小写">
          <Switch
            checked={flags.ignoreCase}
            onChange={checked => handleFlagChange('ignoreCase', checked)}
            size="small"
          />
        </Tooltip>
        <Text className="flag-label">i (忽略大小写)</Text>
      </div>
      <div className="flag-switch">
        <Tooltip content="多行匹配，使^和$匹配每一行的开头和结尾">
          <Switch
            checked={flags.multiline}
            onChange={checked => handleFlagChange('multiline', checked)}
            size="small"
          />
        </Tooltip>
        <Text className="flag-label">m (多行)</Text>
      </div>
      <div className="flag-switch">
        <Tooltip content="点号匹配所有字符，包括换行符">
          <Switch
            checked={flags.dotAll}
            onChange={checked => handleFlagChange('dotAll', checked)}
            size="small"
          />
        </Tooltip>
        <Text className="flag-label">s (点匹配所有)</Text>
      </div>
      <div className="flag-switch">
        <Tooltip content="启用Unicode匹配">
          <Switch
            checked={flags.unicode}
            onChange={checked => handleFlagChange('unicode', checked)}
            size="small"
          />
        </Tooltip>
        <Text className="flag-label">u (Unicode)</Text>
      </div>
      <div className="flag-switch">
        <Tooltip content="粘性匹配，从lastIndex位置开始匹配">
          <Switch
            checked={flags.sticky}
            onChange={checked => handleFlagChange('sticky', checked)}
            size="small"
          />
        </Tooltip>
        <Text className="flag-label">y (粘性)</Text>
      </div>
    </div>
  );

  // 过滤和搜索模板
  const getFilteredTemplates = () => {
    return templates.filter(template => {
      // 分类过滤
      if (templateFilter !== 'all' && template.category !== templateFilter) {
        return false;
      }
      
      // 搜索过滤
      if (searchTemplate) {
        const searchLower = searchTemplate.toLowerCase();
        return (
          template.name.toLowerCase().includes(searchLower) ||
          template.description.toLowerCase().includes(searchLower) ||
          template.pattern.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  };

  // 获取正则表达式语法
  const getRegexSyntax = () => {
    let flagsStr = '';
    if (flags.global) flagsStr += 'g';
    if (flags.multiline) flagsStr += 'm';
    if (flags.ignoreCase) flagsStr += 'i';
    if (flags.sticky) flagsStr += 'y';
    if (flags.unicode) flagsStr += 'u';
    if (flags.dotAll) flagsStr += 's';
    
    return `/${pattern}/${flagsStr}`;
  };

  // 渲染匹配结果
  const renderMatchResults = () => {
    if (!pattern || !testString) {
      return (
        <Empty
          description="请输入正则表达式和测试文本"
          className="empty-container"
        />
      );
    }
    
    if (!isValid) {
      return (
        <div className="error-container">
          <IconCloseCircleFill className="error-icon" />
          <Text type="error">{error}</Text>
        </div>
      );
    }
    
    if (matches.length === 0) {
      return (
        <div className="no-match-container">
          <IconInfoCircle className="no-match-icon" />
          <Text type="secondary">无匹配结果</Text>
        </div>
      );
    }
    
    return (
      <div className="matches-container" ref={matchesTableRef}>
        <div className="matches-header">
          <Text>{`找到 ${matches.length} 个匹配结果`}</Text>
          {matches.length > 0 && (
            <SafeCopy
              text={matches.map(m => m.text).join('\n')}
              tip="已复制所有匹配结果"
            />
          )}
        </div>
        
        <Table
          data={matches}
          borderCell={true}
          className="matches-table"
          pagination={
            matches.length > 5
              ? { pageSize: 5, showTotal: true }
              : false
          }
          columns={[
            {
              title: '序号',
              dataIndex: 'index',
              width: 60,
              render: (_, __, index) => index + 1,
            },
            {
              title: '匹配文本',
              dataIndex: 'text',
              render: (text) => (
                <div className="match-text">
                  <code>{text}</code>
                  <SafeCopy
                    text={text}
                    tip="已复制"
                    className="match-copy"
                  />
                </div>
              ),
            },
            {
              title: '位置',
              dataIndex: 'start',
              width: 180,
              render: (_, record) => (
                <Text code>{record.start} - {record.end}</Text>
              ),
            },
            {
              title: '捕获组',
              dataIndex: 'groups',
              render: (groups) => (
                groups && groups.length > 0 ? (
                  <div className="match-groups">
                    {groups.map((group: string, idx: number) => (
                      <Tag
                        key={idx}
                        color="arcoblue"
                        bordered
                      >
                        {idx + 1}: {group || '(空)'}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <Text type="secondary">无捕获组</Text>
                )
              ),
            },
          ]}
        />
      </div>
    );
  };

  // 渲染高亮的测试文本
  const renderHighlightedText = () => {
    if (!highlightedText) return null;
    
    return (
      <div className="highlighted-text-container">
        <Title heading={6}>高亮匹配结果</Title>
        <div
          className="highlighted-text"
          dangerouslySetInnerHTML={{ __html: highlightedText }}
        />
      </div>
    );
  };

  // 渲染编辑器选项卡
  const renderEditorTab = () => (
    <div className="regex-editor-container">
      <Row gutter={16}>
        <Col span={16}>
          <Card className="pattern-card">
            <div className="pattern-header">
              <Title heading={6}>正则表达式模式</Title>
              <Space>
                <SafeCopy
                  text={getRegexSyntax()}
                  tip="已复制正则表达式"
                />
                <Tooltip content="查看正则表达式模板">
                  <Button
                    type="secondary"
                    icon={<IconBook />}
                    onClick={() => setActiveTab('templates')}
                  >
                    模板
                  </Button>
                </Tooltip>
                <Tooltip content="打开历史记录">
                  <Button
                    type="secondary"
                    icon={<IconHistory />}
                    onClick={() => setHistoryVisible(true)}
                  >
                    历史
                  </Button>
                </Tooltip>
              </Space>
            </div>
            
            <div className="pattern-input-container">
              <Input
                value={pattern}
                onChange={setPattern}
                placeholder="输入正则表达式，例如：\d{4}-\d{2}-\d{2}"
                status={isValid ? undefined : 'error'}
                className="pattern-input"
              />
              
              {error && (
                <div className="pattern-error">
                  <IconCloseCircleFill className="error-icon" />
                  <Text type="error">{error}</Text>
                </div>
              )}
            </div>
            
            {renderFlagSwitches()}
            
            <Divider orientation="left">
              <Text type="secondary">测试文本</Text>
            </Divider>
            
            <Input.TextArea
              value={testString}
              onChange={setTestString}
              placeholder="输入要测试的文本"
              style={{ minHeight: '120px' }}
            />
            
            <div className="actions-container">
              <Button
                type="primary"
                icon={<IconSearch />}
                onClick={testRegex}
                disabled={!pattern || !testString}
              >
                测试匹配
              </Button>
              
              <Space>
                <Select
                  value={exportFormat}
                  onChange={setExportFormat}
                  placeholder="选择导出格式"
                  style={{ width: '120px' }}
                >
                  <Option value="js">JavaScript</Option>
                  <Option value="python">Python</Option>
                  <Option value="php">PHP</Option>
                  <Option value="csharp">C#</Option>
                  <Option value="java">Java</Option>
                </Select>
                
                <Button
                  type="primary"
                  icon={<IconCode />}
                  onClick={() => exportRegex(exportFormat)}
                  disabled={!pattern}
                >
                  导出代码
                </Button>
                
                <Button
                  type="primary"
                  status="warning"
                  icon={<IconShareExternal />}
                  onClick={shareRegex}
                  disabled={!pattern}
                >
                  分享
                </Button>
              </Space>
            </div>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card className="info-card">
            <Title heading={6}>
              <Space>
                <IconInfoCircle />
                语法说明
              </Space>
            </Title>
            
            {infoContent ? (
              <pre className="info-content">
                {infoContent}
              </pre>
            ) : (
              <Empty
                description="输入正则表达式以查看语法说明"
                className="empty-container"
              />
            )}
          </Card>
          
          <Card className="status-card">
            <div className="status-header">
              <Title heading={6}>
                <Space>
                  {isValid ? (
                    <IconCheckCircleFill style={{ color: 'var(--color-success)' }} />
                  ) : (
                    <IconCloseCircleFill style={{ color: 'var(--color-danger)' }} />
                  )}
                  状态
                </Space>
              </Title>
              
              {pattern && (
                <Badge
                  count={isValid ? '有效' : '无效'}
                  color={isValid ? 'green' : 'red'}
                />
              )}
            </div>
            
            <Paragraph className="status-info">
              {pattern ? (
                isValid ? `正则表达式有效: ${getRegexSyntax()}` : `语法错误: ${error}`
              ) : (
                '请输入正则表达式以验证'
              )}
            </Paragraph>
            
            {testString && matches.length > 0 && (
              <Text type="success">
                匹配数量: {matches.length}
              </Text>
            )}
          </Card>
        </Col>
      </Row>
      
      <Card className="results-card">
        <div className="results-header">
          <Title heading={6}>匹配结果</Title>
        </div>
        
        {renderMatchResults()}
        {renderHighlightedText()}
      </Card>
    </div>
  );

  // 渲染模板选项卡
  const renderTemplatesTab = () => (
    <div className="templates-container">
      <Card className="templates-filter-card">
        <Row align="center" justify="space-between">
          <Col span={12}>
            <Space>
              <Text>正则表达式模板库</Text>
              <Select
                value={templateFilter}
                onChange={setTemplateFilter}
                placeholder="选择分类"
                style={{ width: '160px' }}
              >
                <Option value="all">全部分类</Option>
                {templateCategoriesRef.current.map(category => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          
          <Col span={12}>
            <div className="templates-search">
              <Input
                value={searchTemplate}
                onChange={setSearchTemplate}
                placeholder="搜索模板..."
                allowClear
                prefix={<IconSearch />}
              />
            </div>
          </Col>
        </Row>
      </Card>
      
      <div className="templates-grid">
        {getFilteredTemplates().map(template => (
          <Card key={template.id} className="template-card">
            <div className="template-card-header">
              <div className="template-title">
                <Title heading={6}>{template.name}</Title>
                <Tag color="arcoblue">{template.category}</Tag>
              </div>
              
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  loadFromTemplate(template);
                  setActiveTab('editor');
                }}
              >
                使用
              </Button>
            </div>
            
            <Paragraph className="template-description">
              {template.description}
            </Paragraph>
            
            <div className="template-pattern">
              <Text code copyable>
                {template.pattern}
              </Text>
            </div>
            
            {template.example && (
              <div className="template-example">
                <Text type="secondary">示例: </Text>
                <Text>{template.example}</Text>
              </div>
            )}
          </Card>
        ))}
        
        {getFilteredTemplates().length === 0 && (
          <Empty description="没有找到匹配的模板" />
        )}
      </div>
    </div>
  );

  // 渲染历史记录抽屉
  const renderHistoryDrawer = () => (
    <Drawer
      width={500}
      title={
        <div className="history-drawer-header">
          <span>历史记录</span>
          {regexHistory.length > 0 && (
            <Button
              type="primary"
              status="danger"
              size="small"
              icon={<IconDelete />}
              onClick={clearHistory}
            >
              清空历史
            </Button>
          )}
        </div>
      }
      visible={historyVisible}
      onCancel={() => setHistoryVisible(false)}
      footer={null}
    >
      {regexHistory.length > 0 ? (
        <List
          className="history-list"
          dataSource={regexHistory}
          render={(item, index) => (
            <List.Item
              key={item.id}
              actions={[
                <Button
                  key="copy"
                  type="text"
                  icon={<IconCopy />}
                  onClick={() => {
                    navigator.clipboard.writeText(item.pattern);
                    Message.success('已复制正则表达式');
                  }}
                />,
                <Button
                  key="load"
                  type="text"
                  icon={<IconRefresh />}
                  onClick={() => {
                    loadFromHistory(item);
                    setHistoryVisible(false);
                  }}
                />
              ]}
            >
              <div className="history-item">
                <div className="history-item-header">
                  <div className="history-item-title">
                    <Text>{index + 1}. </Text>
                    <Text code>{item.pattern}</Text>
                  </div>
                  <Text type="secondary" className="history-item-date">
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </div>
                
                <div className="history-item-flags">
                  {Object.entries(item.flags).map(
                    ([key, value]) =>
                      value && (
                        <Tag key={key} color="arcoblue" size="small">
                          {key}
                        </Tag>
                      )
                  )}
                </div>
                
                {item.testString && (
                  <div className="history-item-test">
                    <Text type="secondary">测试文本: </Text>
                    <Text ellipsis={{rows: 1}}>
                      {item.testString}
                    </Text>
                  </div>
                )}
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="暂无历史记录" />
      )}
    </Drawer>
  );

  return (
    <div className="module-container">
      <PageHeader title="正则表达式工具" />
      
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        type="card"
        style={{ marginTop: 16 }}
      >
        <TabPane key="editor" title={
          <span>
            <IconCode style={{ marginRight: 6 }}/>
            正则表达式编辑器
          </span>
        }>
          {renderEditorTab()}
        </TabPane>
        <TabPane key="templates" title={
          <span>
            <IconBook style={{ marginRight: 6 }}/>
            模板库
          </span>
        }>
          {renderTemplatesTab()}
        </TabPane>
      </Tabs>
      
      {renderHistoryDrawer()}
    </div>
  );
};

export default RegexTool;
