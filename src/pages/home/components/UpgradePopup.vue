<template>
  <u-popup
    v-model="show"
    mode="bottom"
    border-radius="32"
    :safe-area-inset-bottom="false"
    :mask-close-able="true"
    @close="handleClose"
  >
    <view class="popup-container">
      <!-- Header with Close Button -->
      <view class="popup-header">
        <view class="close-btn-circle" @click="closePopup">
          <text class="icon-close">×</text>
        </view>
      </view>

      <scroll-view scroll-y class="popup-content" :show-scrollbar="false">
        <!-- Avatar & Title -->
        <view class="header-section">
          <view class="avatar-ring">
            <image 
              v-if="userInfo?.avatar" 
              :src="userInfo.avatar" 
              class="user-avatar" 
              mode="aspectFill"
            />
             <view v-else class="default-avatar">
              <text class="avatar-text">{{ userInfo?.name?.[0] || '玥' }}</text>
            </view>
          </view>
          <text class="main-title">人生趋势高级会员</text>
          <text class="sub-title">订阅后解锁全部功能，随时取消</text>
        </view>

        <!-- Testimonial Card -->
        <view class="testimonial-card">
          <swiper 
            class="testimonial-swiper" 
            circular 
            autoplay 
            :interval="5000"
            :duration="500"
            @change="onSwiperChange"
          >
            <swiper-item v-for="(item, index) in testimonials" :key="index">
              <view class="testimonial-content-wrapper">
                <text class="testimonial-title">{{ item.title }}</text>
                <view class="stars-row">
                  <u-icon v-for="i in 5" :key="i" name="star-fill" color="#fbbf24" size="24"></u-icon>
                </view>
                <text class="testimonial-content">{{ item.content }}</text>
              </view>
            </swiper-item>
          </swiper>
          
          <view class="dots-indicator">
            <view 
              v-for="(item, index) in testimonials" 
              :key="index"
              class="dot" 
              :class="{ active: currentSwiperIndex === index }"
            ></view>
          </view>
        </view>

        <!-- Pricing Cards -->
        <view class="pricing-container">
          <!-- Monthly Plan -->
          <view 
            class="plan-card" 
            :class="{ active: selectedPlan === 'month' }"
            @click="selectPlan('month')"
          >
            <view class="tag-badge">
              <text class="tag-text">最受欢迎</text>
            </view>
            <text class="plan-duration"><text class="big-num">30</text>天</text>
            <text class="plan-price">¥29.80</text>
            <text class="plan-desc">每月自动续订</text>
            <text class="plan-gift">赠送 4,000 算力</text>
          </view>

          <!-- Yearly Plan -->
          <view 
            class="plan-card" 
            :class="{ active: selectedPlan === 'year' }"
            @click="selectPlan('year')"
          >
            <view class="tag-badge purple">
              <text class="tag-text">省 25% 再送 20%</text>
            </view>
            <text class="plan-duration"><text class="big-num">12</text>个月</text>
            <text class="plan-price">¥268.00</text>
            <text class="plan-desc">每年自动续订</text>
            <text class="plan-gift">赠送 60,000 算力</text>
          </view>
        </view>

        <!-- Subscribe Button -->
        <button class="subscribe-btn" @click="handleSubscribe">
          订阅{{ selectedPlan === 'year' ? '年度' : '月度' }}会员
        </button>

        <!-- Footer Links -->
        <view class="footer-links">
          <text class="footer-tip">订阅即代表您已阅读并同意以下协议与政策</text>
          <view class="links-row">
            <text class="link-item">恢复购买</text>
            <text class="link-item">用户协议</text>
            <text class="link-item">会员协议</text>
            <text class="link-item">隐私政策</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { userStore } from '@/store/user';
import { handleWechatPayment } from '@/utils/payment';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const userInfo = computed(() => userStore.userInfo);
const selectedPlan = ref<'month' | 'year'>('year');

const currentSwiperIndex = ref(0);
const testimonials = [
  {
    title: '真的很好特别好',
    content: '用过就知道啦呜呜嗯！！一定要越来越好哦呜呜嗯！之前的算法和布局也超棒的，那个深度思考捏！～好好加油呀！'
  },
  {
    title: '分析得太准了',
    content: '人生趋势的分析让我对未来更有信心了，尤其是那个流年运势，简直是为我量身定做的，强烈推荐给大家！'
  },
  {
    title: '非常实用的工具',
    content: '界面简洁美观，功能强大，不仅能看运势还能进行深度对话，解决了我很多困惑，会员非常值得！'
  }
];

