<template>
  <view class="profile-switching-state">
    <view class="custom-loader">
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
    </view>
    <text class="loading-text">正在加载...</text>
  </view>
</template>

<script setup lang="ts">
// No logic needed
</script>

<style lang="scss" scoped>
.profile-switching-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  width: 100%;
  
  .loading-text {
    margin-top: 32rpx;
    font-size: 28rpx;
    color: #6366f1; /* indigo-500, matching app theme */
    font-weight: 500;
    letter-spacing: 0.05em;
  }
}

.custom-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  
  .dot {
    width: 24rpx;
    height: 24rpx;
    background-color: #6366f1;
    border-radius: 50%;
    animation: loader-bounce 1.4s infinite ease-in-out both;
    
    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes loader-bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>