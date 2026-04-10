<template>
  <view class="root">
    <slot name="top"></slot>
    <view class="input-wrapper">

      <!-- Input Field -->
      <textarea
        :placeholder="placeholder || '输入好友邀请码'"
        class="input-field"
        :value="bindingValue"
        @input="onInput"
        @confirm="onConfirm"
        :auto-height="true"
        :show-confirm-bar="false"
        :cursor-spacing="20"
        maxlength="1000"
        :disabled="isAISending || isQuotaExhausted"
        placeholder-style="color: #94a3b8; font-size: 28rpx; font-weight: 400" 
      ></textarea>

      <!-- Right Send Button -->
      <view 
        @click="onButtonClick"
        class="icon-btn send-btn"
        :class="{ 'sending': isAISending }"
      >
        <view class="send-content" v-if="!isAISending">
          <image :src="upSvg" class="send-icon-img" />
        </view>
        <view class="waveform" v-else>
          <view class="bar bar-1"></view>
          <view class="bar bar-2"></view>
          <view class="bar bar-3"></view>
          <view class="bar bar-4"></view>
        </view>
      </view>
    </view>
    
    <text class="risk-warning">内容由 AI 生成，仅供参考</text>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import baguaSvg from '@/static/icon/bagua.svg?url';
import deepActiveSvg from '@/static/icon/deep-active.svg?url';
import deepInactiveSvg from '@/static/icon/deep-inactive.svg?url';
const upSvg = '/static/icon/up.svg';

interface Props {
  modelValue?: string;
  placeholder?: string;
  isAISending?: boolean;
  isQuotaExhausted?: boolean;
}

interface Emits {
  (e: 'confirm', value: string): void;
  (e: 'click', value: string): void;
}


const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  isAISending: false,
  isQuotaExhausted: false
});

const emit = defineEmits<Emits>();

const innerValue = ref('');
// 绑定值，用于控制输入框的显示内容。初始为空，输入时不更新，仅在需要清空时通过变更为 ' ' 再变回 '' 来强制刷新
const bindingValue = ref('');

// 输入处理
const onInput = (e: any) => {
  if (props.isAISending) return;
  const value = e.detail.value;
  // 仅更新内部值，不触发布局更新（避免闪烁）
  innerValue.value = value;
};

// 点击按钮触发
const onButtonClick = () => {
  if (props.isAISending) return;
  emit('click', innerValue.value);
  onClear();
};

// 回车确认触发
const onConfirm = (e: any) => {
  const value = e.detail.value;
  emit('confirm', value);
  onClear();
};

const onClear = () => {
  // 强制清空逻辑：先设为空格触发更新，再设为空
  bindingValue.value = ' ';
  nextTick(() => {
    bindingValue.value = '';
    innerValue.value = '';
  });
}
</script>

<style lang="scss" scoped>
.root {
  padding: 0 32rpx 68rpx 32rpx;
  width: 100%;
  box-sizing: border-box;
}

.input-wrapper {
  min-height: 112rpx; /* h-14 = 56px = 112rpx */
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 0.5px solid rgba(202, 195, 216, 0.2);
  border-radius: 999rpx; /* Pill shape */
  display: flex;
  align-items: center; /* Center horizontally instead of flex-end */
  padding: 12rpx 12rpx 12rpx 32rpx; /* More left padding */
  gap: 24rpx;
  box-shadow: 0 20px 40px rgba(124, 77, 255, 0.06);
}

.input-field {
  flex: 1;
  background: transparent;
  font-size: 32rpx; /* body-lg */
  font-weight: 500;
  color: #191c20;
  min-height: 48rpx;
  max-height: 192rpx;
  border: none;
  outline: none;
  padding: 0;
  line-height: 1.5;
  width: 100%;
}

.icon-btn {
  width: 88rpx; /* h-14 w-14 equivalent for icon btn? wait, the wrapper is 112rpx, button is smaller */
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  margin: 0;
}

.send-btn {
  background-color: #7c4dff; /* primary_container */
  color: white;
  transition: transform 0.1s;
  box-shadow: 0 4px 12px rgba(124, 77, 255, 0.2);
  
  &:active {
    transform: scale(0.95);
  }

  &.sending {
    cursor: not-allowed;
    background-color: #7c4dff;
    border-radius: 50%;
  }
}

.send-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-icon-img {
  width: 48rpx;
  height: 48rpx;
  filter: brightness(0) invert(1);
}

.waveform {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  height: 40rpx;
}

.bar {
  width: 6rpx;
  background-color: white;
  border-radius: 4rpx;
  animation: wave 1s ease-in-out infinite;
}

.bar-1 { height: 20rpx; animation-delay: 0.0s; }
.bar-2 { height: 32rpx; animation-delay: 0.1s; }
.bar-3 { height: 24rpx; animation-delay: 0.2s; }
.bar-4 { height: 28rpx; animation-delay: 0.3s; }

@keyframes wave {
  0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
  50% { transform: scaleY(1); opacity: 1; }
}

.input-field::placeholder {
  color: rgba(51, 65, 85, 0.3); /* placeholder:opacity-30 of slate-700 approx */
  font-weight: 500;
}

.send-icon {
  width: 28rpx;
  height: 28rpx;
}

.risk-warning {
  text-align: center;
  font-size: 24rpx;
  color: #94a3b8;
  margin-top: 16rpx;
  width: 100%;
  display: block;
}
</style>
