<template>
  <CommonPopup
    v-model="show"
    background="#f8f9ff"
    @close="handleClose"
  >
    <scroll-view scroll-y class="popup-scroll-container">
      <!-- Account Header (Unwrapped) -->
      <view class="account-header">
        <view class="account-info">
          <text class="user-name">{{ userName }}</text>
          <view class="user-badge" :class="{ 'is-vip': isPro }">
            <text class="badge-text">{{ isPro ? '趋势会员' : '普通用户' }}</text>
          </view>
        </view>
        
        <view class="avatar-circle">
          <u-icon name="account-fill" size="48" color="#7c4dff"></u-icon>
        </view>
      </view>

      <!-- VIP Banner -->
      <view class="vip-banner" :class="{ 'is-active': isPro }">
        <view class="vip-banner-text">
          <text class="vip-title">{{ isPro ? '趋势会员生效中' : '人生趋势会员' }}</text>
          <text class="vip-subtitle">{{ isPro && membershipExpiry ? `有效期：${membershipExpiry}` : '解锁AI无限对话与深度分析' }}</text>
        </view>
        <button class="activate-btn" @click="goToUpgrade">{{ isPro ? '续费' : '激活' }}</button>
      </view>

      <!-- Invite Section Title -->
      <view class="invite-header">
        <text class="invite-title">邀请有礼</text>
        <!-- <text class="invite-subtitle-en">REWARDS PROGRAM</text> -->
      </view>

      <!-- Benefits Grid -->
      <view class="benefits-grid">
        <view class="benefit-item">
          <text class="benefit-value">+5次</text>
          <text class="benefit-desc">对话额度</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-value">+3天</text>
          <text class="benefit-desc">会员时长</text>
        </view>
      </view>

      <!-- Invite Action Box -->
      <view class="invite-action-box">
        <text class="box-label">我的邀请码</text>
        
        <view class="code-display-row">
          <text class="code-text">{{ inviteCode }}</text>
          <view class="copy-btn" @click="copyUserId">
            <text class="copy-text">复制</text>
          </view>
        </view>

        <text class="box-label" style="margin-top: 48rpx;">填写邀请码</text>
        
        <view class="code-input-row" @click="showInputModal">
          <text class="input-placeholder">输入好友邀请码</text>
        </view>

        <button class="invite-action-btn" open-type="share">
          立即邀请领奖励
        </button>
      </view>

      <!-- Invite Stats -->
      <view class="invite-stats-cards">
        <view class="stats-card">
          <text class="stats-num">{{ inviteStats.invited_count }}</text>
          <text class="stats-label">已邀请</text>
        </view>
        <view class="stats-divider"></view>
        <view class="stats-card">
          <text class="stats-num">{{ inviteStats.gifted_quota_times }}</text>
          <text class="stats-label">获赠对话</text>
        </view>
        <view class="stats-divider"></view>
        <view class="stats-card">
          <text class="stats-num">{{ inviteStats.gifted_membership_days }}</text>
          <text class="stats-label">延长会员</text>
        </view>
      </view>
      
      <!-- Bottom Space -->
      <view class="bottom-spacer"></view>
    </scroll-view>
  </CommonPopup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { userStore, MembershipType } from '@/store/user';
import CommonPopup from '@/components/CommonPopup.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { fetchSystemUserInfo, fetchApplyInvite, fetchInviteStats } from '@/api/services';
import userSvg from '@/static/icon/user.svg?url';
import chatSvg from '@/static/icon/chat.svg?url';
import clockSvg from '@/static/icon/default-clock.svg?url';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'open-upgrade']);

const tokenBalance = ref(0);
const isLoading = ref(false);

interface InviteStats {
  invited_count: number;
  gifted_quota_times: number;
  gifted_membership_days: number;
}

const inviteStats = ref<InviteStats>({
  invited_count: 0,
  gifted_quota_times: 0,
  gifted_membership_days: 0
});

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const systemUser = computed(() => userStore.systemUser);
const userId = computed(() => systemUser.value?.id || '67B7DE89');
const inviteCode = computed(() => systemUser.value?.invite_code || userId.value);
const isPro = computed(() => systemUser.value?.membership_type === MembershipType.VIP);
const userName = computed(() => systemUser.value?.nickname || '用户');
const membershipExpiry = computed(() => {
  if (!systemUser.value?.membership_end_at) return '';
  const formatDate = (val: string | number) => {
    if (!val) return '';
    const date = new Date(val);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const end = formatDate(systemUser.value.membership_end_at);
  if (!end) return '';
  
  const start = formatDate(systemUser.value.membership_start_at || '');
  if (start) {
    return `${start} 至 ${end}`;
  }
  return end;
});

const benefitItems = [
  { value: '+5', unit: '次', desc: '普通用户对话额度' },
  { value: '+3', unit: '天', desc: '趋势会员效期顺延' }
];

const loadData = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const userInfoRes = await fetchSystemUserInfo();
    if (userInfoRes) {
       const data = (userInfoRes as any).data || userInfoRes;
       userStore.setSystemUser({ ...userStore.systemUser, ...data });
       tokenBalance.value = data.token_balance;
    }

    const statsRes = await fetchInviteStats();
    if (statsRes) {
        const statsData = (statsRes as any).data || statsRes;
        if (statsData) {
            inviteStats.value = statsData;
        }
    }
  } catch (error) {
    console.error('Failed to load user info', error);
  } finally {
    isLoading.value = false;
  }
};

watch(show, (newVal) => {
  if (newVal) {
    loadData();
  }
});

