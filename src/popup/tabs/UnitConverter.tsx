import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Grid,
  Space,
  Button,
  InputNumber,
  Select,
  Typography,
  Divider,
  List,
  Empty,
  Drawer,
  Message,
  Tag,
  Form,
  Tooltip
} from '@arco-design/web-react';
import {
  IconSync,
  IconHistory,
  IconDelete,
  IconRefresh,
  IconSettings,
  IconSwap,
  IconCopy
} from '@arco-design/web-react/icon';
import useUnitConverter, {
  ConversionType
} from '../../hooks/useUnitConverter';
import PageHeader from '../../components/PageHeader';
import './UnitConverter.css';

const { Row, Col } = Grid;
const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const Option = Select.Option;
const FormItem = Form.Item;

/**
 * 单位转换工具组件
 */
const UnitConverter: React.FC = () => {
  // 使用自定义Hook
  const {
    // 通用
    conversionType,
    setConversionType,
    isSameUnit,
    performConversion,
    conversionHistory,
    loadFromHistory,
    clearHistory,
    
    // CSS单位转换
    cssFromUnit,
    setCssFromUnit,
    cssToUnit,
    setCssToUnit,
    cssValue,
    setCssValue,
    cssResult,
    cssConfig,
    updateCssConfig,
    
    // 时间单位转换
    timeFromUnit,
    setTimeFromUnit,
    timeToUnit,
    setTimeToUnit,
    timeValue,
    setTimeValue,
    timeResult,
    
    // 文件大小单位转换
    fileSizeFromUnit,
    setFileSizeFromUnit,
    fileSizeToUnit,
    setFileSizeToUnit,
    fileSizeValue,
    setFileSizeValue,
    fileSizeResult
  } = useUnitConverter();

  // 状态
  const [activeTab, setActiveTab] = useState<string>(ConversionType.CSS);
  const [historyVisible, setHistoryVisible] = useState<boolean>(false);
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [precision, setPrecision] = useState<number>(4);

  // 当标签页切换时，设置对应的转换类型
  useEffect(() => {
    setConversionType(activeTab as ConversionType);
  }, [activeTab, setConversionType]);

  // 交换单位
  const swapUnits = () => {
    switch (conversionType) {
      case ConversionType.CSS:
        const tempCssUnit = cssFromUnit;
        setCssFromUnit(cssToUnit);
        setCssToUnit(tempCssUnit);
        break;
      case ConversionType.TIME:
        const tempTimeUnit = timeFromUnit;
        setTimeFromUnit(timeToUnit);
        setTimeToUnit(tempTimeUnit);
        break;
      case ConversionType.FILE_SIZE:
        const tempFileSizeUnit = fileSizeFromUnit;
        setFileSizeFromUnit(fileSizeToUnit);
        setFileSizeToUnit(tempFileSizeUnit);
        break;
      default:
        break;
    }
    performConversion();
  };

  // 复制结果
  const copyResult = () => {
    let result = '';
    switch (conversionType) {
      case ConversionType.CSS:
        result = `${cssResult.toFixed(precision)}${cssToUnit}`;
        break;
      case ConversionType.TIME:
        result = `${timeResult.toFixed(precision)} ${timeToUnit}`;
        break;
      case ConversionType.FILE_SIZE:
        result = `${fileSizeResult.toFixed(precision)} ${fileSizeToUnit}`;
        break;
      default:
        break;
    }
    
    navigator.clipboard.writeText(result)
      .then(() => Message.success('已复制到剪贴板'))
      .catch(() => Message.error('复制失败'));
  };

  // 获取当前单位标签
  const getUnitLabel = (unitType: string, unit: string): string => {
    switch (unitType) {
      case 'css':
        return {
          'px': '像素',
          'rem': '根元素字体大小',
          'em': '父元素字体大小',
          'vw': '视口宽度百分比',
          'vh': '视口高度百分比',
          '%': '百分比',
          'pt': '点'
        }[unit] || unit;
      case 'time':
        return {
          'millisecond': '毫秒',
          'second': '秒',
          'minute': '分钟',
          'hour': '小时',
          'day': '天',
          'week': '周',
          'month': '月',
          'year': '年'
        }[unit] || unit;
      case 'fileSize':
        return {
          'B': '字节',
          'KB': '千字节',
          'MB': '兆字节',
          'GB': '吉字节',
          'TB': '太字节',
          'PB': '拍字节'
        }[unit] || unit;
      default:
        return unit;
    }
  };

  // 获取可用单位选项
  const getUnitOptions = (unitType: string) => {
    switch (unitType) {
      case 'css':
        return [
          { value: 'px', label: '像素 (px)' },
          { value: 'rem', label: '根元素字体大小 (rem)' },
          { value: 'em', label: '父元素字体大小 (em)' },
          { value: 'vw', label: '视口宽度百分比 (vw)' },
          { value: 'vh', label: '视口高度百分比 (vh)' },
          { value: '%', label: '百分比 (%)' },
          { value: 'pt', label: '点 (pt)' }
        ];
      case 'time':
        return [
          { value: 'millisecond', label: '毫秒 (ms)' },
          { value: 'second', label: '秒 (s)' },
          { value: 'minute', label: '分钟 (min)' },
          { value: 'hour', label: '小时 (h)' },
          { value: 'day', label: '天 (d)' },
          { value: 'week', label: '周 (w)' },
          { value: 'month', label: '月 (mo)' },
          { value: 'year', label: '年 (y)' }
        ];
      case 'fileSize':
        return [
          { value: 'B', label: '字节 (B)' },
          { value: 'KB', label: '千字节 (KB)' },
          { value: 'MB', label: '兆字节 (MB)' },
          { value: 'GB', label: '吉字节 (GB)' },
          { value: 'TB', label: '太字节 (TB)' },
          { value: 'PB', label: '拍字节 (PB)' }
        ];
      default:
        return [];
    }
  };

  // 渲染CSS单位转换
  const renderCssUnitConverter = () => (
    <Card className="converter-card">
      <div className="converter-content">
        <Row gutter={24}>
          <Col span={11}>
            <div className="input-container">
              <Title heading={6}>输入值</Title>
              
              <div className="unit-input">
                <InputNumber
                  value={cssValue}
                  onChange={value => setCssValue(value || 0)}
                  min={0}
                  precision={precision}
                  className="value-input"
                />
                
                <Select
                  value={cssFromUnit}
                  onChange={setCssFromUnit}
                  className="unit-select"
                >
                  {getUnitOptions('css').map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
              
              <Paragraph className="unit-description">
                {getUnitLabel('css', cssFromUnit)}
              </Paragraph>
            </div>
          </Col>
          
          <Col span={2}>
            <div className="switch-container">
              <Button
                type="secondary"
                shape="circle"
                icon={<IconSwap />}
                onClick={swapUnits}
                className="swap-button"
              />
            </div>
          </Col>
          
          <Col span={11}>
            <div className="output-container">
              <Title heading={6}>转换结果</Title>
              
              <div className="unit-output">
                <div className="result-display">
                  <Text className="result-value">
                    {cssResult.toFixed(precision)}
                  </Text>
                  
                  <Select
                    value={cssToUnit}
                    onChange={setCssToUnit}
                    className="unit-select"
                  >
                    {getUnitOptions('css').map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>
                
                <div className="result-actions">
                  <Tooltip content="复制结果">
                    <Button
                      type="secondary"
                      icon={<IconCopy />}
                      onClick={copyResult}
                      size="small"
                    />
                  </Tooltip>
                </div>
              </div>
              
              <Paragraph className="unit-description">
                {getUnitLabel('css', cssToUnit)}
              </Paragraph>
            </div>
          </Col>
        </Row>
        
        <div className="converter-actions">
          <Space size="large">
            <Button
              type="primary"
              icon={<IconSync />}
              onClick={performConversion}
              disabled={isSameUnit()}
            >
              转换
            </Button>
            
            <Button
              type="secondary"
              icon={<IconSettings />}
              onClick={() => setSettingsVisible(true)}
            >
              配置
            </Button>
            
            <Button
              type="secondary"
              icon={<IconHistory />}
              onClick={() => setHistoryVisible(true)}
            >
              历史记录
            </Button>
          </Space>
        </div>
      </div>
      
      <div className="converter-info">
        <Divider orientation="left">单位说明</Divider>
        <ul className="info-list">
          <li><Text style={{ fontWeight: 'bold' }}>px (像素):</Text> 屏幕上的一个点，是相对单位</li>
          <li><Text style={{ fontWeight: 'bold' }}>rem (根元素字体大小):</Text> 相对于根元素字体大小的单位，1rem = 根元素的字体大小</li>
          <li><Text style={{ fontWeight: 'bold' }}>em (父元素字体大小):</Text> 相对于父元素字体大小的单位，1em = 父元素的字体大小</li>
          <li><Text style={{ fontWeight: 'bold' }}>vw (视口宽度百分比):</Text> 相对于视口宽度的单位，1vw = 视口宽度的1%</li>
          <li><Text style={{ fontWeight: 'bold' }}>vh (视口高度百分比):</Text> 相对于视口高度的单位，1vh = 视口高度的1%</li>
          <li><Text style={{ fontWeight: 'bold' }}>% (百分比):</Text> 相对于父元素的百分比</li>
          <li><Text style={{ fontWeight: 'bold' }}>pt (点):</Text> 1/72英寸，印刷中使用的单位</li>
        </ul>
      </div>
    </Card>
  );

  // 渲染时间单位转换
  const renderTimeUnitConverter = () => (
    <Card className="converter-card">
      <div className="converter-content">
        <Row gutter={24}>
          <Col span={11}>
            <div className="input-container">
              <Title heading={6}>输入值</Title>
              
              <div className="unit-input">
                <InputNumber
                  value={timeValue}
                  onChange={value => setTimeValue(value || 0)}
                  min={0}
                  precision={precision}
                  className="value-input"
                />
                
                <Select
                  value={timeFromUnit}
                  onChange={setTimeFromUnit}
                  className="unit-select"
                >
                  {getUnitOptions('time').map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
              
              <Paragraph className="unit-description">
                {getUnitLabel('time', timeFromUnit)}
              </Paragraph>
            </div>
          </Col>
          
          <Col span={2}>
            <div className="switch-container">
              <Button
                type="secondary"
                shape="circle"
                icon={<IconSwap />}
                onClick={swapUnits}
                className="swap-button"
              />
            </div>
          </Col>
          
          <Col span={11}>
            <div className="output-container">
              <Title heading={6}>转换结果</Title>
              
              <div className="unit-output">
                <div className="result-display">
                  <Text className="result-value">
                    {timeResult.toFixed(precision)}
                  </Text>
                  
                  <Select
                    value={timeToUnit}
                    onChange={setTimeToUnit}
                    className="unit-select"
                  >
                    {getUnitOptions('time').map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>
                
                <div className="result-actions">
                  <Tooltip content="复制结果">
                    <Button
                      type="secondary"
                      icon={<IconCopy />}
                      onClick={copyResult}
                      size="small"
                    />
                  </Tooltip>
                </div>
              </div>
              
              <Paragraph className="unit-description">
                {getUnitLabel('time', timeToUnit)}
              </Paragraph>
            </div>
          </Col>
        </Row>
        
        <div className="converter-actions">
          <Space size="large">
            <Button
              type="primary"
              icon={<IconSync />}
              onClick={performConversion}
              disabled={isSameUnit()}
            >
              转换
            </Button>
            
            <Button
              type="secondary"
              icon={<IconHistory />}
              onClick={() => setHistoryVisible(true)}
            >
              历史记录
            </Button>
          </Space>
        </div>
      </div>
      
      <div className="converter-info">
        <Divider orientation="left">单位说明</Divider>
        <ul className="info-list">
          <li><Text style={{ fontWeight: 'bold' }}>毫秒 (ms):</Text> 1秒 = 1000毫秒</li>
          <li><Text style={{ fontWeight: 'bold' }}>秒 (s):</Text> 基本时间单位</li>
          <li><Text style={{ fontWeight: 'bold' }}>分钟 (min):</Text> 1分钟 = 60秒</li>
          <li><Text style={{ fontWeight: 'bold' }}>小时 (h):</Text> 1小时 = 60分钟</li>
          <li><Text style={{ fontWeight: 'bold' }}>天 (d):</Text> 1天 = 24小时</li>
          <li><Text style={{ fontWeight: 'bold' }}>周 (w):</Text> 1周 = 7天</li>
          <li><Text style={{ fontWeight: 'bold' }}>月 (mo):</Text> 1月 ≈ 30天（简化计算）</li>
          <li><Text style={{ fontWeight: 'bold' }}>年 (y):</Text> 1年 ≈ 365天（简化计算）</li>
        </ul>
      </div>
    </Card>
  );

  // 渲染文件大小单位转换
  const renderFileSizeUnitConverter = () => (
    <Card className="converter-card">
      <div className="converter-content">
        <Row gutter={24}>
          <Col span={11}>
            <div className="input-container">
              <Title heading={6}>输入值</Title>
              
              <div className="unit-input">
                <InputNumber
                  value={fileSizeValue}
                  onChange={value => setFileSizeValue(value || 0)}
                  min={0}
                  precision={precision}
                  className="value-input"
                />
                
                <Select
                  value={fileSizeFromUnit}
                  onChange={setFileSizeFromUnit}
                  className="unit-select"
                >
                  {getUnitOptions('fileSize').map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
              
              <Paragraph className="unit-description">
                {getUnitLabel('fileSize', fileSizeFromUnit)}
              </Paragraph>
            </div>
          </Col>
          
          <Col span={2}>
            <div className="switch-container">
              <Button
                type="secondary"
                shape="circle"
                icon={<IconSwap />}
                onClick={swapUnits}
                className="swap-button"
              />
            </div>
          </Col>
          
          <Col span={11}>
            <div className="output-container">
              <Title heading={6}>转换结果</Title>
              
              <div className="unit-output">
                <div className="result-display">
                  <Text className="result-value">
                    {fileSizeResult.toFixed(precision)}
                  </Text>
                  
                  <Select
                    value={fileSizeToUnit}
                    onChange={setFileSizeToUnit}
                    className="unit-select"
                  >
                    {getUnitOptions('fileSize').map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>
                
                <div className="result-actions">
                  <Tooltip content="复制结果">
                    <Button
                      type="secondary"
                      icon={<IconCopy />}
                      onClick={copyResult}
                      size="small"
                    />
                  </Tooltip>
                </div>
              </div>
              
              <Paragraph className="unit-description">
                {getUnitLabel('fileSize', fileSizeToUnit)}
              </Paragraph>
            </div>
          </Col>
        </Row>
        
        <div className="converter-actions">
          <Space size="large">
            <Button
              type="primary"
              icon={<IconSync />}
              onClick={performConversion}
              disabled={isSameUnit()}
            >
              转换
            </Button>
            
            <Button
              type="secondary"
              icon={<IconHistory />}
              onClick={() => setHistoryVisible(true)}
            >
              历史记录
            </Button>
          </Space>
        </div>
      </div>
      
      <div className="converter-info">
        <Divider orientation="left">单位说明</Divider>
        <ul className="info-list">
          <li><Text style={{ fontWeight: 'bold' }}>字节 (B):</Text> 基本数据单位，1字节 = 8位</li>
          <li><Text style={{ fontWeight: 'bold' }}>千字节 (KB):</Text> 1KB = 1024字节</li>
          <li><Text style={{ fontWeight: 'bold' }}>兆字节 (MB):</Text> 1MB = 1024KB</li>
          <li><Text style={{ fontWeight: 'bold' }}>吉字节 (GB):</Text> 1GB = 1024MB</li>
          <li><Text style={{ fontWeight: 'bold' }}>太字节 (TB):</Text> 1TB = 1024GB</li>
          <li><Text style={{ fontWeight: 'bold' }}>拍字节 (PB):</Text> 1PB = 1024TB</li>
        </ul>
      </div>
    </Card>
  );

  // 渲染设置抽屉
  const renderSettingsDrawer = () => (
    <Drawer
      width={400}
      title="单位转换设置"
      visible={settingsVisible}
      onCancel={() => setSettingsVisible(false)}
      footer={null}
    >
      <Form layout="vertical">
        <FormItem label="小数位数">
          <InputNumber
            value={precision}
            onChange={value => setPrecision(value || 2)}
            min={0}
            max={10}
            style={{ width: '100%' }}
          />
        </FormItem>
        
        <Divider>CSS单位设置</Divider>
        
        <FormItem label="基础字体大小 (px，用于rem/em计算)">
          <InputNumber
            value={cssConfig.baseSize}
            onChange={value => 
              updateCssConfig({ baseSize: value || 16 })
            }
            min={1}
            style={{ width: '100%' }}
          />
        </FormItem>
        
        <FormItem label="视口宽度 (px，用于vw计算)">
          <InputNumber
            value={cssConfig.viewportWidth}
            onChange={value => 
              updateCssConfig({ viewportWidth: value || 1920 })
            }
            min={1}
            style={{ width: '100%' }}
          />
        </FormItem>
        
        <FormItem label="视口高度 (px，用于vh计算)">
          <InputNumber
            value={cssConfig.viewportHeight}
            onChange={value => 
              updateCssConfig({ viewportHeight: value || 1080 })
            }
            min={1}
            style={{ width: '100%' }}
          />
        </FormItem>
      </Form>
    </Drawer>
  );

  // 渲染历史记录抽屉
  const renderHistoryDrawer = () => (
    <Drawer
      width={500}
      title={
        <div className="history-drawer-header">
          <span>历史记录</span>
          {conversionHistory.length > 0 && (
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
      {conversionHistory.length > 0 ? (
        <List
          className="history-list"
          dataSource={conversionHistory}
          render={(item, index) => (
            <List.Item
              key={item.id}
              actions={[
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
                    <Tag color="arcoblue">
                      {item.type === 'css' ? 'CSS单位' :
                       item.type === 'time' ? '时间单位' :
                       item.type === 'fileSize' ? '文件大小' : '单位转换'}
                    </Tag>
                    <span className="history-item-index">{index + 1}.</span>
                  </div>
                  <Text type="secondary" className="history-item-date">
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </div>
                
                <div className="history-item-content">
                  <Space align="center">
                    <Text code>{item.from}</Text>
                    <IconSync />
                    <Text code>{item.to}</Text>
                  </Space>
                </div>
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
      <PageHeader title="单位转换工具" />
      
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        type="card"
        style={{ marginTop: 16 }}
      >
        <TabPane key={ConversionType.CSS} title="CSS单位转换">
          {renderCssUnitConverter()}
        </TabPane>
        <TabPane key={ConversionType.TIME} title="时间单位转换">
          {renderTimeUnitConverter()}
        </TabPane>
        <TabPane key={ConversionType.FILE_SIZE} title="文件大小转换">
          {renderFileSizeUnitConverter()}
        </TabPane>
      </Tabs>
      
      {renderSettingsDrawer()}
      {renderHistoryDrawer()}
    </div>
  );
};

export default UnitConverter;
