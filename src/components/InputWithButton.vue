<template>
  <view class="root">
    <!-- Quick Actions -->
    <view class="quick-actions">
      <view class="action-chip" @click="emit('showBazi')">
        <image :src="baguaSvg" class="chip-icon-img" mode="aspectFit" />
        <text class="chip-text">看生辰</text>
      </view>
    </view>

    <view class="input-wrapper">

      <!-- Input Field -->
      <textarea
        placeholder="向美灵追问细节..."
        class="input-field"
        :value="modelValue"
        @input="onInput"
        @confirm="onConfirm"
        :auto-height="true"
        :show-confirm-bar="false"
        :cursor-spacing="20"
        maxlength="1000"
      ></textarea>

      <!-- Right Send Button -->
      <view 
        @click="onButtonClick"
        class="icon-btn send-btn"
      >
        <image :src="rightSvg" class="send-icon" mode="aspectFit" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import rightSvg from '@/static/icon/right.svg?url';
import baguaSvg from '@/static/icon/bagua.svg?url'; // Assuming this works similar to right.svg

interface Props {
  modelValue?: string;
  placeholder?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'confirm', value: string): void;
  (e: 'click'): void;
  (e: 'generateReport'): void;
  (e: 'showBazi'): void;
}


const props = withDefaults(defineProps<Props>(), {
  placeholder: '向美灵追问细节...',
  modelValue: ''
});

const emit = defineEmits<Emits>();

// 输入处理
const onInput = (e: any) => {
  const value = e.detail.value;
  emit('update:modelValue', value);
};

// 点击按钮触发
const onButtonClick = () => {
  emit('click');
};

// 回车确认触发
const onConfirm = (e: any) => {
  const value = e.detail.value;
  emit('confirm', value);
};
</script>

<style lang="scss" scoped>
.root {
  padding: 32rpx 32rpx 80rpx 32rpx;
  position: fixed;
  bottom: 0;
  width: 100%;
  box-sizing: border-box;
  background: linear-gradient(to top, #fbfbff 0%, #fbfbff 60%, transparent 100%);
  z-index: 100;
}

.quick-actions {
  padding: 0 0 16rpx 0;
  display: flex;
  gap: 16rpx;
  
  .action-chip {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px);
    border: 1rpx solid rgba(255, 255, 255, 0.6);
    border-radius: 32rpx;
    padding: 8rpx 20rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
    transition: transform 0.1s;
    
    &:active {
        transform: scale(0.95);
        background: rgba(255, 255, 255, 0.9);
    }

    .chip-icon-img {
        width: 32rpx;
        height: 32rpx;
    }

    .chip-text {
        font-size: 26rpx;
        color: #475569;
        font-weight: 500;
    }
  }
}

.input-wrapper {
  min-height: 112rpx; /* h-14 = 56px = 112rpx */
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 56rpx; /* rounded-[28px] */
  display: flex;
  align-items: flex-end; /* Align bottom for multi-line */
  padding: 16rpx 16rpx; /* Add vertical padding */
  gap: 24rpx;
  box-shadow: 0 20rpx 40rpx -10rpx rgba(79, 70, 229, 0.15); /* shadow-xl shadow-indigo-50/50 */
}

.icon-btn {
  width: 80rpx; /* w-10 = 40px = 80rpx */
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.left-btn {
  /* text-slate-300 handled by stroke color in svg */
}

.send-btn {
  background-color: #0f172a; /* bg-slate-900 */
  color: white;
  transition: transform 0.1s;
  
  &:active {
    transform: scale(0.9);
  }
}

.input-field {
  flex: 1;
  background: transparent;
  font-size: 28rpx; /* text-[14px] */
  font-weight: 700; /* font-bold */
  color: #334155; /* text-slate-700 */
  min-height: 48rpx;
  max-height: 192rpx; /* Max height before scrolling */
  border: none;
  outline: none;
  padding: 16rpx 24rpx;
  line-height: 48rpx;
  width: 100%;
}

.input-field::placeholder {
  color: rgba(51, 65, 85, 0.3); /* placeholder:opacity-30 of slate-700 approx */
  font-weight: 500;
}

.send-icon {
  width: 32rpx;
  height: 32rpx;
}
</style>