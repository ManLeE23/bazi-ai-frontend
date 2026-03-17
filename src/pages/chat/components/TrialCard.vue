<template>
  <view class="trial-card-container">
    <view class="card-header">
      <view class="tag">
        <text class="tag-text">新人福利</text>
      </view>
      <!-- <view class="star-icon">
        <u-icon name="star-fill" color="#ffffff" size="24"></u-icon>
      </view> -->
    </view>
    
    <view class="card-content">
      <text class="title">完整体验权益生效中</text>
      <text class="subtitle">全模块深度洞察权限已开启</text>
    </view>

    <view class="countdown-section">
      <text class="label">有效期剩余</text>
      <text class="time">{{ timeLeft }}</text>
    </view>
    
    <view class="progress-bar-bg">
      <view class="progress-bar-fill" :style="{ width: progressPercentage + '%' }"></view>
    </view>
    
    <!-- <view class="status-btn">
      <view class="status-dot"></view>
      <text class="status-text">权益生效中</text>
    </view> -->
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps<{
  startTime?: string;
  endTime?: string;
}>();

const now = ref(Date.now());
const timer = ref<any>(null);

const calculateTimeLeft = () => {
  if (!props.endTime) return '0天 00时 00分 00秒';
  
  // Replace hyphens with slashes for better cross-platform compatibility (e.g. iOS)
  const end = new Date(props.endTime.replace(/-/g, '/')).getTime();
  const diff = end - now.value;
  
  if (diff <= 0) return '0天 00时 00分 00秒';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${days}天 ${String(hours).padStart(2, '0')}时 ${String(minutes).padStart(2, '0')}分 ${String(seconds).padStart(2, '0')}秒`;
};

const calculateProgress = () => {
  if (!props.startTime || !props.endTime) return 0;
  
  const start = new Date(props.startTime.replace(/-/g, '/')).getTime();
  const end = new Date(props.endTime.replace(/-/g, '/')).getTime();
  const total = end - start;
  const elapsed = now.value - start;
  
  if (total <= 0) return 100;
  if (elapsed <= 0) return 100; // Not started yet, show full? or empty? Assuming full bar means "time remaining" usually decreases, but here let's make it represent "time left". 
  // Wait, usually progress bar fills up or empties down.
  // Design shows a bar that is mostly white (full) with some transparency at the end.
  // Let's assume it represents "Time Remaining" -> 100% at start, 0% at end.
  
  const percentage = Math.max(0, Math.min(100, ((end - now.value) / total) * 100));
  return percentage;
};

const timeLeft = computed(() => calculateTimeLeft());
const progressPercentage = computed(() => calculateProgress());

const updateTimer = () => {
  now.value = Date.now();
};

onMounted(() => {
  updateTimer();
  timer.value = setInterval(updateTimer, 1000);
});

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});
</script>

<style lang="scss" scoped>
.trial-card-container {
  width: 100%;
  background: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%);
  border-radius: 24rpx;
  padding: 24rpx;
  box-sizing: border-box;
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(129, 140, 248, 0.3);
  margin-top: auto; /* Push to bottom if in flex column */
  margin-bottom: 24rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.tag {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  backdrop-filter: blur(4px);
}

.tag-text {
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 1px;
}

.star-icon {
  opacity: 0.8;
}

.card-content {
  margin-bottom: 32rpx;
}

.title {
  font-size: 32rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 8rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 22rpx;
  opacity: 0.9;
  display: block;
}

.countdown-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.label {
  font-size: 20rpx;
  opacity: 0.8;
  font-weight: 600;
}

.time {
  font-size: 24rpx;
  font-family: monospace;
  font-weight: 700;
}

.progress-bar-bg {
  width: 100%;
  height: 8rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #fff;
  border-radius: 4rpx;
  transition: width 1s linear;
}

.status-btn {
  width: 100%;
  height: 64rpx;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #4ade80; /* Green */
  margin-right: 12rpx;
  box-shadow: 0 0 8rpx rgba(74, 222, 128, 0.6);
}

.status-text {
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 1px;
}
</style>