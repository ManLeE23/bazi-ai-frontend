import { ref } from 'vue';

interface MessageData {
  session_id: string;
  user_id: string;
  role: string;
  content: string;
  reasoning_content?: string;
  id: string;
  created_at: string;
}

interface SSEParams {
  session_id: string;
  user_input: string;
}

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

export default function useSSEMessage(params: SSEParams) {
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const messageList = ref<MessageData[]>([]);
  let socketTask: any = null;
  let buffer = '';
  let isClosed = false;
  let errorCount = 0;
  const MAX_ERROR_COUNT = 3; // 最大错误次数
  let currentMessageId = `stream_${Date.now()}`;

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

          if (!data) {
            console.warn('解析出空的SSE数据');
            continue;
          }

          console.log('SSE data received', data);
          errorCount = 0; // 重置错误计数

          const type = (data as any).type;
          if (type === 'stream_update') {
            const chunkContent =
              (data as any).content ??
              ((data as any).payload && (data as any).payload.content) ??
              '';
            const chunkReasoning =
              (data as any).reasoning ??
              ((data as any).payload &&
                (data as any).payload.reasoning_content) ??
              '';
            const idx = messageList.value.findIndex(
              (m) => m.id === currentMessageId,
            );
            if (idx === -1) {
              const msg: MessageData = {
                session_id: params.session_id,
                user_id: '',
                role: 'assistant',
                content: chunkContent || '',
                reasoning_content: chunkReasoning || '',
                id: currentMessageId,
                created_at: new Date().toISOString(),
              };
              messageList.value.push(msg);
              messageList.value = [...messageList.value];
            } else {
              const existing = messageList.value[idx];
              const nextContent = chunkContent || '';
              const baseContent = existing.content || '';
              const mergedContent =
                nextContent !== ''
                  ? nextContent.length >= baseContent.length
                    ? nextContent
                    : baseContent
                  : baseContent;
              const nextReasoning = chunkReasoning || '';
              const baseReasoning = existing.reasoning_content || '';
              const mergedReasoning =
                nextReasoning !== ''
                  ? nextReasoning.length >= baseReasoning.length
                    ? nextReasoning
                    : baseReasoning
                  : baseReasoning;
              const updated: MessageData = {
                ...existing,
                content: mergedContent,
                reasoning_content: mergedReasoning,
              };
              messageList.value[idx] = updated;
              messageList.value = [...messageList.value];
            }
          } else if (type === 'final_response') {
            const finalId =
              (data as any).id ??
              ((data as any).payload && (data as any).payload.id);
            const createdAt =
              (data as any).created_at ??
              ((data as any).payload && (data as any).payload.created_at) ??
              new Date().toISOString();
            const idx = messageList.value.findIndex(
              (m) => m.id === currentMessageId,
            );
            if (idx !== -1) {
              const existing = messageList.value[idx];
              const updated: MessageData = {
                ...existing,
                id: finalId || existing.id,
                created_at: createdAt,
              };
              messageList.value[idx] = updated;
              messageList.value = [...messageList.value];
            }
            isLoading.value = false;
            stopSSE();
          } else if ((data as any).id) {
            const exists = messageList.value.some(
              (msg) => msg.id === (data as any).id,
            );
            if (!exists) {
              messageList.value.push({
                ...(data as any),
                role: (data as any).role || 'assistant',
              } as MessageData);
            } else {
              const idx = messageList.value.findIndex(
                (m) => m.id === (data as any).id,
              );
              if (idx !== -1) {
                const merged: MessageData = {
                  ...messageList.value[idx],
                  ...(data as any),
                };
                messageList.value[idx] = merged;
                messageList.value = [...messageList.value];
              }
            }
          }
        } catch (e) {
          console.error('SSE数据解析失败:', e, '原始数据:', dataMatch[1]);
          errorCount++;

          // 如果错误次数过多，关闭连接
          if (errorCount >= MAX_ERROR_COUNT) {
            console.error('SSE连续解析错误超过限制，关闭连接');
            stopSSE();
          }
        }
      }
    }

    // 保留最后一个不完整的片段到缓冲
    buffer = events[events.length - 1];
  };

  // 开始SSE连接
  const startSSE = () => {
    isLoading.value = true;
    error.value = null;
    isClosed = false;

    // 构建请求URL
    const url = `/api/chat/sessions/stream-chat/${params.session_id}`;

    // 创建SSE连接
    socketTask = uni.request({
      url: url,
      method: 'POST',
      data: params,
      dataType: 'text',
      header: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      responseType: 'arraybuffer', // 重要：使用arraybuffer接收二进制数据
      enableChunked: true, // 启用分块传输
      success: (res) => {
        console.log('SSE连接建立成功', res);
      },
      fail: (err) => {
        console.error('SSE连接失败', err);
        error.value = err.errMsg || '连接失败';
        isLoading.value = false;
      },
      complete: () => {
        // WeChat 小程序端会在流结束时触发 complete，并可能返回空字符串
        // 避免因默认 dataType 解析而报错，统一在此安全收尾
        if (!isClosed) {
          isLoading.value = false;
        }
      },
    });

    // 监听数据接收 - 使用 onChunkReceived 而不是 onMessage
    if (socketTask && socketTask.onChunkReceived) {
      socketTask.onChunkReceived((res: any) => {
        if (isClosed) {
          return; // 如果已关闭则不再处理数据
        }

        if (res.data && res.data !== '[DONE]' && res.data !== '') {
          parseSSEData(res.data);
        } else if (res.data === '[DONE]') {
          isLoading.value = false;
          stopSSE();
        }
      });
    }

    // 移除 then/catch 依赖，兼容小程序端 RequestTask 无 Promise 的实现
  };

  // 停止SSE连接
  const stopSSE = () => {
    console.log('关闭SSE连接');
    isClosed = true;
    if (socketTask) {
      socketTask.abort && socketTask.abort(); // 终止流式请求
      socketTask = null;
    }
    buffer = '';
    isLoading.value = false;
  };

  return {
    messageList,
    isLoading,
    error,
    startSSE,
    stopSSE,
  };
}
