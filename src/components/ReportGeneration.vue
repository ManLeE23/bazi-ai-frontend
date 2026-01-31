<template>
  <view v-if="showProgress" class="report-generation-container">
    <!-- Thinking Steps -->
    <view class="think-box relative">
      <!-- Thinking line -->
      <view class="think-line think-line-position"></view>

      <!-- Existing thinking steps -->
      <view v-for="item in structuredMessages" :key="item.stage" class="relative flex items-start gap-4">
        <block v-if="item.type === 'text'">
          <view class="think-dot think-dot-default" :class="step === item.stage ? 'think-dot-active' : ''"></view>
          <view class="flex-1 mt-1">
            <p class="text-sm font-bold text-gray-800">{{ item.title }}</p>
            <block v-if="item.payload.content">
              <block v-if="Array.isArray(item.payload.content)">
                <view v-for="(subItem, index) in item.payload.content" :key="index"
                  class="mt-2 flex items-center gap-2">
                  <span class="text-xs-tiny"
                    :class="step === item.stage ? 'text-indigo-400 animate-pulse' : 'text-gray-300'">●</span>
                  <span class="text-xs-small text-gray-400 font-mono">{{ subItem }}</span>
                </view>
              </block>
              <block v-else>
                <view class="mt-2 flex items-center gap-2">
                  <span class="text-xs-tiny"
                    :class="step === item.stage ? 'text-indigo-400 animate-pulse' : 'text-gray-300'">●</span>
                  <span class="text-xs-small text-gray-400 font-mono">{{ item.payload.content }}</span>
                </view>
              </block>
            </block>
          </view>
        </block>
      </view>

      <!-- Insight Card -->
      <view v-if="showInsightCard"
        class="insight-card glass border-indigo-100 bg-indigo-50-opacity translate-y-2 transition-all">
        <p class="text-sm font-black text-indigo-600 mb-2 uppercase tracking-widest">
          人生趋势报告
        </p>
        <p class="text-sm text-gray-700 leading-relaxed font-bold" style="margin-bottom: 8px;">
          分析完毕。你的格局属于"印绶护身"，目前正处于一个长达两年的上升周期起点。点击下方卡片看全维度数据。
        </p>
        <BaziButton type="default" size="medium" show-shadow @click="goToDetail">
          查看完整趋势报告
        </BaziButton>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaziButton from '@/components/BaziButton.vue';  // 修正导入路径
import useChatSSE from '@/hooks/useChatSSE';
import { fetchReportById } from '@/api/services';

interface Props {
  reportId: string;
}

