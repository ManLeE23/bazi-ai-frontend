<template>
  <view class="daily-fortune-page">
    <!-- Background Blobs -->
    <view class="energy-blob blob-1"></view>
    <view class="energy-blob blob-2"></view>

    <HeaderBar :fixed="true" :show-back="true" title="今日运势" />
    
    <view class="aura-card-container" :style="{ paddingTop: (headerHeight + 20) + 'px' }">
      <view class="aura-card">
        <!-- Background Blur Orb -->
        <view class="bg-orb"></view>

        <!-- Content -->
        <view class="card-content">
          
          <!-- Header -->
          <view class="card-header">
            <view class="header-left">
              <view class="date-row">
                <text class="date-number">{{ currentDay < 10 ? '0' + currentDay : currentDay }}</text>
                <text class="solar-term">{{ solarTerm }}</text>
              </view>
              <text class="month-year">{{ currentMonthEn }} / {{ currentYear }}</text>
            </view>
            <view class="header-right">
              <text class="lunar-date">{{ fortuneData?.lunar_date ? '农历 ' + fortuneData.lunar_date : '正在计算...' }}</text>
            </view>
          </view>

          <!-- Loading State -->
          <view v-if="loading && !fortuneData" class="loading-state">
            <u-loading mode="flower" size="40" color="#94a3b8"></u-loading>
            <text class="loading-hint">云开雾散中...</text>
          </view>

          <!-- Main Body -->
          <view v-else-if="fortuneData" class="fortune-body">
            <!-- Yi / Ji Section -->
            <view class="yi-ji-container">
              <view class="yi-ji-wrapper">
                <!-- Vertical Divider -->
                <view class="vertical-divider"></view>

                <!-- Yi (Appropriate) -->
                <view class="yi-section">
                  <view class="section-header">
                    <text class="section-icon">宜</text>
                  </view>
                  <view class="list-container">
                    <text v-for="(item, i) in (fortuneData.yi || [])" :key="'y'+i" class="list-item">
                      {{ item }}
                    </text>
                    <text v-if="!fortuneData.yi?.length" class="list-item">诸事顺遂</text>
                  </view>
                </view>

                <!-- Ji (Avoid) -->
                <view class="ji-section">
                  <view class="section-header">
                    <text class="section-icon ji-icon">忌</text>
                  </view>
                  <view class="list-container">
                    <text v-for="(item, i) in (fortuneData.ji || [])" :key="'j'+i" class="list-item ji-item">
                      {{ item }}
                    </text>
                    <text v-if="!fortuneData.ji?.length" class="list-item ji-item">无碍</text>
                  </view>
                </view>
              </view>
            </view>

            <!-- AI Insight Section -->
            <view class="ai-insight">
              <view class="insight-header">
                <view class="insight-bar"></view>
                <text class="insight-label">AI 解读</text>
              </view>
              <view class="insight-body">
                <text class="insight-quote">
                  草木萌动，<br>春意在冰雪下低语。
                </text>
                <view class="insight-content">
                  <MarkDown :content="fortuneData.analysis" />
                </view>
              </view>
            </view>
          </view>

          <!-- Empty State -->
          <view v-else-if="!loading" class="empty-state">
            <text>空</text>
          </view>

          <!-- Footer -->
          <view class="card-footer">
            <text class="footer-brand">Trenlify Reader</text>
            <view class="footer-share">
              <text>Share</text>
              <text class="share-arrow">→</text>
            </view>
          </view>

        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { userStore } from '@/store/user';
import { fetchDailyFortune, type DailyFortuneResponse } from '@/api/services';
import MarkDown from '@/pages/components/MarkDown/index.vue';
import HeaderBar from '@/components/HeaderBar.vue';

const loading = ref(false);
const fortuneData = ref<DailyFortuneResponse | null>(null);
const headerHeight = ref(0);

const currentDate = new Date();
const currentDay = computed(() => currentDate.getDate());
const currentMonth = computed(() => currentDate.getMonth() + 1);
const currentYear = computed(() => currentDate.getFullYear());

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

const currentMonthEn = computed(() => MONTH_NAMES[currentDate.getMonth()]);

// Simple logic to highlight "Li Chun" if today is Feb 4th
const solarTerm = computed(() => {
  if (currentMonth.value === 2 && currentDay.value === 4) {
    return '立春';
  }
  return '';
});

