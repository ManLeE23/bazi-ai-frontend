<template>
  <div class="slogan-container" :class="{ 'exit': isExiting }">
    <!-- 背景光晕 -->
    <div class="glow-blob blob-1 animate-float"></div>
    <div class="glow-blob blob-2 animate-float" style="animation-delay: -2s"></div>

    <!-- 标题区域 -->
    <div class="text-section">
      <div class="bar"></div>
      <h1 class="main-title">
        看清趋势，<br />
        走对<span class="text-indigo">下一步。</span>
      </h1>
      <p class="sub-text">
        DIGITAL WISDOM & CULTURAL ANALYSIS
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { doLogin } from '@/utils/auth';

const isExiting = ref(false);
const inviteCode = ref('');

onLoad((options: any) => {
  if (options.inviteCode) {
    inviteCode.value = options.inviteCode;
  }
});

onMounted(async () => {
  const minDisplayTime = new Promise(resolve => setTimeout(resolve, 1500));
  
  try {
    await minDisplayTime;
    
    // Start exit animation
    isExiting.value = true;
    
    // Navigate after animation completes
    setTimeout(() => {
      // const token = uni.getStorageSync('token');
      //   if (token) {
    //     uni.reLaunch({
    //       url: '/pages/chat/index'
    //     });
    //   } else {
    //     let url = '/pages/login/index';
    //     if (inviteCode.value) {
    //       url += `?inviteCode=${inviteCode.value}`;
    //     }
    //     uni.reLaunch({
    //       url
    //     });
    //   }
    uni.reLaunch({
      url: '/pages/index/index'
    });
  }, 1000); // 1s matches the CSS transition duration
  } catch (error) {
    console.error('Startup error:', error);
    // Ensure we navigate even if something unexpected happens
    const token = uni.getStorageSync('token');
    if (token) {
      uni.reLaunch({
        url: '/pages/index/index'
      });
    } else {
      let url = '/pages/login/index';
      if (inviteCode.value) {
        url += `?inviteCode=${inviteCode.value}`;
      }
      uni.reLaunch({
        url
      });
    }
  }
});
</script>

<style lang="scss" scoped>
.slogan-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f8f9ff; /* surface */
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 200px 40px 0;
  overflow: hidden;
  
  // Exit transition
  transition: opacity 1s ease, transform 1s ease, filter 1s ease;
  
  &.exit {
    opacity: 0;
    transform: scale(1.1);
    filter: blur(10px);
    pointer-events: none;
  }
}

.glow-blob {
  position: absolute;
  width: 800px;
  height: 800px;
  border-radius: 50%;
  filter: blur(200px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.15;
}

.blob-1 {
  top: -200px;
  left: -200px;
  background-color: #7c4dff; /* primary_container */
}

.blob-2 {
  bottom: 20%;
  right: -300px;
  width: 600px;
  height: 600px;
  background-color: #a78bfa;
}

/* 文本区域 */
.text-section {
  position: relative;
  z-index: 10;
  margin-top: 40px;

  .bar {
    width: 48px;
    height: 6px;
    background-color: #632ce5; /* primary */
    margin-bottom: 32px;
    border-radius: 999px;
  }

  .main-title {
    font-size: 50px;
    font-weight: 900;
    color: #191c20;
    line-height: 1.5;
    letter-spacing: -0.02em;

    .text-slate-300 {
      color: #94a3b8;
    }
    
    .text-indigo {
      color: #632ce5; /* primary */
    }
  }

  .sub-text {
    margin-top: 24px;
    color: #64748b;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
  }
}

/* IP 区域 */
.ip-section {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  .ip-placeholder {
    position: relative;
    z-index: 10;
    width: 280px;
    height: 340px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .center-content {
    text-align: center;
    
    .dots {
      display: flex;
      gap: 8px;
      justify-content: center;
      opacity: 0.4;
      margin-bottom: 16px;
      
      .dot {
        width: 8px;
        height: 8px;
        background-color: #6366f1; /* indigo-500 */
        border-radius: 50%;
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        
        &.delay-1 { animation-delay: 0.15s; }
        &.delay-2 { animation-delay: 0.3s; }
      }
    }

    .placeholder-tag {
      padding: 8px 24px;
      border: 1px solid #c7d2fe; /* indigo-200 */
      border-radius: 999px;
      font-size: 10px;
      font-weight: 700;
      color: #818cf8; /* indigo-400 */
      letter-spacing: 0.1em;
      background-color: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(4px);
    }

    .placeholder-hint {
      font-size: 9px;
      color: #94a3b8; /* slate-400 */
      margin-top: 8px;
      text-transform: uppercase;
      letter-spacing: -0.05em;
    }
  }
}

/* 动画定义 */
.animate-float {
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
</style>