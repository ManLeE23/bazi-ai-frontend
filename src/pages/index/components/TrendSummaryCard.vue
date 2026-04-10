<template>
  <view class="trend-summary-card">
    <view class="card-header">
      <view class="header-left">
        <text class="section-subtitle">当前能量状态</text>
        <view class="score-row">
          <text class="score-value">{{ currentEnergyScore }}</text>
        </view>
      </view>
    </view>
    
    <view class="bar-charts">
      <view class="bar-item" v-for="(item, index) in chartData" :key="index">
        <view class="bar-bg" :style="{ height: item.maxHeight + 'rpx' }">
          <view class="bar-fill" :style="{ height: item.percent + '%', opacity: item.opacity }"></view>
        </view>
        <text class="bar-label">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { userStore } from '@/store/user';
import { useSWR } from '@/hooks/useSWR';
import { fetchTodayTrendDetail } from '@/api/services';

const currentProfileId = computed(() => userStore.userInfo?.id || null);

// Fetch data using SWR
const { data } = useSWR(
  () => currentProfileId.value ? `/api/profiles/self/today-trend/detail?profile_id=${currentProfileId.value}` : null,
  () => {
    if (!currentProfileId.value) return Promise.resolve(null);
    return fetchTodayTrendDetail({ profile_id: currentProfileId.value });
  }
);

// Get score and clamp between 0-100
const currentEnergyScore = computed(() => {
  const score = data.value?.data?.score || data.value?.score || 90; // Fallback to 90
  return Math.min(100, Math.max(0, score));
});

// Mock chart data based on 首页.html
const chartData = computed(() => {
  // Map dimensions from API response: { key, label, value }
  const dimensions = data.value?.data?.dimensions || data.value?.dimensions || [];
  
  const getScore = (label: string, fallback: number) => {
    const dim = dimensions.find((d: any) => d.label === label);
    return dim ? dim.value : fallback;
  };

  return [
    { label: '专注', percent: getScore('专注', 85), maxHeight: 160, opacity: 1 },
    { label: '情绪', percent: getScore('情绪', 70), maxHeight: 120, opacity: 0.8 },
    { label: '关系', percent: getScore('关系', 95), maxHeight: 200, opacity: 1 },
    { label: '机缘', percent: getScore('机缘', 50), maxHeight: 96, opacity: 0.6 },
    { label: '变量', percent: getScore('变量', 75), maxHeight: 144, opacity: 0.8 }
  ];
});

const handleCardClick = () => {
  uni.navigateTo({
    url: '/pages/today-trend/detail'
  });
};
</script>

<style scoped>
.trend-summary-card {
  width: 100%;
  border-radius: 48rpx;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  padding: 48rpx;
  box-sizing: border-box;
  margin-bottom: 32rpx;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 16rpx 64rpx rgba(124, 77, 255, 0.05);
}

.trend-summary-card:active {
  transform: scale(0.98);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.section-subtitle {
  font-size: 24rpx;
  color: #494455;
  letter-spacing: 2rpx;
  margin-bottom: 8rpx;
  font-weight: 600;
}

.score-row {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}

.score-value {
  font-size: 100rpx;
  font-weight: 900;
  color: #7C4DFF;
  line-height: 1;
}

.score-status {
  font-size: 40rpx;
  font-weight: 700;
  color: #475569;
}

.icon-wrapper {
  width: 96rpx;
  height: 96rpx;
  background: rgba(124, 77, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bar-charts {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 240rpx;
  padding: 0 8rpx;
  gap: 16rpx;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.bar-bg {
  width: 72rpx;
  background: rgba(124, 77, 255, 0.1);
  border-radius: 999rpx;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.bar-fill {
  width: 100%;
  background: #7C4DFF;
  border-radius: 999rpx;
  position: absolute;
  bottom: 0;
  left: 0;
  transition: all 1s ease-out;
}

.bar-label {
  font-size: 20rpx;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: -0.5rpx;
}
</style>