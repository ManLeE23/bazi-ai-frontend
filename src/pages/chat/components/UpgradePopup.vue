<template>
  <view>
    <CommonPopup
      v-model="show"
      background="linear-gradient(180deg, #dbeafe 0%, #ede9fe 100%)"
      @close="handleClose"
    >
      <!-- Avatar & Title -->
      <view class="header-section">
        <UserAvatar 
          :name="userInfo?.nickname || 'Q'" 
          size="large"
          style="margin-bottom: 32rpx;" 
        />
        <text class="main-title">人生趋势会员</text>
        <text class="sub-title">升级后解锁全部功能</text>
      </view>

      <!-- Pricing Cards -->
      <view class="pricing-container">
        <view 
          v-for="plan in plans"
          :key="plan.id"
          class="plan-card" 
          :class="{ 'premium-card': plan.id === 'vip_yearly', 'active': selectedPlanId === plan.id }"
          @click="selectPlan(plan.id)"
        >
          <view class="tag-badge" :class="{ 'premium-tag': plan.id === 'vip_yearly' }">
            <text class="tag-text">{{ plan.id === 'vip_yearly' ? '省 30%' : '热门' }}</text>
          </view>
          
          <view class="plan-content">
            <view class="price-row">
               <text class="plan-duration-num">{{ plan.duration_days > 360 ? Math.floor(plan.duration_days / 30) : plan.duration_days }}</text>
               <text class="plan-duration-unit">{{ plan.duration_days > 360 ? '个月' : '天' }}</text>
            </view>
            
            <text class="plan-price">¥{{ (plan.price_cents / 100).toFixed(2) }}</text>
            
            <view class="plan-desc-wrapper">
               <text class="plan-desc">{{ plan.membership_mode === MembershipMode.VIP_YEARLY ? '年付' : '月付' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Plan Benefits List -->
      <view class="benefits-section" v-if="selectedPlan">
         <text class="benefits-title">{{ selectedPlan.name }}权益</text>
         <view class="benefits-list">
            <view class="benefit-row" v-for="(benefit, index) in selectedPlan.benefits" :key="index">
              <view class="benefit-icon-wrapper" :class="{ 'premium-icon': true }">
                <u-icon name="checkmark" size="20" color="#ffffff"></u-icon>
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
  margin-bottom: 40rpx;
}

.main-title {
  font-size: 48rpx; /* text-2xl */
  font-weight: 900; /* font-black */
  color: $slate-800;
  letter-spacing: -0.025em; /* tracking-tight */
  margin-bottom: 8rpx;
}

.sub-title {
  font-size: 26rpx; /* text-[13px] approx */
  color: $slate-400;
  letter-spacing: 1px;
}

/* Pricing Cards */
.pricing-container {
  display: flex;
  gap: 32rpx; /* gap-4 = 1rem = 16px = 32rpx */
  margin-bottom: 32rpx;
}

.plan-card {
  flex: 1;
  position: relative;
  background-color: $white;
  border: 4rpx solid $slate-100; /* border-2 */
  border-radius: 48rpx; /* Reduced from 64rpx for better proportion */
  padding: 40rpx 24rpx;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  
  /* Active State - Strong Highlight */
  &.active {
    border-color: $indigo-600;
    background-color: #eef2ff; /* indigo-50 */
    box-shadow: 0 12rpx 32rpx -8rpx rgba(79, 70, 229, 0.3);
    transform: translateY(-4rpx);
    
    /* Ensure tag badge blends or stands out */
    .tag-badge {
      background-color: $indigo-600;
      .tag-text { color: $white; }
    }
  }
  
  /* Premium Card Styles (Unselected base) */
  &.premium-card {
    /* Subtle difference for premium even when unselected */
    background-color: rgba(238, 242, 255, 0.6); /* indigo-50 with opacity */
    
    &.active {
       /* Premium Active */
       background-color: #eef2ff; /* indigo-50 - Matches border family */
       border-color: $indigo-600; /* Keep consistent active border */
       /* Shadow using indigo tone (79, 70, 229) instead of violet */
       box-shadow: 0 20rpx 40rpx -10rpx rgba(79, 70, 229, 0.25);
    }
  }
}

.tag-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 8rpx 20rpx;
  background-color: $slate-100;
  border-bottom-left-radius: 24rpx;
  transition: all 0.3s ease;
  
  &.premium-tag {
    background-color: $indigo-100; /* Lighter when unselected */
    .tag-text { color: $indigo-600; }
  }
}

.tag-text {
  font-size: 20rpx;
  font-weight: 800;
  color: $slate-500;
}

.plan-content {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.price-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.plan-duration-num {
  font-size: 40rpx;
  font-weight: 700;
  color: $slate-700;
  
  .active & {
    color: $indigo-600;
  }
}

.plan-duration-unit {
  font-size: 24rpx;
  font-weight: 700;
  color: $slate-400;
  margin-left: 4rpx;
  
  .active & {
    color: $indigo-500;
  }
}

.plan-price {
  font-size: 36rpx;
  font-weight: 900;
  color: $slate-800;
  display: block;
  margin-top: 8rpx;
  
  .active & {
    color: $indigo-900;
  }
}

.plan-desc-wrapper {
  margin-top: 24rpx;
  text-align: center;
}

.plan-desc {
  font-size: 22rpx;
  font-weight: 500;
  color: $slate-400;
  line-height: 1.4;
  display: block;
  
  &.highlight {
    font-weight: 700;
    color: $indigo-500;
  }
  
  .active & {
    color: $slate-600;
    &.highlight { color: $indigo-600; }
  }
}

/* Benefits Section */
.benefits-section {
  background-color: rgba(248, 250, 252, 0.5); /* bg-slate-50/50 */
  border: 2rpx solid $slate-100;
  border-radius: 64rpx; /* rounded-[32px] */
  padding: 48rpx; /* p-6 */
  margin-bottom: 32rpx;
}

.benefits-title {
  font-size: 24rpx; /* text-[11px] */
  font-weight: 900; /* font-black */
  color: $slate-400;
  text-transform: uppercase;
  letter-spacing: 0.2em; /* tracking-[0.2em] */
  margin-bottom: 32rpx;
  margin-left: 8rpx;
  display: block;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx; /* space-y-3 */
}

.benefit-row {
  display: flex;
  align-items: center;
  gap: 24rpx; /* gap-3 */
}

.benefit-icon-wrapper {
  width: 40rpx; /* w-5 */
  height: 40rpx; /* h-5 */
  border-radius: 50%;
  background-color: rgba(199, 210, 254, 1); /* indigo-200 (fallback) */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  &.premium-icon {
    background-color: $indigo-500;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  }
}

.benefit-text {
  font-size: 26rpx; /* text-xs */
  font-weight: 700; /* font-bold */
  color: $slate-600;
}

/* Subscribe Button */
.subscribe-btn {
  width: 100%;
  padding: 32rpx 0;
  background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
  color: $white;
  font-size: 28rpx; /* text-sm */
  font-weight: 900; /* font-black */
  border-radius: 32rpx; /* rounded-2xl */
  letter-spacing: 0.1em; /* tracking-[0.1em] */
  box-shadow: 0 20rpx 40rpx -10rpx rgba(99, 102, 241, 0.4);
  margin-bottom: 24rpx;
  transition: all 0.3s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
  
  &[disabled] {
    opacity: 0.8;
    color: #ffffff !important;
    /* Maintain gradient background for loading state */
    /* background: $slate-300; */
    box-shadow: 0 10rpx 20rpx -5rpx rgba(99, 102, 241, 0.4);
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