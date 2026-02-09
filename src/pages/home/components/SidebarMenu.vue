<template>
  <view class="sidebar-container">
    <!-- Explore Section -->
    <view class="menu-section">
      <text class="menu-title">发现</text>
      
      <view 
        class="discovery-item" 
        :class="{ active: currentRoute === 'chat' }"
        @click="navigateToChat"
      >
        <!-- <view class="icon-box">
           <u-icon name="chat" size="36" color="#6366f1"></u-icon>
        </view> -->
        <text class="item-text" :class="{ 'active-text': currentRoute === 'chat' }">聊天</text>
      </view>

      <view 
        class="discovery-item" 
        :class="{ active: currentRoute === 'explore' }"
        @click="navigateToNewWorld"
      >
        <!-- <view class="icon-box">
           <u-icon name="flask" size="36" color="#6366f1"></u-icon>
        </view> -->
        <text class="item-text" :class="{ 'active-text': currentRoute === 'explore' }">探索中心</text>
      </view>
    </view>

    <!-- Profiles List Section -->
    <view class="recent-section">
      <view class="recent-header">
        <text class="section-title">我的档案库</text>
        <view class="add-btn" @click="navigateToAddProfile">
          <u-icon name="plus" :size="28" color="#4f46e5" style="font-weight: 700;" />
          <!-- <text class="add-text">添加</text> -->
        </view>
      </view>

      <!-- Profiles List -->
      <scroll-view scroll-y :show-scrollbar="false" class="profiles-list" v-if="profiles.length > 0">
        <view
          v-for="(item, index) in profiles"
          :key="item.id"
          class="profile-item" 
          :class="{ active: isActive(item), 'menu-active': activeMenuId === item.id }" 
          @click="switchProfile(item)"
        >
          <view v-if="isActive(item)" class="active-dot"></view>

          <view class="profile-info">
            <view class="name-row">
              <text class="profile-name">{{ item.name }}</text>
              <view v-if="item.is_self" class="self-tag">我</view>
            </view>
            <text class="profile-desc">{{ item.gender === 'male' || item.gender === '男' ? '男' : '女' }} · {{ item.birth_date }}</text>
          </view>
          
          <view class="more-btn" @click.stop="handleMoreClick(item)">
            <u-icon name="more-dot-fill" size="16px" color="#94a3b8"></u-icon>
            
            <!-- Dropdown Menu -->
            <template v-if="activeMenuId === item.id">
              <view class="menu-mask-fixed" @click.stop="closeMenu"></view>
              <view class="dropdown-menu" @click.stop>
                <view class="dropdown-item" @click.stop="handleToggleSelf(item)">
                  <text class="dropdown-text">{{ item.is_self ? '解除本人' : '设为本人' }}</text>
                </view>
                <view class="dropdown-divider"></view>
                <view class="dropdown-item delete" @click.stop="handleDelete(item)">
                  <text class="dropdown-text">删除</text>
                </view>
              </view>
            </template>
          </view>
        </view>
      </scroll-view>

      <!-- Empty State -->
      <view class="empty-state" v-else>
        <view class="empty-icon-wrapper">
          <u-icon name="file-text" size="64" color="#cbd5e1"></u-icon>
        </view>
        <text class="empty-title">暂无档案</text>
        <text class="empty-desc">添加档案开始对话</text>
        <button class="add-profile-btn" @click="navigateToAddProfile">立即添加</button>
      </view>
    </view>

    <!-- Trial Card -->
    <!-- <TrialCard 
      v-if="systemUser?.trial_end_at"
      :start-time="systemUser?.trial_start_at"
      :end-time="systemUser?.trial_end_at"
    /> -->

    <!-- Footer User Info -->
    <view class="sidebar-footer" @click="openUserCenter">
      <view class="user-row">
        <view class="avatar">
          <text class="avatar-text">{{ systemUser?.nickname?.[0] || 'User' }}</text>
        </view>
        <view class="user-details">
          <text class="user-name">{{ systemUser?.nickname || '未登录' }}</text>
          <text class="user-status">{{ systemUser?.is_vip ? 'VIP用户' : '' }}</text>
        </view>
        <view class="settings-icon">
          <u-icon name="setting-fill" color="#cbd5e1" size="40"></u-icon>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { userStore, type UserInfo } from '@/store/user';
import { fetchProfilesList, fetchDeleteProfile, fetchSystemUserInfo, fetchUpdateSelfStatus } from '@/api/services';
import TrialCard from './TrialCard.vue';

const props = defineProps<{
  currentProfile?: UserInfo | null;
}>();

const emit = defineEmits(['open-user-center', 'switch-profile', 'open-fortune']);

  const systemUser = computed(() => userStore.systemUser);
  const currentUserId = computed(() => props.currentProfile?.id);

  const profiles = ref<any[]>([]);
  const activeMenuId = ref<string | null>(null);
  const currentRoute = ref('chat');

  const displayProfile = computed(() => {
    return props.currentProfile || userStore.userInfo || (profiles.value.length > 0 ? profiles.value[0] : null);
  });

  const openFortune = () => {
    emit('open-fortune');
  };

  const isActive = (item: any) => {
  if (!currentUserId.value || !item.id) return false;
  return String(currentUserId.value) === String(item.id);
};

const isSelfProfile = (item: any) => {
  return item.is_self;
};

