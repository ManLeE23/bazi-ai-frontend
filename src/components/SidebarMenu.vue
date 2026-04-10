<template>
  <view class="sidebar-container">
    <view class="aura-bg"></view>
    <!-- Global mask for dropdowns to avoid fixed positioning issues during transition -->
    <view 
      v-if="activeMenuId !== null" 
      class="menu-mask-absolute" 
      @click.stop="closeMenu"
      @touchmove.stop.prevent
    ></view>

    <!-- Explore Section -->
    <view class="menu-section">
      <text class="menu-title">发现</text>

      <view
        class="discovery-item"
        :class="{ active: currentRoute === 'feedback' }"
        @click="navigateToFeedback"
      >
        <text
          class="item-text"
          :class="{ 'active-text': currentRoute === 'feedback' }"
          >意见反馈</text
        >
      </view>

      <view
        class="discovery-item"
        :class="{ active: currentRoute === 'mbti' }"
        @click="navigateToMBTI"
      >
        <text
          class="item-text"
          :class="{ 'active-text': currentRoute === 'mbti' }"
          >MBTI 报告</text
        >
      </view>

      <!-- <view 
        class="discovery-item" 
        :class="{ active: currentRoute === 'invite' }"
        @click="navigateToInvite"
      >
        <text class="item-text" :class="{ 'active-text': currentRoute === 'invite' }">邀请好礼</text>
      </view> -->
    </view>

    <!-- Profiles List Section -->
    <view class="recent-section">
      <view class="recent-header">
        <text class="section-title">我的档案库</text>
        <view class="add-btn" @click="navigateToAddProfile">
          <u-icon
            name="plus"
            :size="32"
            color="#632ce5"
            style="font-weight: 700"
          />
          <!-- <text class="add-text">添加</text> -->
        </view>
      </view>

      <!-- Profiles List -->
      <view
        class="profiles-list"
        v-if="profiles.length > 0"
      >
        <view
          v-for="(item, index) in profiles"
          :key="item.id"
          class="profile-item"
          :class="{
            active: isActive(item),
            'menu-active': activeMenuId === item.id,
          }"
          @click="switchProfile(item)"
        >
          <view v-if="isActive(item)" class="active-dot"></view>

          <view class="profile-info">
            <view class="name-row">
              <text class="profile-name">{{ item.name }}</text>
              <view v-if="item.is_self" class="self-tag">我</view>
            </view>
            <text class="profile-desc"
              >{{
                item.gender === 'male' || item.gender === '男' ? '男' : '女'
              }}
              · {{ item.birth_date }}</text
            >
          </view>

          <view class="more-btn" @click.stop="handleMoreClick(item)">
            <u-icon name="more-dot-fill" size="16px" color="#94a3b8"></u-icon>

            <!-- Dropdown Menu -->
            <template v-if="activeMenuId === item.id">
              <view
                class="dropdown-menu"
                :class="{
                  'dropdown-up':
                    index >= profiles.length - 2 && profiles.length > 4,
                }"
                @click.stop
              >
                <view
                  class="dropdown-item"
                  @click.stop="handleToggleSelf(item)"
                >
                  <text class="dropdown-text">{{
                    item.is_self ? '解除本人' : '设为本人'
                  }}</text>
                </view>
                <view class="dropdown-divider"></view>
                <view
                  class="dropdown-item delete"
                  @click.stop="handleDelete(item)"
                >
                  <text class="dropdown-text">删除</text>
                </view>
              </view>
            </template>
          </view>
        </view>
      </view>

      <!-- Empty State -->
      <view class="empty-state" v-else>
        <view class="empty-icon-wrapper">
          <u-icon name="file-text" size="64" color="#cbd5e1"></u-icon>
        </view>
        <text class="empty-title">暂无档案</text>
        <text class="empty-desc">先建立一份档案，再开始趋势对话</text>
        <button class="add-profile-btn" @click="navigateToAddProfile">
          {{ emptyActionText }}
        </button>
      </view>
    </view>

    <view class="sidebar-footer">
      <view v-if="hasToken" class="user-row" @click="openUserCenter">
        <UserAvatar
          :name="systemUser?.nickname || 'User'"
          size="small"
          :shadow="false"
        />
        <view class="user-details">
          <text class="user-name">{{ systemUser?.nickname || '未登录' }}</text>
          <text class="user-status">
            {{
              systemUser?.membership_type === MembershipType.VIP
                ? '趋势会员'
                : '普通用户'
            }}
          </text>
        </view>
        <button v-if="isNormalUser" class="login-footer-btn" @click.stop="openUpgrade">
          升级
        </button>
      </view>

      <view v-else class="user-row">
        <UserAvatar :name="'U'" size="small" :shadow="false" />
        <view class="user-details">
          <text class="user-name">未登录</text>
        </view>
        <button class="login-footer-btn" @click.stop="navigateToLogin">
          登录
        </button>
      </view>

      <!-- <view class="disclaimer-text">
        本应用仅供娱乐和文化研究，不作为人生决策依据
      </view> -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { userStore, type UserInfo, MembershipType } from '@/store/user';
