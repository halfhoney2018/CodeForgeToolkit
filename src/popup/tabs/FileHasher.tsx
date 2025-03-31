import React, { useState, useRef } from 'react';
import {
  Card,
  Typography,
  Upload,
  Button,
  Space,
  Checkbox,
  Table,
  Message,
  Input,
  Badge,
  Grid,
  Tooltip,
  Progress
} from '@arco-design/web-react';
import {
  IconFile,
  IconDelete,
  IconCopy,
  IconCheck,
  IconClose,
  IconUpload,
  IconRefresh,
  IconSearch
} from '@arco-design/web-react/icon';
import useFileHasher, { HashAlgorithm, HashResult } from '../../hooks/useFileHasher';
import './FileHasher.css';

const { Title, Text, Paragraph } = Typography;
const { Row, Col } = Grid;
const CheckboxGroup = Checkbox.Group;

/**
 * 文件哈希校验组件
 */
const FileHasher: React.FC = () => {
  const { state, processFiles, clearResults, removeResult, verifyHash } = useFileHasher();
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<HashAlgorithm[]>(['MD5', 'SHA1', 'SHA256']);
  const [verifyValue, setVerifyValue] = useState('');
  const [verifyIndex, setVerifyIndex] = useState<number | null>(null);
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      processFiles(files, selectedAlgorithms);
    }
  };

  // 处理Arco Upload组件的文件变更
  const handleArcoUpload = (_: any[], file: any) => {
    if (file && file.originFile) {
      handleFileChange([file.originFile]);
    }
  };

  // 处理算法选择变更
  const handleAlgorithmChange = (values: string[]) => {
    setSelectedAlgorithms(values as HashAlgorithm[]);
  };

  // 处理哈希值验证
  const handleVerify = (index: number) => {
    if (!verifyValue.trim()) {
      Message.warning('请输入要验证的哈希值');
      return;
    }

    const result = verifyHash(verifyValue, index);
    setVerifyResult(result);
    setVerifyIndex(index);

    if (result) {
      Message.success('哈希值验证成功，文件完整性已确认');
    } else {
      Message.error('哈希值验证失败，文件可能已被修改');
    }
  };

  // 复制哈希值到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        Message.success('哈希值已复制到剪贴板');
      })
      .catch(() => {
        Message.error('复制失败，请手动复制');
      });
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 表格列定义
  const columns = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      render: (fileName: string) => (
        <div className="file-name-cell">
          <IconFile className="file-icon" />
          <Text ellipsis={{ showTooltip: true }} style={{ maxWidth: 200 }}>
            {fileName}
          </Text>
        </div>
      )
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      render: (size: number) => formatFileSize(size)
    },
    {
      title: '算法',
      dataIndex: 'algorithm',
      render: (algorithm: HashAlgorithm) => (
        <Badge color={
          algorithm === 'MD5' ? 'blue' :
          algorithm === 'SHA1' ? 'green' :
          algorithm === 'SHA256' ? 'orange' : 'purple'
        } text={algorithm} />
      )
    },
    {
      title: '哈希值',
      dataIndex: 'hash',
      render: (hash: string, _: HashResult, index: number) => (
        <div className="hash-cell">
          <Text code copyable={false} ellipsis={{ showTooltip: true }}>
            {hash}
          </Text>
          <Space size="mini">
            <Tooltip content="复制哈希值">
              <Button
                type="text"
                size="mini"
                icon={<IconCopy />}
                onClick={() => copyToClipboard(hash)}
              />
            </Tooltip>
            <Tooltip content="验证哈希值">
              <Button
                type="text"
                size="mini"
                icon={<IconSearch />}
                onClick={() => {
                  setVerifyValue(hash);
                  setVerifyIndex(index);
                  setVerifyResult(null);
                }}
              />
            </Tooltip>
          </Space>
        </div>
      )
    },
    {
      title: '计算时间',
      dataIndex: 'timeElapsed',
      render: (time: number) => `${time.toFixed(2)} ms`
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_: any, __: any, index: number) => (
        <Button
          type="text"
          status="danger"
          icon={<IconDelete />}
          onClick={() => removeResult(index)}
        />
      )
    }
  ];

  // 渲染进度条
  const renderProgressBar = () => {
    const { progress } = state;
    
    if (!state.isCalculating || progress.total === 0) {
      return null;
    }
    
    return (
      <div className="progress-container">
        <div className="progress-info">
          <div className="progress-status">
            <Text bold>正在计算哈希值...</Text>
            <Text type="secondary">
              {progress.current} / {progress.total} 任务完成 ({progress.percentage}%)
            </Text>
          </div>
          {progress.currentFile && progress.currentAlgorithm && (
            <div className="current-task">
              <Text type="secondary">
                当前文件: {progress.currentFile} ({progress.currentAlgorithm})
                {progress.totalChunks > 0 && ` - 块 ${progress.currentChunk}/${progress.totalChunks}`}
              </Text>
            </div>
          )}
        </div>
        <Progress
          percent={progress.percentage}
          animation
          showText
          status={progress.percentage < 100 ? 'normal' : 'success'}
          className="hash-progress"
        />
        {progress.totalChunks > 1 && progress.currentChunk > 0 && (
          <div className="chunk-progress">
            <Text type="secondary" style={{ fontSize: 12, marginBottom: 4 }}>
              分块处理进度:
            </Text>
            <Progress
              percent={Math.round((progress.currentChunk / progress.totalChunks) * 100)}
              animation
              showText
              size="small"
              status="normal"
            />
          </div>
        )}
      </div>
    );
  };

  // 自定义上传请求函数
  const customRequest = (options: any) => {
    // 防止自动上传
    if (options.onSuccess) {
      options.onSuccess();
    }
  };

  return (
    <div className="file-hasher-container">
      <Card>
        <Title heading={5}>
          <IconFile style={{ marginRight: 8 }} />
          本地文件哈希校验
        </Title>
        <Paragraph className="desc-text">
          计算文件的 MD5/SHA-1/SHA-256 哈希值，验证文件完整性
        </Paragraph>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card className="upload-card" bordered={false}>
              <div className="upload-area">
                <Upload
                  drag
                  multiple
                  accept="*/*"
                  showUploadList={false}
                  onChange={handleArcoUpload}
                  disabled={state.isCalculating}
                  action=""
                  customRequest={customRequest}
                >
                  <div className="upload-content">
                    <div className="upload-icon">
                      <IconUpload fontSize={48} />
                    </div>
                    <div className="upload-text">
                      <p className="upload-title">点击或拖拽文件到此区域</p>
                      <p className="upload-description">支持计算单个或多个文件的哈希值</p>
                    </div>
                  </div>
                </Upload>
              </div>
              
              {renderProgressBar()}
              
              <div className="upload-options">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div className="algorithm-selector">
                    <Text bold>选择哈希算法：</Text>
                    <CheckboxGroup
                      options={[
                        { label: 'MD5', value: 'MD5' },
                        { label: 'SHA-1', value: 'SHA1' },
                        { label: 'SHA-256', value: 'SHA256' },
                        { label: 'SHA-512', value: 'SHA512' }
                      ]}
                      value={selectedAlgorithms}
                      onChange={handleAlgorithmChange}
                      direction="horizontal"
                    />
                  </div>
                  
                  <div className="action-buttons">
                    <Space>
                      <Button
                        type="primary"
                        icon={<IconUpload />}
                        onClick={() => fileInputRef.current?.click()}
                        loading={state.isCalculating}
                        disabled={selectedAlgorithms.length === 0}
                      >
                        选择文件
                      </Button>
                      <Button
                        type="secondary"
                        icon={<IconRefresh />}
                        onClick={clearResults}
                        disabled={state.results.length === 0 || state.isCalculating}
                      >
                        清除结果
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        multiple
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleFileChange(Array.from(e.target.files));
                          }
                        }}
                      />
                    </Space>
                  </div>
                </Space>
              </div>
            </Card>
          </Col>

          {state.results.length > 0 && (
            <Col span={24}>
              <Card className="results-card" bordered={false}>
                <Title heading={6}>计算结果</Title>
                <Table
                  columns={columns}
                  data={state.results}
                  loading={state.isCalculating}
                  pagination={{ pageSize: 5 }}
                  rowKey={(record: HashResult) => `${record.fileName}-${record.algorithm}-${record.timeElapsed}`}
                />
              </Card>
            </Col>
          )}

          <Col span={24}>
            <Card className="verify-card" bordered={false}>
              <Title heading={6}>验证哈希值</Title>
              <Paragraph>输入哈希值进行验证，或从上方结果中选择一个哈希值进行验证</Paragraph>
              
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input.TextArea
                  placeholder="粘贴要验证的哈希值..."
                  value={verifyValue}
                  onChange={setVerifyValue}
                  style={{ minHeight: 60 }}
                />
                
                <div className="verify-actions">
                  <Space>
                    <Button
                      type="primary"
                      icon={<IconSearch />}
                      onClick={() => verifyIndex !== null && handleVerify(verifyIndex)}
                      disabled={!verifyValue.trim() || verifyIndex === null}
                    >
                      验证
                    </Button>
                    <Button
                      type="secondary"
                      onClick={() => {
                        setVerifyValue('');
                        setVerifyResult(null);
                        setVerifyIndex(null);
                      }}
                    >
                      清除
                    </Button>
                  </Space>
                  
                  {verifyResult !== null && (
                    <div className={`verify-result ${verifyResult ? 'success' : 'error'}`}>
                      {verifyResult ? (
                        <Space>
                          <IconCheck />
                          <Text>验证成功，文件完整性已确认</Text>
                        </Space>
                      ) : (
                        <Space>
                          <IconClose />
                          <Text>验证失败，文件可能已被修改</Text>
                        </Space>
                      )}
                    </div>
                  )}
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default FileHasher;
