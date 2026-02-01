<template>
  <view class="root">
    <!-- Background Blobs -->
    <view class="energy-blob blob-1"></view>
    <view class="energy-blob blob-2"></view>

    <!-- Custom Header -->
    <HeaderBar :fixed="true" :show-back="false">
      <template #left>
        <button @click="showSidebar = true" class="sidebar-toggle-btn">
          <view class="hamburger-icon">
            <view class="bar long"></view>
            <view class="bar short"></view>
          </view>
        </button>
      </template>
    </HeaderBar>
    
    <!-- Sidebar -->
    <u-popup v-model="showSidebar" mode="left" width="600">
      <view class="sidebar-content">
        <!-- Sidebar content placeholder -->
      </view>
    </u-popup>

    <!-- Chat Messages -->
    <view class="scroll-box" :style="{ paddingTop: headerHeight + 'px' }">
      <ReportGeneration ref="reportGenerationRef" :report-id="reportId" />

      <!-- Chat Message List -->
      <view class="chat-message-list">
        <!-- Initial Greeting (Static or Dynamic?) - keeping dynamic for now -->
        
        <view v-for="(message, index) in chatMessages" :key="index" class="message-wrapper message-in">
          
          <!-- Thinking Chain Display -->
          <view v-if="message.reasoning_content" class="thinking-box animate-fade-in">
            <view @click="toggleReasoning(message)" class="thinking-header">
              <view class="thinking-header-left">
                <view class="thinking-icon" :class="{ 'animate-spin': isThinking && index === chatMessages.length - 1 }">
                  <view class="icon-svg"></view>
                </view>
                <text class="status-text-thinking">
                  {{ (isThinking && index === chatMessages.length - 1) ? '深度思考中...' : '已完成深度思考' }}
                </text>
              </view>
            </view>
          </view>

          <!-- Message Bubble -->
          <view :class="['message-row', message.role === 'user' ? 'justify-end' : 'justify-start']">
            <template v-if="message.type === 'bazi'">
               <BaziCard :data="message.baziData" :userInfo="userInfo" />
            </template>
            <view v-else :class="['bubble', message.role === 'user' ? 'user-bubble' : 'ai-bubble']">
              <view class="bubble-content">
                <text v-if="message.role === 'user' && message.content" :user-select="true" :selectable="true" class="message-text user-text">{{ message.content }}</text>
                <MarkDown v-else-if="message.role === 'assistant' && message.content" :content="message.content" />
              </view>
            </view>
          </view>
          
        </view>

        <!-- Typing indicator -->
        <view v-if="isTyping" class="message-wrapper">
          <view class="message-row justify-start">
             <view class="bubble ai-bubble typing-bubble">
                <LoadingIndicator />
             </view>
          </view>
        </view>
        
        <view id="chat-bottom" style="height: 1rpx;"></view>
      </view>
    </view>

    <!-- Scroll to Bottom Button -->
    <view class="scroll-to-bottom" v-if="!isUserAtBottom" @click.stop="scrollToBottom(true)">
      <view class="arrow-icon">
        <image :src="downSvg" class="icon-img" mode="aspectFit" />
      </view>
    </view>

    <!-- Input Area -->
    <InputWithButton :model-value="inputText" @update:model-value="onInputUpdate" @click="sendQuestion"
      @generate-report="startReportGeneration" @show-bazi="handleShowBazi" />
  </view>
</template>

<script setup lang="ts">
import { onLoad, onPageScroll } from '@dcloudio/uni-app';
import BaziButton from '@/components/BaziButton.vue';
import { ref, onMounted, nextTick } from 'vue';
import HeaderBar from '@/components/HeaderBar.vue';
import useSSEMessage from './hooks/useSSEMessage'; // 导入新的hook
import { fetchReportById, fetchProgressfromReportId, fetchChatHistory, fetchSendMessage, fetchBaziCalculate, fetchCreateSession, fetchSessionUserInfo } from '@/api/services';
import InputWithButton from '@/components/InputWithButton.vue';
import ReportGeneration from '@/components/ReportGeneration.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import MarkDown from '../components/MarkDown/index.vue';
import BaziCard from './components/BaziCard.vue';
import { watch } from 'vue'; // 导入watch
import downSvg from '@/static/icon/down.svg?url';