import UserAvatar from '@/components/UserAvatar.vue';
import {
  fetchProfilesList,
  fetchDeleteProfile,
  fetchSystemUserInfo,
  fetchUpdateSelfStatus,
} from '@/api/services';
import TrialCard from '@/pages/chat/components/TrialCard.vue';

const props = defineProps<{
  currentProfile?: UserInfo | null;
}>();

const emit = defineEmits([
  'open-user-center',
  'switch-profile',
  'open-fortune',
  'open-upgrade',
]);

const systemUser = computed(() => userStore.systemUser);
const currentUserId = computed(() => props.currentProfile?.id);

// Quota Computed Properties
const totalQuota = computed(() => systemUser.value?.free_quota_total ?? 5);
const usedQuota = computed(() => systemUser.value?.free_quota_used ?? 0);
const remainingQuota = computed(() =>
  Math.max(0, totalQuota.value - usedQuota.value),
);
const isQuotaExhausted = computed(
  () =>
    systemUser.value?.membership_type !== MembershipType.VIP &&
    remainingQuota.value <= 0,
);

const profiles = ref<any[]>([]);
const activeMenuId = ref<string | null>(null);
const currentRoute = ref('chat');

const hasToken = computed(() => {
  const token = uni.getStorageSync('token');
  return !!token;
});
const isNormalUser = computed(() => {
  return hasToken.value && systemUser.value?.membership_type !== MembershipType.VIP;
});

const emptyActionText = computed(() => {
  return hasToken.value ? '填写档案，开始对话' : '登录并填写档案';
});

const displayProfile = computed(() => {
  return (
    props.currentProfile ||
    userStore.userInfo ||
    (profiles.value.length > 0 ? profiles.value[0] : null)
  );
});

const isActive = (item: any) => {
  if (!currentUserId.value || !item.id) return false;
  return String(currentUserId.value) === String(item.id);
};

const loadProfiles = async () => {
  try {
    const res: any = await fetchProfilesList();
    if (res.data) {
      // Handle both { data: [...] } and { data: { items: [...] } }
      const list = Array.isArray(res.data) ? res.data : res.data.items || [];
      profiles.value = list;
    }
  } catch (error) {
    console.error('Failed to load profiles:', error);
  }
};

const loadSystemUser = async () => {
  try {
    const res: any = await fetchSystemUserInfo();
    if (res.data) {
      userStore.setSystemUser(res.data);
    }
  } catch (error) {
    console.error('Failed to load system user:', error);
  }
};

const navigateToAddProfile = () => {
  const token = uni.getStorageSync('token');
  if (!token && !systemUser.value) {
    uni.navigateTo({
      url: '/pages/login/index?redirect=step&from=sidebar',
    });
    return;
  }

  uni.navigateTo({
    url: '/pages/step/index',
  });
};

const openUserCenter = () => {
  emit('open-user-center');
};
const openUpgrade = () => {
  emit('open-upgrade');
};

const switchProfile = (profile: UserInfo) => {
  emit('switch-profile', profile);
  // uni.showToast({
  //   title: `已切换至 ${profile.name}`,
  //   icon: 'none'
  // });
  closeMenu();
};

const closeMenu = () => {
  activeMenuId.value = null;
};

const handleMoreClick = (profile: any) => {
  if (activeMenuId.value === profile.id) {
    activeMenuId.value = null;
  } else {
    activeMenuId.value = profile.id;
  }
};

const handleToggleSelf = async (profile: any) => {
  closeMenu();
  try {
    uni.showLoading({ title: '处理中' });
    if (profile.is_self) {
      await fetchUpdateSelfStatus(profile.id, false);
      if (userStore.selfProfileId === String(profile.id)) {
        userStore.setSelfProfileId('');
      }
      uni.showToast({ title: '已解除本人身份', icon: 'none' });
    } else {
      await fetchUpdateSelfStatus(profile.id, true);
      userStore.setSelfProfileId(String(profile.id));
      uni.showToast({ title: '已设置为本人', icon: 'none' });
    }
    await loadProfiles(); // Reload to update state
  } catch (error) {
    // Error is handled in request interceptor usually, but safe to catch here
    console.error('Toggle self failed:', error);
  } finally {
    uni.hideLoading();
  }
};