const onSwiperChange = (e: any) => {
  currentSwiperIndex.value = e.detail.current;
};

const handleClose = () => {
  emit('update:modelValue', false);
};

const closePopup = () => {
  show.value = false;
};

const selectPlan = (plan: 'month' | 'year') => {
  selectedPlan.value = plan;
};

const handleSubscribe = async () => {
  const isYearly = selectedPlan.value === 'year';
  const amount = isYearly ? 26800 : 2980; // Unit: cents
  const description = isYearly ? '年度会员订阅' : '月度会员订阅';

  uni.showLoading({ title: '正在发起支付...' });

  try {
    await handleWechatPayment({
      amount_total: amount,
      description: description
    });
    
    uni.showToast({
      title: '支付成功',
      icon: 'success'
    });
    
    // Close popup on success
    handleClose();
    
    // TODO: Refresh user info or upgrade status here if needed
    
  } catch (error: any) {
    uni.showToast({
      title: error.message || '支付失败',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};
</script>

<style lang="scss" scoped>
.popup-container {
  background: linear-gradient(180deg, #dbeafe 0%, #ede9fe 100%);
  height: 85vh;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: env(safe-area-inset-bottom); /* Handle safe area manually */
}

.popup-header {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  z-index: 10;
}

/* Close Button Style */
.close-btn-circle {
  width: 60rpx;
  height: 60rpx;
  border-radius: 9999px;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.icon-close {
  font-size: 36rpx;
  margin-top: -4rpx;
  font-weight: 300;
}

.popup-content {
  flex: 1;
  padding: 0 48rpx;
  box-sizing: border-box;
}

/* Hide Scrollbar */
.popup-content ::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* Header Section */
.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80rpx;
  margin-bottom: 48rpx;
}

.avatar-ring {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  padding: 6rpx;
  background: rgba(255, 255, 255, 0.5);
  margin-bottom: 32rpx;
}

.user-avatar, .default-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 64rpx;
  font-weight: 600;
  color: #4f46e5;
}

.main-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #1e1b4b;
  margin-bottom: 16rpx;
}

.sub-title {
  font-size: 26rpx;
  color: #475569;
}

/* Testimonial Card */
.testimonial-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 48rpx;
  text-align: center;
}

.testimonial-swiper {
  height: 240rpx; /* Fixed height for swiper */
}

.testimonial-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.testimonial-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1e293b;
  display: block;
  margin-bottom: 12rpx;
}

.stars-row {
  display: flex;
  justify-content: center;
  gap: 4rpx;
  margin-bottom: 16rpx;
}

.testimonial-content {
  font-size: 24rpx;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 24rpx;
  display: block;
  text-align: left;
}

.dots-indicator {
  display: flex;
  justify-content: center;
  gap: 12rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #cbd5e1;
  
  &.active {
    background: #64748b;
  }
}

/* Pricing Cards */
.pricing-container {
  display: flex;
  gap: 24rpx;
  margin-bottom: 48rpx;
}

.plan-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 32rpx;
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  border: 4rpx solid transparent;
  transition: all 0.3s;
  
  &.active {
    background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
    border-color: #818cf8;
  }
}

.tag-badge {
  background: #e0e7ff;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  
  &.purple {
    background: #c7d2fe;
  }
}

.tag-text {
  font-size: 20rpx;
  color: #4f46e5;
  font-weight: 600;
}

.plan-duration {
  font-size: 24rpx;
  color: #1e293b;
  margin-bottom: 8rpx;
}

.big-num {
  font-size: 48rpx;
  font-weight: 700;
  margin-right: 4rpx;
}

.plan-price {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12rpx;
}

.plan-desc {
  font-size: 20rpx;
  color: #475569;
  margin-bottom: 8rpx;
}

.plan-gift {
  font-size: 20rpx;
  color: #475569;
}

/* Subscribe Button */
.subscribe-btn {
  background: #ffffff;
  color: #0f172a;
  font-size: 32rpx;
  font-weight: 600;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  margin-bottom: 48rpx;
  box-shadow: 0 10rpx 25rpx rgba(0, 0, 0, 0.05);
}

/* Footer Links */
.footer-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding-bottom: 48rpx;
}

.footer-tip {
  font-size: 20rpx;
  color: #64748b;
}

.links-row {
  display: flex;
  gap: 32rpx;
}

.link-item {
    font-size: 22rpx;
    color: #475569;
    font-weight: 500;
  }
</style>