const reportGenerationRef = ref<InstanceType<typeof ReportGeneration> | null>(null);
const reportId = ref<string>('');
const isUserAtBottom = ref(true); // Track if user is at bottom
const showSidebar = ref(false);
const headerHeight = ref(0);

const structuredMessages = ref<any[]>([]);
const chatMessages = ref<{ 
  role: string; 
  content: string; 
  timestamp: Date; 
  id: string; 
  reasoning_content?: string; 
  isReasoningExpanded?: boolean; 
  isStreaming?: boolean;
  type?: 'text' | 'bazi';
  baziData?: any;
}[]>([]);
const inputText = ref('');
const isTyping = ref(false);
const showInsightCard = ref(false);
const step = ref(0);
const reportData = ref(null);
const isGenerating = ref(false);
const showChatInterface = ref(true);
const sessionId = ref<string>('');
const isFromIndexPage = ref(false);

// 思维链相关状态
const isThinking = ref(false);

const userInfo = ref<any>(null);
const baziFetchPromise = ref<Promise<any> | null>(null);

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.switchTab({
      url: '/pages/index/index'
    });
  }
};

onLoad((options: any) => {
  if (options.sessionId) {
    sessionId.value = options.sessionId;

    // 检查是否从首页进入
    isFromIndexPage.value = options.from === 'index' || !options.from;

    getChatHistory();
  }
  if (options.message && isFromIndexPage) {
    inputText.value = options.message;
  }

  const initBaziData = (info: any) => {
    baziFetchPromise.value = fetchBaziCalculate(info)
      .then(res => ({ success: true, res }))
      .catch(error => {
        console.error('Bazi pre-fetch failed:', error);
        return { success: false, error };
      });
  };

  if (options.userInfo) {
    try {
      userInfo.value = JSON.parse(decodeURIComponent(options.userInfo));
      initBaziData(userInfo.value);
    } catch (e) {
      console.error('Parse userInfo error:', e);
    }
  } else if (sessionId.value) {
    // Historical session: fetch user info
    fetchSessionUserInfo(sessionId.value).then(res => {
      if (res.data) {
        userInfo.value = res.data;
        initBaziData(userInfo.value);
      }
    }).catch(err => {
      console.error('Fetch session user info error:', err);
    });
  } else {
    // New session: create session first
    fetchCreateSession({}).then(res => {
      const data = res.data as any;
      if (data) {
        sessionId.value = data.session_id;
        if (data.user_info) {
          userInfo.value = data.user_info;
          initBaziData(userInfo.value);
        }
      }
    }).catch(err => {
      console.error('Create session error:', err);
    });
  }
});

onPageScroll(() => {
  checkIfAtBottom();
});

const checkIfAtBottom = () => {
  const query = uni.createSelectorQuery();
  query.select('#chat-bottom').boundingClientRect();
  query.exec((res) => {
    if (!res[0]) return;
    const bottomRect = res[0];
    const windowHeight = uni.getSystemInfoSync().windowHeight;
    // Allow 100px threshold to be more sensitive to upward scrolling
    isUserAtBottom.value = bottomRect.top <= windowHeight - 100;
  });
};

const scrollToBottom = (force = false) => {
  if (!force && !isUserAtBottom.value) return;

  nextTick(() => {
    uni.pageScrollTo({
      scrollTop: 999999,
      duration: 300,
      success: () => {
         if (force) {
            isUserAtBottom.value = true;
         }
      }
    });
  });
};

onMounted(() => {
  // Calculate header height for padding
  const sysInfo = uni.getSystemInfoSync();
  const statusBarHeight = sysInfo.statusBarHeight || 20;
  let navBarHeight = 44;

  // #ifdef MP-WEIXIN
  const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
  const gap = menuButtonInfo.top - statusBarHeight;
  navBarHeight = menuButtonInfo.height + (gap * 2);
  // #endif

  headerHeight.value = statusBarHeight + navBarHeight;
});

