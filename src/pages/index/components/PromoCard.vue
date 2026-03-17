<template>
  <view class="promo-card" :class="variant">
    <view class="promo-left">
      <view class="promo-icon" :class="variant">
        <text class="promo-icon-text">{{ icon }}</text>
      </view>
      <view>
        <text class="promo-title">{{ title }}</text>
        <text class="promo-subtitle">{{ subtitle }}</text>
      </view>
    </view>
    <text class="promo-arrow">›</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  icon: string;
  variant: 'gradient' | 'dark';
}>();
</script>

<style lang="scss" scoped>
.promo-card {
  margin-top: 32rpx;
  border-radius: 56rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
  box-shadow: 0 24rpx 40rpx -16rpx rgba(99, 102, 241, 0.25);
}

.promo-card.gradient {
  background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
}

.promo-card.dark {
  background: #0f172a;
  box-shadow: 0 24rpx 40rpx -16rpx rgba(15, 23, 42, 0.35);
}

.promo-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.promo-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
}

.promo-icon.gradient {
  background: rgba(255, 255, 255, 0.2);
}

.promo-icon.dark {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.promo-icon-text {
  font-size: 44rpx;
}

.promo-title {
  font-size: 28rpx;
  font-weight: 900;
  color: #ffffff;
}

.promo-subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.75);
}

.promo-card.dark .promo-subtitle {
  color: #a5b4fc;
}

.promo-arrow {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.6);
}

.promo-card.dark .promo-arrow {
  color: #818cf8;
}
</style>
