import { ref, onUnmounted } from 'vue';
import { baseUrl } from '@/api/config';

function decodeUTF8(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  let str = '';
  let i = 0;

  while (i < bytes.length) {
    const byte1 = bytes[i++];

    // ASCII 字符 (0-127)
    if (byte1 < 0x80) {
      str += String.fromCharCode(byte1);
    }
    // 2字节 UTF-8
    else if (byte1 >= 0xc0 && byte1 < 0xe0) {
      const byte2 = bytes[i++] & 0x3f;
      str += String.fromCharCode(((byte1 & 0x1f) << 6) | byte2);
    }
    // 3字节 UTF-8
    else if (byte1 >= 0xe0 && byte1 < 0xf0) {
      const byte2 = bytes[i++] & 0x3f;
      const byte3 = bytes[i++] & 0x3f;
      str += String.fromCharCode(((byte1 & 0x0f) << 12) | (byte2 << 6) | byte3);
    }
  }

  return str;
}

interface SSEOptions {
  url: string;
  onMessage?: (data: any) => void;
  onError?: (error: any) => void;
  onOpen?: () => void;
  onClosed?: () => void;
}

const useChatSSE = (options: SSEOptions) => {
  const isConnected = ref<boolean>(false);
  let socketTask: any = null;
  let buffer = '';
  let isClosed = false;
  let lastErrorMessage: string | null = null;
  let errorCount = 0;
  const MAX_ERROR_COUNT = 3; // 最大错误次数

  // 解析SSE数据流
  const parseSSEData = (chunk: ArrayBuffer) => {
    if (!chunk) {
      console.warn('接收到空的数据块');
      return;
    }

    const chunkStr = decodeUTF8(chunk);

    if (!chunkStr || chunkStr.trim() === '') {
      console.warn('接收到空的数据字符串');
      return;
    }

    buffer += chunkStr;

    // 标准SSE事件分隔符是\n\n，直接按此分割
    const events = buffer.split('\n\n');

    // 遍历所有完整事件（最后一个是不完整的，留到下次处理）
    for (let i = 0; i < events.length - 1; i++) {
      const event = events[i].trim();
      if (!event) continue;

      // 只处理data字段（SSE的核心数据字段）
      const dataMatch = event.match(/^data:\s*(.+)/s); // 加s修饰符匹配换行
      if (dataMatch) {
        try {
          const rawData = dataMatch[1].trim();

          if (!rawData) {
            console.warn('接收到空的SSE数据字段');
            continue;
          }

          const data = JSON.parse(rawData);

          console.log('data', data);

          if (!data) {
            console.warn('解析出空的SSE数据');
            continue;
          }

          errorCount = 0; // 重置错误计数

          console.log('data.payload.content', data.payload.content);

          if (data.payload && data.payload.content) {
            // 如果content是数组，转换为字符串
            if (Array.isArray(data.payload.content)) {
              console.log(
                '将payload.content数组转换为字符串',
                data.payload.content
              );
              data.payload.content = data.payload.content.join('');
            }
          }

          // 检查是否收到最终报告准备好的信号
          if (data.type === 'completed') {
            console.log(
              '收到最终报告准备好的信号，将在1秒后关闭SSE连接以确保数据完整传输'
            );
            close();
          }

          if (options.onMessage) {
            options.onMessage(data);
          }
        } catch (e) {
          console.error('SSE数据解析失败:', e, '原始数据:', dataMatch[1]);

          // 检查错误是否与上次相同，如果是则增加错误计数
          const errorMessage = e instanceof Error ? e.message : String(e);
          if (errorMessage === lastErrorMessage) {
            errorCount++;
          } else {
            errorCount = 1;
            lastErrorMessage = errorMessage;
          }

          // 如果错误次数超过阈值，关闭连接
          if (errorCount >= MAX_ERROR_COUNT) {
            console.error(`SSE解析错误次数过多 (${errorCount})，关闭连接`);
            if (options.onError) {
              options.onError(
                new Error(`SSE数据解析错误次数过多: ${errorMessage}`)
              );
            }
            close();
            return;
          }
        }
      }
    }

    // 保留最后一个不完整的片段到缓冲
    buffer = events[events.length - 1];
  };

  // 建立SSE连接
  const connect = () => {
    if (isClosed) {
      console.log('SSE连接已被关闭，不再重连');
      return;
    }

    console.log(`尝试连接 SSE: ${options.url}`);

    // 小程序流式请求配置
    socketTask = uni.request({
      url: options.url,
      method: 'GET',
      responseType: 'stream', // 关键：流式响应
      header: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream', // 告诉后端返回SSE格式
      },
      enableChunked: true,
      // 请求成功（流式请求的success是连接成功，不是数据接收完成）
      success: (res) => {
        console.log('SSE连接成功', res);
        isConnected.value = true;

        if (res.statusCode === 200 && options.onOpen) {
          options.onOpen();
        }
      },
      // 请求失败（网络错误、超时等）
      fail: (err) => {
        console.error('SSE连接失败：', err);
        isConnected.value = false;

        if (options.onError) {
          options.onError(err);
        }
      },
    });

    // 监听数据分片
    if (socketTask.onChunkReceived) {
      socketTask.onChunkReceived((res: any) => {
        if (isClosed) {
          console.log('SSE连接已关闭，忽略接收的数据');
          return;
        }

        console.log('分片数据接收中', res.data);
        parseSSEData(res.data);
      });
    }

    // 监听请求完成
    socketTask.then &&
      socketTask
        .then(() => {
          console.log('SSE请求完成');
          if (!isClosed) {
            isConnected.value = false;
          }
        })
        .catch((err: any) => {
          console.error('SSE请求异常:', err);
          if (!isClosed) {
            isConnected.value = false;
            if (options.onError) {
              options.onError(err);
            }
          }
        });
  };

  // 发送消息 - 由于SSE只能由服务端推送，这里使用普通HTTP请求
  const sendMessage = (data: any) => {
    if (isClosed) {
      console.warn('SSE连接已关闭，无法发送消息');
      return;
    }

    // 在实际应用中，这里应该是向后端发送POST请求
    // 通知后端处理消息并触发SSE推送
    console.log('发送消息到后端:', data);

    // 模拟HTTP请求
    uni.request({
      url: options.url, // 替换为实际的消息发送端点
      method: 'POST',
      data: data,
      header: {
        'Content-Type': 'application/json',
      },
      success: (res) => {
        console.log('消息发送成功:', res);
      },
      fail: (err) => {
        console.error('消息发送失败:', err);
        if (options.onError) {
          options.onError(err);
        }
      },
    });
  };

  // 关闭连接
  const close = () => {
    console.log('关闭SSE连接');
    isClosed = true;
    if (socketTask) {
      socketTask.abort && socketTask.abort(); // 终止流式请求
      socketTask = null;
    }
    buffer = '';
    isConnected.value = false;

    if (options.onClosed) {
      options.onClosed();
    }
  };

  // 初始化连接
  connect();

  // 组件销毁时自动关闭连接
  onUnmounted(() => {
    close();
  });

  return {
    connect,
    sendMessage,
    close,
    isConnected,
  };
};

export default useChatSSE;
