<template>
  <view class="today-trend-detail">
    <HeaderBar title="" :fixed="true" :placeholder="true" backgroundColor="transparent" />
    
    <scroll-view v-if="!isLoading" scroll-y class="detail-scroll" :show-scrollbar="false">
      <view class="content">
        <!-- 头部评分卡片 -->
        <view class="glass-panel header-card">
          <view class="header-left">
            <text class="header-label">综合能量评分</text>
            <view class="score-box">
              <text class="score-num">{{ detailData?.score || 0 }}</text>
              <view class="score-tag">
                <text class="score-tag-text">{{ detailData?.score_level || '未知' }}</text>
              </view>
            </view>
          </view>
          
          <view class="header-right">
            <view 
              v-for="(item, index) in detailData?.dimensions" 
              :key="index" 
              class="mini-bar-group"
            >
              <view class="mini-bar-wrapper">
                <view 
                  class="mini-bar" 
                  :style="{ 
                    height: (item.value || 0) + '%', 
                    background: getDimensionGradient(Number(index)) 
                  }"
                ></view>
              </view>
              <view class="mini-bar-info">
                <text class="mini-bar-label">{{ item.label }}</text>
                <text class="mini-bar-score">{{ item.value }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 趋势原理 -->
        <view class="glass-panel principle-card">
          <view class="card-header">
            <view class="header-indicator"></view>
            <text class="card-title">趋势分析</text>
          </view>
          <view class="principle-content">
            <text class="principle-text">{{ detailData?.analysis || '暂无解读' }}</text>
          </view>
          
          <!-- 建议与避免 -->
          <view class="advice-section">
            <!-- 建议 -->
            <view class="advice-column">
              <view class="advice-header">
                <view class="title-bg yi-bg"></view>
                <text class="title-text">建议</text>
              </view>
              <view class="advice-list">
                <text v-for="(item, idx) in detailData?.yi" :key="idx" class="advice-item-text">{{ item }}</text>
              </view>
            </view>
            
            <!-- 避免 -->
            <view class="advice-column">
              <view class="advice-header">
                <view class="title-bg ji-bg"></view>
                <text class="title-text">避免</text>
              </view>
              <view class="advice-list">
                <text v-for="(item, idx) in detailData?.ji" :key="idx" class="advice-item-text">{{ item }}</text>
              </view>
            </view>
          </view>

          <!-- 时间窗 -->
          <view class="advice-section" v-if="detailData?.time_window || detailData?.time">
            <view class="advice-column">
              <view class="advice-header">
                <view class="title-bg time-bg"></view>
                <text class="title-text">时间窗</text>
              </view>
              <view class="advice-list">
                <text class="advice-item-text">{{ detailData?.time_window || detailData?.time }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 维度列表 -->
        <view class="dimension-list">
          <view 
            v-for="(item, index) in detailData?.dimensions" 
            :key="index" 
            class="glass-panel dimension-card"
          >
            <view 
              class="dimension-icon"
              :style="{ background: getDimensionGradient(Number(index)) }"
            >
              <text class="dimension-icon-text">{{ item.label?.[0] }}</text>
            </view>
            
            <view class="dimension-info">
              <view class="dimension-header">
                <text class="dimension-name">{{ item.label }}</text>
                <text 
                  class="dimension-score" 
                  :style="{ color: getDimensionColor(Number(index)) }"
                >{{ item.value }}分</text>
              </view>
              <text class="dimension-desc">{{ item.desc }}</text>
            </view>
          </view>
        </view>

        <!-- AI 建议 (渐变背景 + 白卡片) -->
        <!-- <view class="glass-panel ai-card" v-if="detailData?.ai_comment">
          <view class="ai-summary-box">
            <view class="ai-header">
              <view class="ai-title-row">
                <text class="ai-label">AI 智能分析</text>
              </view>
            </view>
            
            <text class="ai-content">{{ detailData.ai_comment }}</text>
          </view>
        </view> -->
        
        <view class="bottom-spacer"></view>
      </view>
    </scroll-view>
    
    <view v-else class="loading-state">
      <view class="loading-dots">
        <view class="dot"></view>
        <view class="dot"></view>
        <view class="dot"></view>
      </view>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import HeaderBar from '@/components/HeaderBar.vue';
import { fetchTodayTrendDetail } from '@/api/services';
import { useSWR } from '@/hooks/useSWR';

const queryParams = ref<any>({});
const profileId = computed(() => queryParams.value.profile_id || queryParams.value.id);

const { data: rawData, error, isLoading } = useSWR(
  () =>
    profileId.value
      ? `/api/profiles/self/today-trend/detail?profile_id=${profileId.value}`
      : null,
  () => {
    if (!profileId.value) return Promise.reject('No profile ID');
    return fetchTodayTrendDetail({ profile_id: profileId.value });
  },
  {
    revalidateOnFocus: false,
    revalidateIfStale: false
  }
);

const detailData = computed(() => {
  const data: any = rawData.value || {};
  return data.data || data; 
});

// 按照 TrendSummaryCard 提供的颜色规范
const getDimensionGradient = (index: number) => {
  const gradients = [
    'linear-gradient(180deg, #ff7ad9 0%, #ff4eb8 100%)', // 专注-粉
    'linear-gradient(180deg, #ffd06a 0%, #ff9f43 100%)', // 情绪-橙
    'linear-gradient(180deg, #7cb7ff 0%, #4f7dff 100%)', // 关系-蓝
    'linear-gradient(180deg, #b38bff 0%, #7a5cff 100%)', // 机缘-紫
    'linear-gradient(180deg, #79e6ff 0%, #2ac0ff 100%)'  // 变数-青
  ];
  return gradients[index % gradients.length];
};

const getDimensionColor = (index: number) => {
  const colors = ['#ff4eb8', '#ff9f43', '#4f7dff', '#7a5cff', '#2ac0ff'];
  return colors[index % colors.length];
};

onLoad((options: any) => {
  queryParams.value = options || {};
  if (!options?.profile_id && !options?.id) {
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }
});

watch(error, (val) => {
  if (val) {
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
});
</script>

<style lang="scss" scoped>
.today-trend-detail {
  height: 100vh;
  /* 整体背景渐变 */
  // background: linear-gradient(180deg, #EEF2FF 0%, #F8FAFF 100%);
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #E0E7FF 0%, #F1F5F9 100%);
}

.detail-scroll {
  flex: 1;
  height: 0;
}

.content {
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  padding-bottom: 96rpx;
}

.bottom-spacer {
  height: 60rpx;
}

/* 通用毛玻璃卡片 */
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 36rpx;
  box-shadow: 0 10rpx 40rpx rgba(99, 102, 241, 0.04);
}

/* 头部评分卡片 */
.header-card {
  padding: 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.date-info {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.date-text {
  font-size: 32rpx;
  font-weight: 900;
  color: #1e293b;
}

.lunar-date-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #64748b;
}

.header-label {
  font-size: 20rpx;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  margin-bottom: 8rpx;
}

.score-box {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}

.score-num {
  font-family: "Georgia", serif;
  font-style: italic;
  font-weight: 900;
  font-size: 100rpx;
  color: #4f46e5;
  line-height: 1;
}

.score-tag {
  background: #eef2ff;
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
}

.score-tag-text {
  font-size: 24rpx;
  font-weight: 700;
  color: #6366f1;
}

.header-right {
  display: flex;
  align-items: flex-end;
  gap: 16rpx;
}

.mini-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.mini-bar-wrapper {
  height: 120rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
}

.mini-bar {
  width: 24rpx;
  border-radius: 999rpx;
  min-height: 20rpx;
}

.mini-bar-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.mini-bar-label {
  font-size: 20rpx;
  color: #94a3b8;
  line-height: 1;
}

.mini-bar-score {
  font-size: 22rpx;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}

/* 趋势原理解读 */
.principle-card {
  padding: 40rpx;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.header-indicator {
  width: 8rpx;
  height: 32rpx;
  background: #6366f1;
  border-radius: 999rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 900;
  color: #1e293b;
}

.principle-content {
  line-height: 1.8;
}

.principle-text {
  font-size: 28rpx;
  color: #475569;
}

/* 建议与避免 */
.advice-section {
  display: flex;
  gap: 48rpx;
  margin-top: 40rpx;
  padding-top: 32rpx;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.advice-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.advice-header {
  position: relative;
  display: inline-flex;
  margin-bottom: 24rpx;
  align-self: flex-start;
}

.title-text {
  position: relative;
  z-index: 2;
  font-size: 32rpx;
  font-weight: 900;
  color: #1e293b;
  line-height: 1;
}

.title-bg {
  position: absolute;
  left: -8rpx;
  bottom: -8rpx;
  width: 120%;
  height: 20rpx;
  z-index: 1;
  border-radius: 999rpx;
  transform: skewX(-10deg) rotate(-2deg);
}

.yi-bg {
  background: #ff7ad9; /* sky-100 */
  opacity: 0.6;
}

.ji-bg {
  background: #ffd06a; /* rose-100 */
  opacity: 1;
}

.time-bg {
  background: #a5b4fc; /* indigo-200 */
  opacity: 0.6;
}

.advice-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.advice-item-text {
  font-size: 26rpx;
  color: #475569;
  line-height: 1.5;
}

/* 维度列表 */
.dimension-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.dimension-card {
  padding: 32rpx;
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
}

.dimension-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);
}

.dimension-icon-text {
  font-size: 32rpx;
  font-weight: 900;
  color: #ffffff;
}

.dimension-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dimension-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.dimension-name {
  font-size: 28rpx;
  font-weight: 900;
  color: #1e293b;
}

.dimension-score {
  font-size: 24rpx;
  font-weight: 900;
}

.dimension-desc {
  font-size: 24rpx;
  color: #64748b;
  line-height: 1.6;
}

/* AI 建议 (强毛玻璃感) */
.ai-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(238, 242, 255, 0.5) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.6) !important;
  box-shadow: 0 8rpx 32rpx rgba(99, 102, 241, 0.08) !important;
  padding: 40rpx;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.ai-summary-box {
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.ai-title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.ai-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #4338ca;
}

.ai-label {
  font-size: 30rpx;
  font-weight: 900;
  color: #4338ca;
  letter-spacing: 2rpx;
}

.ai-icon {
  font-size: 36rpx;
}

.ai-content {
  font-size: 28rpx;
  color: #334155;
  line-height: 1.8;
  font-weight: 600;
  text-align: justify;
  display: block;
}

/* Loading */
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
}

.loading-text {
  font-size: 26rpx;
  color: #6366f1;
  font-weight: 600;
}

.loading-dots {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #6366f1;
  animation: dot-bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes dot-bounce {
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