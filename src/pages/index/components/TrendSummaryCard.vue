<template>
  <view class="trend-section">
    <view class="trend-card" @click="navigateToDetail">
      <view class="trend-content-wrapper" v-if="canShowTrend">
        <view class="trend-card-left">
          <view class="date-header">
            <view class="date-main">
              <text class="date-day">{{ dateInfo.day }}</text>
              <view class="date-meta">
                <text class="date-month">{{ dateInfo.month }}月</text>
                <text class="date-week">{{ dateInfo.week }}</text>
              </view>
            </view>
            <view class="lunar-info">
              <text class="lunar-text">农历{{ dateInfo.lunarMonth }}{{ dateInfo.lunarDay }}</text>
              <view class="lunar-dot"></view>
              <text class="ganzhi-text">{{ dateInfo.ganZhi }}</text>
            </view>
          </view>
          
          <view class="trend-energy-label">
            <text class="energy-label-text">综合能量评分</text>
          </view>
          
          <view class="trend-summary-group">
            <text class="trend-summary-label">{{ summary.label }}</text>
            <text class="trend-summary-text">{{ summary.insight }}</text>
            
            <view v-if="summary.lucky_colors && summary.lucky_colors.length" class="lucky-color-row">
              <text class="lucky-label">幸运色</text>
              <view class="lucky-swatches">
                <view class="lucky-item">
                  <view class="lucky-swatch" :style="getLuckyColorStyle(summary.lucky_colors[0])"></view>
                  <text class="lucky-text">{{ summary.lucky_colors[0].label }}</text>
                </view>
              </view>
            </view>

          </view>
        </view>

        <view class="trend-card-right">
          <view class="trend-score-group">
            <text class="trend-score-value">{{ summary.score }}</text>
            <text class="trend-score-label">{{ summary.tag }}</text>
          </view>

          <view class="trend-mini-bars">
            <view
              v-for="(bar, index) in bars"
              :key="index"
              class="trend-mini-bar-group"
            >
              <view class="trend-mini-bar-wrapper">
                <view
                  class="trend-mini-bar"
                  :style="{ height: bar.height, background: bar.gradient }"
                ></view>
              </view>
              <text class="trend-mini-bar-label">{{ bar.label }}</text>
              <text class="trend-mini-bar-value">{{ bar.value }}</text>
            </view>
          </view>
        </view>

        <view class="score-badge"></view>
      </view>

      <view class="trend-empty" v-else>
        <view class="trend-empty-badge">
          <text class="trend-empty-badge-text">趋势</text>
        </view>
        <text class="trend-empty-title">{{ emptyTitle }}</text>
        <text class="trend-empty-desc">{{ emptyDesc }}</text>
        <BaziButton
          type="primary"
          size="medium"
          :customStyle="emptyButtonStyle"
          @click="handleEmptyAction"
        >
          {{ emptyActionText }}
        </BaziButton>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { userStore } from '@/store/user';
import BaziButton from '@/components/BaziButton.vue';
import { fetchTodayTrend } from '@/api/services';
// @ts-ignore
import { Solar } from 'lunar-javascript';

const hasToken = computed(() => !!uni.getStorageSync('token'));
const profileId = computed(() => userStore.userInfo?.id || '');
const hasProfile = computed(() => !!userStore.userInfo?.name);
const canShowTrend = computed(() => hasToken.value && hasProfile.value && !!profileId.value);

const getLuckyColorStyle = (colorObj: any) => {
  const colorHex = colorObj?.color || '#cccccc';
  
  return {
    backgroundColor: colorHex,
    boxShadow: `0 4rpx 12rpx ${colorHex}4d`, // 30% opacity shadow
    border: ['白色', '银色'].includes(colorObj?.label) ? '1rpx solid #e2e8f0' : 'none'
  };
};

const dateInfo = computed(() => {
  const now = new Date();
  const solar = Solar.fromDate(now);
  const lunar = solar.getLunar();
  
  return {
    day: solar.getDay(),
    month: solar.getMonth(),
    week: `周${solar.getWeekInChinese()}`,
    lunarMonth: lunar.getMonthInChinese(),
    lunarDay: lunar.getDayInChinese(),
    ganZhi: `${lunar.getDayInGanZhi()}日`
  };
});

const emptyTitle = computed(() =>
  hasToken.value ? '完成档案后查看今日趋势' : '登录后查看今日趋势'
);
const emptyDesc = computed(() =>
  hasToken.value ? '录入基础信息后解锁趋势分析' : '登录并创建档案即可解锁趋势分析'
);
const emptyActionText = computed(() =>
  hasToken.value ? '填写档案' : '去登录'
);
const emptyButtonStyle = {
  width: 'auto',
  padding: '18rpx 44rpx',
  borderRadius: '999rpx',
  fontSize: '28rpx'
};

