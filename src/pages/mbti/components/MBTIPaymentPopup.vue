<template>
  <u-popup
    v-model="show"
    mode="bottom"
    :border-radius="48"
    :safe-area-inset-bottom="true"
    :mask-close-able="true"
    @close="handleClose"
  >
    <view class="payment-popup-container relative">
      <!-- Background Aura -->
      <view class="absolute top-0 left-0 right-0 h-40 bg-primary rounded-full blur-3xl opacity-10 transform -translate-y-1/2"></view>
      
      <!-- Close Button -->
      <view class="close-btn" @click="handleClose">
        <u-icon name="close" color="#494455" size="28"></u-icon>
      </view>

      <!-- Header Section -->
      <view class="header-section">
        <view class="pill-badge">
          <text>分析完成</text>
        </view>
        <text class="title">您的深度性格报告已就绪</text>
        <text class="subtitle">解锁全部 9 个维度的深度专业解读</text>
      </view>

      <!-- Content Section -->
      <view class="content-section">
        <text class="section-title">报告包含以下内容</text>
        
        <!-- Feature Cards -->
        <view class="feature-card">
          <view class="feature-icon bg-primary-container">
            <u-icon name="photo" color="#7c4dff" size="40"></u-icon>
          </view>
          <view class="feature-text">
            <text class="feature-title">情境图谱</text>
            <text class="feature-desc">探索不同情境下的真实自我</text>
          </view>
        </view>
        
        <view class="feature-card">
          <view class="feature-icon bg-blue-container">
            <u-icon name="bookmark" color="#3b82f6" size="40"></u-icon>
          </view>
          <view class="feature-text">
            <text class="feature-title">职业发展</text>
            <text class="feature-desc">核心职业领域潜力挖掘</text>
          </view>
        </view>

        <view class="feature-card">
          <view class="feature-icon bg-rose-container">
            <u-icon name="heart" color="#f43f5e" size="40"></u-icon>
          </view>
          <view class="feature-text">
            <text class="feature-title">恋爱分析</text>
            <text class="feature-desc">亲密关系与情感模式解读</text>
          </view>
        </view>

        <view class="price-section">
          <text class="section-title">解锁价格</text>
          <view class="price-row">
            <view class="price-current">
              <text class="currency">¥</text>
              <text class="amount">{{ (discountPrice / 100).toFixed(1) }}</text>
            </view>
            <text class="price-original">¥{{ (originalPrice / 100).toFixed(1) }}</text>
            <view class="discount-badge" v-if="discountText">
              <text>限时 {{ discountText }} 折优惠</text>
            </view>
          </view>
        </view>

        <view class="pay-button" @click="handlePayment">
          <u-icon name="lock-fill" color="#ffffff" size="32" class="mr-1"></u-icon>
          <text>立即解锁报告</text>
        </view>

        <view class="secure-text">
          <u-icon name="lock-fill" color="#D1D5DB" size="20" class="mr-1"></u-icon>
          <text>安全支付环境已加密保护</text>
        </view>
      </view>
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

const discountText = computed(() => {
  if (props.originalPrice <= 0) return '';
  // 10 / 9900 * 10 = 0.01 折
  const ratio = (props.discountPrice / props.originalPrice) * 10;
  let text = ratio.toFixed(1);
  if (text.endsWith('.0')) {
    text = text.slice(0, -2);
  }
  // Remove extreme cases like 0.0 if not intended, but mathematically correct.
  // Using parseFloat to strip trailing zeros.
  return parseFloat(ratio.toFixed(2)).toString();
});

const handleClose = () => {
  emit('close');
  emit('update:modelValue', false);
};

const handlePayment = () => {
  emit('pay');
};
</script>

<style lang="scss" scoped>
.payment-popup-container {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  overflow: hidden;
  border-top-left-radius: 48rpx;
  border-top-right-radius: 48rpx;
}

.header-section {
  padding: 80rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 10;
}

.close-btn {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background-color: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.pill-badge {
  background-color: rgba(124, 77, 255, 0.1);
  border-radius: 999rpx;
  padding: 8rpx 24rpx;
  margin-bottom: 24rpx;
  text {
    color: #7c4dff;
    font-size: 24rpx;
    font-weight: 900;
    letter-spacing: 0.05em;
  }
}

.title {
  color: #191c20;
  font-size: 44rpx;
  font-weight: 900;
  margin-bottom: 12rpx;
  text-align: center;
}

.subtitle {
  color: #494455;
  font-size: 28rpx;
  font-weight: 500;
}

.content-section {
  background-color: #ffffff;
  padding: 0 40rpx 48rpx;
  position: relative;
  z-index: 10;
}

.section-title {
  color: #9CA3AF;
  font-size: 26rpx;
  font-weight: 700;
  margin-bottom: 24rpx;
  display: block;
}

.feature-card {
  background-color: #F8F9FF;
  border-radius: 32rpx;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.feature-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}
.bg-primary-container { background-color: rgba(124, 77, 255, 0.1); }
.bg-blue-container { background-color: rgba(59, 130, 246, 0.1); }
.bg-rose-container { background-color: rgba(244, 63, 94, 0.1); }

.feature-text {
  display: flex;
  flex-direction: column;
}

.feature-title {
  color: #191c20;
  font-size: 32rpx;
  font-weight: 800;
  margin-bottom: 8rpx;
}

.feature-desc {
  color: #494455;
  font-size: 24rpx;
}

.price-section {
  margin-top: 48rpx;
  margin-bottom: 40rpx;
}

.price-row {
  display: flex;
  align-items: flex-end;
}

.price-current {
  color: #7c4dff;
  display: flex;
  align-items: baseline;
  margin-right: 16rpx;
  .currency {
    font-size: 36rpx;
    font-weight: 800;
    margin-right: 4rpx;
  }
  .amount {
    font-size: 72rpx;
    font-weight: 900;
    line-height: 1;
  }
}

.price-original {
  color: #D1D5DB;
  font-size: 28rpx;
  text-decoration: line-through;
  margin-bottom: 12rpx;
  margin-right: auto;
}

.discount-badge {
  background-color: #FEF3C7;
  border-radius: 8rpx;
  padding: 8rpx 16rpx;
  margin-bottom: 16rpx;
  text {
    color: #D97706;
    font-size: 24rpx;
    font-weight: 800;
  }
}

.pay-button {
  background-color: #7c4dff;
  border-radius: 999rpx;
  height: 112rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20rpx 40rpx -10rpx rgba(124, 77, 255, 0.4);
  margin-bottom: 32rpx;
  transition: transform 0.2s;
  &:active {
    transform: scale(0.96);
  }
  text {
    color: #ffffff;
    font-size: 36rpx;
    font-weight: 900;
    margin-left: 8rpx;
  }
}

.secure-text {
  display: flex;
  align-items: center;
  justify-content: center;
  text {
    color: #D1D5DB;
    font-size: 24rpx;
    margin-left: 8rpx;
  }
}

.mr-1 { margin-right: 8rpx; }

/* Utilities */
.relative { position: relative; }
.absolute { position: absolute; }
.top-0 { top: 0; }
.left-0 { left: 0; }
.right-0 { right: 0; }
.h-40 { height: 160rpx; }
.bg-primary { background-color: #7c4dff; }
.rounded-full { border-radius: 9999px; }
.blur-3xl { filter: blur(64rpx); }
.opacity-10 { opacity: 0.1; }
.transform { transform: translateY(-50%); }
</style>
