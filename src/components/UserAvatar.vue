<template>
  <view 
    class="avatar-ring" 
    :class="[`size-${size}`, { 'has-shadow': shadow }]"
  >
    <text class="avatar-text">{{ name?.[0] || 'Q' }}</text>
  </view>
</template>

<script setup lang="ts">
interface Props {
  name: string;
  size?: 'small' | 'medium' | 'large';
  shadow?: boolean;
}

withDefaults(defineProps<Props>(), {
  size: 'medium',
  shadow: true
});
</script>

<style lang="scss" scoped>
/* Colors */
$indigo-50: #eef2ff;
$indigo-500: #6366f1;

.avatar-ring {
  border-radius: 50%;
  background-color: $indigo-50;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.has-shadow {
    /* ring-8 ring-indigo-50/50 */
    box-shadow: 0 0 0 16rpx rgba(238, 242, 255, 0.5);
  }

  /* Sizes */
  &.size-small {
    width: 80rpx;
    height: 80rpx;
    
    .avatar-text {
      font-size: 32rpx;
    }
  }

  &.size-medium {
    width: 96rpx;
    height: 96rpx;
    
    .avatar-text {
      font-size: 40rpx;
    }
  }

  &.size-large {
    width: 112rpx;
    height: 112rpx;
    
    .avatar-text {
      font-size: 48rpx;
    }
  }
  
  .avatar-text {
    font-weight: 900; /* font-black */
    font-style: italic;
    color: $indigo-500;
  }
}
</style>