const handleEmptyAction = () => {
  if (!hasToken.value) {
    uni.navigateTo({
      url: '/pages/login/index?redirect=step&from=index'
    });
    return;
  }
  uni.navigateTo({
    url: '/pages/step/index?from=index'
  });
};

const navigateToDetail = () => {
  if (!profileId.value) return;
  uni.navigateTo({
    url: `/pages/today-trend/detail?profile_id=${profileId.value}`
  });
};

const defaultSummary = {
  score: 85,
  tag: '极佳',
  label: '稳中求进',
  insight: '适合梳理计划，不宜做重大承诺',
  do: '复盘目标与重点任务',
  avoid: '冲动承诺或情绪化沟通',
  time: '晚间更利于深度思考',
  lucky_colors: [] as Array<{label: string, color: string}>,
  avoid_colors: [] as Array<{label: string, color: string}>,
  lucky_element: ''
};

const defaultBars = [
  { label: '专注', value: 78, height: '78%', opacity: 1, gradient: 'linear-gradient(180deg, #ff7ad9 0%, #ff4eb8 100%)' },
  { label: '情绪', value: 72, height: '72%', opacity: 1, gradient: 'linear-gradient(180deg, #ffd06a 0%, #ff9f43 100%)' },
  { label: '关系', value: 66, height: '66%', opacity: 1, gradient: 'linear-gradient(180deg, #7cb7ff 0%, #4f7dff 100%)' },
  { label: '机缘', value: 58, height: '58%', opacity: 1, gradient: 'linear-gradient(180deg, #b38bff 0%, #7a5cff 100%)' },
  { label: '变数', value: 42, height: '42%', opacity: 1, gradient: 'linear-gradient(180deg, #79e6ff 0%, #2ac0ff 100%)' }
];

const summary = ref({ ...defaultSummary });
const bars = ref([...defaultBars]);

const mapBars = (items: any[]) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [...defaultBars];
  }
  return items.map((item, index) => ({
    label: item.label ?? defaultBars[index]?.label ?? '',
    value: item.value ?? defaultBars[index]?.value ?? 0,
    height: item.height ?? `${item.value ?? defaultBars[index]?.value ?? 0}%`,
    opacity: item.opacity ?? 1,
    gradient: item.gradient ?? defaultBars[index]?.gradient ?? 'linear-gradient(180deg, #c7d2fe 0%, #a5b4fc 100%)'
  }));
};

const loadTodayTrend = async () => {
  if (!canShowTrend.value) return;
  try {
    const res: any = await fetchTodayTrend({ profile_id: profileId.value });
    const data = res?.data || {};
    summary.value = {
      score: data.score ?? defaultSummary.score,
      tag: data.score_level ?? data.tag ?? defaultSummary.tag,
      label: data.theme ?? data.label ?? defaultSummary.label,
      insight: data.summary ?? data.insight ?? defaultSummary.insight,
      do: data.yi_main ?? data.do ?? defaultSummary.do,
      avoid: data.ji_main ?? data.avoid ?? defaultSummary.avoid,
      time: data.time_window ?? data.time ?? defaultSummary.time,
      lucky_colors: data.lucky_colors ?? defaultSummary.lucky_colors,
      avoid_colors: data.avoid_colors ?? defaultSummary.avoid_colors,
      lucky_element: data.lucky_element ?? defaultSummary.lucky_element
    };
    bars.value = mapBars(data.dimensions || data.bars || data.energy || []);
  } catch (e) {
    summary.value = { ...defaultSummary };
    bars.value = [...defaultBars];
  }
};

onMounted(() => {
  loadTodayTrend();
});

watch([profileId, canShowTrend], () => {
  loadTodayTrend();
});
</script>

