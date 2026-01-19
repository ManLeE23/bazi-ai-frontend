<template>
  <view class="root">
    <!-- Header -->
    <!-- <view class="px-6 py-4 flex items-center justify-between bg-white">
      <button @click="goBack" class="text-gray-400 text-sm font-bold">
        ← 返回
      </button>
      <view class="text-center">
        <p class="font-black text-gray-800 text-sm">深度趋势模拟</p>
        <p class="text-xs-small font-bold text-indigo-500 animate-pulse uppercase tracking-tighter">
          AI Analysis in Progress
        </p>
      </view>
      <view class="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden">
        <image src="https://i.pravatar.cc/100?img=12" class="w-full h-full" />
      </view>
    </view> -->

    <u-navbar :is-back="true" :is-fixed="true" title="人生趋势官" title-color="#1f2937" background="transparent" back-icon-color="#1f2937"
      :border-bottom="false" />

    <!-- Chat Messages -->
    <scroll-view class="flex-1 px-4 overflow-y-auto" scroll-y :scroll-into-view="scrollToView"
      style="box-sizing: border-box;">
      <view class="think-box relative">
        <!-- Thinking line -->
        <view class="think-line think-line-position"></view>

        <!-- Existing thinking steps -->
        <view v-for="item in structuredMessages" :key="item.stage" class="relative flex items-start gap-4">
          <block v-if="item.type === 'text'">
            <view class="think-dot think-dot-default" :class="step === item.stage ? 'think-dot-active' : ''"></view>
            <view class="flex-1 -mt-1">
              <p class="text-sm font-bold text-gray-800">{{ item.title }}</p>
              <block v-if="item.payload.content">
                <block v-if="Array.isArray(item.payload.content)">
                  <view v-for="(subItem, index) in item.payload.content" :key="index"
                    class="mt-2 flex items-center gap-2">
                    <span class="text-xs-tiny"
                      :class="step === item.stage ? 'text-indigo-400 animate-pulse' : 'text-gray-300'">●</span>
                    <span class="text-xs-small text-gray-400 font-mono">{{ subItem }}</span>
                  </view>
                </block>
                <block v-else>
                  <view class="mt-2 flex items-center gap-2">
                    <span class="text-xs-tiny"
                      :class="step === item.stage ? 'text-indigo-400 animate-pulse' : 'text-gray-300'">●</span>
                    <span class="text-xs-small text-gray-400 font-mono">{{ item.payload.content }}</span>
                  </view>
                </block>
              </block>
            </view>
          </block>
        </view>

        <!-- Insight Card -->
        <view v-if="showInsightCard"
          class="insight-card glass border-indigo-100 bg-indigo-50-opacity translate-y-2 transition-all">
          <p class="text-xs font-black text-indigo-600 mb-2 uppercase tracking-widest">
            人生趋势报告
          </p>
          <p class="text-sm text-gray-700 leading-relaxed font-bold" style="margin-bottom: 8px;">
            分析完毕。你的格局属于"印绶护身"，目前正处于一个长达两年的上升周期起点。点击下方卡片看全维度数据。
          </p>
          <BaziButton type="default" size="small" show-shadow @click="goToDetail">
            查看完整趋势报告
          </BaziButton>
        </view>
      </view>

      <!-- Chat Message List -->
      <view class="chat-message-list mt-4">
        <view v-for="(message, index) in chatMessages" :key="index" class="message-item mb-4">
          <view :class="['message-content', message.role === 'user' ? 'user-message' : 'ai-message']">
            <view class="message-text">
              <view :class="['bubble', message.role === 'user' ? 'user-bubble' : 'ai-bubble']">
                <text>{{ message.content }}</text>
              </view>
              <!-- <view class="message-time text-xs text-gray-400 mt-1">
                {{ formatTime(message.timestamp) }}
              </view> -->
            </view>
          </view>
        </view>
        
        <!-- Typing indicator -->
        <view v-if="isTyping" class="message-item mb-4">
          <view class="message-content ai-message">
            <view class="message-text">
              <view class="bubble ai-bubble typing-indicator">
                <view class="dot"></view>
                <view class="dot"></view>
                <view class="dot"></view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Input Area -->
    <InputWithButton :model-value="inputText" @update:model-value="onInputUpdate" @click="sendQuestion" @confirm="sendQuestion" />
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import BaziButton from '@/components/BaziButton.vue';
import { ref, onMounted } from 'vue';
import useChatSSE from '@/hooks/useChatSSE';
import { fetchReportById, fetchProgressfromReportId } from '@/api/services';
import InputWithButton from '@/components/InputWithButton.vue';

const structuredMessages = ref<any[]>([]);
const chatMessages = ref<{role: string, content: string, timestamp: Date}[]>([]);
const inputText = ref('');
const scrollToView = ref('');
const isTyping = ref(false);
const showInsightCard = ref(false);
const step = ref(0);
const reportData = ref(null);

// const startAnalysis = () => {
//   step.value = 0;

//   // 模拟思考步骤递进
//   setTimeout(() => step.value = 1, 1000);
//   setTimeout(() => step.value = 2, 2200);
//   setTimeout(() => step.value = 3, 3500);
// };

const goBack = () => {
  uni.navigateBack();
};

const goToDetail = () => {
  uni.navigateTo({
    url: `/pages/report-detail/index?id=${reportId}`
  });
};