const getChatHistory = async () => {
  try {
    const res = await fetchChatHistory(sessionId.value);
    console.log('Chat history response:', res);

    if (Array.isArray(res.data)) {
      // 清空现有消息
      chatMessages.value = [];

      // 遍历聊天历史数据并添加到消息列表
      res.data.forEach(item => {
        // 添加用户消息
        if (item.role === 'user') {
          chatMessages.value.push({
            role: 'user',
            content: item.content,
            timestamp: new Date(item.created_at),
            id: item.id
          });
        } else if (item.role === 'assistant') {
          // 如果有AI消息，也可以添加
          chatMessages.value.push({
            role: 'assistant',
            reasoning_content: item.reasoning_content,
            content: item.content,
            timestamp: new Date(item.created_at),
            id: item.id,
            isReasoningExpanded: false // 历史消息默认收起
          });
        }
      });

      scrollToBottom(true);

      // 检查是否需要自动触发
      if (res.data.length === 0) {
        sendQuestion();
      }
    }
  } catch (error) {
    console.error('获取聊天历史失败:', error);
  }
};

// 切换思维链显示/隐藏
const toggleReasoning = (message: any) => {
  message.isReasoningExpanded = !message.isReasoningExpanded;
};

const handleShowBazi = async () => {
  // Simulate user asking "看生辰"
  chatMessages.value.push({
    role: 'user',
    content: '看生辰',
    timestamp: new Date(),
    id: `user_${Date.now()}`,
    type: 'text'
  });
  
  scrollToBottom(true);
  isTyping.value = true;
  
  try {
    let result;
    
    // Use pre-fetched promise if available
    if (baziFetchPromise.value) {
      result = await baziFetchPromise.value;
    } else {
      // Fallback if promise is missing (e.g. component reloaded but onLoad didn't fire appropriately?)
      // or just direct call if logic changes.
      try {
        if (!userInfo.value) {
           throw new Error('User info not ready');
        }
        const res = await fetchBaziCalculate(userInfo.value);
        result = { success: true, res };
      } catch (error) {
        result = { success: false, error };
      }
    }

    if (result.success && result.res && result.res.data) {
       chatMessages.value.push({
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        id: `ai_${Date.now()}`,
        type: 'bazi',
        baziData: result.res.data
      });
      scrollToBottom(true);
    } else {
       throw result.error || new Error('Unknown error');
    }
  } catch (error) {
    console.error('获取八字数据失败:', error);
    chatMessages.value.push({
        role: 'assistant',
        content: '获取八字数据失败，请稍后再试。',
        timestamp: new Date(),
        id: `ai_${Date.now()}`,
        type: 'text'
    });
  } finally {
    isTyping.value = false;
    scrollToBottom(true);
  }
};

const sendQuestion = async () => {
  if (inputText.value.trim()) {
    // 添加用户消息到聊天列表
    chatMessages.value.push({
      role: 'user',
      content: inputText.value,
      timestamp: new Date(),
      id: `temp_${Date.now()}`
    });

    scrollToBottom(true);

    // 清空输入框
    const question = inputText.value;
    inputText.value = '';

    // 显示打字指示器
    isTyping.value = true;
    isThinking.value = true;

    try {
      // 使用SSE获取流式响应
      const { messageList, isLoading, startSSE, stopSSE } = useSSEMessage({
        session_id: sessionId.value,
        user_input: question
      });

      // 开始SSE连接
      startSSE();

      // 监听SSE消息更新
      const unwatch = watch(messageList, (newMessages) => {
        if (newMessages.length > 0) {
          const latestMessage = newMessages[newMessages.length - 1];
          const existingMessage = chatMessages.value.find((msg) => msg.id === latestMessage.id);
          const startedContent =
            latestMessage.role === 'assistant' &&
            typeof latestMessage.content === 'string' &&
            latestMessage.content.length > 0;

          if (startedContent) {
            isTyping.value = false;
            isThinking.value = false;
            if (existingMessage) {
              existingMessage.isReasoningExpanded = false;
            }
          }
          if (existingMessage) {
            existingMessage.content = latestMessage.content;
            existingMessage.reasoning_content = latestMessage.reasoning_content;
            existingMessage.timestamp = new Date(latestMessage.created_at || Date.now());
            existingMessage.isStreaming = true;
          } else if (latestMessage.role === 'assistant') {
            chatMessages.value.push({
              role: 'assistant',
              reasoning_content: latestMessage.reasoning_content,
              content: latestMessage.content,
              timestamp: new Date(latestMessage.created_at || Date.now()),
              id: latestMessage.id,
              isReasoningExpanded: false,
              isStreaming: true
            });
          }
        }

        scrollToBottom();
      }, { deep: true });

      // 监听加载状态
      const unwatchLoading = watch(isLoading, (loading) => {
        if (!loading) {
          // 加载完成，停止监听
          unwatch();
          unwatchLoading();
          isTyping.value = false;
          isThinking.value = false;
          for (let i = chatMessages.value.length - 1; i >= 0; i--) {
            const msg = chatMessages.value[i];
            if (msg.role === 'assistant' && msg.isStreaming) {
              msg.isStreaming = false;
              break;
            }
          }
          scrollToBottom();
        }
      });

    } catch (error) {
      console.error('发送问题失败:', error);
      isTyping.value = false;
      isThinking.value = false;
    }
  }
};

