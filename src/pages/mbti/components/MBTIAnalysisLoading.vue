<template>
  <u-popup
    v-model="show"
    mode="bottom"
    :border-radius="48"
    :mask-close-able="false"
    :safe-area-inset-bottom="true"
  >
    <!-- 核心加载弹窗 -->
    <view class="loading-modal">
      <!-- 顶部标题 -->
      <view class="text-center mb-8 mt-4">
        <text class="text-2xl font-black text-primary mb-2 block">MBTI 深度分析</text>
        <text class="text-sm text-outline-variant font-medium">基于您的答题结果，我们正在进行多维度算法拟合...</text>
      </view>

      <!-- 动态加载图标 -->
      <view class="flex justify-center mb-10">
        <view class="spinner-container">
          <view class="spinner-ring"></view>
          <view class="spinner-core"></view>
        </view>
      </view>

      <!-- 进度条 -->
      <view class="mb-10 text-center w-full">
        <view class="flex justify-between items-center mb-2 px-1">
          <text class="text-xs font-black text-outline-variant uppercase tracking-widest">分析进度</text>
          <text class="text-sm font-black text-primary">{{ progress }}%</text>
        </view>
        <view class="w-full h-3 bg-surface-variant rounded-full overflow-hidden p-0_5 border border-outline-variant">
          <view class="h-full rounded-full progress-flow" :style="{ width: progress + '%' }"></view>
        </view>
      </view>

      <!-- 分析步骤项目 -->
      <view class="space-y-3 w-full min-h-steps">
        <view 
          v-for="(item, index) in visibleSteps" 
          :key="index"
          class="step-item flex items-center gap-4 p-4 rounded-2xl option-card"
          :class="index === visibleSteps.length - 1 ? 'option-active' : 'opacity-60'"
        >
          <view class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                :class="index === visibleSteps.length - 1 ? 'bg-primary' : 'bg-surface-variant'">
            <u-icon v-if="index === visibleSteps.length - 1" name="reload" color="#fff" size="24" class="animate-spin"></u-icon>
            <u-icon v-else name="checkmark" color="#7c4dff" size="24"></u-icon>
          </view>
          <text class="text-sm font-bold flex-1"
                :class="index === visibleSteps.length - 1 ? 'text-on-surface' : 'text-outline-variant'">
            {{ item }}
          </text>
        </view>
      </view>


    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: 'analyzing' // 'analyzing', 'success', 'error'
  }
});

const emit = defineEmits(['update:modelValue', 'complete']);

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const steps = [
  "正在检索基础人格特征...",
  "正在分析性格内外向、直觉、情感...",
  "正在构建您的天赋与行为风格模型...",
  "正在综合分析您的核心优势与劣势...",
  "正在匹配最适合的职业发展路径...",
  "正在计算情感模式与亲密关系需求...",
  "正在生成进阶提升个性化建议...",
  "数据拟合完成，报告渲染中..."
];

const currentStep = ref(0);
const progress = ref(0);
const visibleSteps = ref<string[]>([]);

let timer: any = null;

const startAnimation = () => {
  currentStep.value = 0;
  progress.value = 0;
  visibleSteps.value = [steps[0]];
  
  const updateProgress = () => {
    if (!show.value) return;

    if (props.status === 'success') {
      // If API finished, speed up to 100%
      progress.value += Math.floor(Math.random() * 15) + 10;
    } else {
      // Normal fake progress, stall at 90%
      if (progress.value < 90) {
        progress.value += Math.floor(Math.random() * 5) + 1;
      }
    }

    if (progress.value >= 100) {
      progress.value = 100;
      visibleSteps.value.push(steps[steps.length - 1]);
      if (visibleSteps.value.length > 3) visibleSteps.value.shift();
      
      // Trigger completion
      setTimeout(() => {
        emit('complete');
        show.value = false;
      }, 800);
      return;
    }

    // Update steps based on progress
    const expectedStep = Math.min(
      Math.floor(progress.value / (100 / (steps.length - 1))),
      steps.length - 2
    );

    if (expectedStep > currentStep.value) {
      currentStep.value = expectedStep;
      visibleSteps.value.push(steps[currentStep.value]);
      if (visibleSteps.value.length > 3) {
        visibleSteps.value.shift();
      }
    }

    timer = setTimeout(updateProgress, props.status === 'success' ? 100 : 200 + Math.random() * 300);
  };

  updateProgress();
};

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    startAnimation();
  } else {
    if (timer) clearTimeout(timer);
  }
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>