const loadProfiles = async () => {
  try {
    const res: any = await fetchProfilesList();
    if (res.data) {
      // Handle both { data: [...] } and { data: { items: [...] } }
      const list = Array.isArray(res.data) ? res.data : (res.data.items || []);
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
  uni.navigateTo({
    url: '/pages/step/index'
  });
};

const openUserCenter = () => {
  uni.showToast({
    title: '功能正在开发',
    icon: 'none'
  });
  // emit('open-user-center');
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
          const index = profiles.value.findIndex(p => p.id === profile.id);
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
              const nextIndex = index < profiles.value.length ? index : index - 1;
              const nextProfile = profiles.value[nextIndex];
              if (nextProfile) {
                 emit('switch-profile', nextProfile);
              }
            } else {
              // No profiles left, reload
              setTimeout(() => {
                uni.reLaunch({
                  url: '/pages/home/index'
                });
              }, 500);
            }
          }
        } catch (error) {
          uni.hideLoading();
          uni.showToast({ title: '删除失败', icon: 'none' });
        }
      }
    }
  });
};

onMounted(() => {
  loadProfiles();
  loadSystemUser();
  
  const pages = getCurrentPages();
  const page = pages[pages.length - 1];
  if (page && page.route) {
    if (page.route.includes('new-world')) {
      currentRoute.value = 'explore';
    } else {
      currentRoute.value = 'chat';
    }
  }
});

const navigateToNewWorld = () => {
  uni.showToast({
    title: '功能正在开发',
    icon: 'none'
  });
};

const navigateToChat = () => {
  uni.reLaunch({
    url: '/pages/home/index'
  });
};

const navigateToHistory = () => {
  uni.navigateTo({
    url: '/pages/chat-history/index'
  });
};
</script>

<style lang="scss" scoped>
/* Discovery Section Styles */
.menu-title {
  font-size: 24rpx;
  color: #64748b;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 24rpx;
  display: block;
  margin-left: 8rpx;
}

.discovery-item {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  border-radius: 999px; /* Pill shape */
  margin-bottom: 16rpx;
  transition: all 0.2s;
  
  &.active {
    background-color: #f1f5f9; /* Light gray background */
  }

  &:active {
    opacity: 0.8;
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
  font-size: 30rpx;
  font-weight: 500;
  
  &.active-text {
    color: #6366f1; /* Indigo/Purple */
    font-weight: 800;
    font-size: 34rpx;
  }
  
  &.gray-text {
    color: #94a3b8; /* Slate gray */
  }
}

.sidebar-container {
  width: 100%;
  height: 100%;
  background-color: #fff;
  padding: 40rpx 32rpx;
  /* Add padding for status bar */
  padding-top: calc(var(--status-bar-height) + 40rpx);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4rpx;
  
  .self-tag {
    font-size: 10px;
    color: #fff;
    background: #6366f1;
    padding: 1px 4px;
    border-radius: 4px;
    line-height: 1.2;
  }
}

/* Menu Section */
.menu-section {
  margin-bottom: 32rpx;
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
  font-size: 30rpx;
  font-weight: 500;
  color: #334155;
}

/* Recent Section (Now Profiles) */
.recent-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* For scroll-view */
  position: relative;
  z-index: 1;
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 24rpx;
  color: #64748b;
  font-weight: 700;
  letter-spacing: 2px;
}

.add-btn {
  display: flex;
  align-items: center;
  padding: 16rpx;
  border-radius: 999px;
  background-color: #eef2ff;
}

.add-text {
  font-size: 24rpx;
  color: #94a3b8;
  margin-left: 4rpx;
}

.profiles-list {
  flex: 1;
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
  padding: 24rpx 16rpx;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  transition: all 0.2s;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  
  &:active {
    background-color: #f8fafc;
  }
  
  &.active {
    background: rgba(224, 231, 255, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    // border: 1px solid rgba(255, 255, 255, 0.5);
  }
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.profile-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1e293b;
  // margin-bottom: 4rpx;
}

.profile-desc {
  font-size: 24rpx;
  color: #94a3b8;
}

.active-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #6366f1;
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
  width: 120rpx;
  height: 120rpx;
  background-color: #f1f5f9;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #94a3b8;
  margin-bottom: 32rpx;
}

.add-profile-btn {
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
  background-color: #4f46e5;
  border-radius: 12px;
  padding: 0 48rpx;
  line-height: 80rpx;
  border: none;
  
  &:active {
    opacity: 0.9;
  }
  &::after {
    border: none !important;
  }
}

/* Footer */
.sidebar-footer {
  margin-top: auto;
  padding-top: 32rpx;
  border-top: 1px solid #f1f5f9;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .avatar-text {
    font-size: 32rpx;
    color: #4f46e5;
    font-weight: 600;
  }
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e293b;
}

.user-status {
  font-size: 22rpx;
  color: #94a3b8;
}

.settings-icon {
  padding: 12rpx;
}

/* Dropdown Menu Styles */
.menu-mask-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background-color: transparent;
}

.profile-item.menu-active {
  z-index: 100;
  background-color: #f1f5f9;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200rpx;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  padding: 8rpx 0;
  z-index: 101;
  margin-top: 8rpx;
  border: 1px solid #f1f5f9;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  transition: all 0.2s;
  
  &:active {
    background-color: #f8fafc;
  }
  
  &.delete {
    color: #f43f5e;
  }
}

.dropdown-text {
  font-size: 28rpx;
}

.dropdown-divider {
  height: 1px;
  background-color: #f1f5f9;
  margin: 4rpx 0;
}
</style>
