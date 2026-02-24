<template>
  <view class="page-container">
    <HeaderBar title="邀请有礼" :fixed="true" :placeholder="true" background-color="#F4F7FF" />
    
    <scroll-view scroll-y class="content-scroll">
      <view class="content-wrapper">
        
        <!-- Header Section -->
        <view class="section-header">
          <text class="section-title">邀请好礼</text>
          <view class="status-badge">
            <text class="status-text">进行中</text>
          </view>
        </view>

        <!-- Reward Card (Standard) -->
        <view class="reward-card">
          <view class="card-top">
            <view class="text-content">
              <text class="card-label">Standard User</text>
              <text class="card-title">邀请新人注册</text>
              <text class="card-subtitle">立享免费对话特权</text>
            </view>
            <view class="icon-box">
              <u-icon name="account-fill" size="48" color="#6366f1"></u-icon>
            </view>
          </view>

          <view class="benefit-box">
            <view class="benefit-row">
              <text class="benefit-value">+5</text>
              <view class="benefit-details">
                <text class="benefit-name">免费对话额度</text>
                <text class="benefit-desc">每成功邀请 1 位好友注册+建立档案</text>
              </view>
            </view>
          </view>

          <button class="action-btn standard-btn" @click="copyInviteCode">
            立即邀请领额度
          </button>
        </view>

        <!-- VIP Card -->
        <view class="vip-card">
          <!-- Decorative Blur -->
          <view class="blur-circle"></view>
          
          <view class="card-top">
            <view class="text-content">
              <view class="vip-badge">
                <text class="vip-badge-text">VIP Exclusive</text>
              </view>
              <text class="card-title white">会员专属延期奖励</text>
              <text class="card-subtitle white-70">您的影响力，能让智慧延续</text>
            </view>
            <view class="icon-box white-10">
              <u-icon name="clock-fill" size="48" color="#ffffff"></u-icon>
            </view>
          </view>

          <view class="benefit-box white-10">
            <view class="benefit-row">
              <view class="benefit-value white">
                +3<text class="unit">天</text>
              </view>
              <view class="benefit-details">
                <text class="benefit-name white">会员期限顺延</text>
                <text class="benefit-desc white-50">好友完成注册并建立首份档案即可</text>
              </view>
            </view>
          </view>

          <button class="action-btn vip-btn pulse-anim" @click="copyInviteCode">
            邀请好友并延期
          </button>
        </view>

        <!-- Referral Code Bar -->
        <view class="referral-bar">
          <view class="referral-info">
            <text class="referral-label">My Referral Code</text>
            <text class="referral-code">{{ inviteCode }}</text>
          </view>
          <button class="copy-btn-dark" @click="copyInviteCode">
            复制分享
          </button>
        </view>
        
        <!-- Fill Code Button (Optional extra) -->
        <view class="fill-code-container" @click="showInputModal">
           <text class="fill-code-text">我有邀请码？点此填写 ></text>
        </view>

      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import HeaderBar from '@/components/HeaderBar.vue';
import { userStore, MembershipType } from '@/store/user';
import { fetchSystemUserInfo, fetchApplyInvite } from '@/api/services';

const isLoading = ref(false);
const tokenBalance = ref(0);

const systemUser = computed(() => userStore.systemUser);
const userId = computed(() => systemUser.value?.id || '');
const inviteCode = computed(() => systemUser.value?.invite_code || userId.value || 'Loading...');
const isPro = computed(() => systemUser.value?.membership_type === MembershipType.VIP);

const loadData = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const userInfoRes: any = await fetchSystemUserInfo();
    if (userInfoRes) {
       const data = userInfoRes.data || userInfoRes;
       userStore.setSystemUser({ ...userStore.systemUser, ...data });
       tokenBalance.value = data.token_balance || 0;
    }
  } catch (error) {
    console.error('Failed to load user info', error);
  } finally {
    isLoading.value = false;
  }
};

onShow(() => {
  loadData();
});

const copyInviteCode = () => {
  if (!inviteCode.value) return;
  uni.setClipboardData({
    data: inviteCode.value,
    success: () => {
      uni.showToast({ title: '复制成功', icon: 'none' });
    }
  });
};

