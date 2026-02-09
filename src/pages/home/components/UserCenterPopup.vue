<template>
  <CommonPopup
    v-model="show"
    background="#f8fafc"
    @close="handleClose"
  >
    <template #header-left>
      <view class="user-info-row">
        <view class="avatar-wrapper">
          <text class="avatar-text">{{ userName?.[0] }}</text>
        </view>
        <view class="user-details">
          <text class="user-name">{{ userName }}</text>
          <!-- <view class="user-id-row" @click="copyUserId">
            <text class="user-id">ID: {{ userId || 'K6XPQ7EV' }}</text>
            <view class="copy-tag">
              <u-icon name="file-text" size="20" color="#94a3b8"></u-icon>
              <text class="copy-text">复制我的ID</text>
            </view>
          </view> -->
        </view>
      </view>
    </template>

    <!-- Extra Spacer for tall header -->
    <!-- <view class="header-extra-spacer"></view> -->

    <!-- VIP Membership Card -->
    <view class="vip-section" v-if="!isPro">
      <view class="vip-header">
        <view class="vip-badge">
          <text class="vip-badge-text">限时特惠</text>
        </view>
      </view>
      
      <view class="vip-content">
        <view class="vip-title-row">
          <text class="vip-title">人生趋势高级会员</text>
          <button class="activate-btn" @click="goToUpgrade">激活</button>
        </view>
        
        <text class="vip-subtitle">即刻解锁会员权益</text>
      </view>
    </view>
    
    <!-- Pro Section (if upgraded) -->
    <view class="pro-vip-section" v-else>
      <view class="pro-content">
        <text class="pro-title">Pro 版订阅中</text>
        <text class="pro-validity">有效期至 2027.01.19</text>
      </view>
    </view>

    <!-- Invitation Section -->
    <view class="invite-card">
      <view class="invite-header">
        <view class="code-row">
          <text class="invite-code">{{ inviteCode }}</text>
          <view class="copy-btn-small" @click="copyUserId">
            <!-- <u-icon name="file-text" size="20" color="#94a3b8"></u-icon> -->
            <text class="copy-text-small">复制</text>
          </view>
        </view>
        <button class="fill-code-btn" @click="showInputModal">填写</button>
      </view>
      
      <!-- <text class="invite-status">您已邀请 0 个朋友加入人生趋势</text> -->
      <text class="invite-desc">当您填写/被填写邀请码时，您将获得AI性能升级。{{ isPro ? '会员用户每次邀请赠送一次深度报告生成。' : '非会员用户每次邀请赠送三次对话额度。' }}参与话题挑战领取的「免费高级会员」适用。</text>

      <view class="stats-row">
        <!-- <view class="stat-item">
          <text class="stat-limit">封顶 1000%</text>
          <view class="stat-icon-wrapper">
            <u-icon name="hourglass" size="40" color="#1e293b"></u-icon>
          </view>
          <text class="stat-value">+0%</text>
          <text class="stat-label">记忆上限</text>
        </view> -->
        
        <view class="stat-item highlight">
          <!-- <view class="member-tag">会员专属</view> -->
          <text class="stat-limit">无限累计</text>
          <view class="stat-icon-wrapper">
            <u-icon name="gift-fill" size="40" color="#1e293b"></u-icon>
          </view>
          <text class="stat-value">{{ isLoading ? '...' : tokenBalance }}</text>
          <text class="stat-label">赠送算力</text>
        </view>
        
        <view class="stat-item">
          <text class="stat-limit">封顶 3 次</text>
          <view class="stat-icon-wrapper">
            <u-icon name="coupon" size="40" color="#1e293b"></u-icon>
          </view>
          <text class="stat-value">{{ freeDeepSessions }}</text>
          <text class="stat-label">深度诊断</text>
        </view>
      </view>
      
      <text class="footer-note">注意：数据更新可能有一天的延迟，请耐心等待~</text>
    </view>
    
    <!-- Bottom Space -->
    <view class="bottom-spacer"></view>
  </CommonPopup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { userStore } from '@/store/user';
import CommonPopup from '@/components/CommonPopup.vue';
import { fetchSystemUserInfo, fetchMembershipInfo, fetchApplyInvite } from '@/api/services';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'open-upgrade']);

const tokenBalance = ref(0);
// const freeDeepSessions = ref(0); // Can access via systemUser
const isLoading = ref(false);

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const systemUser = computed(() => userStore.systemUser);
const userId = computed(() => systemUser.value?.id || '67B7DE89');
const inviteCode = computed(() => (systemUser.value as any)?.invite_code || userId.value); // Fallback to ID if no code
const isPro = computed(() => !!systemUser.value?.is_vip);
const userName = computed(() => systemUser.value?.nickname || '用户');
const freeDeepSessions = computed(() => (systemUser.value as any)?.free_deep_sessions_total || 0);

