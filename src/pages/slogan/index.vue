<template>
  <div class="slogan-container" :class="{ 'exit': isExiting }">
    <!-- 背景圆环动画 -->
    <div class="bg-circles">
      <div class="circle-outer animate-rotate"></div>
      <div class="circle-inner"></div>
    </div>

    <!-- 标题区域 -->
    <div class="text-section">
      <div class="bar"></div>
      <h1 class="main-title">
        把复杂的<br />
        <span class="text-slate-300">人生，</span><br />
        变成<span class="text-indigo">可行趋势。</span>
      </h1>
      <p class="sub-text">
        DIGITAL WISDOM & DESTINY ALGORITHMS
      </p>
    </div>

    <!-- IP 漂浮区域 -->
    <!-- <div class="ip-section animate-float">
      <div class="glow-blob"></div>
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

const isExiting = ref(false);

onMounted(() => {
  setTimeout(() => {
    // Start exit animation
    isExiting.value = true;
    
    // Navigate after animation completes
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/index/index'
      });
    }, 1000); // 1s matches the CSS transition duration
  }, 1500);
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
  justify-content: space-between;
  padding: 80px 40px;
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

/* 背景圆环 */
.bg-circles {
  position: absolute;
  inset: 0;
  opacity: 0.05;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;

  .circle-outer {
    width: 500px;
    height: 500px;
    border: 1px solid #312e81; /* indigo-900 */
    border-radius: 50%;
  }

  .circle-inner {
    position: absolute;
    width: 300px;
    height: 300px;
    border: 1px solid #312e81; /* indigo-900 */
    border-radius: 50%;
    opacity: 0.3;
  }
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
    font-size: 52px;
    font-weight: 900;
    color: #0f172a; /* slate-900 */
    line-height: 1.05;
    letter-spacing: -0.05em;

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

  .glow-blob {
    position: absolute;
    width: 256px;
    height: 256px;
    background-color: rgba(99, 102, 241, 0.2); /* indigo-500/20 */
    border-radius: 50%;
    filter: blur(80px);
  }

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
.animate-rotate {
  animation: rotate-slow 20s linear infinite;
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

@keyframes rotate-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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