const sendQuestion = async () => {
  if (inputText.value.trim()) {
    // 添加用户消息到聊天列表
    chatMessages.value.push({
      role: 'user',
      content: inputText.value,
      timestamp: new Date()
    });
    
    // 清空输入框
    const question = inputText.value;
    inputText.value = '';
    
    // 显示打字指示器
    isTyping.value = true;
    
    try {
      // 发送问题到后端
      // 这里应该调用实际的API来获取AI回复
      // 模拟API调用
      setTimeout(() => {
        // 添加AI回复到聊天列表
        chatMessages.value.push({
          role: 'assistant',
          content: `关于"${question}"的问题，我为您详细分析一下。根据您的八字格局，这个问题与您命盘中的XX因素相关，建议您可以从以下几个方面着手处理...`,
          timestamp: new Date()
        });
        isTyping.value = false;
      }, 1500);
      
    } catch (error) {
      console.error('发送问题失败:', error);
      isTyping.value = false;
    }
  }
};

// onMounted(() => {
//   startAnalysis();
// });

let reportId: string | null = null;
let sseClient: any = null;

onLoad((options) => {
  if (options.reportId) {
    reportId = options.reportId;
    connectSSE(options.reportId);
  }
});

const onInit = () => {
  const pages = getCurrentPages();
  const prevPage = pages[pages.length - 2];
  if (prevPage.route?.includes('pages/index/index')) {
    connectSSE(reportId);
    return;
  }
  
  // 获取报告详情
  if (reportId) {
    fetchReportById(reportId).then((data) => {
      reportData.value = data;
    });
  }
};

// 连接到 SSE
const connectSSE = (reportId: string) => {
  const sseUrl = `/api/v1/reports/structured-thinking-sse/${reportId}`;

  sseClient = useChatSSE({
    url: sseUrl,
    onOpen: (event) => {
      console.log('SSE 连接已打开', event);
    },
    onMessage: (event) => {
      // console.log('收到 SSE 消息', event);
      isTyping.value = false;

      // 根据消息类型处理
      try {
        // 检查是否是结构化消息
        if (event && typeof event === 'object' && 'stage' in event) {
          // 这是一个结构化消息，添加到structuredMessages
          step.value = event.stage;

          const existingIndex = structuredMessages.value.findIndex(msg => msg.stage === event.stage);

          if (existingIndex !== -1) {
            const content = structuredMessages.value[existingIndex].payload.content;
            if (Array.isArray(content)) {
              structuredMessages.value[existingIndex].payload.content.push(event.payload.content);
              return;
            } else {
              structuredMessages.value[existingIndex].payload.content = [content, event.payload.content];
            }
          } else {
            structuredMessages.value.push(event);
          }

          if (event.type === 'completed') {
            getReportDetail();
          }

        } else {
          // 这是一个普通消息，可以根据需要处理
          console.log('收到普通消息:', event);
        }
      } catch (e) {
        console.error('处理SSE消息失败:', e);
      }
    },
    onError: (event) => {
      console.error('SSE 连接错误', event);
      isTyping.value = false;
    },
    onClosed: (event) => {
      console.log('SSE 连接已关闭', event);
    }
  });

  const getReportDetail = async () => {
    const res = await fetchReportById(reportId);
    reportData.value = res.data;
    showInsightCard.value = true;
  }
}

const onInputUpdate = (value: string) => {
  inputText.value = value;
};

const formatTime = (date: Date) => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

</script>

<style lang="scss">
.root {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: radial-gradient(circle at 0% 0%, rgba(212, 226, 255, 0.5) 0, transparent 50%),
    radial-gradient(circle at 100% 0%, rgba(255, 226, 241, 0.5) 0, transparent 50%),
    // radial-gradient(circle at 100% 100%, rgba(226, 255, 241, 0.5) 0, transparent 50%),
    radial-gradient(circle at 0% 100%, rgba(241, 226, 255, 0.5) 0, transparent 50%),
    #ffffff;

  view {
    box-sizing: border-box;
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

.think-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.think-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  border: 3rpx solid white;
  z-index: 10;
  transition: all 0.3s;
}

.think-dot-default {
  background: #6366f1;
  z-index: 1;
}

.think-dot-active {
  background: #6366f1 !important;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
  animation: pulse 2s infinite;
}

.think-line {
  position: absolute;
  width: 3rpx;
  background: rgba(99, 102, 241, 0.1);
}

.think-line-position {
  left: 12rpx;
  top: 4px;
  bottom: 0;
}

/* Chat Message Styles */
.chat-message-list {
  margin-top: 24rpx;
}

.message-item {
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
}

.bubble {
  padding: 20rpx;
  border-radius: 24rpx;
  max-width: 90%;
  position: relative;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.user-bubble {
  background-color: #4f46e5;
  color: white;
  border-bottom-right-radius: 8rpx;
  margin-left: auto;
}

.ai-bubble {
  background-color: rgba(255, 255, 255, 0.8);
  color: #374151;
  border-bottom-left-radius: 8rpx;
  backdrop-filter: blur(10px);
}

.typing-indicator {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx !important;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  background-color: #9ca3af;
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
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5rpx); }
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
  font-size: 22rpx;  /* 增加4rpx */
}

.text-xs-small {
  font-size: 24rpx;  /* 增加4rpx */
}

.text-sm {
  font-size: 28rpx;  /* 增加4rpx */
}

.text-base {
  font-size: 32rpx;  /* 增加4rpx */
}

.text-lg {
  font-size: 36rpx;  /* 增加4rpx */
}

.text-xl {
  font-size: 40rpx;  /* 增加4rpx */
}

.text-2xl {
  font-size: 52rpx;  /* 增加4rpx */
}

.text-3xl {
  font-size: 52rpx;  /* 增加4rpx */
}

.text-4xl {
  font-size: 68rpx;  /* 增加4rpx */
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
</style>