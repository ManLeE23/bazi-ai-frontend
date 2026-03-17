<template>
  <view class="feature-card">
    <view class="feature-icon" :style="{ background: iconBg, color: iconColor }">
      <text class="feature-icon-text">{{ icon }}</text>
    </view>
    <text class="feature-title">{{ title }}</text>
    <text class="feature-subtitle">{{ subtitle }}</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}>();
</script>

<style lang="scss" scoped>
.feature-card {
  background: #ffffff;
  border-radius: 56rpx;
  padding: 40rpx;
  box-shadow: 0 12rpx 30rpx -16rpx rgba(15, 23, 42, 0.08);
  border: 1rpx solid transparent;
}

.feature-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.feature-icon-text {
  font-size: 32rpx;
}

.feature-title {
  font-size: 28rpx;
  font-weight: 900;
  color: #334155;
}

.feature-subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #94a3b8;
}
</style>
