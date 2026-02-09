<template>
  <div class="slogan-container" :class="{ 'exit': isExiting }">
    <!-- 背景光晕 -->
    <div class="glow-blob animate-float"></div>

    <!-- 标题区域 -->
    <div class="text-section">
      <div class="bar"></div>
      <h1 class="main-title">
        看清趋势，<br />
        走对<span class="text-indigo">下一步。</span>
      </h1>
      <p class="sub-text">
        DIGITAL WISDOM & DESTINY ALGORITHMS
      </p>
    </div>

    <!-- IP 漂浮区域 -->
    <!-- <div class="ip-section animate-float">
       <div class="ip-placeholder">
         <div class="center-content">
           <div class="dots">
             <div class="dot"></div>
             <div class="dot delay-1"></div>
             <div class="dot delay-2"></div>
           </div>
           <div class="placeholder-tag">
             IP CHARACTER PLACEHOLDER
           </div>
           <p class="placeholder-hint">请替换为你下载的男女 IP 合影图</p>
         </div>
       </div>
     </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { doLogin } from '@/utils/auth';

const isExiting = ref(false);

onMounted(async () => {
  const minDisplayTime = new Promise(resolve => setTimeout(resolve, 1500));
  
  try {
    await minDisplayTime;
    
    // Start exit animation
    isExiting.value = true;
    
    // Navigate after animation completes
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/home/index'
      });
    }, 1000); // 1s matches the CSS transition duration
  } catch (error) {
    console.error('Startup error:', error);
    // Ensure we navigate even if something unexpected happens
    uni.reLaunch({
      url: '/pages/home/index'
    });
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
  background-color: #F8FAFF;
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

/* 背景圆环 - 已移除 */

.glow-blob {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background-color: rgba(99, 102, 241, 0.15); /* indigo-500/15 */
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  z-index: 0;
}

/* 文本区域 */
.text-section {
  position: relative;
  z-index: 10;
  margin-top: 40px;

  .bar {
    width: 48px;
    height: 6px;
    background-color: #4f46e5; /* indigo-600 */
    margin-bottom: 32px;
    border-radius: 999px;
  }

  .main-title {
    font-size: 50px;
    font-weight: 900;
    color: #0f172a; /* slate-900 */
    line-height: 1.5;

    .text-slate-300 {
      color: #cbd5e1;
    }
    
    .text-indigo {
      color: #4f46e5;
    }
  }

  .sub-text {
    margin-top: 24px;
    color: #94a3b8; /* slate-400 */
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