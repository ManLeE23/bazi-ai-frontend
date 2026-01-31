<template>
  <view class="life-flow-chat">
    <!-- Chat Header -->
    <view class="chat-header">
      <button @click="goBack" class="back-button">
        ←
      </button>
      <view class="header-content">
        <p class="header-title">LifeFlow AI 对话</p>
        <view class="live-status">
          <span class="status-dot"></span>
          <p class="status-text">Live Syncing</p>
        </view>
      </view>
      <view class="user-avatar">
        <image src="https://i.pravatar.cc/100?img=12" class="avatar-image" />
      </view>
    </view>

    <!-- Chat Messages -->
    <scroll-view class="chat-messages" scroll-y>
      <view class="message-item user-message">
        <view class="message-bubble user-bubble">
          <p class="message-text">
            你好 <span class="user-name">{{ userName }}</span>，我已经根据你的生辰建立了能量场。关于明年的转机，你想了解哪个板块？
          </p>
        </view>
      </view>

      <view class="message-item ai-message">
        <view class="message-bubble ai-bubble">
          <p class="message-text">我想看看我明年的事业转机。</p>
        </view>
        <p class="message-status">Delivered</p>
      </view>

      <view class="message-item user-message" v-if="step >= 1">
        <view class="message-bubble user-bubble">
          <p class="message-text">
            解析中... 你的"食神"星将在明年三月被激活，这预示着一个从边缘走向核心的机会。
          </p>
        </view>
      </view>
    </scroll-view>

    <!-- Fixed Bottom Section -->
    <view class="fixed-bottom">
      <!-- Action Buttons -->
      <view class="action-buttons">
        <button @click="generateReport" class="primary-action-btn">
          <span class="action-icon">✨</span>
          <span class="action-text">生成完整诊断报告</span>
        </button>
        <button class="secondary-action-btn">
          💡 换个问法
        </button>
      </view>

      <!-- Input Area -->
      <view class="input-area">
        <view class="input-container">
          <input
            type="text"
            placeholder="针对结果深入追问..."
            class="input-field"
            v-model="inputText"
            @confirm="sendMessage"
          />
          <button
            @click="sendMessage"
            class="send-button"
          >
            ↑
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

interface Props {
  userName?: string;
  step?: number;
}

interface Emits {
  (e: 'goBack'): void;
  (e: 'generateReport'): void;
  (e: 'sendMessage', message: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  userName: '用户',
  step: 0
});

const emit = defineEmits<Emits>();

const inputText = ref('');

const goBack = () => {
  emit('goBack');
};

const generateReport = () => {
  emit('generateReport');
};

const sendMessage = () => {
  if (inputText.value.trim()) {
    emit('sendMessage', inputText.value);
    inputText.value = '';
  }
};
</script>

<style scoped>
.life-flow-chat {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #FBFBFF;
  position: relative;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 48rpx;
  padding-top: 96rpx;
  padding-bottom: 32rpx;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20rpx);
  position: sticky;
  top: 0;
  z-index: 30;
  border-bottom: 1rpx solid rgba(99, 102, 241, 0.5);
}

.back-button {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24rpx;
  background-color: #f3f4f6;
  color: #9ca3af;
  font-size: 32rpx;
  border: none;
}

.header-content {
  text-align: center;
}

.header-title {
  font-size: 28rpx;
  font-weight: 900;
  color: #1e293b;
  letter-spacing: -0.2rpx;
}

.live-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-top: 8rpx;
}

.status-dot {
  width: 8rpx;
  height: 8rpx;
  background-color: #818cf8;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.status-text {
  font-size: 16rpx;
  font-weight: 900;
  color: #818cf8;
  text-transform: uppercase;
  letter-spacing: 2rpx;
}

.user-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 24rpx;
  border: 4rpx solid white;
  overflow: hidden;
  background-color: rgba(99, 102, 241, 0.1);
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.chat-messages {
  flex: 1;
  padding: 48rpx;
  padding-bottom: 480rpx; /* Space for fixed bottom section */
  box-sizing: border-box;
}

.message-item {
  margin-bottom: 48rpx;
}

.user-message {
  display: flex;
  justify-content: flex-start;
}

.ai-message {
  display: flex;
  justify-content: flex-end;
}

.message-bubble {
  max-width: 85%;
  padding: 40rpx;
  border-radius: 48rpx;
  position: relative;
}

.user-bubble {
  background-color: white;
  border: 1rpx solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.05);
  border-top-left-radius: 16rpx;
}

.ai-bubble {
  background: linear-gradient(to bottom, #6366f1, #6b72e8, #8b5cf6);
  border-top-right-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx 0 rgba(99, 102, 241, 0.3);
}

.message-text {
  font-size: 26rpx;
  font-weight: 700;
  line-height: 42rpx;
  color: #334155;
}

.user-bubble .message-text {
  color: #334155;
}

.ai-bubble .message-text {
  color: white;
}

.message-status {
  font-size: 18rpx;
  font-weight: 700;
  color: #d1d5db;
  margin-top: 16rpx;
  text-align: right;
  letter-spacing: -0.1rpx;
}

.user-name {
  color: #6366f1;
}

.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  padding: 0 48rpx;
  padding-top: 48rpx;
  background: linear-gradient(to top, #FBFBFF, #FBFBFFCC, transparent);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 32rpx;
  margin-bottom: 32rpx;
}

.primary-action-btn {
  display: flex;
  align-items: center;
  gap: 24rpx;
  flex: 1;
  padding: 32rpx;
  background-color: #1e293b;
  color: white;
  border-radius: 48rpx;
  box-shadow: 0 4rpx 16rpx 0 rgba(124, 58, 237, 0.2);
  border: none;
}

.action-icon {
  font-size: 24rpx;
}

.action-text {
  font-size: 20rpx;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2rpx;
}

.secondary-action-btn {
  padding: 32rpx;
  background-color: white;
  border: 1rpx solid #c7d2fe;
  color: #818cf8;
  border-radius: 48rpx;
  font-size: 20rpx;
  font-weight: 700;
  border: none;
}

.input-area {
  background-color: rgba(255, 255, 255, 0.5);
  border-top: 1rpx solid rgba(255, 255, 255, 0.8);
}

.input-container {
  height: 96rpx;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(14px);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  gap: 24rpx;
}

.input-field {
  flex: 1;
  background: transparent;
  font-size: 28rpx;
  font-weight: 700;
  outline: none;
  border: none;
}

.send-button {
  width: 64rpx;
  height: 64rpx;
  background: #4f46e5;
  color: white;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-size: 28rpx;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>