const showInputModal = () => {
  uni.showModal({
    title: '填写邀请码',
    editable: true,
    placeholderText: '请输入邀请码',
    success: async (res) => {
      if (res.confirm && res.content) {
        if (!res.content.trim()) return;
        
        uni.showLoading({ title: '兑换中...' });
        try {
          await fetchApplyInvite(res.content);
          uni.showToast({ title: '兑换成功', icon: 'success' });
          loadData(); // Refresh data
        } catch (error: any) {
          console.error('Invite failed', error);
          uni.showToast({ title: error.msg || '兑换失败', icon: 'none' });
        } finally {
          uni.hideLoading();
        }
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #F4F7FF;
  display: flex;
  flex-direction: column;
}

.content-scroll {
  flex: 1;
  height: 0;
}

.content-wrapper {
  padding: 48rpx; /* p-6 approx */
  padding-bottom: 80rpx;
}

/* Header Section */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16rpx;
  margin-bottom: 48rpx; /* space-y-6 */
}

.section-title {
  font-size: 22rpx; /* text-[11px] */
  font-weight: 900; /* font-black */
  color: #94a3b8; /* text-slate-400 */
  text-transform: uppercase;
  letter-spacing: 4rpx; /* tracking-widest */
}

.status-badge {
  background-color: #eef2ff; /* bg-indigo-50 */
  padding: 4rpx 16rpx;
  border-radius: 999px;
}

.status-text {
  font-size: 20rpx; /* text-[10px] */
  font-weight: 700; /* font-bold */
  color: #6366f1; /* text-indigo-500 */
}

/* Reward Card (Standard) */
.reward-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(30rpx); /* blur(15px) */
  -webkit-backdrop-filter: blur(30rpx);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 64rpx; /* rounded-[32px] */
  padding: 48rpx; /* p-6 */
  box-shadow: 0 40rpx 50rpx -10rpx rgba(224, 231, 255, 0.3); /* shadow-xl shadow-indigo-100/30 */
  margin-bottom: 48rpx;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 48rpx; /* mb-6 */
}

.text-content {
  flex: 1;
}

.card-label {
  font-size: 20rpx; /* text-[10px] */
  font-weight: 900;
  color: #94a3b8; /* text-slate-400 */
  text-transform: uppercase;
  letter-spacing: -1rpx; /* tracking-tighter */
  display: block;
  margin-bottom: 8rpx; /* mb-1 */
}

.card-title {
  font-size: 36rpx; /* text-lg */
  font-weight: 900; /* font-black */
  color: #1e293b; /* text-slate-800 */
  line-height: 1.25;
  display: block;
  
  &.white {
    color: #ffffff;
    margin-top: 16rpx; /* mt-2 */
  }
}

.card-subtitle {
  font-size: 24rpx; /* text-xs */
  font-weight: 700;
  color: #64748b; /* text-slate-500 */
  margin-top: 8rpx; /* mt-1 */
  display: block;
  
  &.white-70 {
    color: rgba(255, 255, 255, 0.7);
  }
}

.icon-box {
  width: 96rpx; /* w-12 */
  height: 96rpx; /* h-12 */
  background-color: #eef2ff; /* bg-indigo-50 */
  border-radius: 32rpx; /* rounded-2xl */
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.white-10 {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

/* Benefit Box */
.benefit-box {
  background-color: #ffffff;
  border-radius: 32rpx; /* rounded-2xl */
  padding: 32rpx; /* p-4 */
  border: 1px solid #f1f5f9; /* border-slate-100 */
  margin-bottom: 48rpx; /* mb-6 */
  
  &.white-10 {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.benefit-row {
  display: flex;
  align-items: center;
  gap: 24rpx; /* gap-3 */
}

.benefit-value {
  font-size: 60rpx; /* text-3xl */
  font-weight: 900;
  color: #6366f1; /* text-indigo-500 */
  
  &.white {
    color: #ffffff;
  }
}

.unit {
  font-size: 24rpx; /* text-xs */
  margin-left: 4rpx; /* ml-1 */
}

.benefit-details {
  flex: 1;
}

.benefit-name {
  font-size: 24rpx; /* text-xs */
  font-weight: 900;
  color: #1e293b; /* text-slate-800 */
  display: block;
  
  &.white {
    color: #ffffff;
  }
}

.benefit-desc {
  font-size: 20rpx; /* text-[10px] */
  color: #94a3b8; /* text-slate-400 */
  font-weight: 700;
  font-style: italic;
  display: block;
  
  &.white-50 {
    color: rgba(255, 255, 255, 0.5);
  }
}

/* Buttons */
.action-btn {
  width: 100%;
  padding: 32rpx 0; /* py-4 */
  border-radius: 32rpx; /* rounded-2xl */
  font-size: 24rpx; /* text-xs */
  font-weight: 900;
  box-shadow: 0 20rpx 25rpx -5rpx rgba(0, 0, 0, 0.1), 0 10rpx 10rpx -5rpx rgba(0, 0, 0, 0.04); /* shadow-lg */
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.95);
    opacity: 0.9;
  }
  
  &::after {
    border: none;
  }
}

.standard-btn {
  background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); /* vip-accent */
  color: #ffffff;
}

.vip-btn {
  background-color: #ffffff;
  color: #4f46e5; /* text-indigo-600 */
}

/* VIP Card */
.vip-card {
  background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); /* vip-accent */
  border-radius: 64rpx; /* rounded-[32px] */
  padding: 48rpx; /* p-6 */
  box-shadow: 0 50rpx 50rpx -12rpx rgba(199, 210, 254, 0.5); /* shadow-2xl shadow-indigo-200/50 */
  position: relative;
  overflow: hidden;
  margin-bottom: 48rpx; /* space-y-6 */
}

.blur-circle {
  position: absolute;
  right: -64rpx;
  top: -64rpx;
  width: 256rpx; /* w-32 */
  height: 256rpx; /* h-32 */
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  filter: blur(64rpx); /* blur-3xl */
  z-index: 1;
}

.vip-badge {
  display: inline-block;
  padding: 4rpx 8rpx;
  border-radius: 12rpx; /* rounded-md */
  background-color: rgba(255, 255, 255, 0.2);
  margin-bottom: 8rpx;
}

.vip-badge-text {
  font-size: 18rpx; /* text-[9px] */
  font-weight: 900;
  color: #ffffff;
  text-transform: uppercase;
  font-style: italic;
}

.pulse-anim {
  animation: shadow-pulse 2s infinite;
}

@keyframes shadow-pulse {
  0% { box-shadow: 0 0 0 0px rgba(99, 102, 241, 0.4); }
  100% { box-shadow: 0 0 0 24rpx rgba(99, 102, 241, 0); }
}

/* Referral Bar */
.referral-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  border-radius: 32rpx; /* rounded-2xl */
  padding: 32rpx; /* p-4 */
  border: 1px solid #f1f5f9; /* border-slate-100 */
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05); /* shadow-sm */
  margin-bottom: 48rpx;
}

.referral-info {
  display: flex;
  flex-direction: column;
}

.referral-label {
  font-size: 18rpx; /* text-[9px] */
  font-weight: 900;
  color: #cbd5e1; /* text-slate-300 */
  text-transform: uppercase;
  letter-spacing: 4rpx; /* tracking-widest */
  margin-bottom: 4rpx;
}

.referral-code {
  font-size: 40rpx; /* text-xl */
  font-weight: 900;
  color: #1e293b; /* text-slate-800 */
  letter-spacing: -2rpx; /* tracking-tighter */
}

.copy-btn-dark {
  background-color: #0f172a; /* bg-slate-900 */
  color: #ffffff;
  font-size: 20rpx; /* text-[10px] */
  font-weight: 900;
  padding: 16rpx 32rpx; /* px-4 py-2 */
  border-radius: 24rpx; /* rounded-xl */
  margin: 0;
  transition: background-color 0.2s;
  
  &:active {
    background-color: #1e293b; /* bg-slate-800 */
  }
  
  &::after {
    border: none;
  }
}

.fill-code-container {
  display: flex;
  justify-content: center;
  padding: 20rpx;
}

.fill-code-text {
  font-size: 24rpx;
  color: #64748b;
  text-decoration: underline;
}
</style>