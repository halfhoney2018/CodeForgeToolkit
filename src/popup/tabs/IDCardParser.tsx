import React, { useState } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Divider, 
  Typography, 
  Space, 
  Grid,
  Table,
  Empty,
  Message,
  Spin
} from '@arco-design/web-react';
import { IconIdcard, IconSearch, IconCopy } from '@arco-design/web-react/icon';
import useIDCardParser, { IDCardInfo } from '../../hooks/useIDCardParser';
import './IDCardParser.css';

const { Title, Text, Paragraph } = Typography;
const { Row, Col } = Grid;

/**
 * 身份证解析器组件
 */
const IDCardParser: React.FC = () => {
  const { idcard, info, loading, parseIDCard, setIdcard } = useIDCardParser();
  const [history, setHistory] = useState<Array<{ idcard: string; info: IDCardInfo }>>([]);
  
  /**
   * 处理身份证号输入
   */
  const handleInputChange = (value: string) => {
    setIdcard(value.trim());
  };
  
  /**
   * 解析身份证信息
   */
  const handleParse = () => {
    if (!idcard) {
      Message.warning('请输入身份证号码');
      return;
    }
    
    parseIDCard(idcard).then(() => {
      if (info.valid && !info.error) {
        // 添加到历史记录
        setHistory(prev => {
          // 过滤掉可能的重复记录
          const newHistory = prev.filter(item => item.idcard !== idcard);
          return [{ idcard, info }, ...newHistory].slice(0, 10); // 保留最新的10条
        });
      }
    });
  };
  
  /**
   * 从历史记录中重新解析
   */
  const handleReparse = (idcardNumber: string) => {
    setIdcard(idcardNumber);
    parseIDCard(idcardNumber);
  };
  
  /**
   * 复制到剪贴板
   */
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => Message.success('已复制到剪贴板'))
      .catch(() => Message.error('复制失败'));
  };
  
  /**
   * 清空历史记录
   */
  const clearHistory = () => {
    setHistory([]);
    Message.success('历史记录已清空');
  };

  // 表格列定义
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80,
      render: (_: any, __: any, index: number) => index + 1
    },
    {
      title: '身份证号',
      dataIndex: 'idcard',
      width: 180,
      render: (idcard: string) => (
        <div className="idcard-cell">
          <Text>{idcard}</Text>
          <Button 
            type="text" 
            icon={<IconCopy />} 
            size="mini"
            onClick={() => handleCopy(idcard)}
          />
        </div>
      )
    },
    {
      title: '性别',
      dataIndex: 'info.gender',
      width: 80,
      render: (_: any, record: any) => record.info.gender
    },
    {
      title: '出生日期',
      dataIndex: 'info.birthDate',
      width: 120,
      render: (_: any, record: any) => record.info.birthDate
    },
    {
      title: '年龄',
      dataIndex: 'info.age',
      width: 80,
      render: (_: any, record: any) => `${record.info.age}周岁`
    },
    {
      title: '属相',
      dataIndex: 'info.zodiacSign',
      width: 80,
      render: (_: any, record: any) => record.info.zodiacSign
    },
    {
      title: '星座',
      dataIndex: 'info.constellation',
      width: 80,
      render: (_: any, record: any) => record.info.constellation
    },
    {
      title: '省份',
      dataIndex: 'info.province',
      width: 100,
      render: (_: any, record: any) => record.info.province
    },
    {
      title: '操作',
      width: 100,
      render: (_: any, record: any) => (
        <Button 
          type="text" 
          size="small"
          onClick={() => handleReparse(record.idcard)}
        >
          重新解析
        </Button>
      )
    }
  ];

  return (
    <div className="idcard-parser-container">
      <Card>
        <Title heading={5}>身份证解析器</Title>
        <Paragraph className="desc-text">
          输入身份证号码，解析户籍所在地、生日、性别、年龄、生肖、星座等信息
        </Paragraph>
        
        <Row className="input-row" align="center">
          <Col flex="auto">
            <Input
              placeholder="请输入18位或15位身份证号码"
              value={idcard}
              onChange={handleInputChange}
              prefix={<IconIdcard />}
              allowClear
              size="large"
            />
          </Col>
          <Col flex="100px" style={{ marginLeft: 12 }}>
            <Button 
              type="primary" 
              icon={<IconSearch />} 
              onClick={handleParse}
              loading={loading}
              size="large"
            >
              解析
            </Button>
          </Col>
        </Row>
        
        <Divider orientation="center">解析结果</Divider>
        
        {loading ? (
          <div className="loading-container">
            <Spin size={40} tip="解析中..." />
          </div>
        ) : info.valid && !info.error ? (
          <div className="result-container">
            <div className="result-header">
              <div className="result-id-card">
                <span className="id-number">{idcard}</span>
                <Button 
                  type="text" 
                  size="mini" 
                  icon={<IconCopy />} 
                  onClick={() => handleCopy(idcard)}
                />
              </div>
            </div>
            
            <Row className="result-content" gutter={[0, 16]}>
              <Col span={24}>
                <Card className="info-card info-card-personal">
                  <div className="card-title">个人信息</div>
                  <Row gutter={[24, 12]}>
                    <Col span={8}>
                      <div className="info-item">
                        <span className="info-label">性别：</span>
                        <span className="info-value">
                          <span className={`gender-tag ${info.gender === '男' ? 'male' : 'female'}`}>
                            {info.gender}
                          </span>
                        </span>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="info-item">
                        <span className="info-label">出生日期：</span>
                        <span className="info-value highlight">{info.birthDate}</span>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="info-item">
                        <span className="info-label">年龄：</span>
                        <span className="info-value">{info.age} 周岁</span>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card className="info-card info-card-location">
                  <div className="card-title">户籍信息</div>
                  <Row gutter={[24, 12]}>
                    <Col span={8}>
                      <div className="info-item">
                        <span className="info-label">省份：</span>
                        <span className="info-value highlight">{info.province}</span>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="info-item">
                        <span className="info-label">城市：</span>
                        <span className="info-value">{info.city || '—'}</span>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="info-item">
                        <span className="info-label">区县：</span>
                        <span className="info-value">{info.district || '—'}</span>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card className="info-card info-card-zodiac">
                  <div className="card-title">星座属相</div>
                  <Row gutter={[24, 12]}>
                    <Col span={8}>
                      <div className="info-item">
                        <span className="info-label">生肖：</span>
                        <span className="info-value highlight zodiac-sign">{info.zodiacSign}</span>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="info-item">
                        <span className="info-label">星座：</span>
                        <span className="info-value highlight constellation">{info.constellation}</span>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </div>
        ) : info.error ? (
          <div className="error-container">
            <Empty
              description={
                <Space direction="vertical">
                  <Text type="error">{info.error}</Text>
                  <Text type="secondary">请检查身份证号码格式是否正确</Text>
                </Space>
              }
            />
          </div>
        ) : (
          <div className="empty-container">
            <Empty description="请输入身份证号码并点击解析" />
          </div>
        )}
        
        <Divider orientation="center">历史记录</Divider>
        
        {history.length > 0 ? (
          <div className="history-container">
            <div className="history-header">
              <Title heading={6}>最近解析记录</Title>
              <Button 
                type="text" 
                status="danger" 
                size="small"
                onClick={clearHistory}
              >
                清空记录
              </Button>
            </div>
            <Table
              columns={columns}
              data={history}
              size="small"
              rowKey="idcard"
              pagination={false}
              scroll={{ x: true }}
              className="history-table"
            />
          </div>
        ) : (
          <div className="empty-container">
            <Empty description="暂无解析记录" />
          </div>
        )}
      </Card>
    </div>
  );
};

export default IDCardParser;
