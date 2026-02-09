<template>
  <u-popup
    v-model="show"
    mode="bottom"
    :border-radius="borderRadius"
    :safe-area-inset-bottom="false"
    :mask-close-able="maskCloseAble"
    @close="handleClose"
  >
    <view class="popup-container" :style="{ height: height, background: background }">
      <!-- Header Area (Absolute) -->
      <view class="popup-header-bar">
        <!-- Left Slot (Optional) -->
        <view class="header-left">
          <slot name="header-left">
             <text v-if="title" class="default-title">{{ title }}</text>
          </slot>
        </view>
        
        <!-- Close Button (Right) -->
        <view class="close-btn-circle" @click="closePopup">
          <u-icon name="close" color="#ffffff" size="24" style="font-weight: 700;"></u-icon>
        </view>
      </view>

      <scroll-view scroll-y class="popup-content" :show-scrollbar="false">
        <slot></slot>
      </scroll-view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '85vh'
  },
  borderRadius: {
    type: [Number, String],
    default: 32
  },
  background: {
    type: String,
    default: '#f8fafc'
  },
  maskCloseAble: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'close']);

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const handleClose = () => {
  emit('close');
  emit('update:modelValue', false);
};

const closePopup = () => {
  show.value = false;
};
</script>

<style lang="scss" scoped>
.popup-container {
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
  padding: 24rpx;
  box-sizing: border-box;
}

.popup-header-bar {
  padding: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header-left {
  /* pointer-events: auto; removed as header is no longer pointer-events: none */
}

.header-left {
  pointer-events: auto;
}

.default-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}

.close-btn-circle {
  pointer-events: auto;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}

.popup-content {
  flex: 1;
  box-sizing: border-box;
  overflow: hidden; /* Ensure scroll-view handles overflow */
}
</style>