interface Emits {
  (e: 'generationComplete', reportData: any): void;
  (e: 'navigateToDetail', reportId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const structuredMessages = ref<any[]>([]);
const showInsightCard = ref(false);
const step = ref(0);
const reportData = ref(null);
const showProgress = ref(false);
let sseClient: any = null;

const stopGeneration = () => {
  if (sseClient) {
    sseClient.close();
  }
};
// 连接到 SSE
const startGeneration = () => {
  console.log('report startGeneration')
  if (!props.reportId) {
    console.error('No reportId provided to start generation');
    return;
  }

  showProgress.value = true;
  
  const sseUrl = `/api/reports/structured-thinking-sse/${props.reportId}`;

  sseClient = useChatSSE({
    url: sseUrl,
    onOpen: () => {
      console.log('SSE 连接已打开');
    },
    onMessage: (event) => {
      // console.log('收到 SSE 消息', event);

      // 根据消息类型处理
      try {
        // 检查是否是结构化消息
        if (event && typeof event === 'object' && 'stage' in event) {
          // 这是一个结构化消息，添加到structuredMessages
          step.value = event.stage;

          const existingIndex = structuredMessages.value.findIndex(msg => msg.stage === event.stage);

          if (existingIndex !== -1) {
            const content = structuredMessages.value[existingIndex].payload.content;
            if (Array.isArray(content)) {
              structuredMessages.value[existingIndex].payload.content.push(event.payload.content);
              return;
            } else {
              structuredMessages.value[existingIndex].payload.content = [content, event.payload.content];
            }
          } else {
            structuredMessages.value.push(event);
          }

          if (event.type === 'completed') {
            getReportDetail();
          }

        } else {
          // 这是一个普通消息，可以根据需要处理
          console.log('收到普通消息:', event);
        }
      } catch (e) {
        console.error('处理SSE消息失败:', e);
      }
    },
  });
};

const getReportDetail = async () => {
  const res = await fetchReportById(props.reportId);
  reportData.value = res.data;
  showInsightCard.value = true;
  emit('generationComplete', res.data);
};

const goToDetail = () => {
  emit('navigateToDetail', props.reportId);
};

// 组件挂载后自动开始生成
// onMounted(() => {
//   startGeneration();
// });

// 暴露开始生成的方法
defineExpose({
  startGeneration
});
</script>

<style lang="scss">
.report-generation-container {
  view {
    box-sizing: border-box;
  }
}

.think-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.think-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  border: 3rpx solid white;
  z-index: 10;
  transition: all 0.3s;
}

.think-dot-default {
  background: #6366f1;
  z-index: 1;
}

.think-dot-active {
  background: #6366f1 !important;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
  animation: pulse 2s infinite;
}

.think-line {
  position: absolute;
  width: 3rpx;
  background: rgba(99, 102, 241, 0.1);
}

.think-line-position {
  left: 12rpx;
  top: 4px;
  bottom: 0;
}

.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.insight-card {
  margin: 16px 0;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 12px;
  width: 100%;
}

.bg-indigo-50-opacity {
  background-color: rgba(238, 242, 255, 0.4);
}

.bg-white-opacity {
  background-color: rgba(255, 255, 255, 0.8);
}

.bg-white-40 {
  background-color: rgba(255, 255, 255, 0.4);
}

.bg-white-50 {
  background-color: rgba(255, 255, 255, 0.5);
}

.bg-white-70 {
  background-color: rgba(255, 255, 255, 0.7);
}

.border-white-80 {
  border-color: rgba(255, 255, 255, 0.8);
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

/* Font sizes */
.text-xs-tiny {
  font-size: 22rpx;  /* 增加4rpx */
}

.text-xs-small {
  font-size: 24rpx;  /* 增加4rpx */
}

.text-sm {
  font-size: 28rpx;  /* 增加4rpx */
}

.text-base {
  font-size: 32rpx;  /* 增加4rpx */
}

.text-lg {
  font-size: 36rpx;  /* 增加4rpx */
}

.text-xl {
  font-size: 40rpx;  /* 增加4rpx */
}

.text-2xl {
  font-size: 52rpx;  /* 增加4rpx */
}

.text-3xl {
  font-size: 52rpx;  /* 增加4rpx */
}

.text-4xl {
  font-size: 68rpx;  /* 增加4rpx */
}

.leading-relaxed {
  line-height: 1.625;
}

.font-bold {
  font-weight: 700;
}

.font-black {
  font-weight: 900;
}

.font-mono {
  font-family: monospace;
}

.uppercase {
  text-transform: uppercase;
}

.tracking-tighter {
  letter-spacing: -0.05em;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.tracking-widest {
  letter-spacing: 0.1em;
}

.text-gray-300 {
  color: #d1d5db;
}

.text-gray-800 {
  color: #1f2937;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.text-indigo-500 {
  color: #6366f1;
}

.text-indigo-400 {
  color: #818cf8;
}

.text-indigo-600 {
  color: #4f46e5;
}

.border-indigo-100 {
  border-color: #e0e7ff;
}

.rounded-3xl {
  border-radius: 48rpx;
}

.rounded-2xl {
  border-radius: 32rpx;
}

.rounded-xl {
  border-radius: 24rpx;
}

.mb-2 {
  margin-bottom: 16rpx;
}

.mt-1 {
  margin-top: 8rpx;
}

.mt-2 {
  margin-top: 16rpx;
}

.mb-1 {
  margin-bottom: 8rpx;
}

.ml-1 {
  margin-left: 8rpx;
}

.mr-1 {
  margin-right: 8rpx;
}

.ml-2 {
  margin-left: 16rpx;
}

.mr-2 {
  margin-right: 16rpx;
}

.ml-3 {
  margin-left: 24rpx;
}

.mr-3 {
  margin-right: 24rpx;
}

.mt-4 {
  margin-top: 32rpx;
}

.mb-4 {
  margin-bottom: 32rpx;
}

.p-4 {
  padding: 32rpx;
}

.p-5 {
  padding: 40rpx;
}

.p-6 {
  padding: 48rpx;
}

.px-4 {
  padding-left: 24rpx;
  padding-right: 24rpx;
}

.py-2 {
  padding-top: 16rpx;
  padding-bottom: 16rpx;
}

.py-4 {
  padding-top: 32rpx;
  padding-bottom: 32rpx;
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.flex-row {
  flex-direction: row;
}

.items-start {
  align-items: flex-start;
}

.items-center {
  align-items: center;
}

.items-end {
  align-items: flex-end;
}

.justify-start {
  justify-content: flex-start;
}

.justify-center {
  justify-content: center;
}

.justify-end {
  justify-content: flex-end;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 16rpx;
}

.gap-4 {
  gap: 32rpx;
}

.gap-3 {
  gap: 24rpx;
}

.transition-all {
  transition: all 0.3s ease;
}

.translate-y-2 {
  transform: translateY(-16rpx);
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.flex-1 {
  flex: 1;
}

.border {
  border: 1rpx solid;
}

.w-1 {
  width: 8rpx;
}

.h-1 {
  height: 8rpx;
}

.w-2 {
  width: 16rpx;
}

.h-2 {
  height: 16rpx;
}

.h-3 {
  height: 24rpx;
}

.w-3 {
  width: 24rpx;
}

.w-8 {
  width: 64rpx;
}

.h-8 {
  height: 64rpx;
}

.w-10 {
  width: 80rpx;
}

.h-10 {
  height: 80rpx;
}

.w-12 {
  width: 96rpx;
}

.h-12 {
  height: 96rpx;
}

.z-10 {
  z-index: 10;
}

.z-20 {
  z-index: 20;
}

.rounded-full {
  border-radius: 50%;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-left {
  text-align: left;
}

.overflow-hidden {
  overflow: hidden;
}

.overflow-visible {
  overflow: visible;
}

.shadow-sm {
  box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.05);
}

.shadow-md {
  box-shadow: 0 4rpx 6rpx -1rpx rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -1rpx rgba(0, 0, 0, 0.06);
}

.shadow-lg {
  box-shadow: 0 10rpx 15rpx -3rpx rgba(0, 0, 0, 0.1), 0 4rpx 6rpx -2rpx rgba(0, 0, 0, 0.05);
}

.block {
  display: block;
}

.inline-block {
  display: inline-block;
}

.hidden {
  display: none;
}

.text-xs {
  font-size: 20rpx;
}

.text-2xl {
  font-size: 48rpx;
}

.font-light {
  font-weight: 300;
}

.font-normal {
  font-weight: 400;
}

.font-medium {
  font-weight: 500;
}

.text-white {
  color: #ffffff;
}

.text-black {
  color: #000000;
}

.text-gray-900 {
  color: #111827;
}

.text-gray-200 {
  color: #e5e7eb;
}

.text-gray-100 {
  color: #f3f4f6;
}

.bg-white {
  background-color: #ffffff;
}

.bg-black {
  background-color: #000000;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-transparent {
  background-color: transparent;
}

.bg-indigo-100 {
  background-color: #e0e7ff;
}

.border-gray-200 {
  border-color: #e5e7eb;
}

.border-gray-300 {
  border-color: #d1d5db;
}

.rounded {
  border-radius: 8rpx;
}

.rounded-md {
  border-radius: 12rpx;
}

.rounded-lg {
  border-radius: 16rpx;
}

.rounded-sm {
  border-radius: 6rpx;
}

</style>
