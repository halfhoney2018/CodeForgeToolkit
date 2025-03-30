import React, { useState } from 'react';
import {
  Card,
  Space,
  Button,
  Typography,
  List,
  Tag,
  Divider,
  InputNumber,
  Grid,
  Table,
  Message,
  Tabs,
  Empty
} from '@arco-design/web-react';
import {
  IconDelete,
  IconRefresh,
  IconCopy,
  IconFile,
  IconRight
} from '@arco-design/web-react/icon';
import useRandomGenerator, { HistoryItem } from '../../hooks/useRandomGenerator';
import SafeCopy from '../../components/SafeCopy';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Row, Col } = Grid;
const TabPane = Tabs.TabPane;

/**
 * 格式化时间戳
 * @param timestamp 时间戳
 * @returns 格式化后的时间字符串
 */
const formatTime = (timestamp: number): string => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 随机信息生成器组件
 */
const RandomGenerator: React.FC = () => {
  // 从 hook 获取状态和方法
  const {
    generatedInfo,
    generateCount,
    history,
    setGenerateCount,
    generateBatch,
    clearGeneratedInfo,
    clearHistory,
    restoreFromHistory
  } = useRandomGenerator();
  
  // 当前标签页
  const [activeTab, setActiveTab] = useState<string>('generator');
  // 导出格式
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  
  // 复制所有生成的信息
  const copyAllGenerated = () => {
    if (generatedInfo.length === 0) {
      Message.error('没有可复制的数据');
      return;
    }
    
    let content = '';
    
    if (exportFormat === 'json') {
      content = JSON.stringify(generatedInfo, null, 2);
    } else {
      // CSV 格式
      const headers = ['姓名', '性别', '身份证号', '手机号', '邮箱', '地址', '公司', '职业', '生日', '年龄'];
      const rows = generatedInfo.map(info => [
        info.name,
        info.gender,
        info.idCard,
        info.phone,
        info.email,
        info.address,
        info.company,
        info.job,
        info.birthday,
        info.age.toString()
      ]);
      
      content = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
    }
    
    navigator.clipboard.writeText(content).then(
      () => {
        Message.success(`已复制 ${generatedInfo.length} 条数据到剪贴板`);
      },
      () => {
        Message.error('复制失败');
      }
    );
  };
  
  // 导出为文件
  const exportToFile = () => {
    if (generatedInfo.length === 0) {
      Message.error('没有可导出的数据');
      return;
    }
    
    let content = '';
    let mimeType = '';
    let fileExtension = '';
    
    if (exportFormat === 'json') {
      content = JSON.stringify(generatedInfo, null, 2);
      mimeType = 'application/json';
      fileExtension = 'json';
    } else {
      // CSV 格式
      const headers = ['姓名', '性别', '身份证号', '手机号', '邮箱', '地址', '公司', '职业', '生日', '年龄'];
      const rows = generatedInfo.map(info => [
        info.name,
        info.gender,
        info.idCard,
        info.phone,
        info.email,
        info.address,
        info.company,
        info.job,
        info.birthday,
        info.age.toString()
      ]);
      
      content = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      mimeType = 'text/csv';
      fileExtension = 'csv';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `random_info_${dayjs().format('YYYYMMDD_HHmmss')}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    Message.success(`已导出 ${generatedInfo.length} 条数据到文件`);
  };
  
  // 表格列定义
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      width: 90,
      render: (text: string) => (
        <SafeCopy text={text} tip="复制姓名">
          <Space>
            {text}
            <IconCopy style={{ fontSize: 14, cursor: 'pointer', opacity: 0.5 }} />
          </Space>
        </SafeCopy>
      )
    },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 60
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
      width: 180,
      render: (text: string) => (
        <SafeCopy text={text} tip="复制身份证号">
          <Space>
            {text}
            <IconCopy style={{ fontSize: 14, cursor: 'pointer', opacity: 0.5 }} />
          </Space>
        </SafeCopy>
      )
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 120,
      render: (text: string) => (
        <SafeCopy text={text} tip="复制手机号">
          <Space>
            {text}
            <IconCopy style={{ fontSize: 14, cursor: 'pointer', opacity: 0.5 }} />
          </Space>
        </SafeCopy>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 180,
      render: (text: string) => (
        <SafeCopy text={text} tip="复制邮箱">
          <Space>
            {text}
            <IconCopy style={{ fontSize: 14, cursor: 'pointer', opacity: 0.5 }} />
          </Space>
        </SafeCopy>
      )
    },
    {
      title: '地址',
      dataIndex: 'address',
      width: 200,
      render: (text: string) => (
        <SafeCopy text={text} tip="复制地址">
          <Space>
            {text}
            <IconCopy style={{ fontSize: 14, cursor: 'pointer', opacity: 0.5 }} />
          </Space>
        </SafeCopy>
      )
    },
    {
      title: '公司',
      dataIndex: 'company',
      width: 180,
      render: (text: string) => (
        <SafeCopy text={text} tip="复制公司名称">
          <Space>
            {text}
            <IconCopy style={{ fontSize: 14, cursor: 'pointer', opacity: 0.5 }} />
          </Space>
        </SafeCopy>
      )
    },
    {
      title: '职业',
      dataIndex: 'job',
      width: 120,
      render: (text: string) => (
        <SafeCopy text={text} tip="复制职业">
          <Space>
            {text}
            <IconCopy style={{ fontSize: 14, cursor: 'pointer', opacity: 0.5 }} />
          </Space>
        </SafeCopy>
      )
    },
    {
      title: '生日',
      dataIndex: 'birthday',
      width: 110,
      render: (text: string) => (
        <SafeCopy text={text} tip="复制生日">
          <Space>
            {text}
            <IconCopy style={{ fontSize: 14, cursor: 'pointer', opacity: 0.5 }} />
          </Space>
        </SafeCopy>
      )
    },
    {
      title: '年龄',
      dataIndex: 'age',
      width: 60
    }
  ];
  
  // 历史记录标签
  const renderHistoryTab = () => {
    if (history.length === 0) {
      return <Empty description="暂无历史记录" />;
    }
    
    return (
      <List
        dataSource={history}
        header={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>历史记录</Text>
            <Button
              type="text"
              icon={<IconDelete />}
              onClick={clearHistory}
              size="small"
            >
              清空
            </Button>
          </div>
        }
        render={(item: HistoryItem) => (
          <List.Item
            key={item.id}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              restoreFromHistory(item);
              setActiveTab('generator');
              Message.success('已恢复记录');
            }}
            actions={[<IconRight key="restore" />]}
          >
            <List.Item.Meta
              title={`${formatTime(item.timestamp)}`}
              description={`共 ${item.data.length} 条数据`}
            />
          </List.Item>
        )}
      />
    );
  };
  
  return (
    <Card bordered={false} style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title heading={5}>随机信息生成器</Title>
        
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          <TabPane key="generator" title="生成器">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row gutter={16} align="center" style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Space>
                    <Text>生成数量：</Text>
                    <InputNumber
                      min={1}
                      max={100}
                      defaultValue={1}
                      value={generateCount}
                      onChange={value => setGenerateCount(value as number)}
                      style={{ width: 80 }}
                    />
                  </Space>
                </Col>
                <Col span={4}>
                  <Button 
                    type="primary" 
                    icon={<IconRefresh />} 
                    onClick={generateBatch}
                    long
                  >
                    生成
                  </Button>
                </Col>
                <Col span={6}>
                  <Space>
                    <Text>导出格式：</Text>
                    <Space>
                      <Tag 
                        color={exportFormat === 'json' ? 'arcoblue' : 'gray'} 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setExportFormat('json')}
                      >
                        JSON
                      </Tag>
                      <Tag 
                        color={exportFormat === 'csv' ? 'arcoblue' : 'gray'} 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setExportFormat('csv')}
                      >
                        CSV
                      </Tag>
                    </Space>
                  </Space>
                </Col>
                <Col span={8} style={{ textAlign: 'right' }}>
                  <Space>
                    <Button
                      icon={<IconCopy />}
                      onClick={copyAllGenerated}
                      disabled={generatedInfo.length === 0}
                    >
                      复制全部
                    </Button>
                    <Button
                      icon={<IconFile />}
                      onClick={exportToFile}
                      disabled={generatedInfo.length === 0}
                    >
                      导出文件
                    </Button>
                    <Button
                      type="text"
                      icon={<IconDelete />}
                      onClick={clearGeneratedInfo}
                      disabled={generatedInfo.length === 0}
                    >
                      清空
                    </Button>
                  </Space>
                </Col>
              </Row>
              
              <Divider style={{ margin: '8px 0' }} />
              
              {generatedInfo.length > 0 ? (
                <div style={{ overflow: 'auto' }}>
                  <Table
                    columns={columns}
                    data={generatedInfo}
                    scroll={{ x: 1300 }}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                    size="small"
                    border={true}
                  />
                </div>
              ) : (
                <Empty description="点击生成按钮随机生成信息" />
              )}
            </Space>
          </TabPane>
          
          <TabPane key="history" title="历史记录">
            {renderHistoryTab()}
          </TabPane>
        </Tabs>
      </Space>
    </Card>
  );
};

export default RandomGenerator;
