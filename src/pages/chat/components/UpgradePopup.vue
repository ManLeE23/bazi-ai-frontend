<template>
  <view>
    <CommonPopup
      v-model="show"
      background="#f8f9ff"
      @close="handleClose"
    >
      <!-- Header Section -->
      <view class="header-section">
        <text class="main-title">人生趋势会员</text>
        <text class="sub-title">开启您的数字策展之旅</text>
      </view>

      <!-- Pricing Cards -->
      <view class="pricing-container">
        <view 
          v-for="plan in plans"
          :key="plan.id"
          class="plan-card" 
          :class="{ 'active': selectedPlanId === plan.id }"
          @click="selectPlan(plan.id)"
        >
          <view class="plan-card-header">
            <text class="plan-duration">{{ plan.duration_days > 360 ? Math.floor(plan.duration_days / 30) + '个月' : plan.duration_days + '天' }}</text>
            <view class="tag-badge" v-if="plan.id === 'vip_yearly' || plan.id === 'vip_monthly'">
              <text class="tag-text">{{ plan.id === 'vip_yearly' ? '省 30%' : '热门' }}</text>
            </view>
          </view>
          
          <view class="plan-price-row">
            <text class="price-symbol">¥</text>
            <text class="plan-price">{{ (plan.price_cents / 100).toFixed(2) }}</text>
          </view>
        </view>
      </view>

      <!-- Plan Benefits List -->
      <view class="benefits-section" v-if="selectedPlan">
         <view class="benefits-list">
            <view class="benefit-row" v-for="(benefit, index) in selectedPlan.benefits" :key="index">
              <view class="benefit-icon-wrapper">
                <u-icon name="checkbox-mark" size="24" color="#ffffff"></u-icon>
              </view>
              <text class="benefit-text">{{ benefit }}</text>
            </view>
         </view>
      </view>

      <!-- Subscribe Button -->
      <button 
        class="subscribe-btn" 
        :loading="isSubscribing" 
        :disabled="isSubscribing"
        @click="handleSubscribe"
      >
        开通{{ selectedPlan ? selectedPlan.name : '' }}
      </button>

      <!-- Footer Links -->
      <view class="footer-links">
        <text class="footer-tip">开通即代表您已阅读并同意以下协议与政策</text>
        <view class="links-row">
          <text class="link-item" @click.stop="handleOpenLegal('user_agreement')">用户协议</text>
          <text class="link-item" @click.stop="handleOpenLegal('privacy_policy')">隐私政策</text>
        </view>
      </view>
    </CommonPopup>

    <!-- Legal Popup -->
    <u-popup v-model="showLegalPopup" mode="bottom" border-radius="24" :closeable="true" :z-index="10080">
      <view class="legal-popup-content">
        <view class="legal-title">{{ legalTitle }}</view>
        <scroll-view scroll-y class="legal-scroll">
          <text class="legal-text">{{ legalContent }}</text>
        </scroll-view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import CommonPopup from '@/components/CommonPopup.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { userStore, MembershipMode } from '@/store/user';
import { handleWechatPayment } from '@/utils/payment';
import { fetchSystemUserInfo, fetchMembershipPlans, fetchWechatOrderQuery, fetchLegalDocs } from '@/api/services';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const userInfo = computed(() => userStore.userInfo);

interface MembershipPlan {
  id: string;
  name: string;
  membership_mode: MembershipMode;
  duration_days: number;
  price_cents: number;
  currency: string;
  compute: {
    deep_chat_priority: string;
    max_parallel_sessions: number;
  };
  benefits: string[];
}

const plans = ref<MembershipPlan[]>([]);
const selectedPlanId = ref<string>('');
const isSubscribing = ref(false);
const showLegalPopup = ref(false);
const legalTitle = ref('');
const legalContent = ref('');

const handleOpenLegal = async (type: 'user_agreement' | 'privacy_policy') => {
  uni.showLoading({ title: '加载中...' });
  try {
    legalTitle.value = type === 'user_agreement' ? '用户协议' : '隐私政策';
    const res: any = await fetchLegalDocs(type);
    if (res.code === 200 && res.data) {
      legalContent.value = res.data.content || '暂无内容';
      showLegalPopup.value = true;
    } else {
      uni.showToast({ title: '获取内容失败', icon: 'none' });
    }
  } catch (error) {
    console.error('Fetch legal doc error:', error);
    uni.showToast({ title: '获取内容失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
};

const loadPlans = async () => {
  try {
    const res: any = await fetchMembershipPlans();
    if (res && res.data && res.data.plans) {
      plans.value = res.data.plans;
      // Default select yearly plan if exists, otherwise first plan
      const yearly = plans.value.find(p => p.membership_mode === MembershipMode.VIP_YEARLY);
      selectedPlanId.value = yearly ? yearly.id : (plans.value[0]?.id || '');
    }
  } catch (error) {
    console.error('Failed to load membership plans', error);
  }
};

onMounted(() => {
  loadPlans();
});

const currentSwiperIndex = ref(0);

const onSwiperChange = (e: any) => {
  currentSwiperIndex.value = e.detail.current;
};

const handleClose = () => {
  emit('update:modelValue', false);
};

const selectPlan = (planId: string) => {
  selectedPlanId.value = planId;
};

const selectedPlan = computed(() => plans.value.find(p => p.id === selectedPlanId.value));

const handleSubscribe = async () => {
  if (!selectedPlan.value) return;
  
  const plan = selectedPlan.value;
  const amount = plan.price_cents;
  const description = `${plan.name}开通`;

  if (isSubscribing.value) return;
  isSubscribing.value = true;
  uni.showLoading({ title: '正在发起支付...' });

  try {
    // Get login code for payment (required by backend to get openid)
    const loginRes = await new Promise<any>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      });
    });

    if (!loginRes.code) {
      throw new Error('获取登录凭证失败');
    }

    const outTradeNo = await handleWechatPayment({
      amount_total: amount,
      description: description,
      mode: plan.membership_mode,
      code: loginRes.code
    });

    console.log('outTradeNo', outTradeNo);

    if (outTradeNo) {
      try {
        await fetchWechatOrderQuery(outTradeNo);
      } catch (e) {
        console.error('Order query failed:', e);
      }
    }
    
    // Refresh user info to update VIP status
    try {
      const userRes: any = await fetchSystemUserInfo();
      if (userRes.data) {
        userStore.setSystemUser(userRes.data);
      }
    } catch (e) {
      console.error('Refresh user info failed:', e);
    }

    uni.showToast({
      title: '支付成功',
      icon: 'success'
    });
    
    // Close popup on success
    handleClose();
    
  } catch (error: any) {
    uni.showToast({
      title: error.msg || '支付失败',
      icon: 'none'
    });
  } finally {
    isSubscribing.value = false;
    uni.hideLoading();
  }
};
</script>