const handleClose = () => {
  show.value = false;
};

const copyUserId = () => {
  uni.setClipboardData({
    data: inviteCode.value,
    success: () => {
      uni.showToast({ title: '复制成功', icon: 'none' });
    }
  });
};

const goToUpgrade = () => {
  show.value = false;
  emit('open-upgrade');
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
          await fetchApplyInvite(res.content, { hideErrorToast: true });
          uni.hideLoading();
          uni.showToast({ title: '兑换成功', icon: 'success' });
          loadData();
        } catch (error: any) {
          uni.hideLoading();
          console.error('Invite failed', error);
          uni.showToast({ title: error.msg || '兑换失败', icon: 'none' });
        }
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.popup-scroll-container {
  padding: 40rpx 32rpx;
  height: 85vh;
  box-sizing: border-box;
}

/* Account Header (Unwrapped) */
.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
  padding: 0 16rpx;
}

.account-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.account-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.05em;
  margin-bottom: 8rpx;
}

.user-name {
  font-size: 48rpx; /* display-like */
  font-weight: 800;
  color: #191c20;
  letter-spacing: -0.02em;
  margin-bottom: 12rpx;
}

.user-badge {
  padding: 6rpx 20rpx;
  background-color: #f1f5f9;
  border-radius: 999rpx;
  
  .badge-text {
    font-size: 24rpx;
    font-weight: 600;
    color: #64748b;
  }
  
  &.is-vip {
    background-color: rgba(124, 77, 255, 0.1);
    .badge-text {
      color: #7c4dff;
    }
  }
}

.avatar-circle {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  border: 4rpx solid #7c4dff;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
}

.vip-banner {
  background: linear-gradient(135deg, #7c4dff 0%, #632ce5 100%);
  border-radius: 999rpx;
  padding: 40rpx 48rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48rpx;
  box-shadow: 0 20px 40px rgba(124, 77, 255, 0.15);
}

.vip-banner-text {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.vip-title {
  font-size: 36rpx;
  font-weight: 800;
  color: #ffffff;
}

.vip-subtitle {
  font-size: 24rpx;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.activate-btn {
  background-color: #ffffff;
  color: #632ce5;
  font-size: 28rpx;
  font-weight: 600;
  padding: 16rpx 40rpx;
  border-radius: 999rpx;
  margin: 0;
  line-height: 1.5;
  box-shadow: none;
  
  &::after {
    border: none;
  }
}

/* Invite Section Title */
.invite-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32rpx;
  padding: 0 8rpx;
}

.invite-title {
  font-size: 40rpx;
  font-weight: 800;
  color: #7c4dff;
  letter-spacing: -0.02em;
}

.invite-subtitle-en {
  font-size: 24rpx;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 4rpx;
}

/* Benefits Grid */
.benefits-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-bottom: 40rpx;
}

.benefit-item {
  background-color: transparent;
  border-radius: 40rpx;
  padding: 40rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid rgba(202, 195, 216, 0.4);
}

.benefit-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  
  &.message {
    background-color: rgba(124, 77, 255, 0.1);
  }
  
  &.calendar {
    background-color: rgba(124, 77, 255, 0.1);
  }
}

.benefit-value {
  font-size: 56rpx;
  font-weight: 800;
  color: #7c4dff;
  letter-spacing: -0.02em;
  margin-bottom: 8rpx;
}

.benefit-desc {
  font-size: 24rpx;
  font-weight: 600;
  color: #191c20;
}

/* Invite Action Box */
.invite-action-box {
  background-color: #ffffff;
  border-radius: 48rpx;
  padding: 40rpx;
  /* border: none; */
  /* outline: 0.5px solid rgba(202, 195, 216, 0.2); Removed outline to fix artifact */
  border: 1px solid rgba(202, 195, 216, 0.2);
  box-shadow: 0 20px 40px rgba(124, 77, 255, 0.04);
  margin-bottom: 48rpx;
  display: flex;
  flex-direction: column;
}

.box-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #191c20;
  margin-bottom: 24rpx;
}

.code-display-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9ff;
  border-radius: 999rpx;
  padding: 16rpx 16rpx 16rpx 40rpx;
}

.code-text {
  font-size: 48rpx;
  font-weight: 800;
  color: #191c20;
  letter-spacing: 0.1em;
}

.copy-btn {
  background-color: rgba(124, 77, 255, 0.15);
  padding: 16rpx 32rpx;
  border-radius: 999rpx;
}

.copy-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #7c4dff;
}

.code-input-row {
  background-color: #f8f9ff;
  border-radius: 999rpx;
  padding: 32rpx 40rpx;
  margin-bottom: 40rpx;
}

.input-placeholder {
  font-size: 28rpx;
  font-weight: 600;
  color: #94a3b8;
}

.invite-action-btn {
  background-color: #632ce5; /* primary */
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
  padding: 32rpx 0;
  border-radius: 999rpx;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  margin: 0;
  line-height: 1.5;
  border: none;
  
  &::after {
    border: none;
  }
}

/* Invite Stats Cards */
.invite-stats-cards {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 32rpx;
}

.stats-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 40rpx;
}

.stats-divider {
  width: 1px;
  height: 48rpx;
  background-color: rgba(202, 195, 216, 0.4);
}

.stats-num {
  font-size: 48rpx;
  font-weight: 800;
  color: #191c20;
  line-height: 1;
  margin-bottom: 12rpx;
}

.stats-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #64748b;
}

.bottom-spacer {
  height: 40rpx;
}
</style>