<template>
  <CommonPopup
    v-model="show"
    height="auto"
    :borderRadius="32"
    @close="handleClose"
  >
    <view class="p-6 flex flex-col items-center">
      <view class="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4 mt-2">
        <u-icon name="lock-closed" color="#8B5CF6" size="32"></u-icon>
      </view>
      
      <text class="text-xl font-black text-gray-800 mb-2">解锁专属深度报告</text>
      <text class="text-sm text-gray-500 mb-6 text-center">你的答卷已分析完毕，支付后即可查看超万字的性格深度解析与职业指南。</text>
      
      <view class="w-full bg-purple-50 rounded-2xl p-4 mb-6 flex flex-col items-center">
        <view class="flex items-baseline gap-1 text-purple-600 mb-1">
          <text class="text-lg font-bold">¥</text>
          <text class="text-4xl font-black">{{ (discountPrice / 100).toFixed(2) }}</text>
        </view>
        <text class="text-xs text-gray-400 line-through">原价 ¥{{ (originalPrice / 100).toFixed(2) }}</text>
      </view>
      
      <view 
        class="w-full h-12 rounded-full bg-purple-gradient flex items-center justify-center text-white font-bold text-base active-scale-95 transition-transform mb-4"
        @click="handlePayment"
      >
        立即支付解锁
      </view>
    </view>
  </CommonPopup>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CommonPopup from '@/components/CommonPopup.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  discountPrice: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['update:modelValue', 'close', 'pay']);

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const handleClose = () => {
  emit('close');
};

const handlePayment = () => {
  emit('pay');
};
</script>

<style lang="scss" scoped>
.bg-purple-100 { background-color: #EDE9FE; }
.bg-purple-50 { background-color: #F5F3FF; }
.text-purple-600 { color: #7C3AED; }
.bg-purple-gradient { background: linear-gradient(to right, #C084FC, #8B5CF6); }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.items-baseline { align-items: baseline; }
.gap-1 { gap: 8rpx; }

.w-full { width: 100%; }
.w-16 { width: 128rpx; }
.h-16 { height: 128rpx; }
.h-12 { height: 96rpx; }

.rounded-full { border-radius: 9999px; }
.rounded-2xl { border-radius: 32rpx; }

.p-4 { padding: 32rpx; }
.p-6 { padding: 48rpx; }
.mb-1 { margin-bottom: 8rpx; }
.mb-2 { margin-bottom: 16rpx; }
.mb-4 { margin-bottom: 32rpx; }
.mb-6 { margin-bottom: 48rpx; }
.mt-2 { margin-top: 16rpx; }

.text-center { text-align: center; }
.font-bold { font-weight: bold; }
.font-black { font-weight: 900; }
.text-xs { font-size: 24rpx; }
.text-sm { font-size: 28rpx; }
.text-base { font-size: 32rpx; }
.text-lg { font-size: 36rpx; }
.text-xl { font-size: 40rpx; }
.text-4xl { font-size: 72rpx; }

.text-white { color: #FFFFFF; }
.text-gray-400 { color: #9CA3AF; }
.text-gray-500 { color: #6B7280; }
.text-gray-800 { color: #1F2937; }

.line-through { text-decoration: line-through; }
.active-scale-95:active { transform: scale(0.95); }
.transition-transform { transition: transform 0.3s ease; }
</style>
