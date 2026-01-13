<template>
  <div class="chat-page">
    <!-- Header -->
    <div class="chat-header">
      <u-navbar
        :is-back="true"
        :is-fixed="true"
        background="transparent"
        back-icon-color="#fff"
        :border-bottom="false"
      />
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <image src="@/static/icon/chat.svg" class="icon" />
          </div>
          <div class="header-text">
            <h3 class="header-title">AI 命师</h3>
            <p class="header-subtitle">还剩 {{ remainingQuestions }} 次免费解答</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="messages-container">
      <!-- 使用新的步骤组件渲染AI报告生成过程 -->
      <ReportSteps :messages="structuredMessages" />
      
      <!-- 用户消息仍按原有方式显示 -->
      <div 
        v-for="(message, index) in userMessages" 
        :key="'user-' + index"
        class="message-item user-message"
      >
        <div class="message-content user-content">
          <p class="message-text">{{ message.content }}</p>
        </div>
      </div>

      <div v-if="isTyping" class="message-item ai-message">
        <div class="ai-content typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>

      <!-- 报告完成后的跳转卡片 -->
      <ReportCard 
        v-if="showReportCard" 
        @click="goToReport"
      />

      <div ref="messagesEndRef" />
    </div>

    <!-- Input Area -->
    <div class="input-container">
      <div v-if="remainingQuestions === 0" class="upgrade-section">
        <div class="upgrade-content">
          <p class="upgrade-text">免费次数已用完</p>
          <p class="upgrade-subtext">升级会员获取更多解答</p>
        </div>
        <div class="upgrade-button">
          <button class="upgrade-btn">立即升级会员</button>
        </div>
      </div>
      <div v-else class="input-area">
        <input
          ref="inputRef"
          type="text"
          v-model="input"
          @keypress="handleKeyPress"
          placeholder="输入你的疑问..."
          :disabled="isTyping"
          class="chat-input"
        />
        <button
          @click="handleSend"
          :disabled="!input.trim() || isTyping"
          class="send-btn"
        >
          <image src="@/static/icon/send.svg" class="send-icon" />
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, computed } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import useChatSSE from '@/hooks/useChatSSE';
import ReportSteps from '@/components/ReportSteps.vue';
import ReportCard from './components/ReportCard.vue'; // 导入ReportCard组件

type Message = {
  role: 'user' | 'ai';
  content: string;
};

// 用于存储结构化消息（AI报告生成过程）
const structuredMessages = ref<any[]>([]);

// 用于存储用户消息
const userMessages = ref<Message[]>([]);

const input = ref('');
const remainingQuestions = ref(3);
const isTyping = ref(false);
const messagesEndRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const showReportCard = ref(false);

let chatId: string | null = null;
let sseClient: any = null;

onLoad((options) => {
  if (options.chatId) {
    chatId = options.chatId;
    // 这里可以添加加载聊天历史的逻辑
  }
  if (options.reportId) {
    // 连接到 SSE 服务器
    connectSSE(options.reportId);
  }
});

// 连接到 SSE
const connectSSE = (reportId: string) => {
  const sseUrl = `/api/v1/reports/structured-thinking-sse/${reportId}`;
  
  sseClient = useChatSSE({
    url: sseUrl,
    onOpen: (event) => {

      console.log('SSE 连接已打开', event);
    },
    onMessage: (event) => {
      console.log('收到 SSE 消息', event);
      isTyping.value = false;
      
      // 根据消息类型处理
      try {
        // 检查是否是结构化消息
        if (event && typeof event === 'object' && 'stage' in event) {
          // 这是一个结构化消息，添加到structuredMessages
          structuredMessages.value.push(event);
          
          // 检查是否是完成状态
          if (event.messages && 
              (event.messages.type === 'completed' || 
               (event.messages.type === 'generater_report' && event.messages.content.includes('完成')))) {
            showReportCard.value = true;
          }
        } else {
          // 这是一个普通消息，添加到用户消息
          const messageContent = typeof event === 'string' ? event : JSON.stringify(event);
          userMessages.value.push({
            role: 'ai',
            content: messageContent
          });
        }
      } catch (e) {
        console.error('处理SSE消息失败:', e);
        // 如果解析失败，仍然尝试显示原始数据
        userMessages.value.push({
          role: 'ai',
          content: typeof event === 'string' ? event : JSON.stringify(event)
        });
      }
      updateMessages();
    },
    onError: (event) => {
      console.error('SSE 连接错误', event);
      userMessages.value.push({
        role: 'ai',
        content: '连接出现问题，请稍后重试。'
      });
      isTyping.value = false;
      updateMessages();
    },
    onClosed: (event) => {
      console.log('SSE 连接已关闭', event);
    }
  });
};

