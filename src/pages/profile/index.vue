<template>
  <view class="root">
    <view class="flex-1 px-6 pt-12">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">个人中心</h2>

      <view class="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-6 text-white mb-6 relative overflow-hidden">
        <view class="relative z-10">
          <p class="text-xs opacity-60">人生趋势 VIP 会员</p>

          <p class="text-xl font-bold mt-1">未订阅会员</p>

          <button class="mt-4 px-4 py-2 bg-indigo-500 text-xs font-bold rounded-xl">
            升级会员，获取无限分析
          </button>
        </view>

        <view class="absolute -right-4 -bottom-4 text-6xl opacity-20">
          💎
        </view>
      </view>

      <view class="space-y-4">
        <template v-for="(item, index) in [1,2,3]" :key="index">
          <view class="glass p-4 rounded-2xl flex justify-between items-center">
            <view>
              <p class="text-sm font-bold text-gray-700">
                2026-01-{{ item }} 趋势诊断
              </p>

              <p class="text-xs-small text-gray-400">关注点：事业发展</p>
            </view>

            <span class="text-indigo-500 text-xs font-bold">已完成 ></span>
          </view>
        </template>
      </view>

      <view class="mt-8 space-y-2">
        <view class="glass p-4 rounded-2xl text-sm text-gray-600">
          我的订单
        </view>

        <view class="glass p-4 rounded-2xl text-sm text-gray-600">
          意见反馈
        </view>

        <view class="p-4 text-center text-sm text-red-400">退出登录</view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <view class="glass h-20 px-10 flex items-center justify-between mt-auto border-t border-white">
      <button @click="navigateTo('/pages/index')" class="flex flex-col items-center gap-1">
        <span
          class="text-xl transition-all"
          :class="currentPage === 'home' ? 'scale-110 opacity-100' : 'opacity-20'"
          >🏠</span
        >
        <span
          class="text-xs-small font-bold uppercase tracking-tighter"
          :class="currentPage === 'home' ? 'active-tab' : 'text-gray-400'"
          >Home</span
        >
      </button>
      <button @click="navigateTo('/pages/report-list')" class="flex flex-col items-center gap-1">
        <span
          class="text-xl transition-all"
          :class="currentPage === 'reports' ? 'scale-110 opacity-100' : 'opacity-20'"
          >📊</span
        >
        <span
          class="text-xs-small font-bold uppercase tracking-tighter"
          :class="currentPage === 'reports' ? 'active-tab' : 'text-gray-400'"
          >Report</span
        >
      </button>
      <button @click="navigateTo('/pages/profile')" class="flex flex-col items-center gap-1">
        <span
          class="text-xl transition-all"
          :class="currentPage === 'me' ? 'scale-110 opacity-100' : 'opacity-20'"
          >👤</span
        >
        <span
          class="text-xs-small font-bold uppercase tracking-tighter"
          :class="currentPage === 'me' ? 'active-tab' : 'text-gray-400'"
          >Me</span
        >
      </button>
    </view>
  </view>
</template>

<script lang="ts">
import { ref } from 'vue';

export default {
  name: 'ProfilePage',
  setup() {
    const currentPage = ref('me'); // 设置当前页面为个人中心
    
    const navigateTo = (url: string) => {
      if(url !== '/pages/profile') {  // 如果不是当前页面则跳转
        uni.navigateTo({
          url
        });
      }
    };

    return {
      currentPage,
      navigateTo
    };
  }
};
</script>

<style lang="scss">
.root {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 0% 0%, rgba(212, 226, 255, 0.5) 0, transparent 50%),
    radial-gradient(circle at 100% 0%, rgba(255, 226, 241, 0.5) 0, transparent 50%),
    // radial-gradient(circle at 100% 100%, rgba(226, 255, 241, 0.5) 0, transparent 50%),
    radial-gradient(circle at 0% 100%, rgba(241, 226, 255, 0.5) 0, transparent 50%),
    #ffffff;
}

.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.active-tab {
  color: #6366f1;
  font-weight: 800;
}

