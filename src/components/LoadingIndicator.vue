<template>
  <view class="loading-icon">
    <view class="message-content ai-message">
      <view class="message-text">
        <view class="typing-indicator">
          <view class="dot"></view>
          <view class="dot"></view>
          <view class="dot"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
.loading-icon {
  background: transparent !important;
  width: fit-content !important;
}

.message-content {
  display: flex;
  align-items: flex-start;
}

.ai-message {
  flex-direction: row;
}

.message-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-weight: 500;
  font-size: 28rpx;
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
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5rpx);
  }
}
</style>