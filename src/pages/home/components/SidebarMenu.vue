<template>
  <view class="sidebar-container">
    <!-- Glow Effect -->
    <view class="glow-effect"></view>

    <!-- Mask for closing menu -->
    <view class="menu-mask" v-if="activeMenuId" @click="closeMenu"></view>

    <!-- Feature Placeholder -->
    <view class="feature-placeholder">
      <view class="placeholder-icon">
        <u-icon name="grid-fill" size="28" color="#CBD5E1"></u-icon>
      </view>
      <view class="placeholder-content">
        <text class="placeholder-title">更多功能</text>
        <text class="placeholder-desc">正在开发中...</text>
      </view>
    </view>

    <!-- Profiles List Section -->
    <view class="recent-section">
      <view class="recent-header">
        <text class="section-title">档案</text>
        <view class="add-btn" @click="navigateToAddProfile">
          <text class="add-text">添加</text>
        </view>
      </view>

      <!-- Profiles List -->
      <scroll-view scroll-y class="profiles-list" v-if="profiles.length > 0">
        <view
          v-for="(item, index) in profiles"
          :key="item.id"
          class="profile-item" 
          :class="{ active: isActive(item), 'menu-active': activeMenuId === item.id }" 
          @click="switchProfile(item)"
        >
          <view v-if="isActive(item)" class="active-dot"></view>

          <view class="profile-info">
            <text class="profile-name">{{ item.name }}</text>
            <text class="profile-desc">{{ item.gender === 'male' || item.gender === '男' ? '男' : '女' }} · {{ item.birth_date }}</text>
          </view>
          
          <view class="more-btn" @click.stop="handleMoreClick(item)">
            <u-icon name="more-dot-fill" size="16px" color="#94a3b8"></u-icon>
            
            <!-- Dropdown Menu -->
            <view class="dropdown-menu" v-if="activeMenuId === item.id" @click.stop>
              <view class="dropdown-item delete" @click.stop="handleDelete(item)">
                <u-icon name="trash" size="28" color="#f43f5e"></u-icon>
                <text class="dropdown-text">删除</text>
              </view>
            </view>
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
import { fetchProfilesList, fetchDeleteProfile, fetchSystemUserInfo } from '@/api/services';

const props = defineProps<{
  currentProfile?: UserInfo | null;
}>();

const emit = defineEmits(['open-user-center', 'switch-profile']);

const systemUser = computed(() => userStore.systemUser);
const currentUserId = computed(() => props.currentProfile?.id);

const profiles = ref<any[]>([]);
const activeMenuId = ref<string | null>(null);

const isActive = (item: any) => {
  if (!currentUserId.value || !item.id) return false;
  return String(currentUserId.value) === String(item.id);
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
  emit('open-user-center');
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

const handleDelete = (profile: any) => {
  closeMenu();
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
          
          // If deleted current profile, clear store or switch to another
          if (currentUserId.value === profile.id) {
            if (profiles.value.length > 0) {
              emit('switch-profile', profiles.value[0]);
            } else {
              // Emit null or empty object to indicate no profile
               emit('switch-profile', {} as UserInfo);
            }
          }
          
          uni.hideLoading();
          uni.showToast({ title: '删除成功', icon: 'success' });
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
});
</script>

<style lang="scss" scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  padding: 40rpx 32rpx;
  box-sizing: border-box;
  padding-top: 100rpx; /* Matches sidebar header space */
  position: relative;
  overflow: hidden;
}

/* Glow Effect */
.glow-effect {
  position: absolute;
  top: -100rpx;
  left: -100rpx;
  width: 500rpx;
  height: 500rpx;
  background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, rgba(79, 70, 229, 0) 70%);
  filter: blur(60px);
  z-index: 0;
  pointer-events: none;
}

/* Feature Placeholder */
.feature-placeholder {
  margin-bottom: 40rpx;
  // background: #F8FAFC;
  border-radius: 24rpx;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  // border: 2rpx dashed #E2E8F0;
}

.placeholder-icon {
  width: 80rpx;
  height: 80rpx;
  background-color: #F1F5F9;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0;
  margin-bottom: 16rpx;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.placeholder-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #94A3B8;
  margin-bottom: 4rpx;
}

.placeholder-desc {
  font-size: 24rpx;
  color: #CBD5E1;
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
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #334155;
}

.add-btn {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  border-radius: 999px;
  background-color: #f8fafc;
  
  &:active {
    background-color: #f1f5f9;
  }
}

.add-text {
  font-size: 24rpx;
  color: #94a3b8;
  margin-left: 4rpx;
}

.profiles-list {
  flex: 1;
  overflow-y: auto;
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
  margin-bottom: 4rpx;
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
  font-size: 24rpx;
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
.menu-mask {
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
  margin-left: 12rpx;
}
</style>
