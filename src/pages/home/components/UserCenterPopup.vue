<template>
  <CommonPopup
    v-model="show"
    background="#f8fafc"
    @close="handleClose"
  >
    <template #header-left>
      <view class="user-info-row">
        <UserAvatar :name="userName || 'U'" :shadow="false" />
        <view class="user-details">
          <text class="user-name">{{ userName }}</text>
          <view class="user-badge" :class="{ 'is-vip': isPro }">
            <text class="badge-text">{{ isPro ? '趋势会员' : '普通用户' }}</text>
          </view>
        </view>
      </view>
    </template>

    <!-- VIP Membership Card -->
    <view class="vip-card-wrapper">
      <view class="vip-card" :class="{ 'is-active': isPro }">
        <!-- Decorative background elements could be added here if needed -->
        
        <view class="vip-card-content">
          <view class="vip-info">
            <view class="vip-tag">
              <text class="vip-tag-text">{{ isPro ? '尊享权益' : '限时特惠' }}</text>
            </view>
            <text class="vip-card-title">{{ isPro ? '趋势会员生效中' : '人生趋势会员' }}</text>
            <text class="vip-card-subtitle">{{ isPro && membershipExpiry ? `有效期：${membershipExpiry}` : (isPro ? '' : '即刻解锁会员权益') }}</text>
          </view>
          
          <button class="activate-btn" @click="goToUpgrade" v-if="!isPro">激活</button>
          <button class="activate-btn" @click="goToUpgrade" v-else>续费</button>
        </view>
      </view>
    </view>

    <!-- Invite Card -->
    <view class="invite-card-wrapper">
      <view class="invite-header">
        <text class="invite-section-title">邀请有礼</text>
        <!-- <view class="invite-record-btn">
          <text class="record-text">邀请记录</text>
          <u-icon name="arrow-right" size="20" color="#6366f1"></u-icon>
        </view> -->
      </view>

      <view class="invite-subtitle">
        <text class="subtitle-text">邀请新用户注册并建立档案，可获得奖励</text>
      </view>

      <view class="benefits-grid">
        <view class="benefit-item" v-for="(item, index) in benefitItems" :key="index">
          <view class="benefit-value-row">
            <text class="benefit-value">{{ item.value }}</text>
            <text class="benefit-unit">{{ item.unit }}</text>
          </view>
          <text class="benefit-desc">{{ item.desc }}</text>
        </view>
      </view>

      <view class="invite-code-box">
        <view class="code-left">
          <text class="code-label">我的邀请码</text>
          <view class="code-value-row">
            <text class="code-text">{{ inviteCode }}</text>
            <view class="copy-badge" @click="copyUserId">
              <text class="copy-text">复制</text>
            </view>
          </view>
        </view>
        <button class="fill-code-btn" @click="showInputModal">
          填写邀请码
        </button>
      </view>

      <button class="invite-action-btn" open-type="share">
        立即邀请领奖励
      </button>
    </view>

    <!-- Invite Stats -->
    <view class="invite-stats-cards">
      <view class="stats-card">
        <text class="stats-num">{{ inviteStats.invited_count }}</text>
        <text class="stats-label">已邀请人数</text>
      </view>
      <view class="stats-card">
        <text class="stats-num">{{ inviteStats.gifted_quota_times }}</text>
        <text class="stats-label">获赠对话(次)</text>
        <view class="stats-tag normal">
          <text class="stats-tag-text">普通用户</text>
        </view>
      </view>
      <view class="stats-card">
        <text class="stats-num">{{ inviteStats.gifted_membership_days }}</text>
        <text class="stats-label">延长会员(天)</text>
        <view class="stats-tag vip">
          <text class="stats-tag-text">会员专属</text>
        </view>
      </view>
    </view>
    
    <!-- Bottom Space -->
    <view class="bottom-spacer"></view>
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
/* Header Styles */
.user-info-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: 900;
  color: #1e293b; /* slate-800 */
}