<style lang="scss" scoped>
.trend-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.trend-card {
  position: relative;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(24rpx);
  -webkit-backdrop-filter: blur(24rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 72rpx;
  padding: 48rpx;
  overflow: hidden;
  box-shadow: 0 12rpx 40rpx rgba(99, 102, 241, 0.05);
}

.trend-content-wrapper {
  display: flex;
  justify-content: space-between;
}

.trend-empty {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18rpx;
  text-align: center;
}

.trend-empty-badge {
  width: 80rpx;
  height: 80rpx;
  border-radius: 28rpx;
  background: rgba(99, 102, 241, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.trend-empty-badge-text {
  font-size: 30rpx;
  font-weight: 900;
  color: #6366f1;
}

.trend-empty-title {
  font-size: 34rpx;
  font-weight: 900;
  color: #1e293b;
}

.trend-empty-desc {
  font-size: 28rpx;
  color: #64748b;
  line-height: 1.5;
}

.trend-card-left {
  flex: 1;
  padding-right: 24rpx;
  display: flex;
  flex-direction: column;
}

.date-header {
  margin-bottom: 20rpx;
}

.date-main {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.date-day {
  font-size: 64rpx;
  font-weight: 900;
  color: #1e293b;
  line-height: 1;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
}

.date-meta {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.date-month {
  font-size: 26rpx;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
}

.date-week {
  font-size: 22rpx;
  font-weight: 600;
  color: #64748b;
  line-height: 1.2;
}

.lunar-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.lunar-text {
  font-size: 24rpx;
  color: #94a3b8;
  font-weight: 500;
}

.lunar-dot {
  width: 4rpx;
  height: 4rpx;
  background: #cbd5e1;
  border-radius: 50%;
}

.ganzhi-text {
  font-size: 22rpx;
  color: #94a3b8;
  font-weight: 500;
}

.trend-energy-label {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.energy-label-text {
  font-size: 24rpx;
  color: #94a3b8;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.trend-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 4rpx;
}

.date-row {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.date-text {
  font-size: 40rpx;
  font-weight: 900;
  color: #1e293b;
  line-height: 1.2;
}

.week-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #64748b;
}

.trend-title {
  font-size: 40rpx;
  font-weight: 900;
  color: #1e293b;
  margin-bottom: 4rpx;
  line-height: 1.2;
}

.trend-subtitle {
  font-size: 24rpx;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 32rpx;
}

.trend-summary-group {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.trend-summary-label {
  color: #4f46e5;
  font-weight: 900;
  font-size: 30rpx;
  margin-bottom: 4rpx;
}

.trend-summary-text {
  font-size: 26rpx;
  line-height: 1.5;
  color: #64748b;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.lucky-color-row {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.lucky-label {
  font-size: 24rpx;
  color: #94a3b8;
  font-weight: 500;
}

.lucky-swatches {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.lucky-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.lucky-swatch {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
}

.lucky-text {
  font-size: 24rpx;
  color: #64748b;
  font-weight: 500;
}

.trend-card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  min-width: 200rpx;
}

.trend-score-group {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.trend-score-value {
  font-size: 96rpx;
  font-family: Georgia, serif;
  font-style: italic;
  font-weight: 900;
  color: #4f46e5;
  line-height: 1;
}

.trend-score-label {
  font-size: 22rpx;
  font-weight: 900;
  color: #a5b4fc;
  margin-top: 8rpx;
}

.trend-mini-bars {
  display: flex;
  align-items: flex-end;
  gap: 12rpx;
  height: 200rpx;
}

.trend-mini-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  justify-content: flex-end;
  width: 40rpx;
  height: 100%;
}

.trend-mini-bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8rpx;
}

.trend-mini-bar {
  width: 16rpx;
  border-radius: 999rpx;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.05);
}

.trend-mini-bar-label {
  font-size: 20rpx;
  color: #94a3b8;
  font-weight: 500;
  line-height: 1;
  margin-bottom: 6rpx;
  white-space: nowrap;
}

.trend-mini-bar-value {
  font-size: 22rpx;
  // color: #4f46e5;
  font-weight: 700;
  line-height: 1;
  // font-family: Georgia, serif;
}

.score-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 240rpx;
  height: 240rpx;
  background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.profile-popup-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.profile-popup-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 16rpx;
  border-radius: 16rpx;
  background: #ffffff;
  border: 1rpx solid transparent;
  position: relative;
  transition: all 0.2s;
  box-shadow: none;
}

.profile-popup-item.active {
  background: rgba(224, 231, 255, 0.5);
}

.profile-popup-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 8rpx;
}

.profile-popup-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.profile-popup-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e293b;
}

.profile-popup-self {
  padding: 2rpx 10rpx;
  border-radius: 999rpx;
  background: #e0e7ff;
  font-size: 20rpx;
  color: #6366f1;
  font-weight: 700;
}

.profile-popup-desc {
  font-size: 22rpx;
  color: #64748b;
}

.profile-popup-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  padding: 40rpx 0;
}

.profile-popup-empty-text {
  font-size: 26rpx;
  color: #94a3b8;
}

.profile-popup-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #6366f1;
  margin-right: 24rpx;
  flex-shrink: 0;
  position: relative;
}

.profile-popup-dot::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: inherit;
  animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  z-index: 1;
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
  }
}
</style>
