<template>
  <view class="guide-card-container">
    <view class="guide-card">
      <view class="badge-wrapper">
        <view class="badge">START</view>
      </view>
      
      <view class="blur-circle"></view>

      <view class="content">
        <view class="header-section">
          <view class="icon-wrapper">
            <u-icon name="account-fill" size="52" color="#632ce5"></u-icon>
          </view>
          <view class="text-wrapper">
            <text class="title">建立人生趋势档案</text>
            <text class="subtitle">UNLOCK YOUR DESTINY</text>
          </view>
        </view>
        
        <view class="desc-wrapper">
          <text class="desc">分析模型需要一些基础信息作为输入参数</text>
        </view>

        <button class="action-btn" hover-class="btn-hover" @click="handleClick">
          <text>{{ buttonText }}</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  hasToken?: boolean;
  inviteCode?: string;
  agentType?: string;
}>();

const buttonText = computed(() => {
  if (props.hasToken) {
    return '填写档案，开始对话';
  }
  return '登录并填写档案';
});

const handleClick = () => {
  if (!props.hasToken) {
    let url = '/pages/login/index?redirect=step&from=home';
    if (props.inviteCode) {
      url += `&inviteCode=${props.inviteCode}`;
    }
    if (props.agentType) {
      url += `&agentType=${props.agentType}`;
    }
    uni.navigateTo({
      url
    });
    return;
  }

  let url = '/pages/step/index';
  if (props.agentType) {
    url += `?agentType=${props.agentType}`;
  }
  uni.navigateTo({
    url
  });
};
</script>

<style lang="scss" scoped>
.guide-card-container {
  padding: 32rpx;
  width: 100%;
  box-sizing: border-box;
  animation: fade-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.guide-card {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 0.5px solid rgba(202, 195, 216, 0.2);
  border-radius: 48rpx;
  padding: 48rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(124, 77, 255, 0.05);
}

.badge-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
}

.badge {
  background: rgba(124, 77, 255, 0.05);
  color: #632ce5; /* primary */
  font-size: 22rpx;
  font-weight: 900;
  padding: 20rpx 32rpx;
  border-bottom-left-radius: 48rpx;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  border-left: 0.5px solid rgba(202, 195, 216, 0.2);
  border-bottom: 0.5px solid rgba(202, 195, 216, 0.2);
}

.blur-circle {
  position: absolute;
  top: -32rpx;
  right: -32rpx;
  width: 160rpx;
  height: 160rpx;
  background: #7c4dff; /* primary_container */
  opacity: 0.15;
  border-radius: 50%;
  filter: blur(64rpx);
  pointer-events: none;
}

.content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.header-section {
  display: flex;
  align-items: center;
  gap: 32rpx;
  margin-bottom: 32rpx;
}

.icon-wrapper {
  width: 96rpx;
  height: 96rpx;
  border-radius: 32rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0.5px solid rgba(202, 195, 216, 0.2);
  box-shadow: 0 4rpx 12rpx rgba(124, 77, 255, 0.05);
}

.text-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 40rpx;
  font-weight: 800;
  color: #191c20;
  line-height: 1.2;
  margin-bottom: 8rpx;
}

.subtitle {
  font-size: 24rpx;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.desc-wrapper {
  margin-bottom: 48rpx;
}

.desc {
  font-size: 28rpx;
  color: #64748b;
  line-height: 1.6;
}

.action-btn {
  background: #7c4dff; /* primary_container */
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 800;
  padding: 0 48rpx;
  height: 96rpx;
  letter-spacing: 1px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(124, 77, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::after {
    border: none;
  }
}

.btn-hover {
  transform: translateY(2rpx) scale(0.99);
  box-shadow: 0 2rpx 6rpx rgba(124, 77, 255, 0.1);
  opacity: 0.9;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20rpx) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
