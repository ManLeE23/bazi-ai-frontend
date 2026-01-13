import { ref, onUnmounted } from 'vue';

interface WebSocketOptions {
  url: string;
  onOpen?: (event: any) => void;
  onMessage?: (event: any) => void;
  onError?: (event: any) => void;
  onClose?: (event: any) => void;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
}

const useWebSocket = (options: WebSocketOptions) => {
  const isConnected = ref<boolean>(false);
  let reconnectAttempts = 0;
  let socketTask: any = null;
  let shouldReconnect = true;

  // 建立连接
  const connect = () => {
    if (socketTask && isConnected.value) {
      return; // 已连接则不再重复连接
    }

    console.log(`尝试连接 WebSocket: ${options.url}`);

    try {
      // 在 uni-app 中使用 connectSocket 方法
      socketTask = uni.connectSocket({
        url: options.url,
        success: (res) => {
          console.log('WebSocket 连接请求已发送', res);
        }
      });

      // 监听 WebSocket 打开事件
      socketTask.onOpen(() => {
        console.log('WebSocket 已打开');
        isConnected.value = true;
        reconnectAttempts = 0; // 连接成功后重置重连次数

        if (options.onOpen) {
          options.onOpen({});
        }
      });

      // 使用 uni.onSocketMessage 监听消息（兼容APP端）
      uni.onSocketMessage((res) => {
        console.log('收到消息：', res.data);
        if (options.onMessage) {
          options.onMessage(res);
        }
      });

      // 监听 WebSocket 错误
      socketTask.onClose((res: any) => {
        console.log('WebSocket 已关闭', res);
        isConnected.value = false;

        if (options.onClose) {
          options.onClose(res);
        }

        // 如果允许重连且未达到最大重连次数，则尝试重连
        handleReconnect();
      });

      // 监听错误
      socketTask.onError((res: any) => {
        console.error('WebSocket 连接失败', res);
        isConnected.value = false;

        if (options.onError) {
          options.onError(res);
        }

        // 连接失败时尝试重连
        handleReconnect();
      });
    } catch (error) {
      console.error('创建 WebSocket 连接时发生错误:', error);
      if (options.onError) {
        options.onError(error);
      }

      handleReconnect();
    }
  };

  // 处理重连逻辑
  const handleReconnect = () => {
    if (!options.reconnect || isConnected.value || !shouldReconnect) {
      return;
    }

    if (reconnectAttempts < (options.maxReconnectAttempts || 5)) {
      reconnectAttempts++;
      console.log(`WebSocket 重连尝试 #${reconnectAttempts}`);

      setTimeout(() => {
        connect();
      }, options.reconnectInterval || 3000);
    } else {
      console.warn('WebSocket 已达到最大重连尝试次数');
    }
  };

  // 发送消息
  const sendMessage = (data: string | ArrayBuffer) => {
    if (!socketTask) {
      console.error('WebSocket 未初始化');
      return;
    }

    if (!isConnected.value) {
      console.error('WebSocket 未连接，无法发送消息');
      return;
    }

    socketTask.send({
      data,
      success: () => {
        console.log('消息发送成功');
      },
      fail: (err: any) => {
        console.error('消息发送失败', err);
      }
    });
  };

  // 关闭连接
  const close = (code?: number, reason?: string) => {
    shouldReconnect = false; // 设置标志，停止重连
    
    if (!socketTask) {
      console.warn('WebSocket 未初始化，无需关闭');
      return;
    }

    // 使用 SocketTask.close() 方法关闭连接
    socketTask.close({
      code: code || 1000, // 正常关闭状态码
      reason: reason || '主动关闭连接',
      success: () => {
        console.log('WebSocket 连接已关闭');
        isConnected.value = false;
      },
      fail: (err: any) => {
        console.error('关闭 WebSocket 连接失败', err);
      }
    });
  };

  // 初始化连接
  connect();

  // 组件销毁时自动关闭连接
  onUnmounted(() => {
    close(1000, '页面卸载');
  });

  return {
    connect,
    sendMessage,
    close,
    isConnected
  };
};

export default useWebSocket;