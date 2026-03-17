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
            <u-icon name="account-fill" size="52" color="#6366f1"></u-icon>
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
  background: linear-gradient(135deg, #e0e7ff 0%, #f3f4ff 100%);
  border-radius: 56rpx;
  padding: 48rpx;
  position: relative;
  overflow: hidden;
  // border: 1rpx solid rgba(99, 102, 241, 0.2);
  box-shadow: 
    0 20rpx 40rpx -8rpx rgba(79, 70, 229, 0.1),
    0 8rpx 16rpx -4rpx rgba(79, 70, 229, 0.05);
}

.badge-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
}

.badge {
  background: rgba(79, 70, 229, 0.05);
  color: #4f46e5;
  font-size: 22rpx;
  font-weight: 900;
  padding: 20rpx 32rpx;
  border-bottom-left-radius: 56rpx;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  border-left: 1rpx solid rgba(224, 231, 255, 0.5);
  border-bottom: 1rpx solid rgba(224, 231, 255, 0.5);
}

.blur-circle {
  position: absolute;
  top: -32rpx;
  right: -32rpx;
  width: 160rpx;
  height: 160rpx;
  background: #c7d2fe;
  opacity: 0.3;
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
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #e0e7ff;
  box-shadow: 0 4rpx 12rpx rgba(79, 70, 229, 0.1);
}

.text-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 40rpx;
  font-weight: 900;
  color: #1e293b;
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
  background: #4f46e5;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 700;
  padding: 0 48rpx;
  height: 96rpx;
  letter-spacing: 1px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 32rpx;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(79, 70, 229, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::after {
    border: none;
  }
}

.btn-hover {
  transform: translateY(2rpx) scale(0.99);
  box-shadow: 0 2rpx 6rpx rgba(79, 70, 229, 0.2);
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