const handleDelete = (profile: any) => {
  closeMenu();

  if (profile.is_self) {
    uni.showToast({ title: '自己的档案不支持删除', icon: 'none' });
    return;
  }

  uni.showModal({
    title: '确认删除',
    content: `确定要删除 ${profile.name} 的档案吗？此操作不可恢复。`,
    success: async (modalRes) => {
      if (modalRes.confirm) {
        try {
          uni.showLoading({ title: '删除中' });
          await fetchDeleteProfile(profile.id);

          // Remove from list
          const index = profiles.value.findIndex((p) => p.id === profile.id);
          if (index > -1) {
            profiles.value.splice(index, 1);
          }

          uni.hideLoading();
          uni.showToast({ title: '删除成功', icon: 'none' });

          // If deleted current profile, switch to next or previous
          if (currentUserId.value === profile.id) {
            if (profiles.value.length > 0) {
              // Try to select the one at the same index (which was the next one)
              // If index is out of bounds (was the last one), select index - 1
              const nextIndex =
                index < profiles.value.length ? index : index - 1;
              const nextProfile = profiles.value[nextIndex];
              if (nextProfile) {
                emit('switch-profile', nextProfile);
              }
            } else {
              // No profiles left, reload
              setTimeout(() => {
                uni.reLaunch({
                  url: '/pages/chat/index',
                });
              }, 500);
            }
          }
        } catch (error) {
          uni.hideLoading();
          uni.showToast({ title: '删除失败', icon: 'none' });
        }
      }
    },
  });
};

onMounted(() => {
  loadProfiles();
  loadSystemUser();

  const pages = getCurrentPages();
  const page = pages[pages.length - 1];
  if (page && page.route) {
    if (page.route.includes('new-world') || page.route === 'pages/index/index') {
      currentRoute.value = 'explore';
    }
  }
});

const navigateToNewWorld = () => {
  uni.navigateTo({
    url: '/pages/index/index',
  });
};

const navigateToFeedback = () => {
  uni.navigateTo({
    url: '/pages/feedback/index',
  });
};

const navigateToMBTI = () => {
  uni.navigateTo({
    url: '/pages/mbti/list',
  });
};

const navigateToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/index?from=sidebar',
  });
};
</script>

<style lang="scss" scoped>
/* Discovery Section Styles */
.menu-title {
  font-size: 24rpx; /* label-md */
  color: #94a3b8;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 32rpx;
  display: block;
  margin-left: 24rpx;
}

.discovery-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  border-radius: 999px; /* Pill shape */
  margin-bottom: 24rpx;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &.active {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow: 0 20px 40px rgba(124, 77, 255, 0.06);
    /* outline: 0.5px solid rgba(202, 195, 216, 0.2); Removed to prevent rendering line artifacts */
    border: 1px solid rgba(202, 195, 216, 0.2);
  }

  &:active {
    transform: scale(0.98);
  }
}

.icon-box {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;

  &.transparent {
    background-color: transparent;
  }
}

.item-text {
  font-size: 32rpx; /* body-lg */
  font-weight: 500;
  color: #191c20;

  &.active-text {
    color: #632ce5; /* Primary */
    font-weight: 700;
  }

  &.gray-text {
    color: #94a3b8; /* Slate gray */
  }
}



.sidebar-container {
  width: 100%;
  height: 100%;
  background-color: #f8f9ff; /* surface */
  padding: 40rpx 32rpx;
  /* Add padding for status bar */
  padding-top: calc(var(--status-bar-height) + 40rpx);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.aura-bg {
  position: absolute;
  top: -200rpx;
  right: -200rpx;
  width: 800rpx;
  height: 800rpx;
  background-color: #632ce5;
  border-radius: 50%;
  filter: blur(200rpx);
  opacity: 0.12;
  pointer-events: none;
  z-index: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 4rpx;

  .self-tag {
    font-size: 20rpx; /* label-md-like */
    color: #fff;
    background: #632ce5; /* primary */
    padding: 2rpx 8rpx;
    border-radius: 8rpx;
    line-height: 1.2;
    font-weight: 600;
  }
}

/* Menu Section */
.menu-section {
  margin-bottom: 48rpx;
  position: relative;
  z-index: 1;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.menu-item-simple {
  padding: 20rpx 0;
  display: flex;
  align-items: center;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.6;
  }
}

.menu-text {
  font-size: 32rpx; /* body-lg */
  font-weight: 500;
  color: #191c20;
}

/* Recent Section (Now Profiles) */
.recent-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* For scroll-view */
  position: relative;
  /* z-index: 1; Removed to allow children (active profile) to pop above the global mask */
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
  padding-left: 24rpx;
}