const onInputUpdate = (value: string) => {
  inputText.value = value;
};

const formatTime = (date: Date) => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const startReportGeneration = () => {
  console.log('reportGenerationRef', reportGenerationRef.value);
  // 设置生成状态为true，开始报告生成流程
  isGenerating.value = true;

  // 使用nextTick确保组件渲染完成后再调用
  nextTick(() => {
    if (reportGenerationRef.value) {
      reportGenerationRef.value.startGeneration();
    }
  });
};

const onGenerationComplete = () => {
  // 生成完成后，隐藏生成界面，显示聊天界面
  isGenerating.value = false;
  showChatInterface.value = true;
};

</script>

<style lang="scss" scoped>
.root {
  min-height: 100vh;
  background-color: #F8F9FF;
  position: relative;

  view {
    box-sizing: border-box;
  }
}

/* Energy Blobs */
.energy-blob {
  position: fixed;
  width: 600rpx;
  height: 600rpx;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.4;
  border-radius: 50%;
  animation: move 25s infinite alternate ease-in-out;
  pointer-events: none;
}

.blob-1 {
  background-color: #c7d2fe;
  top: -10%;
  left: -10%;
}

.blob-2 {
  background-color: #ffe4e6;
  bottom: -10%;
  right: -10%;
  animation-delay: -10s;
}

@keyframes move {
  from {
    transform: translate(-20%, -20%);
  }
  to {
    transform: translate(30%, 40%);
  }
}

/* Custom Header */
/* .custom-header removed - replaced by HeaderBar component */

.header-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  color: #94a3b8;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.95);
  }
}

/* .header-center, .app-title removed */


@keyframes pulse-green {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.7;
    transform: scale(0.9);
  }
}

.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.insight-card {
  margin: 16px 0;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 12px;
  width: 100%;
}

.scroll-box {
  width: 100%;
  box-sizing: border-box;
  padding-bottom: 152px;
}

.scroll-to-bottom {
  position: fixed;
  bottom: 240rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.8);

  .arrow-icon {
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-img {
    width: 100%;
    height: 100%;
  }

  &:active {
    transform: translateX(-50%) scale(0.95);
    background: rgba(255, 255, 255, 1);
  }
}

/* Chat Message Styles */
.chat-message-list {
  padding: 0 16px;
}

.loading-icon {
  background: transparent !important;
  width: fit-content !important;
}

.message-item {
  &:last-child {
    margin-bottom: 0;
  }
  margin-bottom: 32rpx;
}

.message-content {
  display: flex;
  align-items: flex-start;
}

.ai-message {
  flex-direction: row;
}

.user-message {
  flex-direction: row-reverse;
}

.message-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: 28rpx;
  line-height: 1.8;
}

.bubble {
  padding: 24rpx;
  border-radius: 24rpx;
  max-width: 95%;
  position: relative;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.user-bubble {
  background: #4f46e5;
  // background: linear-gradient(to bottom, #6366f1, #6b72e8, #8b5cf6);
  color: white;
  // border-bottom-right-radius: 8rpx;
  margin-left: auto;
  box-shadow: 0 10px 15px -3px rgb(224 231 255 / 0.5), 0 4px 6px -4px rgb(224 231 255 / 0.5);
  border-radius: 24px;
  border-top-right-radius: 0;
}

.ai-bubble {
  background-color: rgba(255, 255, 255, 0.8);
  color: #334155;
  // border-bottom-left-radius: 8rpx;
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border-top-left-radius: 0px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border: 1px solid #e0e7ff4d;
}

.response-content {
  display: block;
  font-weight: bold;
  color: #4f46e5;
  margin-bottom: 8rpx;
  font-size: 30rpx;
  line-height: 1.5;
}

.typing-indicator {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx !important;
  background: transparent;
  border: none;
  box-shadow: none;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  background-color: #a5b4fc;
  border-radius: 50%;
  margin-right: 12rpx;
  animation: bounce 1.5s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5rpx);
  }
}

