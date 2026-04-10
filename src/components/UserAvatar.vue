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
$primary-container: #7c4dff;
$on-primary: #ffffff;
$primary-10: rgba(124, 77, 255, 0.1);

.avatar-ring {
  border-radius: 50%;
  background-color: $primary-10;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%);
    border-radius: 50%;
    pointer-events: none;
  }
  
  &.has-shadow {
    /* Diffused tinted shadow per spec */
    box-shadow: 0 20px 40px rgba(124, 77, 255, 0.15);
  }

  /* Sizes */
  &.size-small {
    width: 80rpx;
    height: 80rpx;
    
    .avatar-text {
      font-size: 36rpx; /* display-like scaling */
    }
  }

  &.size-medium {
    width: 96rpx;
    height: 96rpx;
    
    .avatar-text {
      font-size: 44rpx;
    }
  }

  &.size-large {
    width: 112rpx;
    height: 112rpx;
    
    .avatar-text {
      font-size: 52rpx;
    }
  }
  
  .avatar-text {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800; /* ExtraBold */
    font-style: normal;
    color: $primary-container;
    position: relative;
    z-index: 1;
    letter-spacing: -0.02em; /* locked-in feel */
  }
}
</style>