.section-title {
  font-size: 24rpx; /* label-md */
  color: #94a3b8;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.add-btn {
  display: flex;
  align-items: center;
  padding: 16rpx;
  border-radius: 999px;
  background-color: transparent;
  color: #632ce5;
}

.add-text {
  font-size: 24rpx;
  color: #94a3b8;
  margin-left: 4rpx;
}

.profiles-list {
  flex: 1;
  min-height: 0; /* Fix for nested flex scrolling */
  overflow-y: auto;
  padding-bottom: 12px;

  /* Hide scrollbar specifically for this container */
  &::-webkit-scrollbar {
    display: none;
    width: 0 !important;
    height: 0 !important;
    background: transparent;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.profile-item {
  display: flex;
  align-items: center;
  padding: 32rpx 24rpx;
  border-radius: 48rpx; /* 3rem / 48rpx */
  margin-bottom: 24rpx;
  background-color: transparent;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  width: 100%;
  box-sizing: border-box;

  &:active {
    transform: scale(0.98);
  }

  &.active {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow: 0 20px 40px rgba(124, 77, 255, 0.06);
    /* outline: 0.5px solid rgba(202, 195, 216, 0.2); Removed to prevent rendering line artifacts */
    border: 1px solid rgba(202, 195, 216, 0.2);
  }
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.profile-name {
  font-size: 32rpx; /* body-lg */
  font-weight: 600;
  color: #191c20;
}

.profile-desc {
  font-size: 24rpx; /* label-md-like */
  color: #94a3b8;
}

.active-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #632ce5; /* primary */
  margin-right: 24rpx;
  flex-shrink: 0;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: inherit;
    animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    z-index: 1;
  }
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
  }
}

.more-btn {
  padding: 16rpx;
  box-sizing: border-box;
  margin-right: -16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &:active {
    opacity: 0.6;
  }
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 80rpx;
}

.empty-icon-wrapper {
  width: 160rpx;
  height: 160rpx;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #632ce5;
    border-radius: 50%;
    filter: blur(40rpx);
    opacity: 0.1;
    z-index: 0;
  }
  
  u-icon {
    position: relative;
    z-index: 1;
  }
}

.empty-title {
  font-size: 32rpx; /* body-lg */
  font-weight: 600;
  color: #191c20;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #94a3b8;
  margin-bottom: 48rpx;
}

.add-profile-btn {
  font-size: 24rpx; /* label-md */
  font-weight: 600;
  color: #ffffff;
  background-color: #7c4dff; /* primary_container */
  border-radius: 999rpx; /* rounded-full */
  padding: 0 48rpx;
  line-height: 80rpx;
  border: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:active {
    transform: scale(0.96);
  }
  &::after {
    border: none !important;
  }
}

/* Footer */
.sidebar-footer {
  margin-top: auto;
  padding-top: 48rpx;
  position: relative;
  z-index: 1;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 32rpx; /* body-lg */
  font-weight: 600;
  color: #191c20;
}

.user-status {
  font-size: 24rpx;
  color: #94a3b8;
}

.login-footer-btn {
  padding: 8rpx 32rpx;
  border-radius: 999rpx;
  background-color: #7c4dff; /* primary_container */
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 24rpx; /* label-md */
  font-weight: 600;
  color: #ffffff;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.login-footer-btn:active {
  transform: scale(0.96);
  opacity: 0.9;
}

.settings-icon {
  padding: 12rpx;
}

/* Dropdown Menu Styles */
.menu-mask-absolute {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99;
  background-color: transparent;
}

.profile-item.menu-active {
  z-index: 100;
  /* background-color: #f1f5f9; Removed gray background on click */
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 240rpx;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 24rpx;
  box-shadow: 0 20px 40px rgba(124, 77, 255, 0.06);
  outline: 0.5px solid rgba(202, 195, 216, 0.2);
  padding: 16rpx 0;
  z-index: 101;
  margin-top: 16rpx;
}

.dropdown-menu.dropdown-up {
  top: auto;
  bottom: 100%;
  margin-top: 0;
  margin-bottom: 16rpx;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  transition: all 0.2s;

  &:active {
    background-color: rgba(248, 250, 252, 0.5);
  }

  &.delete {
    color: #f43f5e;
  }
}

.dropdown-text {
  font-size: 28rpx;
  font-weight: 500;
}

.dropdown-divider {
  display: none; /* No 1px dividers per spec */
}

  // .disclaimer-text {
  //   margin-top: 20rpx;
  //   font-size: 20rpx;
  //   color: #94a3b8;
  //   text-align: center;
  //   line-height: 1.4;
  // }
</style>