.message-time {
  margin-top: 8rpx;
  text-align: right;
  padding-right: 16rpx;
}

.bg-indigo-50-opacity {
  background-color: rgba(238, 242, 255, 0.4);
}

.bg-white-opacity {
  background-color: rgba(255, 255, 255, 0.8);
}

.bg-white-40 {
  background-color: rgba(255, 255, 255, 0.4);
}

.bg-white-50 {
  background-color: rgba(255, 255, 255, 0.5);
}

.bg-white-70 {
  background-color: rgba(255, 255, 255, 0.7);
}

.border-white-80 {
  border-color: rgba(255, 255, 255, 0.8);
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

/* Font sizes */
.text-xs-tiny {
  font-size: 22rpx;
  /* 增加4rpx */
}

.text-xs-small {
  font-size: 24rpx;
  /* 增加4rpx */
}

.text-sm {
  font-size: 28rpx;
  /* 增加4rpx */
}

.text-base {
  font-size: 32rpx;
  /* 增加4rpx */
}

.text-lg {
  font-size: 36rpx;
  /* 增加4rpx */
}

.text-xl {
  font-size: 40rpx;
  /* 增加4rpx */
}

.text-2xl {
  font-size: 52rpx;
  /* 增加4rpx */
}

.text-3xl {
  font-size: 52rpx;
  /* 增加4rpx */
}

.text-4xl {
  font-size: 68rpx;
  /* 增加4rpx */
}

.leading-relaxed {
  line-height: 1.625;
}

.font-bold {
  font-weight: 700;
}

.font-black {
  font-weight: 900;
}

.font-mono {
  font-family: monospace;
}

.uppercase {
  text-transform: uppercase;
}

.tracking-tighter {
  letter-spacing: -0.05em;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.tracking-widest {
  letter-spacing: 0.1em;
}

.text-gray-300 {
  color: #d1d5db
}

;

.text-gray-800 {
  color: #1f2937;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.text-indigo-500 {
  color: #6366f1;
}

.text-indigo-400 {
  color: #818cf8;
}

.text-indigo-600 {
  color: #4f46e5;
}

.border-indigo-100 {
  border-color: #e0e7ff;
}

.rounded-3xl {
  border-radius: 48rpx;
}

.rounded-2xl {
  border-radius: 32rpx;
}

.rounded-xl {
  border-radius: 24rpx;
}

.w-8 {
  width: 64rpx;
}

.h-8 {
  height: 64rpx;
}

.w-full {
  width: 100%;
}

.h-12 {
  height: 96rpx;
}

.h-20 {
  height: 160rpx;
}

.w-20 {
  width: 160rpx;
}

.w-1 {
  width: 8rpx;
}

.h-3 {
  height: 24rpx;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.top-0 {
  top: 0;
}

.z-10 {
  z-index: 10;
}

.z-40 {
  z-index: 40;
}

.z-50 {
  z-index: 50;
}

.px-6 {
  padding-left: 24rpx;
  padding-right: 24rpx;
}

.py-4 {
  padding-top: 16rpx;
  padding-bottom: 16rpx;
}

.mt-2 {
  margin-top: 16rpx;
}

.mb-2 {
  margin-bottom: 16rpx;
}

.mt-4 {
  margin-top: 32rpx;
}

.mb-10 {
  margin-bottom: 80rpx;
}

.mt-1 {
  margin-top: 8rpx;
}

.mb-1 {
  margin-bottom: 8rpx;
}

.p-5 {
  padding: 40rpx;
}

.p-6 {
  padding: 48rpx;
}

.py-8 {
  padding-top: 64rpx;
  padding-bottom: 64rpx;
}

.pt-12 {
  padding-top: 96rpx;
}

.pb-24 {
  padding-bottom: 192rpx;
}

.pt-20 {
  padding-top: 160rpx;
}

.pb-20 {
  padding-bottom: 160rpx;
}

.px-4 {
  padding-left: 24px;
  padding-right: 24px;
}

.px-7 {
  padding-left: 56rpx;
  padding-right: 56rpx;
}

.py-6 {
  padding-top: 48rpx;
  padding-bottom: 48rpx;
}

.space-y-8 {
  margin-top: 64rpx;
}

.space-y-6 {
  margin-top: 48rpx;
}

.space-y-4 {
  margin-top: 32rpx;
}

.space-y-2 {
  margin-top: 16rpx;
}

.gap-4 {
  gap: 32rpx;
}

.gap-3 {
  gap: 24rpx;
}

.gap-2 {
  gap: 16rpx;
}

.gap-5 {
  gap: 40rpx;
}

.items-start {
  align-items: flex-start;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-around {
  justify-content: space-around;
}

.justify-center {
  justify-content: center;
}

.text-center {
  text-align: center;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.flex-col {
  flex-direction: column;
}

.overflow-y-auto {
  overflow-y: auto;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

.backdrop-filter {
  backdrop-filter: blur(14px);
}

/* Thinking Chain Styles */
.thinking-box {
  background-color: rgba(238, 242, 255, 0.5); /* bg-indigo-50/50 */
  border-left: 8rpx solid rgba(129, 140, 248, 0.3); /* border-l-4 border-indigo-400/30 */
  border-top-right-radius: 24rpx; /* rounded-r-[20px] */
  border-bottom-right-radius: 24rpx;
  border-bottom-left-radius: 24rpx; /* rounded-bl-[20px] */
  border-top-left-radius: 0;
  overflow: hidden;
  box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
  margin-bottom: 24rpx;
  max-width: 95%;
}

.thinking-header {
  padding: 20rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.3s;

  &:active {
    background-color: rgba(224, 231, 255, 0.3); /* hover:bg-indigo-100/30 equivalent */
  }
}

.thinking-header-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.thinking-icon {
  width: 28rpx;
  height: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .icon-svg {
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234f46e5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M13 10V3L4 14h7v7l9-11h-7z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }

  &.animate-spin .icon-svg {
    animation: spin 1s linear infinite;
  }
}

.status-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #818cf8; /* text-indigo-400 */
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.toggle-text {
  font-size: 26rpx;
  font-weight: 500;
  color: #a5b4fc; /* text-indigo-300 */
}

.thinking-content {
  padding: 24rpx 32rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.5); /* border-white/50 */
}

.thought-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.thought-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: #818cf8; /* bg-indigo-400 */
  margin-top: 12rpx;
  flex-shrink: 0;
  box-shadow: 0 0 8rpx rgba(129, 140, 248, 0.5); /* shadow-[0_0_4px_rgba(129,140,248,0.5)] */
}

.thought-text {
  font-size: 28rpx;
  color: #475569; /* text-slate-600 */
  font-weight: 500;
  line-height: 1.625;
}

.thinking-loading {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 8rpx;
}

.loading-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: #6366f1; /* bg-indigo-500 */
  animation: pulse 2s infinite;
}

.loading-bar {
  height: 12rpx;
  width: 128rpx;
  background-color: rgba(199, 210, 254, 0.5); /* bg-indigo-200/50 */
  border-radius: 9999rpx;
  animation: pulse 1.5s infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.message-wrapper {
  width: 100%;
  margin-bottom: 32rpx;
  &:last-child {
    margin-bottom: 0;
  }
}

.message-row {
  display: flex;
  width: 100%;
}

.justify-end {
  justify-content: flex-end;
}

.justify-start {
  justify-content: flex-start;
}

.message-in {
  animation: springUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.2) both;
}

@keyframes springUp {
  0% {
    opacity: 0;
    transform: translateY(30rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.sidebar-toggle-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  padding: 0;
  margin: 0;
  border: none;
  
  &:active {
    transform: scale(0.9);
  }

  .hamburger-icon {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
    
    .bar {
      height: 2px;
      background-color: #1e293b;
      border-radius: 999px;
      
      &.long {
        width: 18px;
      }
      
      &.short {
        width: 10px;
      }
    }
  }
}

.sidebar-content {
  padding: 40px 20px;
}
</style>
