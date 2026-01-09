<template>
  <div class="loading-page">
    <u-navbar :is-back="false" background="transparent" :border-bottom="false" />
    <div class="text-center max-w-sm">
      <!-- Animated Icon -->
      <div class="icon-container">
        <div class="ping-animation">
          <div class="ping-circle"></div>
        </div>
        <div class="pulse-icon">
          <div class="gradient-icon">
            <image src="@/static/default-logo.svg" alt="logo" class="icon-text" />
          </div>
        </div>
      </div>

      <!-- Loading Text -->
      <h2 class="loading-title">AI 诊断中</h2>
      <p class="loading-description">
        正在为你解读命盘...
      </p>

      <!-- Progress Steps -->
      <div class="steps-container">
        <LoadingStep text="排列八字结构" :delay="0" />
        <LoadingStep text="分析命理格局" :delay="600" />
        <LoadingStep text="生成人话解释" :delay="1200" />
        <LoadingStep text="整合诊断建议" :delay="1800" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import LoadingStep from './components/LoadingStep.vue';
import { createSSEConnection, closeSSEConnection } from '@/utils/sse';

let sseInstance = null;

const reportId = ref(null);

onLoad((params) => {
  if (params.id) {
    reportId.value = params.id;
    onCreateSEE();
  }
});

const onCreateSEE = () => {
  sseInstance = createSSEConnection(
    reportId.value,
    (message) => {
      console.log('Received SSE message:', message);
      // 处理接收到的消息
      if (message.data.status === 'completed') {
        closeSSEConnection(sseInstance);
        onJump();
      }
    },
    (error) => {
      console.error('SSE error:', error);
      // 处理错误
      closeSSEConnection(sseInstance);
    }
  );
};

const onJump = () => {
  uni.redirectTo({ url: `/pages/report/index?id=${reportId.value}` });
}

</script>

<style lang="scss" scoped>
.loading-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md;
  background: $color-slate-50;
}

.icon-container {
  position: relative;
  margin-bottom: $spacing-lg;
}

.ping-animation {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ping-circle {
  width: 128px;
  height: 128px;
  background: linear-gradient(
    135deg,
    rgba($color-amber-400, 0.2),
    rgba($color-orange-500, 0.2)
  );
  border-radius: 50%;
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.pulse-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gradient-icon {
  width: 96px;
  height: 96px;
  background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
  border-radius: $border-radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.icon-text {
  width: 48px;
  height: 48px;
  color: $color-white;
}

.loading-title {
  font-size: $text-sm;
  color: $color-slate-900;
  margin-bottom: $spacing-sm;
  text-align: center;
}

.loading-description {
  text-align: center;
  font-size: $text-sm;
  color: $color-slate-600;
  margin-bottom: $spacing-lg;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