const loadData = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const userInfoRes = await fetchSystemUserInfo();
    if (userInfoRes) {
       // Update store if needed, or just rely on the response if we were not using store for everything
       // The fetchSystemUserInfo might not update store automatically unless called via an action that does so.
       // Looking at doLogin in auth.ts (not visible here), usually it updates store.
       // Let's manually update store here to be safe and reactive
       const data = (userInfoRes as any).data || userInfoRes;
       userStore.setSystemUser({ ...userStore.systemUser, ...data });
    }
    
    const membershipInfo = await fetchMembershipInfo() as any;
    if (membershipInfo) {
       const data = membershipInfo.data || membershipInfo;
       tokenBalance.value = data.token_balance;
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

// closePopup function removed as it is handled by CommonPopup

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
        uni.showLoading({ title: '兑换中...' });
        try {
          await fetchApplyInvite(res.content);
          uni.showToast({ title: '兑换成功', icon: 'success' });
          loadData(); // Refresh data
        } catch (error: any) {
          // Error is handled by interceptor usually, but we can log
          console.error('Invite failed', error);
          uni.showToast({ title: error.message || '兑换失败', icon: 'none' });
        } finally {
          uni.hideLoading();
        }
      }
    }
  });
};
</script>

<style lang="scss" scoped>
/* Removed popup-container, popup-header, btn-circle styles */

/* .header-extra-spacer removed */

.user-info-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
  /* Add padding top to align with design if needed, but CommonPopup handles top offset */
  margin-top: 10rpx; 
}

.avatar-wrapper {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background-color: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .avatar-text {
    font-size: 40rpx;
    font-weight: 600;
    color: #4f46e5;
  }
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.user-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}

.user-id-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.user-id {
  font-size: 24rpx;
  color: #64748b;
}

.copy-tag {
  display: flex;
  align-items: center;
  gap: 4rpx;
  background-color: #f1f5f9;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  
  .copy-text {
    font-size: 20rpx;
    color: #64748b;
  }
}

/* Close Button Style from step/index */
.btn-circle {
  width: 80rpx;
  height: 80rpx;
  border-radius: 9999px;
  background-color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.icon-close {
  font-size: 56rpx;
  margin-top: -4rpx;
  font-weight: 300;
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding: 32rpx;
  box-sizing: border-box;
}

/* VIP Section */
.vip-section {
  background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%);
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
}

.vip-header {
  margin-bottom: 24rpx;
}

.vip-badge {
  display: inline-flex;
  padding: 6rpx 16rpx;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 12rpx;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4rpx 12rpx rgba(255, 255, 255, 0.3);
}

.vip-badge-text {
  font-size: 22rpx;
  color: #6366f1;
  font-weight: 600;
}

/* VIP Features */
.vip-features {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24rpx;
}

.feature-item {
  font-size: 22rpx;
  color: #64748b;
}

.restore-btn {
  font-size: 22rpx;
  color: #6366f1;
  font-weight: 500;
}

.activate-btn {
  background: #ffffff;
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 600;
  padding: 0 48rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 36rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  margin: 0;
  &::after {
    border: none !important;
  }
}

.vip-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.vip-title {
  font-size: 40rpx;
  font-weight: 800;
  color: #1e1b4b;
  line-height: 1.2;
}

.vip-subtitle {
  font-size: 26rpx;
  color: #475569;
  display: block;
  margin-bottom: 32rpx;
}

/* Invite Card */
.invite-card {
  background-color: #fff;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 40rpx;
}

.invite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.code-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.invite-code {
  font-size: 40rpx;
  font-weight: 700;
  color: #1e293b;
}

.copy-btn-small {
  display: flex;
  align-items: center;
  gap: 4rpx;
  background-color: #f1f5f9;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  
  .copy-text-small {
    font-size: 20rpx;
    color: #64748b;
  }
}

.fill-code-btn {
  background-color: #f1f5f9;
  color: #1e293b;
  font-size: 28rpx;
  font-weight: 600;
  padding: 0 32rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 999px;
  margin: 0;
  &::after {
    border: none !important;
  }
}

.invite-status {
  font-size: 28rpx;
  color: #334155;
  display: block;
  margin-bottom: 16rpx;
}

.invite-desc {
  font-size: 22rpx;
  color: #94a3b8;
  line-height: 1.5;
  display: block;
  margin-bottom: 32rpx;
}

.stats-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.stat-item {
  flex: 1;
  background-color: #f8fafc;
  border-radius: 24rpx;
  padding: 24rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  
  &.highlight {
    background-color: #fff;
    border: 1px solid #f1f5f9;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  }
}

.member-tag {
  position: absolute;
  top: -12rpx;
  background-color: #1e293b;
  color: #fff;
  font-size: 18rpx;
  padding: 4rpx 12rpx;
  border-radius: 999px;
}

.stat-limit {
  font-size: 20rpx;
  color: #94a3b8;
  margin-bottom: 16rpx;
}

.stat-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.highlight .stat-icon-wrapper {
  background-color: #f1f5f9;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4rpx;
}

.stat-label {
  font-size: 20rpx;
  color: #64748b;
}

.footer-note {
  font-size: 20rpx;
  color: #94a3b8;
  text-align: center;
  display: block;
}

.bottom-spacer {
  height: 40rpx;
}
</style>