onUnload(() => {
  // 页面卸载时关闭 SSE 连接
  if (sseClient && sseClient.close) {
    sseClient.close();
  }
});

onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus();
  }
});

const scrollToBottom = async () => {
  await nextTick();
  if (messagesEndRef.value) {
    uni.pageScrollTo({
      scrollTop: messagesEndRef.value.offsetTop,
      duration: 300
    });
  }
};

// 每次消息更新后滚动到底部
const updateMessages = () => {
  nextTick(() => {
    scrollToBottom();
  });
};

updateMessages();

const handleSend = () => {
  if (!input.value.trim() || remainingQuestions.value === 0 || isTyping.value) return;

  const userMessage: Message = {
    role: 'user',
    content: input.value,
  };

  userMessages.value.push(userMessage);
  input.value = '';
  isTyping.value = true;
  remainingQuestions.value -= 1;

  updateMessages();

  // 如果有 SSE 连接，则发送消息
  if (sseClient && sseClient.isConnected.value) {
    sseClient.sendMessage({
      type: 'chat_message',
      content: userMessage.content,
      timestamp: Date.now()
    });
  }
};

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};

// 跳转到报告页面
const goToReport = () => {
  uni.navigateTo({
    url: '/pages/report/index'
  });
};
</script>

<style lang="scss" scoped>
.chat-page {
  height: 100vh;
  overflow: hidden;
  background: $color-white;
  display: flex;
  flex-direction: column;
  padding-top: var(--status-bar-height) 0 70px 0;
}

.chat-header {
  background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
  padding: 24px 20px 24px 20px;
  box-sizing: border-box;
  position: relative;
  z-index: 10;
  margin-bottom: 0;
  position: sticky;
  top: 0;
  
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .header-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .header-icon {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .icon {
          width: 20px;
          height: 20px;
        }
      }
      
      .header-text {
        .header-title {
          color: $color-white;
          font-size: $text-lg;
          margin: 0;
          font-weight: 600;
        }
        
        .header-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: $text-sm;
          margin: 0;
        }
      }
    }
  }
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
  background: $color-slate-50;
  
  .message-item {
    margin-bottom: 16px;
    display: flex;
    
    &.user-message {
      justify-content: flex-end;
    }
    
    &.ai-message {
      justify-content: flex-start;
    }
    
    .message-content {
      max-width: 80%;
      border-radius: 16px;
      padding: 12px 16px;
      
      &.user-content {
        background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
        color: $color-white;
      }
      
      &.ai-content {
        background: $color-slate-100;
        color: $color-slate-700;
      }
    }
    
    .message-text {
      margin: 0;
      line-height: 1.5;
      white-space: pre-wrap;
    }
  }
  
  .typing-indicator {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 8px 12px !important;
    
    .typing-dot {
      width: 8px;
      height: 8px;
      background: $color-slate-400;
      border-radius: 50%;
      animation: bounce 1.5s infinite ease-in-out;
      
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.input-container {
  position: sticky;
  bottom: 0;
  padding: 16px 20px;
  background: $color-white;
  border-top: 1px solid $color-slate-200;
  
  .upgrade-section {
    background: linear-gradient(135deg, $color-amber-50, $color-orange-50);
    border: 2px solid $color-amber-400;
    border-radius: 16px;
    padding: 16px;
    
    .upgrade-content {
      text-align: center;
      margin-bottom: 12px;
      
      .upgrade-text {
        color: $color-amber-800;
        font-size: $text-base;
        font-weight: 600;
        margin: 0 0 4px 0;
      }
      
      .upgrade-subtext {
        color: $color-amber-600;
        font-size: $text-sm;
        margin: 0;
      }
    }
    
    .upgrade-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
      color: $color-white;
      border: none;
      border-radius: 12px;
      font-size: $text-base;
      font-weight: 600;
    }
  }
  
  .input-area {
    display: flex;
    gap: 12px;
    
    .chat-input {
      flex: 1;
      padding: 12px 16px;
      background: $color-slate-50;
      border: 1px solid $color-slate-200;
      border-radius: 12px;
      font-size: $text-base;
      
      &:focus {
        outline: none;
        border-color: $color-amber-400;
        box-shadow: 0 0 0 2px rgba($color-amber-400, 0.2);
      }
      
      &[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    
    .send-btn {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
      border: none;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .send-icon {
        width: 20px;
        height: 20px;
      }
      
      &[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
</style>