.user-badge {
  display: inline-flex;
  align-self: flex-start;
  padding: 4rpx 12rpx;
  background-color: #eef2ff; /* indigo-50 */
  border-radius: 12rpx;
  
  .badge-text {
    font-size: 22rpx; /* text-[10px] */
    font-weight: 900;
    color: #818cf8; /* indigo-400 */
    text-transform: uppercase;
    letter-spacing: 2rpx;
  }
  
  &.is-vip {
    background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
    .badge-text {
      color: #ffffff;
    }
  }
}

/* VIP Card */
.vip-card-wrapper {
  margin-bottom: 48rpx;
}

.vip-card {
  background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
  border-radius: 64rpx; /* rounded-[32px] */
  padding: 48rpx; /* p-6 */
  box-shadow: 0 20rpx 50rpx -10rpx rgba(99, 102, 241, 0.3); /* shadow-lg shadow-indigo-100 */
  position: relative;
  overflow: hidden;
  
  &.is-active {
     /* Different style for active VIP if needed, currently same gradient */
  }
}

.vip-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 10;
}

.vip-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.vip-tag {
  display: inline-flex;
  align-self: flex-start;
  padding: 4rpx 12rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
  margin-bottom: 8rpx;
  
  .vip-tag-text {
    font-size: 22rpx; /* text-[10px] */
    font-weight: 900;
    color: #ffffff;
    text-transform: uppercase;
    font-style: italic;
  }
}

.vip-card-title {
  font-size: 40rpx; /* text-xl */
  font-weight: 900;
  color: #ffffff;
  margin-top: 4rpx;
  line-height: 1.2;
}

.vip-card-subtitle {
  font-size: 24rpx; /* text-[11px] */
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4rpx;
}

.activate-btn {
  background-color: #ffffff;
  color: #4f46e5; /* indigo-600 */
  font-size: 26rpx; /* text-xs */
  font-weight: 900;
  padding: 16rpx 40rpx; /* px-5 py-2 */
  border-radius: 32rpx; /* rounded-2xl */
  box-shadow: 0 20rpx 25rpx -5rpx rgba(0, 0, 0, 0.1); /* shadow-xl */
  margin: 0;
  line-height: 1.5;
  
  &::after {
    border: none;
  }
}