/* 字体大小类 */
.text-xs-tiny { font-size: 16rpx; }
.text-xs-small { font-size: 18rpx; }
.text-sm { font-size: 24rpx; }
.text-base { font-size: 28rpx; }
.text-lg { font-size: 32rpx; }
.text-xl { font-size: 36rpx; }
.text-2xl { font-size: 48rpx; }
.text-3xl { font-size: 48rpx; }
.text-4xl { font-size: 64rpx; }

/* 间距类 */
.mb-6 { margin-bottom: 48rpx; }
.mt-1 { margin-top: 8rpx; }
.mt-4 { margin-top: 32rpx; }
.mt-6 { margin-top: 48rpx; }
.mb-10 { margin-bottom: 80rpx; }
.mb-2 { margin-bottom: 16rpx; }
.p-4 { padding: 32rpx; }
.p-6 { padding: 48rpx; }
.py-2 { padding-top: 16rpx; padding-bottom: 16rpx; }
.px-4 { padding-left: 32rpx; padding-right: 32rpx; }
.px-6 { padding-left: 48rpx; padding-right: 48rpx; }
.py-8 { padding-top: 64rpx; padding-bottom: 64rpx; }
.pt-12 { padding-top: 96rpx; }
.pb-24 { padding-bottom: 192rpx; }
.pt-20 { padding-top: 160rpx; }
.pb-20 { padding-bottom: 160rpx; }
.px-7 { padding-left: 56rpx; padding-right: 56rpx; }
.py-6 { padding-top: 48rpx; padding-bottom: 48rpx; }
.space-y-4 { margin-top: 32rpx; }
.space-y-2 { margin-top: 16rpx; }
.gap-1 { gap: 8rpx; }
.gap-4 { gap: 32rpx; }
.gap-3 { gap: 24rpx; }
.gap-2 { gap: 16rpx; }
.gap-5 { gap: 40rpx; }

/* 布局类 */
.items-start { align-items: flex-start; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }
.justify-center { justify-content: center; }
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }
.flex { display: flex; }
.flex-1 { flex: 1; }
.flex-col { flex-direction: column; }
.overflow-hidden { overflow: hidden; }
.overflow-y-auto { overflow-y: auto; }

/* 文本样式 */
.font-bold { font-weight: 700; }
.font-black { font-weight: 900; }
.uppercase { text-transform: uppercase; }
.tracking-tighter { letter-spacing: -0.05em; }
.tracking-wider { letter-spacing: 0.05em; }
.tracking-widest { letter-spacing: 0.1em; }

/* 颜色类 */
.text-gray-800 { color: #1f2937; }
.text-gray-700 { color: #374151; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-indigo-500 { color: #6366f1; }
.text-indigo-400 { color: #818cf8; }
.text-indigo-600 { color: #4f46e5; }
.text-red-400 { color: #f87171; }
.opacity-20 { opacity: 0.2; }
.opacity-60 { opacity: 0.6; }

/* 背景类 */
.bg-indigo-500 { background-color: #6366f1; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-green-100 { background-color: #dcfce7; }
.bg-white-40 { background-color: rgba(255, 255, 255, 0.4); }
.bg-white-50 { background-color: rgba(255, 255, 255, 0.5); }
.bg-white-70 { background-color: rgba(255, 255, 255, 0.7); }
.bg-white-80 { background-color: rgba(255, 255, 255, 0.8); }

/* 边框类 */
.border-white { border-color: #fff; }
.border-t { border-top: 1rpx solid currentColor; }

/* 圆角类 */
.rounded-2xl { border-radius: 32rpx; }
.rounded-3xl { border-radius: 48rpx; }
.rounded-xl { border-radius: 24rpx; }

/* 尺寸类 */
.w-full { width: 100%; }
.h-20 { height: 160rpx; }
.h-full { height: 100%; }

/* 定位类 */
.absolute { position: absolute; }
.relative { position: relative; }
.top-0 { top: 0; }
.right-0 { right: 0; }
.-right-4 { right: -32rpx; }
.-bottom-4 { bottom: -32rpx; }
.z-10 { z-index: 10; }

/* 动画过渡类 */
.transition-all { transition: all 0.3s; }
.scale-110 { transform: scale(1.1); }

/* 其他样式 */
.backdrop-filter { backdrop-filter: blur(14px); }
</style>