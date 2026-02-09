<template>
  <view class="digital-soul-container">
    <!-- Ambient Background (The "Soul" of the design) -->
    <view class="ambient-bg">
      <view class="orb orb-1"></view>
      <view class="orb orb-2"></view>
      <view class="orb orb-3"></view>
    </view>

    <!-- Header Bar -->
    <HeaderBar 
      :fixed="true" 
      background-color="transparent" 
      :show-back="true"
    >
      <template #right>
        <view class="header-me-btn glass-panel">
          <text class="me-text">ME</text>
        </view>
      </template>
    </HeaderBar>
    
    <scroll-view scroll-y class="content-scroll" :show-scrollbar="false">
      <view class="content-wrapper">
        
        <!-- Page Title Section -->
        <view class="page-header fade-in-up">
          <text class="page-title">探索</text>
          <view class="subtitle-row">
            <view class="subtitle-line"></view>
            <text class="page-subtitle">DIGITAL SOUL HUB</text>
          </view>
        </view>

        <!-- Main Engine Card (Bazi) -->
        <view class="ds-card main-card fade-in-up delay-1" @click="navigateTo('/pages/step/index')">
          <!-- Inner Glow -->
          <view class="card-glow"></view>
          
          <view class="card-top">
            <view class="tag-pill">
              <view class="status-dot pulsing"></view>
              <text class="tag-text">MAIN ENGINE</text>
            </view>
          </view>
          
          <view class="card-main">
            <text class="card-title-serif">八字排盘</text>
            <text class="card-desc">基于时间向量的{{ '\n' }}能量场深度建模</text>
          </view>
          
          <view class="card-footer">
            <view class="action-circle">
              <u-icon name="arrow-right" color="#1e293b" size="32"></u-icon>
            </view>
            <text class="card-meta">V 2.0.1</text>
          </view>
        </view>

        <!-- Grid Section -->
        <view class="grid-section">
          
          <!-- MBTI Card -->
          <view class="ds-card grid-card mbti-card fade-in-up delay-2" @click="handleMBTI">
            <view class="card-content">
              <view class="icon-placeholder mbti-icon">
                <text class="icon-text">M</text>
              </view>
              <view class="text-group">
                <text class="card-title-serif">MBTI</text>
                <text class="card-sub">PERSONALITY</text>
              </view>
            </view>
          </view>

          <!-- Daily Fortune Card -->
          <view class="ds-card grid-card fortune-card fade-in-up delay-3" @click="navigateTo('/pages/fortune/index')">
            <view class="card-top-right">
              <view class="status-dot-blue"></view>
            </view>
            <view class="card-content">
              <view class="date-group">
                <text class="date-num">{{ currentDay }}</text>
                <text class="date-month">{{ currentMonth }}</text>
              </view>
              <view class="text-group">
                <text class="card-title-serif">今日运势</text>
                <text class="card-sub">DAILY AURA</text>
              </view>
            </view>
          </view>
          
        </view>

        <!-- Bottom Tools Row -->
        <view class="tools-row fade-in-up delay-4">
          <!-- Date Selection -->
          <view class="ds-card tool-pill" @click="showComingSoon('择吉日')">
            <view class="tool-icon-box">
              <u-icon name="calendar" color="#64748b" size="32"></u-icon>
            </view>
            <text class="tool-text">择吉日</text>
          </view>
          
          <!-- Compatibility -->
          <view class="ds-card tool-pill" @click="showComingSoon('合盘')">
            <view class="tool-icon-box">
              <u-icon name="heart" color="#64748b" size="32"></u-icon>
            </view>
            <text class="tool-text">合盘</text>
          </view>
        </view>

      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import HeaderBar from '@/components/HeaderBar.vue';

// Date Logic
const date = new Date();
const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const currentDay = computed(() => date.getDate().toString().padStart(2, '0'));
const currentMonth = computed(() => months[date.getMonth()]);

const navigateTo = (url: string) => {
  if (url === '/pages/fortune/index') {
     uni.navigateTo({ 
       url, 
       fail: () => uni.showToast({title: '功能开发中', icon:'none'}) 
     });
  } else {
    uni.navigateTo({ url });
  }
};

const handleMBTI = () => {
  uni.showToast({
    title: 'MBTI 功能开发中',
    icon: 'none'
  });
};

const showComingSoon = (feature: string) => {
  uni.showToast({
    title: `${feature} 即将上线`,
    icon: 'none'
  });
};
</script>

<style lang="scss" scoped>
/* 
  GLASSMORPHISM & OVERSEAS DESIGN SYSTEM 
  - Colors: Slate (Text), Indigo/Violet (Accents), White (Glass)
  - Effects: Backdrop Blur, Soft Shadows, Mesh Gradients
*/

.digital-soul-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  background-color: #F8FAFC; /* Slate-50 */
  overflow: hidden;
}

/* Ambient Background Animation */
.ambient-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  background: #F8FAFC;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: floatOrb 10s ease-in-out infinite;
}

