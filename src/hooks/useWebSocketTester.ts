import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * WebSocket 连接状态
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

/**
 * WebSocket 消息类型
 */
export enum MessageType {
  SENT = 'sent',
  RECEIVED = 'received',
  SYSTEM = 'system'
}

/**
 * WebSocket 消息记录
 */
export interface WebSocketMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: number;
}

/**
 * WebSocket 连接历史
 */
export interface ConnectionHistory {
  id: string;
  url: string;
  timestamp: number;
}

/**
 * WebSocket 测试工具 Hook
 * @returns WebSocket 测试工具的状态和方法
 */
const useWebSocketTester = () => {
  // 连接 URL
  const [url, setUrl] = useState<string>('ws://124.222.6.60:8800');
  // 发送的消息
  const [message, setMessage] = useState<string>('');
  // 连接状态
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  // 消息历史
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  // 连接历史
  const [connectionHistory, setConnectionHistory] = useState<ConnectionHistory[]>([]);
  // WebSocket 引用
  const wsRef = useRef<WebSocket | null>(null);
  // 是否自动滚动消息列表
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  // 自定义请求头
  const [headers, setHeaders] = useState<Record<string, string>>({});
  // 是否保持连接
  const [keepAlive, setKeepAlive] = useState<boolean>(false);
  // 保持连接的心跳消息
  const [heartbeatMessage, setHeartbeatMessage] = useState<string>('ping');
  // 心跳发送间隔（秒）
  const [heartbeatInterval, setHeartbeatInterval] = useState<number>(30);
  // 心跳定时器引用
  const heartbeatTimerRef = useRef<number | null>(null);

  /**
   * 生成唯一 ID
   * @returns 唯一 ID
   */
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  /**
   * 添加消息记录
   * @param type 消息类型
   * @param content 消息内容
   */
  const addMessage = useCallback((type: MessageType, content: string) => {
    const newMessage: WebSocketMessage = {
      id: generateId(),
      type,
      content,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);
  }, []);

  /**
   * 添加连接历史
   * @param url 连接 URL
   */
  const addConnectionHistory = useCallback((url: string) => {
    // 检查是否已存在相同的 URL
    const exists = connectionHistory.some(history => history.url === url);
    if (!exists) {
      const newHistory: ConnectionHistory = {
        id: generateId(),
        url,
        timestamp: Date.now()
      };
      
      // 保留最近的10条记录
      setConnectionHistory(prev => {
        const updated = [newHistory, ...prev];
        return updated.slice(0, 10);
      });
    }
  }, [connectionHistory]);

  /**
   * 清空消息历史
   */
  const clearMessages = () => {
    setMessages([]);
  };

  /**
   * 清空连接历史
   */
  const clearConnectionHistory = () => {
    setConnectionHistory([]);
  };

  /**
   * 添加自定义请求头
   * @param key 请求头名称
   * @param value 请求头值
   */
  const addHeader = (key: string, value: string) => {
    setHeaders(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * 移除自定义请求头
   * @param key 请求头名称
   */
  const removeHeader = (key: string) => {
    setHeaders(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  /**
   * 连接 WebSocket
   */
  const connect = useCallback(() => {
    if (!url) return;

    // 关闭已有连接
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;

      // 清除心跳定时器
      if (heartbeatTimerRef.current !== null) {
        window.clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    }

    setStatus(ConnectionStatus.CONNECTING);
    addMessage(MessageType.SYSTEM, `正在连接到 ${url}...`);

    try {
      // 创建新连接
      wsRef.current = new WebSocket(url);

      // 设置事件监听
      wsRef.current.onopen = () => {
        setStatus(ConnectionStatus.CONNECTED);
        addMessage(MessageType.SYSTEM, `已连接到 ${url}`);
        addConnectionHistory(url);

        // 设置心跳
        if (keepAlive && heartbeatMessage && heartbeatInterval > 0) {
          heartbeatTimerRef.current = window.setInterval(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(heartbeatMessage);
              addMessage(MessageType.SENT, `[心跳] ${heartbeatMessage}`);
            }
          }, heartbeatInterval * 1000);
        }
      };

      wsRef.current.onmessage = (event) => {
        addMessage(MessageType.RECEIVED, event.data);
      };

      wsRef.current.onerror = (error) => {
        setStatus(ConnectionStatus.ERROR);
        addMessage(MessageType.SYSTEM, `连接错误: ${JSON.stringify(error)}`);
      };

      wsRef.current.onclose = () => {
        setStatus(ConnectionStatus.DISCONNECTED);
        addMessage(MessageType.SYSTEM, '连接已关闭');

        // 清除心跳定时器
        if (heartbeatTimerRef.current !== null) {
          window.clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }
      };
    } catch (error) {
      setStatus(ConnectionStatus.ERROR);
      addMessage(MessageType.SYSTEM, `连接初始化错误: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [url, addMessage, addConnectionHistory, keepAlive, heartbeatMessage, heartbeatInterval]);

  /**
   * 断开 WebSocket 连接
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // 清除心跳定时器
    if (heartbeatTimerRef.current !== null) {
      window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }

    setStatus(ConnectionStatus.DISCONNECTED);
    addMessage(MessageType.SYSTEM, '已断开连接');
  }, [addMessage]);

  /**
   * 发送消息
   */
  const sendMessage = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !message) {
      return;
    }

    wsRef.current.send(message);
    addMessage(MessageType.SENT, message);
    setMessage('');
  }, [message, addMessage]);

  /**
   * 从历史记录中选择连接 URL
   * @param url 连接 URL
   */
  const selectFromHistory = (url: string) => {
    setUrl(url);
  };

  /**
   * 组件卸载时清理资源
   */
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // 清除心跳定时器
      if (heartbeatTimerRef.current !== null) {
        window.clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };
  }, []);

  return {
    url,
    message,
    status,
    messages,
    connectionHistory,
    autoScroll,
    headers,
    keepAlive,
    heartbeatMessage,
    heartbeatInterval,
    setUrl,
    setMessage,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
    clearConnectionHistory,
    selectFromHistory,
    setAutoScroll,
    addHeader,
    removeHeader,
    setKeepAlive,
    setHeartbeatMessage,
    setHeartbeatInterval
  };
};

export default useWebSocketTester;