<style lang="scss" scoped>
.loading-modal {
  width: 100%;
  background-color: #F8F9FF; /* bg-surface */
  padding: 64rpx 48rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.min-h-steps {
  min-height: 320rpx; /* Prevent jitter when steps render */
}

.spinner-container {
  width: 144rpx;
  height: 144rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 6rpx solid rgba(124, 77, 255, 0.1);
  border-top-color: #7c4dff;
  animation: spin 1.2s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
}

.spinner-core {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #C084FC, #7c4dff);
  box-shadow: 0 0 32rpx rgba(124, 77, 255, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.8); opacity: 0.8; }
}

.relative { position: relative; }
.absolute { position: absolute; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.z-10 { z-index: 10; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.gap-4 { gap: 32rpx; }
.space-y-3 > view + view { margin-top: 24rpx; }

.w-full { width: 100%; }
.h-full { height: 100%; }
.w-32 { width: 256rpx; }
.h-32 { height: 256rpx; }
.w-24 { width: 192rpx; }
.h-24 { height: 192rpx; }
.w-8 { width: 64rpx; }
.h-8 { height: 64rpx; }
.h-3 { height: 24rpx; }
.h-6 { height: 48rpx; }
.flex-1 { flex: 1; }
.flex-shrink-0 { flex-shrink: 0; }

.rounded-full { border-radius: 9999px; }
.rounded-2xl { border-radius: 32rpx; }
.overflow-hidden { overflow: hidden; }

.text-center { text-align: center; }
.font-bold { font-weight: bold; }
.font-black { font-weight: 900; }
.font-medium { font-weight: 500; }
.text-xxs { font-size: 20rpx; }
.text-xs { font-size: 24rpx; }
.text-sm { font-size: 28rpx; }
.text-2xl { font-size: 48rpx; }
.text-xl { font-size: 40rpx; }
.text-4xl { font-size: 72rpx; }
.uppercase { text-transform: uppercase; }
.tracking-widest { letter-spacing: 0.1em; }
.block { display: block; }

.mb-2 { margin-bottom: 16rpx; }
.mb-4 { margin-bottom: 32rpx; }
.mb-8 { margin-bottom: 64rpx; }
.mb-10 { margin-bottom: 80rpx; }
.mt-4 { margin-top: 32rpx; }
.mt-8 { margin-top: 64rpx; }
.p-4 { padding: 32rpx; }
.px-1 { padding-left: 8rpx; padding-right: 8rpx; }
.p-0_5 { padding: 4rpx; }
.opacity-10 { opacity: 0.1; }
.opacity-60 { opacity: 0.6; }
.shadow-sm { box-shadow: 0 2rpx 4rpx 0 rgba(0,0,0,0.05); }

.text-primary { color: #7c4dff; }
.text-on-surface { color: #191c20; }
.text-outline-variant { color: #494455; }
.bg-primary { background-color: #7c4dff; }
.bg-primary-container { background-color: rgba(124, 77, 255, 0.1); }
.bg-surface-variant { background-color: #E7E8EE; }
.border-outline-variant { border-color: rgba(202, 195, 216, 0.4); }

.blur-2xl { filter: blur(48rpx); }
.blur-3xl { filter: blur(64rpx); }
.transition-opacity { transition: opacity 0.3s ease; }

/* Option Cards (Glassmorphism) */
.option-card {
  background-color: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(202, 195, 216, 0.2);
}
.option-active {
  background-color: #FFFFFF !important;
  border-color: rgba(124, 77, 255, 0.3) !important;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05) !important;
  transform: translateY(-4rpx);
}

.progress-flow {
  background: linear-gradient(90deg, #7c4dff, #C084FC, #7c4dff);
  background-size: 200% 100%;
  animation: flow 2s linear infinite;
}

@keyframes flow {
  0% { background-position: 200% 0; }
  100% { background-position: 0 0; }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}
.step-item {
  animation: fade-in-up 0.5s ease forwards;
}

.animate-spin {
  animation: spin 1s linear infinite;
}
.animate-spin-slow {
  animation: spin 2s linear infinite;
}
</style>