.orb-1 {
  width: 600rpx;
  height: 600rpx;
  background: radial-gradient(circle, #E0E7FF 0%, rgba(224, 231, 255, 0) 70%); /* Indigo-100 */
  top: -10%;
  right: -20%;
  animation-delay: 0s;
}

.orb-2 {
  width: 500rpx;
  height: 500rpx;
  background: radial-gradient(circle, #F3E8FF 0%, rgba(243, 232, 255, 0) 70%); /* Purple-100 */
  bottom: 20%;
  left: -10%;
  animation-delay: -2s;
}

.orb-3 {
  width: 400rpx;
  height: 400rpx;
  background: radial-gradient(circle, #DBEAFE 0%, rgba(219, 234, 254, 0) 70%); /* Blue-100 */
  top: 40%;
  right: 10%;
  animation-delay: -5s;
}

@keyframes floatOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* Header Elements */
.header-me-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);
}

.me-text {
  font-size: 20rpx;
  font-weight: 800;
  color: #334155;
}

/* Layout */
.content-scroll {
  height: 100vh;
  width: 100%;
}

.content-wrapper {
  padding: calc(env(safe-area-inset-top) + 120rpx) 40rpx calc(env(safe-area-inset-bottom) + 40rpx);
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 24rpx; /* Tighter gap for modern feel */
}

/* Typography */
.card-title-serif {
  font-family: 'Songti SC', 'Noto Serif SC', serif;
  font-weight: 800;
  color: #1e293b;
}

.page-header {
  margin-bottom: 32rpx;
  padding-left: 8rpx;
}

.page-title {
  font-family: 'Songti SC', 'Noto Serif SC', serif;
  font-size: 72rpx;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
  display: block;
}

.subtitle-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 12rpx;
}

.subtitle-line {
  width: 40rpx;
  height: 2rpx;
  background: #94a3b8;
}

.page-subtitle {
  font-size: 22rpx;
  color: #64748b;
  font-weight: 600;
  letter-spacing: 4rpx;
}

/* Glass Cards Common */
.ds-card {
  background: rgba(255, 255, 255, 0.5); /* More transparent */
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 48rpx; /* Softer corners */
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 20rpx 40rpx -10rpx rgba(148, 163, 184, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5); /* Inner border light */
  position: relative;
  overflow: hidden;
  transition: transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  &:active {
    transform: scale(0.98);
  }
}

/* Main Card */
.main-card {
  height: 440rpx;
  padding: 48rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
  filter: blur(40px);
  z-index: 0;
}

.card-top { position: relative; z-index: 2; }

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(255, 255, 255, 0.5);
  padding: 8rpx 20rpx;
  border-radius: 100rpx;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  background-color: #6366f1;
  border-radius: 50%;
  box-shadow: 0 0 10rpx rgba(99, 102, 241, 0.4);
}

.pulsing {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.tag-text {
  font-size: 20rpx;
  font-weight: 700;
  color: #475569;
  letter-spacing: 1rpx;
}

.card-main { position: relative; z-index: 2; margin-top: auto; margin-bottom: 32rpx; }
.main-card .card-title-serif {
  font-size: 64rpx;
  margin-bottom: 16rpx;
  display: block;
  letter-spacing: -1rpx;
}
.card-desc {
  font-size: 26rpx;
  color: #64748b;
  line-height: 1.6;
}

.card-footer {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-circle {
  width: 88rpx;
  height: 88rpx;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.06);
}

.card-meta {
  font-size: 20rpx;
  color: #94a3b8;
  font-weight: 600;
  letter-spacing: 2rpx;
}

/* Grid Section */
.grid-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}

.grid-card {
  height: 340rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-sub {
  font-size: 18rpx;
  color: #94a3b8;
  font-weight: 700;
  letter-spacing: 1rpx;
  margin-top: 8rpx;
  text-transform: uppercase;
}

/* MBTI Specific */
.mbti-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}
.icon-text {
  font-size: 40rpx;
  font-family: serif;
  font-weight: 900;
  color: #3b82f6;
}
.mbti-card .card-title-serif { font-size: 40rpx; }

/* Fortune Specific */
.fortune-card { position: relative; }
.card-top-right {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
}
.status-dot-blue {
  width: 10rpx;
  height: 10rpx;
  background-color: #3b82f6;
  border-radius: 50%;
}
.date-group {
  margin-bottom: auto;
}
.date-num {
  font-size: 56rpx;
  font-weight: 800;
  color: #0f172a;
  display: block;
  line-height: 1;
  letter-spacing: -2rpx;
}
.date-month {
  font-size: 20rpx;
  color: #64748b;
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 4rpx;
  display: block;
}
.fortune-card .card-title-serif { font-size: 40rpx; }

/* Tools Row */
.tools-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}
.tool-pill {
  height: 112rpx;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  gap: 20rpx;
  border-radius: 36rpx;
}
.tool-icon-box {
  width: 64rpx;
  height: 64rpx;
  background: rgba(255,255,255,0.5);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tool-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #475569;
}

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.15s; }
.delay-3 { animation-delay: 0.2s; }
.delay-4 { animation-delay: 0.25s; }
</style>