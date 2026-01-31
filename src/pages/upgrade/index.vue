<template>
  <view class="upgrade-page">
    <u-navbar :is-back="true" :is-fixed="true" background="#fff" :border-bottom="false" />
    <view class="upgrade-content">
      <text class="main-title">解锁深度洞察</text>
      <text class="subtitle">不错过每一个人生转折点</text>

      <view class="plans-container">
        <view class="plan-item feature-plan" :class="{ selected: selectedPlan === 'year' }" @click="selectedPlan = 'year'">
          <view class="discount-tag">限时 8 折</view>
          <text class="plan-name">年度会员</text>
          <text class="plan-price">¥198 <text class="price-desc">/ 年</text></text>
        </view>

        <view class="plan-item" :class="{ selected: selectedPlan === 'month' }" @click="selectedPlan = 'month'">
          <text class="plan-name">月度会员</text>
          <text class="plan-price">¥29 <text class="price-desc">/ 月</text></text>
        </view>
      </view>

      <view class="benefits-list">
        <text class="benefit-item">✓ 每月无限次深度趋势分析</text>
        <text class="benefit-item">✓ 实时对话追问无上限</text>
        <text class="benefit-item">✓ 多时间点趋势对比功能</text>
      </view>
      <BaziButton type="primary" size="large" show-shadow @click="subscribe" class="subscribe-btn">立即订阅</BaziButton>
    </view>
  </view>
</template>

<script setup lang="ts">
import BaziButton from '@/components/BaziButton.vue';
import { ref } from 'vue';
const selectedPlan = ref<'year' | 'month'>('year');
const goBack = () => {
  uni.navigateBack();
};

const subscribe = () => {
  console.log('用户点击订阅', selectedPlan.value);
};
</script>

<style lang="scss">
.upgrade-page {
  height: 100vh;
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.upgrade-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow-y: auto;
  box-sizing: border-box;
}

.main-title {
  font-size: 72rpx;
  font-weight: 900;
  color: #1f2937;
  display: block;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #6b7280;
  display: block;
  margin-bottom: 80rpx;
}

.plans-container {
  margin-bottom: 80rpx;
}

.plan-item {
  padding: 64rpx;
  border-radius: 64rpx;
  margin-bottom: 20rpx;
  position: relative;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(14px);
  border: 2rpx solid #f3f4f6;
}

.feature-plan {
  border: 2rpx solid #4f46e5;
}

.plan-item.selected {
  background: #e0e7ff;
  border: 4rpx solid #4f46e5;
  box-shadow: 0 16rpx 40rpx rgba(79, 70, 229, 0.15);
}

.discount-tag {
  position: absolute;
  top: 0;
  right: 60rpx;
  transform: translateY(-50%);
  background: #4f46e5;
  color: white;
  font-size: 20rpx;
  padding: 12rpx 20rpx;
  border-radius: 40rpx;
  font-style: italic;
}

.plan-name {
  font-size: 28rpx;
  font-weight: bold;
  display: block;
}

.plan-price {
  font-size: 56rpx;
  font-weight: 900;
  margin-top: 16rpx;
  display: block;
}

.price-desc {
  font-size: 28rpx;
  font-weight: normal;
  color: #9ca3af;
}

.benefits-list {
  margin: auto 0 80rpx;
  flex: 1;
}

.benefit-item {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.subscribe-btn {
  width: 100%;
  position: sticky;
  bottom: 0;
  margin-bottom: 12px;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
