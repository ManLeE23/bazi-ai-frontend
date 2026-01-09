import { baseUrl } from '@/api/config';

function decodeUTF8(arrayBuffer) {
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

/**
 * 创建小程序版SSE连接（基于wx.request的流式请求模拟）
 * @param {string} reportId - 报告ID
 * @param {Function} onMessage - 消息回调（接收解析后的data）
 * @param {Function} onError - 错误回调
 * @param {Object} options - 可选配置（重连次数、间隔等）
 * @returns {Object} 包含关闭连接的方法
 */
export const createSSEConnection = (
  reportId,
  onMessage,
  onError,
  options = {}
) => {
  // 默认配置
  const config = {
    baseUrl,
    maxReconnect: 3, // 最大重连次数
    reconnectInterval: 3000, // 重连间隔（ms）
    ...options,
  };

  // SSE相关变量
  let socketTask = null; // 小程序流式请求任务
  let reconnectCount = 0; // 重连次数
  let buffer = ''; // 数据流缓冲（处理分片数据）
  let isClosed = false; // 是否手动关闭

  // 解析SSE数据流（核心：处理data: {}\n\n格式）
  const parseSSEData = (chunk) => {
    const chunkStr = decodeUTF8(chunk);
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
          const data = JSON.parse(rawData);
          console.log('处理后的data', data);
          onMessage(data);
        } catch (e) {
          console.error('SSE数据解析失败:', e);
        }
      }
    }

    // 保留最后一个不完整的片段到缓冲
    buffer = events[events.length - 1];
  };

  // 建立SSE连接（流式请求）
  const connectSSE = () => {
    // 如果已手动关闭，不再连接
    if (isClosed) return;

    // 小程序流式请求配置
    socketTask = uni.request({
      url: `/api/v1/reports/${reportId}/sse`,
      method: 'GET',
      responseType: 'stream', // 关键：流式响应
      header: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream', // 告诉后端返回SSE格式
      },
      enableChunked: true,
      // 请求成功（流式请求的success是连接成功，不是数据接收完成）
      success: (res) => {
        // 状态码非200，触发错误
        if (res.statusCode !== 200) {
          onError(new Error(`SSE连接失败，状态码：${res.statusCode}`));
          reconnectSSE();
        }
      },
      // 请求失败（网络错误、超时等）
      fail: (err) => {
        console.error('SSE连接失败：', err);
        onError(err);
        reconnectSSE();
      },
      // 请求完成（成功/失败都会触发）
      complete: () => {
        // 如果不是手动关闭，且未达最大重连次数，尝试重连
        if (!isClosed && reconnectCount < config.maxReconnect) {
          reconnectSSE();
        }
      },
    });
    socketTask.onChunkReceived &&
      socketTask.onChunkReceived((res) => {
        console.log('分片数据接收中', res.data);
        parseSSEData(res.data);
      });
  };

  // 重连SSE
  const reconnectSSE = () => {
    if (isClosed || reconnectCount >= config.maxReconnect) {
      onError(new Error('SSE重连次数已达上限'));
      return;
    }
    reconnectCount += 1;
    setTimeout(connectSSE, config.reconnectInterval);
  };

  // 关闭SSE连接
  const closeSSE = () => {
    console.log('closeSSE');
    isClosed = true;
    if (socketTask) {
      console.log('socketTask closeSEE');
      socketTask.abort && socketTask.abort(); // 终止流式请求
      socketTask = null;
    }
    buffer = '';
  };

  // 初始化连接
  connectSSE();

  // 返回控制对象（替代原有EventSource实例）
  return {
    close: closeSSE,
    isConnected: () => !!socketTask && !isClosed,
  };
};

/**
 * 关闭小程序版SSE连接
 * @param {Object} sseInstance - createSSEConnection返回的对象
 */
export const closeSSEConnection = (sseInstance) => {
  console.log('closeSSEConnection');
  if (sseInstance && typeof sseInstance.close === 'function') {
    sseInstance.close();
  }
};
