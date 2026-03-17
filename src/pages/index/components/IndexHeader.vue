<template>
  <view class="index-header">
    <view class="header-left">
      <text class="header-title">人生趋势</text>
    </view>
  </view>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.index-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16rpx;
  margin-bottom: 48rpx;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.header-title {
  font-size: 40rpx;
  font-weight: 900;
  color: #1e293b;
  letter-spacing: -0.02em;
}
</style>
