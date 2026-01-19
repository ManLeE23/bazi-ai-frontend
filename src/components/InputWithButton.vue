<template>
  <view class="input-with-button-container">
    <view class="input-container bg-white-opacity border-t border-white-opacity">
      <view class="input-wrapper">
        <input 
          type="text" 
          placeholder="针对结果深入追问..." 
          class="input-field"
          :value="modelValue"
          @input="onInput"
          @confirm="onConfirm"
        />
        <button 
          @click="onButtonClick"
          class="submit-button"
        >
          ↑
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string;
  placeholder?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'confirm', value: string): void;
  (e: 'click'): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '针对结果深入追问...',
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

<style scoped>
.input-with-button-container {
  padding: 24rpx;
}

.input-container {
  border-top: 1rpx solid rgba(255, 255, 255, 0.8);
}

.input-wrapper {
  height: 96rpx;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(14px);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  gap: 24rpx;
}

.input-field {
  flex: 1;
  background: transparent;
  font-size: 28rpx;
  font-weight: bold;
  outline: none;
  border: none;
}

.submit-button {
  width: 64rpx;
  height: 64rpx;
  background: #4f46e5;
  color: white;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-size: 28rpx;
}
</style>