<style lang="scss" scoped>
/* Colors */
$indigo-50: #eef2ff;
$indigo-100: #e0e7ff;
$indigo-500: #6366f1;
$indigo-600: #4f46e5;
$indigo-900: #312e81;
$slate-50: #f8fafc;
$slate-100: #f1f5f9;
$slate-300: #cbd5e1;
$slate-400: #94a3b8;
$slate-500: #64748b;
$slate-600: #475569;
$slate-700: #334155;
$slate-800: #1e293b;
$white: #ffffff;

/* Header Section */
.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16rpx;
  margin-bottom: 64rpx;
}

.main-title {
  font-size: 56rpx; /* display-like */
  font-weight: 800; /* ExtraBold */
  color: #191c20;
  letter-spacing: -0.02em; /* tracking-tight */
  margin-bottom: 16rpx;
}

.sub-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

/* Pricing Cards */
.pricing-container {
  display: flex;
  flex-direction: column; /* Stacked vertically */
  gap: 32rpx;
  margin-bottom: 48rpx;
}

.plan-card {
  position: relative;
  background-color: #ffffff;
  border-radius: 48rpx; /* 3rem */
  padding: 48rpx 40rpx;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(124, 77, 255, 0.04);
  border: none;
  outline: 0.5px solid rgba(202, 195, 216, 0.2);
  
  /* Active State */
  &.active {
    background-color: #7c4dff; /* primary_container */
    box-shadow: 0 20px 40px rgba(124, 77, 255, 0.15);
    outline: none;
    
    .plan-duration, .price-symbol, .plan-price {
      color: #ffffff;
    }

    .tag-badge {
      background-color: rgba(255, 255, 255, 0.2);
      .tag-text { color: #ffffff; }
    }
  }
}

.plan-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.plan-duration {
  font-size: 32rpx; /* body-lg */
  font-weight: 600;
  color: #191c20;
  transition: color 0.3s ease;
}

.tag-badge {
  padding: 8rpx 24rpx;
  background-color: #f1f5f9;
  border-radius: 999rpx; /* rounded-full */
  transition: all 0.3s ease;
}

.tag-text {
  font-size: 24rpx; /* label-md */
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.plan-price-row {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 36rpx;
  font-weight: 800;
  color: #191c20;
  margin-right: 8rpx;
  transition: color 0.3s ease;
}

.plan-price {
  font-size: 72rpx; /* display-lg like */
  font-weight: 800; /* ExtraBold */
  color: #191c20;
  letter-spacing: -0.02em;
  line-height: 1;
  transition: color 0.3s ease;
}

/* Benefits Section */
.benefits-section {
  padding: 0 32rpx;
  margin-bottom: 48rpx;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 40rpx; 
}

.benefit-row {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.benefit-icon-wrapper {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background-color: #7c4dff; /* primary_container */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.benefit-text {
  font-size: 32rpx; /* body-lg */
  font-weight: 500;
  color: #191c20;
}

/* Subscribe Button */
.subscribe-btn {
  width: 100%;
  padding: 32rpx 0;
  background-color: #7c4dff; /* primary_container */
  color: #ffffff;
  font-size: 32rpx; /* body-lg */
  font-weight: 600;
  border-radius: 999rpx; /* rounded-full */
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  margin-bottom: 24rpx;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    transform: scale(0.98);
  }
  
  &[disabled] {
    opacity: 0.8;
    color: #ffffff !important;
  }
  
  &::after {
    border: none;
  }
}

/* Footer Links */
.footer-links {
  margin-top: 24rpx;
  text-align: center;
}

.footer-tip {
  font-size: 22rpx; /* text-[9px] */
  font-weight: 500;
  color: $slate-500; /* Darkened from slate-300 for better readability */
  display: block;
  margin-bottom: 16rpx;
  letter-spacing: 1px;
}

.links-row {
  display: flex;
  justify-content: center;
  gap: 32rpx;
}

.link-item {
    font-size: 20rpx; /* text-[9px] */
    font-weight: 700; /* font-bold */
    color: $slate-400; /* Lightened from slate-600 */
  }

/* Legal Popup */
.legal-popup-content {
  padding: 64rpx 48rpx;
  background-color: $white;
  height: 60vh;
  display: flex;
  flex-direction: column;
  
  .legal-title {
    font-size: 36rpx;
    font-weight: 700;
    color: $slate-800;
    text-align: center;
    margin-bottom: 32rpx;
  }
  
  .legal-scroll {
    flex: 1;
    height: 0;
  }
  
  .legal-text {
    font-size: 28rpx;
    color: $slate-600;
    line-height: 1.6;
    white-space: pre-wrap;
  }
}
</style>