const loadFortune = async () => {
  if (!userStore.selfProfileId) return;

  loading.value = true;
  try {
    const res = await fetchDailyFortune() as unknown as any;
    if (res.data) {
        fortuneData.value = res.data as DailyFortuneResponse;
    } else {
        fortuneData.value = res as DailyFortuneResponse;
    }
  } catch (error) {
    console.error('Fortune load error', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // Calculate header height
  const sysInfo = uni.getSystemInfoSync();
  const statusBarHeight = sysInfo.statusBarHeight || 20;
  let navBarHeight = 44;

  // #ifdef MP-WEIXIN
  const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
  const gap = menuButtonInfo.top - statusBarHeight;
  navBarHeight = menuButtonInfo.height + (gap * 2);
  // #endif

  headerHeight.value = statusBarHeight + navBarHeight;

  loadFortune();
});
</script>

<style lang="scss" scoped>
/* Font Imports (Web only) */

.daily-fortune-page {
  min-height: 100vh;
  background-color: #ffffff;
  position: relative;
  overflow-x: hidden;
}

/* Energy Blobs */
.energy-blob {
  position: fixed;
  width: 100vw;
  height: 800rpx;
  filter: blur(120px);
  z-index: 0;
  opacity: 0.6;
  border-radius: 50%;
  pointer-events: none;
}

.blob-1 {
  background: radial-gradient(circle at center, #E0E7FF 0%, rgba(199, 210, 254, 0.5) 100%);
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
}

.blob-2 {
  background: radial-gradient(circle at center, #F3E8FF 0%, rgba(233, 213, 255, 0.5) 100%);
  top: -10%;
  right: -20%;
  width: 600rpx;
  height: 600rpx;
}

.aura-card-container {
  padding: 32rpx;
  min-height: 100vh;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.aura-card {
  width: 100%;
  max-width: 420px;
  border-radius: 56rpx;
  padding: 48rpx;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8rpx 32rpx rgba(31, 38, 135, 0.07);
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
  position: relative;
}

.bg-orb {
  position: absolute;
  top: -96rpx;
  right: -96rpx;
  width: 256rpx;
  height: 256rpx;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 9999px;
  filter: blur(60px);
  z-index: 0;
}

.card-content {
  position: relative;
  z-index: 10;
}

/* Header Styles */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 48rpx;
}

.header-left {
  /* Default block */
}

.date-row {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.date-number {
  font-size: 120rpx;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: #0f172a; /* slate-900 */
  line-height: 1;
}

.solar-term {
  font-size: 40rpx; /* xl */
  font-family: 'Noto Serif SC', serif;
  font-weight: 700;
  color: #1e293b; /* slate-800 */
}

.month-year {
  font-size: 24rpx; /* xs */
  font-weight: 900;
  color: #94a3b8; /* slate-400 */
  text-transform: uppercase;
  letter-spacing: 0.4em;
  margin-top: 16rpx;
  display: block;
}

.header-right {
  text-align: right;
}

.year-pillar {
  font-size: 24rpx;
  font-weight: 900;
  color: rgba(79, 70, 229, 0.8); /* indigo-600-80 */
  letter-spacing: 0.1em;
  font-family: 'Noto Serif SC', serif;
  display: block;
}

.lunar-date {
  font-size: 24rpx;
  color: #64748b; /* slate-500 */
  font-weight: 700;
  margin-top: 4rpx;
  display: block;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.loading-hint {
  margin-top: 24rpx;
  font-size: 24rpx;
  color: #94a3b8;
  letter-spacing: 0.2em;
}

/* Main Body */
.fortune-body {
  /* Container styles if needed */
}

/* Yi / Ji Section */
.yi-ji-container {
  position: relative;
  z-index: 10;
  margin-bottom: 48rpx;
  padding: 0 4rpx;
}

.yi-ji-wrapper {
  display: flex;
  position: relative;
}

.vertical-divider {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #f1f5f9; /* slate-100 */
}

.yi-section {
  flex: 1;
  padding-right: 24rpx;
}

.ji-section {
  flex: 1;
  padding-left: 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.section-icon {
  font-family: 'Noto Serif SC', serif;
  font-weight: 900;
  color: #ef4444; /* red-500 */
  font-size: 24rpx;
}

.ji-icon {
  color: #10b981; /* emerald-500 */
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.list-item {
  font-family: 'Noto Serif SC', serif;
  font-size: 28rpx; /* sm */
  line-height: 1.625;
  color: #1e293b; /* slate-800 */
  font-weight: 500;
  display: block;
}

.ji-item {
  color: #475569; /* slate-600 */
}

/* AI Insight */
.ai-insight {
  position: relative;
  z-index: 10;
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.insight-bar {
  height: 4rpx; /* 2px */
  width: 32rpx;
  background-color: #6366f1; /* indigo-500 */
}

.insight-label {
  font-size: 24rpx;
  font-weight: 900;
  color: #6366f1; /* indigo-500 */
  text-transform: uppercase;
  letter-spacing: 0.4em;
}

.insight-body {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.insight-quote {
  font-size: 40rpx; /* xl */
  font-family: 'Noto Serif SC', serif;
  font-weight: 900;
  line-height: 1.375;
  color: #0f172a; /* slate-900 */
  letter-spacing: -0.025em;
  display: block;
}

.insight-content {
  font-size: 28rpx; /* sm */
  line-height: 2;
  color: #64748b; /* slate-500 */
  font-weight: 500;
  font-family: 'Noto Serif SC', serif;
  opacity: 0.8;
  text-align: justify;
  display: block;
}

/* Empty State */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
  color: #cbd5e1;
  font-family: 'Noto Serif SC', serif;
  font-size: 64rpx;
}

/* Footer */
.card-footer {
  margin-top: 48rpx;
  padding-top: 32rpx;
  border-top: 1px solid #f8fafc; /* slate-50 */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-brand {
  font-size: 24rpx;
  font-weight: 900;
  color: #1e293b; /* slate-800 */
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.footer-share {
  font-size: 24rpx;
  font-weight: 900;
  color: #94a3b8; /* slate-400 */
  text-transform: uppercase;
  letter-spacing: 0.4em;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.footer-share:active {
  color: #4f46e5; /* indigo-600 */
}

.share-arrow {
  font-size: 36rpx; /* lg */
}
</style>
