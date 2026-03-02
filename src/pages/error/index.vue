<template>
  <view class="error-page">
    <HeaderBar title="" :showBack="false" :fixed="true" :placeholder="true" backgroundColor="transparent" />
    
    <view class="content">
      
      <!-- Icon Section with Animation -->
      <view class="icon-section float-anim">
        <view class="icon-bg-blur"></view>
        <view class="icon-box">
          <!-- Using SVG from reference -->
          <image 
            :src="errorFaceIcon" 
            class="error-icon"
            mode="aspectFit"
          />
        </view>
      </view>

      <!-- Text Section -->
      <view class="text-section">
        <text class="error-title">哎呀，出错了</text>
        
        <view class="error-badge">
          <text class="badge-label">ERROR: </text>
          <text class="badge-value">{{ message || 'Unknown Error' }}</text>
        </view>

        <text class="error-desc">
          请尝试重新选择或返回首页重新加载数据。
          <br>
          如遇问题，请前往反馈。
        </text>
      </view>
      
      <!-- Button Group -->
      <view class="btn-group">
        <button 
          class="btn-primary" 
          hover-class="btn-primary-hover"
          @click="goHome"
        >
          返回首页
        </button>
        
        <button 
          class="btn-secondary" 
          hover-class="btn-secondary-hover"
          @click="goFeedback"
        >
          反馈问题
        </button>

        <button
          v-if="showRetry"       
          class="btn-secondary" 
          hover-class="btn-secondary-hover"
          @click="handleRetry"
        >
          刷新试试
        </button>
      </view>

    </view>

    <!-- Footer -->
    <view class="footer">
      <text class="footer-text">感谢您对人生趋势的支持</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import HeaderBar from '@/components/HeaderBar.vue';

import errorFaceIcon from '@/static/icon/error-face.svg?url';

const message = ref('');
const showRetry = ref(true);

onLoad((options: any) => {
  if (options.message) {
    message.value = decodeURIComponent(options.message);
  }
  if (options.showRetry === 'false') {
    showRetry.value = false;
  }
});

const goHome = () => {
  uni.reLaunch({
    url: '/pages/home/index'
  });
};

const goFeedback = () => {
  uni.navigateTo({
    url: '/pages/feedback/index'
  });
};

const handleRetry = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    goHome();
  }
};
</script>

<style lang="scss" scoped>
.error-page {
  min-height: 100vh;
  background-color: #F1F0FA;
  display: flex;
  flex-direction: column;
  position: relative;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 40rpx;
  padding-top: 100rpx; // Give some space from header
}

/* Animations */
@keyframes float { 
  0% { transform: translateY(0px); } 
  50% { transform: translateY(-10px); } 
  100% { transform: translateY(0px); } 
}

.float-anim {
  animation: float 3s ease-in-out infinite;
}

/* Icon Section */
.icon-section {
  position: relative;
  margin-bottom: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-bg-blur {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(199, 210, 254, 0.3); // indigo-200, opacity 30
  filter: blur(40px); // blur-3xl equivalent
  border-radius: 9999px;
  z-index: 0;
  transform: scale(1.5);
}

.icon-box {
  position: relative;
  width: 180rpx; // w-24 (96px approx 192rpx, slightly adjusted)
  height: 180rpx;
  background-color: #ffffff;
  border-radius: 64rpx; // rounded-[32px]
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); // shadow-xl
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.error-icon {
  width: 96rpx;
  height: 96rpx;
}

/* Text Section */
.text-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 80rpx;
}

.error-title {
  font-size: 44rpx;
  font-weight: 900; // font-black
  color: #1e293b; // slate-800
  margin-bottom: 24rpx;
}

.error-badge {
  display: inline-flex;
  align-items: center;
  padding: 12rpx 32rpx;
  background-color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 9999px;
  margin-bottom: 24rpx;
}

.badge-label {
  font-size: 26rpx;
  font-weight: 700;
  color: #94a3b8; // slate-400
  letter-spacing: 0.05em; // tracking-wide
  text-transform: uppercase;
}

.badge-value {
  font-size: 26rpx;
  font-weight: 700;
  color: #fb7185; // rose-400
  margin-left: 8rpx;
  text-transform: uppercase;
}

.error-desc {
  font-size: 30rpx;
  color: #94a3b8; // slate-400
  font-weight: 500;
  padding: 0 32rpx;
  line-height: 1.6;
}

/* Button Group */
.btn-group {
  width: 100%;
  padding: 0 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.btn-primary {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  background: linear-gradient(135deg, #818CF8 0%, #6366F1 100%); // Brand Gradient
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 900; // font-black
  border-radius: 48rpx; // rounded-[24px]
  box-shadow: 0 10px 15px -3px rgba(199, 210, 254, 0.5); // shadow-lg shadow-indigo-100
  border: none;
  transition: all 0.2s;
  
  &::after {
    border: none;
  }
}

.btn-primary-hover {
  transform: scale(0.98);
  opacity: 0.95;
}

.btn-secondary {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  background-color: #ffffff;
  color: #94a3b8; // slate-400
  font-size: 32rpx;
  font-weight: 900;
  border-radius: 48rpx;
  border: 1px solid #f1f5f9; // slate-100
  transition: all 0.2s;
  
  &::after {
    border: none;
  }
}

.btn-secondary-hover {
  background-color: #f8fafc; // slate-50
}

/* Footer */
.footer {
  position: absolute;
  bottom: 80rpx;
  width: 100%;
  text-align: center;
  left: 0;
}

.footer-text {
  font-size: 26rpx;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}
</style>