/* Invite Card */
.invite-card-wrapper {
  background: linear-gradient(180deg, #FFFFFF 0%, #F4F7FF 100%);
  border-radius: 64rpx; /* rounded-[32px] */
  padding: 40rpx; /* p-5 */
  border: 1px solid #eef2ff; /* border-indigo-50 */
  margin-bottom: 48rpx;
}

.invite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.invite-section-title {
  font-size: 26rpx; /* text-xs */
  font-weight: 900;
  color: #94a3b8; /* slate-400 */
  text-transform: uppercase;
  letter-spacing: 4rpx;
}

.invite-record-btn {
  display: flex;
  align-items: center;
  gap: 4rpx;
  
  .record-text {
    font-size: 24rpx; /* text-[11px] */
    font-weight: 700;
    color: #6366f1; /* indigo-500 */
  }
}

.benefits-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.benefit-item {
  background-color: #ffffff;
  border-radius: 32rpx; /* rounded-2xl */
  padding: 32rpx; /* p-4 */
  border: 1px solid #f1f5f9; /* border-slate-100 */
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.benefit-value-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 4rpx;
}

.benefit-value {
  font-size: 52rpx; /* text-xl */
  font-weight: 900;
  color: #4f46e5; /* indigo-600 */
}

.benefit-unit {
  font-size: 24rpx; /* text-[11px] */
  font-weight: 700;
  color: #4f46e5;
  margin-left: 4rpx;
}

.benefit-desc {
  font-size: 22rpx; /* text-[10px] */
  font-weight: 700;
  color: #94a3b8; /* slate-400 */
  line-height: 1.2;
  display: block;
}

.invite-subtitle {
  margin-bottom: 24rpx;
  padding: 0 8rpx;
}

.subtitle-text {
  font-size: 24rpx; /* text-[11px] */
  font-weight: 700;
  color: #6366f1; /* indigo-400 */
}

.invite-code-box {
  background-color: #ffffff;
  border-radius: 32rpx; /* rounded-2xl */
  padding: 32rpx; /* p-4 */
  border: 1px solid rgba(224, 231, 255, 0.3); /* border-indigo-100/30 */
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.code-left {
  display: flex;
  flex-direction: column;
}

.code-label {
  font-size: 24rpx; /* text-[9px] */
  font-weight: 900;
  color: #94a3b8; /* slate-400 */
  text-transform: uppercase;
  margin-bottom: 4rpx;
  letter-spacing: 1px;
}

.code-value-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.code-text {
  font-size: 44rpx; /* text-[21px] */
  font-weight: 900;
  color: #1e293b; /* slate-800 */
  letter-spacing: -2rpx;
}

.copy-badge {
  padding: 4rpx 16rpx;
  background-color: #eef2ff; /* indigo-50 */
  border-radius: 8rpx;
  
  &:active {
    background-color: #e0e7ff;
  }
}

.copy-text {
  font-size: 20rpx; /* text-[9px] */
  font-weight: 900;
  color: #6366f1; /* indigo-500 */
}

.fill-code-btn {
  background-color: #0f172a; /* slate-900 */
  color: #ffffff;
  font-size: 26rpx; /* text-xs */
  font-weight: 900;
  padding: 20rpx 40rpx; /* px-5 py-2.5 */
  border-radius: 24rpx; /* rounded-xl */
  box-shadow: 0 10rpx 15rpx -3rpx rgba(0, 0, 0, 0.1); /* shadow-lg */
  margin: 0;
  line-height: 1.5;
  
  &:active {
    transform: scale(0.95);
  }
  
  &::after {
    border: none;
  }
}

.invite-action-btn {
  width: 100%;
  background-color: #6366f1; /* indigo-500 */
  color: #ffffff;
  font-size: 28rpx; /* text-[13px] */
  font-weight: 900;
  padding: 32rpx 0; /* py-4 */
  border-radius: 32rpx; /* rounded-2xl */
  box-shadow: 0 20rpx 25rpx -5rpx rgba(224, 231, 255, 1); /* shadow-xl shadow-indigo-100 */
  margin: 0;
  line-height: 1.5;
  
  &:active {
    transform: scale(0.98);
  }
  
  &::after {
    border: none;
  }
}

/* Invite Stats Cards */
.invite-stats-cards {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  margin-top: 32rpx;
}

.stats-card {
  flex: 1;
  background-color: transparent;
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  border: none;
}

.stats-icon-bg {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  
  &.slate {
    background-color: #f8fafc; /* slate-50 */
  }
  
  &.indigo {
    background-color: #eef2ff; /* indigo-50 */
  }
  
  &.fuchsia {
    background-color: #fdf4ff; /* fuchsia-50 */
  }
}

.stats-icon {
  width: 32rpx;
  height: 32rpx;
  
  &.slate {
    filter: invert(71%) sepia(8%) saturate(762%) hue-rotate(183deg) brightness(88%) contrast(85%); /* #94a3b8 slate-400 */
  }
  
  &.indigo {
    filter: invert(44%) sepia(76%) saturate(5427%) hue-rotate(224deg) brightness(98%) contrast(93%); /* #6366f1 indigo-500 */
  }
  
  &.fuchsia {
    filter: invert(58%) sepia(63%) saturate(5486%) hue-rotate(295deg) brightness(92%) contrast(96%); /* #d946ef fuchsia-500 */
  }
}

.stats-num {
  font-size: 36rpx;
  font-weight: 900;
  color: #1e293b; /* slate-800 */
  margin-bottom: 4rpx;
  line-height: 1;
}

.stats-label {
  font-size: 20rpx;
  font-weight: 700;
  color: #94a3b8; /* slate-400 */
  margin-top: 4rpx;
  text-transform: uppercase;
}

.stats-tag {
  margin-top: 8rpx;
  padding: 4rpx 8rpx;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.normal {
    background-color: #eef2ff; /* indigo-50 */
    .stats-tag-text { color: #818cf8; } /* indigo-400 */
  }
  
  &.vip {
    background-color: #faf5ff; /* fuchsia-50 */
    .stats-tag-text { color: #c084fc; } /* fuchsia-500 */
  }
}

.stats-tag-text {
  font-size: 18rpx;
  font-weight: 900;
  line-height: 1;
}

.bottom-spacer {
  height: 40rpx;
}
</style>