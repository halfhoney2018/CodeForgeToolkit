import React, { useState } from 'react';
import {
  Card,
  Typography,
  Input,
  Button,
  Slider,
  Space,
  Divider,
  Message,
  Grid,
  Table,
  Progress,
  Tooltip,
  Checkbox,
  Empty
} from '@arco-design/web-react';
import {
  IconRefresh,
  IconCopy,
  IconDelete,
  IconHistory,
  IconLock,
  IconEye,
  IconEyeInvisible
} from '@arco-design/web-react/icon';
import usePasswordGenerator, { PasswordHistory } from '../../hooks/usePasswordGenerator';
import './PasswordGenerator.css';

const { Title, Text, Paragraph } = Typography;
const { Row, Col } = Grid;

/**
 * 密码生成器组件
 */
const PasswordGenerator: React.FC = () => {
  const {
    options,
    generatedPassword,
    history,
    loading,
    generatePassword,
    updateOptions,
    resetOptions,
    clearHistory,
    regenerateFromHistory
  } = usePasswordGenerator();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  /**
   * 生成新密码
   */
  const handleGeneratePassword = () => {
    try {
      generatePassword();
    } catch (error: any) {
      Message.error(error.message || '密码生成失败');
    }
  };
  
  /**
   * 复制密码到剪贴板
   */
  const handleCopyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword.password)
        .then(() => Message.success('密码已复制到剪贴板'))
        .catch(() => Message.error('复制失败，请手动复制'));
    }
  };
  
  /**
   * 切换密码可见性
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  /**
   * 切换历史记录显示
   */
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };
  
  /**
   * 从历史记录重新生成密码
   */
  const handleRegenerateFromHistory = (id: string) => {
    regenerateFromHistory(id);
    setShowHistory(false);
  };
  
  /**
   * 获取密码强度颜色
   */
  const getStrengthColor = (strength: string): string => {
    switch (strength) {
      case 'weak':
        return 'rgb(var(--danger-6))';
      case 'medium':
        return 'rgb(var(--warning-6))';
      case 'strong':
        return 'rgb(var(--success-6))';
      case 'very-strong':
        return 'rgb(var(--success-6))';
      default:
        return 'rgb(var(--gray-6))';
    }
  };
  
  /**
   * 获取密码强度进度
   */
  const getStrengthProgress = (strength: string): number => {
    switch (strength) {
      case 'weak':
        return 25;
      case 'medium':
        return 50;
      case 'strong':
        return 75;
      case 'very-strong':
        return 100;
      default:
        return 0;
    }
  };
  
  /**
   * 格式化时间戳
   */
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };
  
  /**
   * 历史记录表格列定义
   */
  const columns = [
    {
      title: '密码',
      dataIndex: 'password',
      render: (password: string) => (
        <div className="password-cell">
          <Text>{showPassword ? password : '••••••••••••••••'}</Text>
          <Button
            type="text"
            icon={<IconCopy />}
            size="mini"
            onClick={() => {
              navigator.clipboard.writeText(password)
                .then(() => Message.success('密码已复制到剪贴板'))
                .catch(() => Message.error('复制失败'));
            }}
          />
        </div>
      )
    },
    {
      title: '强度',
      dataIndex: 'strength',
      width: 120,
      render: (strength: string) => (
        <div className="strength-cell">
          <Progress
            percent={getStrengthProgress(strength)}
            color={getStrengthColor(strength)}
            size="small"
          />
          <Text style={{ marginLeft: 8, textTransform: 'capitalize' }}>
            {strength === 'weak' ? '弱' : 
             strength === 'medium' ? '中' : 
             strength === 'strong' ? '强' : 
             strength === 'very-strong' ? '非常强' : strength}
          </Text>
        </div>
      )
    },
    {
      title: '熵值',
      dataIndex: 'entropy',
      width: 80,
      render: (entropy: number) => `${entropy} 位`
    },
    {
      title: '生成时间',
      dataIndex: 'timestamp',
      width: 180,
      render: (timestamp: number) => formatTimestamp(timestamp)
    },
    {
      title: '操作',
      width: 120,
      render: (_: any, record: PasswordHistory) => (
        <Space>
          <Button
            type="text"
            icon={<IconRefresh />}
            size="mini"
            onClick={() => handleRegenerateFromHistory(record.id)}
          >
            重用
          </Button>
        </Space>
      )
    }
  ];
  
  return (
    <div className="password-generator-container">
      <Card>
        <Title heading={5}>
          <IconLock style={{ marginRight: 8 }} />
          随机密码生成器
        </Title>
        <Paragraph className="desc-text">
          生成安全、强壮的随机密码，支持自定义字符集和多种安全选项
        </Paragraph>
        
        <div className="password-display">
          {generatedPassword ? (
            <>
              <div className="password-field">
                <Input
                  value={generatedPassword.password}
                  readOnly
                  size="large"
                  type={showPassword ? 'text' : 'password'}
                  addAfter={
                    <Space>
                      <Button
                        type="text"
                        icon={showPassword ? <IconEyeInvisible /> : <IconEye />}
                        onClick={togglePasswordVisibility}
                      />
                      <Button
                        type="text"
                        icon={<IconCopy />}
                        onClick={handleCopyPassword}
                      />
                    </Space>
                  }
                />
              </div>
              
              <div className="password-info">
                <div className="strength-indicator">
                  <Text>强度：</Text>
                  <Progress
                    percent={getStrengthProgress(generatedPassword.strength)}
                    color={getStrengthColor(generatedPassword.strength)}
                    size="small"
                    style={{ width: 120, marginRight: 8 }}
                  />
                  <Text style={{ textTransform: 'capitalize' }}>
                    {generatedPassword.strength === 'weak' ? '弱' : 
                     generatedPassword.strength === 'medium' ? '中' : 
                     generatedPassword.strength === 'strong' ? '强' : 
                     generatedPassword.strength === 'very-strong' ? '非常强' : generatedPassword.strength}
                  </Text>
                </div>
                
                <div className="entropy-indicator">
                  <Tooltip content="熵值表示破解密码所需的计算复杂度，值越高越安全">
                    <Text>熵值：{generatedPassword.entropy} 位</Text>
                  </Tooltip>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-password">
              <Text type="secondary">点击生成按钮创建随机密码</Text>
            </div>
          )}
        </div>
        
        <div className="action-buttons">
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleGeneratePassword}
            icon={<IconRefresh />}
          >
            生成密码
          </Button>
          
          <Button
            type="secondary"
            size="large"
            onClick={toggleHistory}
            icon={<IconHistory />}
          >
            {showHistory ? '隐藏历史' : '查看历史'}
          </Button>
        </div>
        
        <Divider orientation="center">密码选项</Divider>
        
        <div className="password-options">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div className="option-item">
                <Text>密码长度: {options.length}</Text>
                <Slider
                  value={options.length}
                  min={4}
                  max={64}
                  step={1}
                  style={{ width: '100%', marginTop: 8 }}
                  onChange={(value) => updateOptions({ length: value as number })}
                />
              </div>
            </Col>
            
            <Col span={12}>
              <Card className="options-card">
                <Title heading={6}>字符类型</Title>
                <div className="option-item">
                  <Checkbox
                    checked={options.includeLowercase}
                    onChange={(checked) => updateOptions({ includeLowercase: checked })}
                  >
                    包含小写字母 (a-z)
                  </Checkbox>
                </div>
                
                <div className="option-item">
                  <Checkbox
                    checked={options.includeUppercase}
                    onChange={(checked) => updateOptions({ includeUppercase: checked })}
                  >
                    包含大写字母 (A-Z)
                  </Checkbox>
                </div>
                
                <div className="option-item">
                  <Checkbox
                    checked={options.includeNumbers}
                    onChange={(checked) => updateOptions({ includeNumbers: checked })}
                  >
                    包含数字 (0-9)
                  </Checkbox>
                </div>
                
                <div className="option-item">
                  <Checkbox
                    checked={options.includeSymbols}
                    onChange={(checked) => updateOptions({ includeSymbols: checked })}
                  >
                    包含特殊符号 (!@#$%...)
                  </Checkbox>
                </div>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card className="options-card">
                <Title heading={6}>高级选项</Title>
                <div className="option-item">
                  <Checkbox
                    checked={options.excludeSimilarCharacters}
                    onChange={(checked) => updateOptions({ excludeSimilarCharacters: checked })}
                  >
                    排除相似字符 (i, l, 1, L, o, 0, O)
                  </Checkbox>
                </div>
                
                <div className="option-item">
                  <Checkbox
                    checked={options.excludeAmbiguous}
                    onChange={(checked) => updateOptions({ excludeAmbiguous: checked })}
                  >
                    排除歧义字符 ({}, [], (), /, \, 等)
                  </Checkbox>
                </div>
                
                <div className="option-item">
                  <Checkbox
                    checked={options.avoidSequential}
                    onChange={(checked) => updateOptions({ avoidSequential: checked })}
                  >
                    避免连续字符 (abc, 123, qwe, 等)
                  </Checkbox>
                </div>
                
                <div className="option-item">
                  <Checkbox
                    checked={options.avoidRepeating}
                    onChange={(checked) => updateOptions({ avoidRepeating: checked })}
                  >
                    避免重复字符 (aaa, 111, 等)
                  </Checkbox>
                </div>
              </Card>
            </Col>
            
            <Col span={24}>
              <div className="option-item">
                <Text>自定义字符集 (留空使用上面的选项)</Text>
                <Input
                  placeholder="输入自定义字符集，例如: ABCDEFabcdef123456!@#$%^"
                  value={options.customCharacters || ''}
                  onChange={(value) => updateOptions({ customCharacters: value })}
                  style={{ marginTop: 8 }}
                />
              </div>
            </Col>
            
            <Col span={24}>
              <div className="reset-options">
                <Button onClick={resetOptions}>重置为默认选项</Button>
              </div>
            </Col>
          </Row>
        </div>
        
        {showHistory && (
          <>
            <Divider orientation="center">
              历史记录
              <Button
                type="text"
                icon={<IconDelete />}
                status="danger"
                size="mini"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  clearHistory();
                  Message.success('历史记录已清空');
                }}
              >
                清空
              </Button>
            </Divider>
            
            <div className="password-history">
              {history.length > 0 ? (
                <Table
                  columns={columns}
                  data={history}
                  size="small"
                  pagination={false}
                  scroll={{ y: 300 }}
                  rowKey="id"
                />
              ) : (
                <Empty description="暂无历史记录" />
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default PasswordGenerator;
