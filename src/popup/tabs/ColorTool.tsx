import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Space,
  Button,
  Typography,
  Tabs,
  Input,
  Grid,
  Message,
  ColorPicker,
  Slider,
  Radio,
  Drawer,
  List,
  Empty,
  Divider
} from '@arco-design/web-react';
import {
  IconPlus,
  IconDelete,
  IconHistory,
  IconSave,
  IconCopy,
  IconExport,
  IconImport
} from '@arco-design/web-react/icon';
import useColorTool, { RGB, HSL, CMYK, HSV } from '../../hooks/useColorTool';
import SafeCopy from '../../components/SafeCopy';
import PageHeader from '../../components/PageHeader';
import './ColorTool.css';

const { Text } = Typography;
const { Row, Col } = Grid;
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;

/**
 * 颜色工具组件
 */
const ColorTool: React.FC = () => {
  // 使用自定义Hook
  const {
    currentColor,
    setColor,
    savedColors,
    colorHistory,
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    hslToRgb,
    rgbToCmyk,
    cmykToRgb,
    rgbToHsv,
    hsvToRgb,
    getComplementaryColor,
    getMonochromaticColors,
    getTriadicColors,
    getAnalogousColors,
    saveCurrentColor,
    deleteSavedColor,
    clearHistory,
    exportColorScheme,
    importColorScheme
  } = useColorTool();

  // 状态
  const [activeTab, setActiveTab] = useState<string>('picker');
  const [hexInput, setHexInput] = useState<string>(currentColor);
  const [rgbValues, setRgbValues] = useState<RGB>({ r: 0, g: 0, b: 0 });
  const [hslValues, setHslValues] = useState<HSL>({ h: 0, s: 0, l: 0 });
  const [cmykValues, setCmykValues] = useState<CMYK>({ c: 0, m: 0, y: 0, k: 0 });
  const [hsvValues, setHsvValues] = useState<HSV>({ h: 0, s: 0, v: 0 });
  const [colorName, setColorName] = useState<string>('');
  const [historyVisible, setHistoryVisible] = useState<boolean>(false);
  const [savedVisible, setSavedVisible] = useState<boolean>(false);
  const [harmonies, setHarmonies] = useState<string[]>([]);
  const [harmonyType, setHarmonyType] = useState<string>('complementary');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 更新当前颜色的所有表示形式
  useEffect(() => {
    try {
      // 更新HEX输入
      setHexInput(currentColor);

      // 计算并更新RGB值
      const rgb = hexToRgb(currentColor);
      setRgbValues(rgb);

      // 计算并更新HSL值
      const hsl = rgbToHsl(rgb);
      setHslValues(hsl);

      // 计算并更新CMYK值
      const cmyk = rgbToCmyk(rgb);
      setCmykValues(cmyk);

      // 计算并更新HSV值
      const hsv = rgbToHsv(rgb);
      setHsvValues(hsv);

      // 根据选择的和谐类型更新颜色和谐
      updateHarmonies();
    } catch (error) {
      Message.error('颜色格式转换失败');
      console.error(error);
    }
  }, [currentColor, harmonyType]);

  // 更新颜色和谐
  const updateHarmonies = () => {
    try {
      switch (harmonyType) {
        case 'complementary':
          setHarmonies([getComplementaryColor(currentColor)]);
          break;
        case 'triadic':
          setHarmonies(getTriadicColors(currentColor).slice(1));
          break;
        case 'analogous':
          setHarmonies(getAnalogousColors(currentColor, 5).slice(1));
          break;
        case 'monochromatic':
          setHarmonies(getMonochromaticColors(currentColor, 5));
          break;
        default:
          setHarmonies([]);
      }
    } catch (error) {
      console.error('计算颜色和谐失败:', error);
    }
  };

  // 处理HEX输入变化
  const handleHexChange = (value: string) => {
    setHexInput(value);
    if (/^#?([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(value)) {
      const formattedHex = value.startsWith('#') ? value : `#${value}`;
      setColor(formattedHex);
    }
  };

  // 处理RGB值变化
  const handleRgbChange = (key: keyof RGB, value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    const newRgb = { ...rgbValues, [key]: newValue };
    setRgbValues(newRgb);
    setColor(rgbToHex(newRgb));
  };

  // 处理HSL值变化
  const handleHslChange = (key: keyof HSL, value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    const newHsl = { ...hslValues, [key]: newValue };
    setHslValues(newHsl);
    const rgb = hslToRgb(newHsl);
    setColor(rgbToHex(rgb));
  };

  // 处理CMYK值变化
  const handleCmykChange = (key: keyof CMYK, value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    const newCmyk = { ...cmykValues, [key]: newValue };
    setCmykValues(newCmyk);
    const rgb = cmykToRgb(newCmyk);
    setColor(rgbToHex(rgb));
  };

  // 处理HSV值变化
  const handleHsvChange = (key: keyof HSV, value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    const newHsv = { ...hsvValues, [key]: newValue };
    setHsvValues(newHsv);
    const rgb = hsvToRgb(newHsv);
    setColor(rgbToHex(rgb));
  };

  // 处理颜色选择器变化
  const handleColorPickerChange = (value: string) => {
    setColor(value);
  };

  // 保存当前颜色
  const handleSaveColor = () => {
    saveCurrentColor(colorName || undefined);
    setColorName('');
  };

  // 处理颜色和谐类型变化
  const handleHarmonyTypeChange = (value: string) => {
    setHarmonyType(value);
  };

  // 导入颜色方案
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 处理文件导入
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        importColorScheme(content);
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

  // 渲染颜色选择器Tab
  const renderColorPickerTab = () => (
    <Card className="color-card">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="color-preview-container">
          <div
            className="color-preview"
            style={{ backgroundColor: currentColor }}
          />
          <div className="color-info">
            <Text>当前颜色: {hexInput}</Text>
            <Text>RGB: {`rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})`}</Text>
            <Text>HSL: {`hsl(${hslValues.h}, ${hslValues.s}%, ${hslValues.l}%)`}</Text>
          </div>
        </div>

        <Divider />

        <Space>
          <ColorPicker
            value={currentColor}
            onChange={handleColorPickerChange}
          />
          <Input
            value={hexInput}
            onChange={handleHexChange}
            placeholder="#RRGGBB"
            style={{ width: 120 }}
          />
          <SafeCopy text={currentColor} tip="已复制颜色代码" />
        </Space>

        <Divider>保存颜色</Divider>

        <Space>
          <Input
            value={colorName}
            onChange={setColorName}
            placeholder="输入颜色名称（可选）"
            style={{ width: 180 }}
          />
          <Button type="primary" icon={<IconSave />} onClick={handleSaveColor}>
            保存颜色
          </Button>
          <Button icon={<IconHistory />} onClick={() => setHistoryVisible(true)}>
            历史记录
          </Button>
          <Button icon={<IconPlus />} onClick={() => setSavedVisible(true)}>
            查看收藏
          </Button>
        </Space>
      </Space>
    </Card>
  );

  // 渲染RGB转换Tab
  const renderRgbTab = () => (
    <Card className="color-card">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="color-preview-container">
          <div
            className="color-preview"
            style={{ backgroundColor: currentColor }}
          />
          <div className="color-info">
            <Text>HEX: {hexInput}</Text>
            <Text>RGB: {`rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})`}</Text>
            <SafeCopy 
              text={`rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})`}
              tip="已复制RGB值" 
            />
          </div>
        </div>

        <Divider />

        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>R: {rgbValues.r}</Text>
          <Slider
            value={rgbValues.r}
            onChange={(value: number | number[]) => handleRgbChange('r', value)}
            min={0}
            max={255}
            showTicks
          />

          <Text>G: {rgbValues.g}</Text>
          <Slider
            value={rgbValues.g}
            onChange={(value: number | number[]) => handleRgbChange('g', value)}
            min={0}
            max={255}
            showTicks
          />

          <Text>B: {rgbValues.b}</Text>
          <Slider
            value={rgbValues.b}
            onChange={(value: number | number[]) => handleRgbChange('b', value)}
            min={0}
            max={255}
            showTicks
          />
        </Space>
      </Space>
    </Card>
  );

  // 渲染HSL转换Tab
  const renderHslTab = () => (
    <Card className="color-card">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="color-preview-container">
          <div
            className="color-preview"
            style={{ backgroundColor: currentColor }}
          />
          <div className="color-info">
            <Text>HEX: {hexInput}</Text>
            <Text>HSL: {`hsl(${hslValues.h}, ${hslValues.s}%, ${hslValues.l}%)`}</Text>
            <SafeCopy 
              text={`hsl(${hslValues.h}, ${hslValues.s}%, ${hslValues.l}%)`}
              tip="已复制HSL值" 
            />
          </div>
        </div>

        <Divider />

        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>H (色相): {hslValues.h}°</Text>
          <Slider
            value={hslValues.h}
            onChange={(value: number | number[]) => handleHslChange('h', value)}
            min={0}
            max={360}
            showTicks
          />

          <Text>S (饱和度): {hslValues.s}%</Text>
          <Slider
            value={hslValues.s}
            onChange={(value: number | number[]) => handleHslChange('s', value)}
            min={0}
            max={100}
            showTicks
          />

          <Text>L (亮度): {hslValues.l}%</Text>
          <Slider
            value={hslValues.l}
            onChange={(value: number | number[]) => handleHslChange('l', value)}
            min={0}
            max={100}
            showTicks
          />
        </Space>
      </Space>
    </Card>
  );

  // 渲染CMYK转换Tab
  const renderCmykTab = () => (
    <Card className="color-card">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="color-preview-container">
          <div
            className="color-preview"
            style={{ backgroundColor: currentColor }}
          />
          <div className="color-info">
            <Text>HEX: {hexInput}</Text>
            <Text>CMYK: {`cmyk(${cmykValues.c}%, ${cmykValues.m}%, ${cmykValues.y}%, ${cmykValues.k}%)`}</Text>
            <SafeCopy 
              text={`cmyk(${cmykValues.c}%, ${cmykValues.m}%, ${cmykValues.y}%, ${cmykValues.k}%)`}
              tip="已复制CMYK值" 
            />
          </div>
        </div>

        <Divider />

        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>C (青): {cmykValues.c}%</Text>
          <Slider
            value={cmykValues.c}
            onChange={(value: number | number[]) => handleCmykChange('c', value)}
            min={0}
            max={100}
            showTicks
          />

          <Text>M (洋红): {cmykValues.m}%</Text>
          <Slider
            value={cmykValues.m}
            onChange={(value: number | number[]) => handleCmykChange('m', value)}
            min={0}
            max={100}
            showTicks
          />

          <Text>Y (黄): {cmykValues.y}%</Text>
          <Slider
            value={cmykValues.y}
            onChange={(value: number | number[]) => handleCmykChange('y', value)}
            min={0}
            max={100}
            showTicks
          />

          <Text>K (黑): {cmykValues.k}%</Text>
          <Slider
            value={cmykValues.k}
            onChange={(value: number | number[]) => handleCmykChange('k', value)}
            min={0}
            max={100}
            showTicks
          />
        </Space>
      </Space>
    </Card>
  );

  // 渲染HSV转换Tab
  const renderHsvTab = () => (
    <Card className="color-card">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="color-preview-container">
          <div
            className="color-preview"
            style={{ backgroundColor: currentColor }}
          />
          <div className="color-info">
            <Text>HEX: {hexInput}</Text>
            <Text>HSV: {`hsv(${hsvValues.h}°, ${hsvValues.s}%, ${hsvValues.v}%)`}</Text>
            <SafeCopy 
              text={`hsv(${hsvValues.h}°, ${hsvValues.s}%, ${hsvValues.v}%)`}
              tip="已复制HSV值" 
            />
          </div>
        </div>

        <Divider />

        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>H (色相): {hsvValues.h}°</Text>
          <Slider
            value={hsvValues.h}
            onChange={(value: number | number[]) => handleHsvChange('h', value)}
            min={0}
            max={360}
            showTicks
          />

          <Text>S (饱和度): {hsvValues.s}%</Text>
          <Slider
            value={hsvValues.s}
            onChange={(value: number | number[]) => handleHsvChange('s', value)}
            min={0}
            max={100}
            showTicks
          />

          <Text>V (明度): {hsvValues.v}%</Text>
          <Slider
            value={hsvValues.v}
            onChange={(value: number | number[]) => handleHsvChange('v', value)}
            min={0}
            max={100}
            showTicks
          />
        </Space>
      </Space>
    </Card>
  );

  // 渲染色彩和谐Tab
  const renderHarmonyTab = () => (
    <Card className="color-card">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="color-preview-container">
          <div
            className="color-preview"
            style={{ backgroundColor: currentColor }}
          />
          <div className="color-info">
            <Text>基础颜色: {hexInput}</Text>
            <RadioGroup
              type="button"
              name="harmonyType"
              value={harmonyType}
              onChange={handleHarmonyTypeChange}
            >
              <Radio value="complementary">互补色</Radio>
              <Radio value="triadic">三色方案</Radio>
              <Radio value="analogous">类似色</Radio>
              <Radio value="monochromatic">单色方案</Radio>
            </RadioGroup>
          </div>
        </div>

        <Divider />

        <div className="harmony-colors">
          <Row gutter={[16, 16]}>
            {harmonies.map((color, index) => (
              <Col span={6} key={index}>
                <Card
                  className="harmony-color-card"
                  style={{ padding: 0 }}
                  bodyStyle={{ padding: '8px' }}
                >
                  <div
                    className="harmony-color-preview"
                    style={{ backgroundColor: color }}
                    onClick={() => setColor(color)}
                  />
                  <div className="harmony-color-info">
                    <Text>{color}</Text>
                    <SafeCopy text={color} tip="已复制颜色代码" />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Space>
    </Card>
  );

  // 历史记录抽屉
  const renderHistoryDrawer = () => (
    <Drawer
      width={400}
      title="颜色历史记录"
      visible={historyVisible}
      onCancel={() => setHistoryVisible(false)}
      footer={null}
    >
      {colorHistory.length > 0 ? (
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
          <List>
            {colorHistory.map(item => (
              <List.Item
                key={item.id}
                actions={[
                  <Button
                    type="text"
                    icon={<IconCopy />}
                    onClick={() => {
                      navigator.clipboard.writeText(item.hex);
                      Message.success('已复制色值');
                    }}
                  />,
                  <Button
                    type="text"
                    icon={<IconPlus />}
                    onClick={() => setColor(item.hex)}
                  />
                ]}
              >
                <div className="history-item">
                  <div
                    className="history-color-preview"
                    style={{ backgroundColor: item.hex }}
                  />
                  <div className="history-color-info">
                    <Text>{item.hex}</Text>
                    <Text type="secondary">
                      {new Date(item.timestamp).toLocaleString()}
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

  // 收藏颜色抽屉
  const renderSavedDrawer = () => (
    <Drawer
      width={400}
      title="已保存的颜色"
      visible={savedVisible}
      onCancel={() => setSavedVisible(false)}
      footer={
        <div className="drawer-footer">
          <Button
            type="primary"
            icon={<IconExport />}
            onClick={exportColorScheme}
            disabled={savedColors.length === 0}
          >
            导出方案
          </Button>
          <Button
            type="primary"
            icon={<IconImport />}
            onClick={handleImportClick}
          >
            导入方案
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
      {savedColors.length > 0 ? (
        <List>
          {savedColors.map(item => (
            <List.Item
              key={item.id}
              actions={[
                <Button
                  type="text"
                  icon={<IconCopy />}
                  onClick={() => {
                    navigator.clipboard.writeText(item.hex);
                    Message.success('已复制色值');
                  }}
                />,
                <Button
                  type="text"
                  icon={<IconPlus />}
                  onClick={() => setColor(item.hex)}
                />,
                <Button
                  type="text"
                  icon={<IconDelete />}
                  onClick={() => deleteSavedColor(item.id)}
                />
              ]}
            >
              <div className="saved-item">
                <div
                  className="saved-color-preview"
                  style={{ backgroundColor: item.hex }}
                />
                <div className="saved-color-info">
                  <Text bold>{item.name}</Text>
                  <Text>{item.hex}</Text>
                  <Text type="secondary">
                    {`RGB(${item.rgb.r}, ${item.rgb.g}, ${item.rgb.b})`}
                  </Text>
                </div>
              </div>
            </List.Item>
          ))}
        </List>
      ) : (
        <Empty description="暂无保存的颜色" />
      )}
    </Drawer>
  );

  return (
    <div className="module-container">
      <PageHeader title="颜色工具" />
      
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        type="card"
        style={{ marginTop: 16 }}
      >
        <TabPane key="picker" title="颜色选择器">
          {renderColorPickerTab()}
        </TabPane>
        <TabPane key="rgb" title="RGB">
          {renderRgbTab()}
        </TabPane>
        <TabPane key="hsl" title="HSL">
          {renderHslTab()}
        </TabPane>
        <TabPane key="cmyk" title="CMYK">
          {renderCmykTab()}
        </TabPane>
        <TabPane key="hsv" title="HSV">
          {renderHsvTab()}
        </TabPane>
        <TabPane key="harmony" title="色彩和谐">
          {renderHarmonyTab()}
        </TabPane>
      </Tabs>

      {renderHistoryDrawer()}
      {renderSavedDrawer()}
    </div>
  );
};

export default ColorTool;
