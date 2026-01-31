<template>
  <view>
    <view 
      class="header-container" 
      :class="{ 'is-fixed': fixed }"
      :style="{ 
        paddingTop: statusBarHeight + 'px', 
        backgroundColor: backgroundColor 
      }"
    >
      <view class="header-content" :style="{ height: navBarHeight + 'px' }">
        <!-- Left Area -->
        <view class="header-left">
          <view v-if="showBack" class="header-btn" @click="goBack">
            <u-icon name="arrow-left" color="#94a3b8" size="40"></u-icon>
          </view>
          <slot name="left" v-else></slot>
        </view>

        <!-- Center Area -->
        <view class="header-center" :style="{ opacity: title ? 1 : 0 }">
          <text class="app-title">{{ title }}</text>
          <slot name="center"></slot>
        </view>

        <!-- Right Area -->
        <view class="header-right" :style="{ marginRight: capsuleWidth + 'px' }">
          <slot name="right"></slot>
        </view>
      </view>
    </view>
    <!-- Placeholder -->
    <view v-if="fixed && placeholder" :style="{ height: totalHeight + 'px' }"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: true
  },
  fixed: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: Boolean,
    default: false
  },
  backgroundColor: {
    type: String,
    default: 'transparent'
  }
});

const emit = defineEmits(['back']);

const statusBarHeight = ref(20);
const navBarHeight = ref(44);
const capsuleWidth = ref(0);
const totalHeight = computed(() => statusBarHeight.value + navBarHeight.value);

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 20;

  // #ifdef MP-WEIXIN
  const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
  const gap = menuButtonInfo.top - statusBarHeight.value;
  // Calculate nav bar height to fit capsule comfortably
  // Height = capsule height + (gap * 2)
  navBarHeight.value = menuButtonInfo.height + (gap * 2);
  // Reserve space on the right for the capsule
  capsuleWidth.value = menuButtonInfo.width + 12; // 12px extra margin
  // #endif

  // #ifndef MP-WEIXIN
  navBarHeight.value = 44;
  capsuleWidth.value = 0;
  // #endif
});

const goBack = () => {
  // Allow parent to handle back if needed, otherwise default navigateBack
  emit('back');
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.header-container {
  width: 100%;
  z-index: 50;
  position: relative;
  box-sizing: content-box;

  &.is-fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  position: relative;
}

.header-left {
  display: flex;
  align-items: center;
  z-index: 2;
}

.header-right {
  display: flex;
  align-items: center;
  z-index: 2;
}

.header-center {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  pointer-events: none; // Let clicks pass through to left/right buttons
}

.header-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  color: #94a3b8;
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.95);
  }
}

.app-title {
  font-size: 32rpx;
  font-weight: 900;
  color: #1e293b;
  letter-spacing: -0.025em;
}
</style>
