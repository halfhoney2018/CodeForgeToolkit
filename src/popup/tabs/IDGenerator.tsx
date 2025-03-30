import React, { useState, useCallback } from 'react';
import { 
  Card, 
  Space, 
  Button, 
  Select, 
  InputNumber, 
  Table, 
  Typography, 
  Message,
  Alert
} from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import { 
  generateIdCard, 
  batchGenerateIdCards, 
  provinceCodes, 
  cityCodes 
} from '../../features/IDGenerator/utils';
import SafeCopy from '../../components/SafeCopy';

const { Title, Text } = Typography;
const Option = Select.Option;

/**
 * 身份证生成器组件
 * @returns 身份证生成器UI组件
 */
const IDGenerator: React.FC = () => {
  // 状态定义
  const [idCard, setIdCard] = useState<string>(''); // 单个身份证号
  const [batchCount, setBatchCount] = useState<number>(5); // 批量生成数量
  const [idCards, setIdCards] = useState<string[]>([]); // 批量生成结果
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(undefined); // 选中的省份
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined); // 选中的城市
  const [startYear, setStartYear] = useState<number>(1950); // 出生年份范围开始
  const [endYear, setEndYear] = useState<number>(2000); // 出生年份范围结束
  const [gender, setGender] = useState<'male' | 'female' | undefined>(undefined); // 性别选择
  
  // 城市选项列表 - 根据选中的省份筛选
  const cityOptions = React.useMemo(() => {
    if (!selectedProvince) return [];
    
    // 根据省份代码筛选城市
    return Object.entries(cityCodes)
      .filter(([code]) => code.startsWith(selectedProvince))
      .map(([code, name]) => ({
        label: name,
        value: code
      }));
  }, [selectedProvince]);
  
  // 处理省份变更
  const handleProvinceChange = useCallback((value: string) => {
    setSelectedProvince(value);
    setSelectedCity(undefined); // 清空城市选择
  }, []);
  
  // 处理城市变更
  const handleCityChange = useCallback((value: string) => {
    setSelectedCity(value);
  }, []);
  
  // 单次生成处理函数
  const handleGenerateOne = useCallback(() => {
    try {
      const areaCode = selectedCity || selectedProvince;
      const generatedId = generateIdCard(areaCode, startYear, endYear, gender);
      setIdCard(generatedId);
      Message.success('身份证生成成功');
    } catch (err) {
      Message.error('生成失败，请检查参数');
      console.error(err);
    }
  }, [selectedProvince, selectedCity, startYear, endYear, gender]);
  
  // 批量生成处理函数
  const handleGenerateBatch = useCallback(() => {
    try {
      const areaCode = selectedCity || selectedProvince;
      const generatedIds = batchGenerateIdCards(batchCount, areaCode, startYear, endYear, gender);
      setIdCards(generatedIds);
      Message.success(`成功生成 ${batchCount} 个身份证号`);
    } catch (err) {
      Message.error('批量生成失败，请检查参数');
      console.error(err);
    }
  }, [batchCount, selectedProvince, selectedCity, startYear, endYear, gender]);
  
  // 复制单个身份证号
  const handleCopyIdCard = useCallback(async () => {
    if (!idCard) {
      Message.warning('请先生成身份证号');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(idCard);
      Message.success('复制成功');
    } catch (error) {
      Message.error('复制失败，请手动选择并复制');
      console.error('复制失败:', error);
    }
  }, [idCard]);
  
  // 表格列定义
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80,
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 100,
      render: (_: string, record: { idCard: string }) => (
        <SafeCopy text={record.idCard} tip="复制身份证号" />
      )
    }
  ];
  
  // 表格数据处理
  const tableData = idCards.map((id, index) => ({
    key: index,
    index: index + 1,
    idCard: id
  }));
  
  // 复制所有身份证号（以换行符分隔）
  const handleCopyAll = useCallback(async () => {
    if (idCards.length === 0) {
      Message.warning('请先生成身份证号');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(idCards.join('\n'));
      Message.success('复制全部成功');
    } catch (error) {
      Message.error('复制失败，请手动选择并复制');
      console.error('复制失败:', error);
    }
  }, [idCards]);
  
  // 年份范围验证
  const validateYearRange = useCallback(() => {
    if (startYear >= endYear) {
      Message.warning('起始年份必须小于结束年份');
      setStartYear(1950);
      setEndYear(2000);
    }
  }, [startYear, endYear]);
  
  return (
    <div className="module-container">
      <Title heading={4}>身份证生成器</Title>
      
      <Alert
        type="warning"
        content="免责声明：本工具生成的数据仅用于开发测试，请勿用于非法用途。"
        closable={false}
        style={{ marginBottom: 20 }}
      />
      
      <Card title="区域与生日设置" style={{ marginBottom: 20 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Select
              placeholder="选择省份（可选）"
              style={{ width: 160 }}
              onChange={handleProvinceChange}
              value={selectedProvince}
              allowClear
            >
              {Object.entries(provinceCodes).map(([code, name]) => (
                <Option key={code} value={code}>
                  {name}
                </Option>
              ))}
            </Select>
            
            <Select
              placeholder="选择城市（可选）"
              style={{ width: 160 }}
              onChange={handleCityChange}
              value={selectedCity}
              allowClear
              disabled={!selectedProvince}
            >
              {cityOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
            
            <Select
              placeholder="选择性别（可选）"
              style={{ width: 120 }}
              onChange={setGender}
              value={gender}
              allowClear
            >
              <Option key="male" value="male">男性</Option>
              <Option key="female" value="female">女性</Option>
            </Select>
          </Space>
          
          <div style={{ display: 'flex' }}>
            <div style={{ width: '50%', marginRight: 8 }}>
              <Text style={{ display: 'block', marginBottom: 8 }}>出生年份范围(起始)</Text>
              <InputNumber
                min={1900}
                max={2020}
                style={{ width: '100%' }}
                value={startYear}
                onChange={(value) => {
                  setStartYear(value || 1950);
                  setTimeout(validateYearRange, 0);
                }}
              />
            </div>
            <div style={{ width: '50%', marginLeft: 8 }}>
              <Text style={{ display: 'block', marginBottom: 8 }}>出生年份范围(结束)</Text>
              <InputNumber
                min={1900}
                max={2020}
                style={{ width: '100%' }}
                value={endYear}
                onChange={(value) => {
                  setEndYear(value || 2000);
                  setTimeout(validateYearRange, 0);
                }}
              />
            </div>
          </div>
        </Space>
      </Card>
      
      <Card title="单个身份证生成" style={{ marginBottom: 20 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button type="primary" onClick={handleGenerateOne} style={{ marginRight: 16 }}>
              生成身份证号
            </Button>
            <Text style={{ flex: 1, fontFamily: 'monospace' }}>
              {idCard || '点击按钮生成身份证号码'}
            </Text>
            {idCard && (
              <Button 
                type="text" 
                icon={<IconCopy />} 
                onClick={handleCopyIdCard}
                aria-label="复制身份证号"
              />
            )}
          </div>
        </Space>
      </Card>
      
      <Card title="批量身份证生成">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ marginRight: 16 }}>生成数量：</Text>
            <InputNumber
              min={1}
              max={10}
              defaultValue={5}
              style={{ width: 120, marginRight: 16 }}
              value={batchCount}
              onChange={(value) => setBatchCount(value || 5)}
            />
            <Button type="primary" onClick={handleGenerateBatch}>
              批量生成
            </Button>
            {idCards.length > 0 && (
              <Button 
                type="text" 
                onClick={handleCopyAll} 
                style={{ marginLeft: 8 }}
              >
                复制全部
              </Button>
            )}
          </div>
          
          {idCards.length > 0 && (
            <div>
              <Alert
                type="info"
                content="提示：点击操作列的复制按钮可复制单个身份证号"
                closable
                style={{ marginBottom: 12 }}
              />
              <Table
                columns={columns}
                data={tableData}
                pagination={false}
                border={{ wrapper: true, cell: true }}
                rowClassName={() => 'card-row'}
                style={{ marginBottom: 12 }}
              />
              <div style={{ textAlign: 'center', opacity: 0.6, fontSize: 12 }}>
                <Text>生成时间: {new Date().toLocaleString()}</Text>
                <Text style={{ marginLeft: 16 }}>虚拟数据 - 仅用于测试</Text>
              </div>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default IDGenerator;
