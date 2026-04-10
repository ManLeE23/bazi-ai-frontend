<template>
  <view class="explore-page">
    <!-- Ambient Background Elements -->
    <view class="aura-blob aura-blob-top"></view>
    <view class="aura-blob aura-blob-bottom"></view>
    <HeaderBar :showBack="false" :fixed="false" :placeholder="false" backgroundColor="transparent">
      <template #left>
        <button class="nav-icon-btn" @click="showSidebar = true">
          <view class="hamburger-icon">
            <view class="bar long"></view>
            <view class="bar short"></view>
          </view>
        </button>
      </template>
      <template #center>
        <button class="profile-switch-btn" @tap="showProfilePopup = true">
          <text class="profile-switch-text">{{ currentProfileName }}</text>
          <u-icon name="arrow-down" size="24" color="#94a3b8"></u-icon>
        </button>
      </template>
    </HeaderBar>

    <view class="container">
      <TrendSummaryCard />
      <RecentQuestionBanner />
      
      <!-- 洞察中心 (Insight Center) -->
      <view class="feature-section insight-center">
        <view class="section-header">
          <text class="section-title">洞察中心</text>
        </view>
        <scroll-view class="insight-scroll" scroll-x="true" :show-scrollbar="false">
          <view class="horizontal-list">
            <!-- 知势 -->
            <view class="insight-card border-trend" @click="navigateTo('trend')">
              <view class="icon-box">
                <image 
                  src="https://api.dicebear.com/7.x/personas/svg?seed=zhishi_trend_v6&backgroundColor=e0e7ff&facialHairProbability=0&hair=fade&eyes=open&mouth=smile&body=squared&clothingColor=7c4dff&hairColor=362c47&skinColor=eeb4a4" 
                  class="avatar-icon"
                  mode="aspectFit"
                />
              </view>
              <view class="card-text-content">
                <text class="card-title">知势</text>
                <text class="card-desc">看清人生阶段与方向</text>
              </view>
            </view>

            <!-- 知心 -->
            <view class="insight-card border-emo" @click="navigateTo('emo')">
              <view class="icon-box">
                <image 
                  src="https://api.dicebear.com/7.x/personas/svg?seed=zhixin_emo_v5&backgroundColor=fce7f3&facialHairProbability=0&hair=long&eyes=open&mouth=smile&body=rounded&clothingColor=fb7185&hairColor=362c47&skinColor=eeb4a4" 
                  class="avatar-icon"
                  mode="aspectFit"
                />
              </view>
              <view class="card-text-content">
                <text class="card-title">知心</text>
                <text class="card-desc">理解关系、情绪、沟通</text>
              </view>
            </view>

            <!-- 知业 -->
            <view class="insight-card border-biz" @click="navigateTo('biz')">
              <view class="icon-box">
                <image 
                  src="https://api.dicebear.com/7.x/personas/svg?seed=zhiye_career_v4&backgroundColor=fef3c7&facialHairProbability=0&hair=bobBangs&eyes=open&mouth=smirk&body=squared&clothingColor=456dff&hairColor=362c47&skinColor=eeb4a4" 
                  class="avatar-icon"
                  mode="aspectFit"
                />
              </view>
              <view class="card-text-content">
                <text class="card-title">知业</text>
                <text class="card-desc">分析事业选择与成长路径</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 自我探索 (Self Exploration) -->
      <view class="feature-section self-explore">
        <text class="section-title">自我探索</text>
        
        <view class="vertical-list">
          <!-- MBTI -->
          <view class="explore-card" @click="navigateTo('mbti')">
            <view class="card-left-group">
              <view class="icon-box mbti-icon-bg">
                <text style="font-size: 26rpx; font-weight: 900; color: #7C4DFF; letter-spacing: 1rpx;">MBTI</text>
              </view>
              <view class="card-text-content">
                <view class="title-row">
                  <text class="card-title">MBTI</text>
                  <text class="tag-new">NEW</text>
                </view>
                <text class="card-desc">深层人格特质解析</text>
              </view>
            </view>
            <u-icon name="arrow-right" size="32" color="#cbd5e1"></u-icon>
          </view>

          <!-- 个人档案 -->
          <view class="explore-card" @click="navigateTo('bazi')">
            <view class="card-left-group">
              <view class="icon-box profile-icon-bg">
                <image :src="userAvatar" class="profile-img-small" mode="aspectFill" />
              </view>
              <view class="card-text-content">
                <text class="card-title">个人档案</text>
                <text class="card-desc">了解你的能量特质与潜能</text>
              </view>
            </view>
            <u-icon name="arrow-right" size="32" color="#cbd5e1"></u-icon>
          </view>
        </view>
      </view>

      <!-- <view class="footer">
        <text class="footer-text">© 2024 Transcendental Ether</text>
      </view> -->
    </view>

    <!-- Custom Sidebar Implementation -->
    <!-- Mask -->
    <view 
      class="sidebar-overlay" 
      :class="{ 'show': showSidebar }" 
      @click="showSidebar = false"
      @touchmove.stop.prevent
    ></view>

    <!-- Sidebar Panel -->
    <view 
      class="sidebar-panel" 
      :class="{ 'show': showSidebar }"
    >
      <view class="sidebar-wrapper-fixed">
        <SidebarMenu 
          class="sidebar-menu-root"
          :current-profile="userInfo"
          @open-user-center="handleOpenUserCenter" 
          @switch-profile="handleSwitchProfile" 
          @open-upgrade="handleOpenUpgrade"
        />
      </view>
    </view>

    <!-- User Center Popup -->
    <UserCenterPopup v-model="showUserPopup" @open-upgrade="handleOpenUpgrade" />

    <!-- Upgrade Popup -->
    <UpgradePopup v-model="showUpgradePopup" />

    <!-- Profile Selection Popup -->
    <ProfileSelectionPopup v-model="showProfilePopup" @select="handleSwitchProfile" />

    <!-- Profile Switching State -->
    <ProfileSwitchingState v-if="isSwitchingProfile" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { userStore } from '@/store/user';
import { fetchProfilesList, fetchSystemUserInfo, fetchBaziCalculate } from '@/api/services';
import HeaderBar from '@/components/HeaderBar.vue';
import TrendSummaryCard from './components/TrendSummaryCard.vue';
import RecentQuestionBanner from './components/RecentQuestionBanner.vue';
import PromoCard from './components/PromoCard.vue';
import ImmersiveCard from './components/ImmersiveCard.vue';
import SidebarMenu from '@/components/SidebarMenu.vue';
import UserCenterPopup from '@/pages/chat/components/UserCenterPopup.vue';
import UpgradePopup from '@/pages/chat/components/UpgradePopup.vue';
import ProfileSwitchingState from '@/pages/chat/components/ProfileSwitchingState.vue';
import ProfileSelectionPopup from '@/components/ProfileSelectionPopup.vue';
import { useShare } from '@/hooks/useShare';
import { useSWR } from '@/hooks/useSWR';

const { shareConfig, loadShareConfig } = useShare();
loadShareConfig();

onShareAppMessage(() => {
  return {
    title: shareConfig.value.title,
    path: shareConfig.value.path,
    imageUrl:shareConfig.value.imageUrl,
  };
});

onShareTimeline(() => {
  const query = shareConfig.value.path.split('?')[1] || '';
  return {
    title: shareConfig.value.title,
    query: query,
    imageUrl:shareConfig.value.imageUrl,
  };
});

// Pre-fetch Bazi data for current profile using SWR
// This ensures we have the data cached when navigating to Bazi details
// The SWR implementation handles caching policy (only keeping current profile in storage)
const baziData = useSWR(
  () => userStore.userInfo?.id ? `/api/bazi/calculate/profile/${userStore.userInfo.id}` : null,
  () => {
    if (!userStore.userInfo?.id) return Promise.resolve(null);
    return fetchBaziCalculate(userStore.userInfo.id);
  },
  {
    revalidateOnFocus: true, // Revalidate on focus to ensure data is fresh
    dedupingInterval: 60000 // 1 minute deduping
  }
);

onShow(async () => {
  // Always sync with store on show to catch newly created profiles
  const token = uni.getStorageSync('token');
  
  if (token) {
    if (!userStore.systemUser) {
      try {
        const res: any = await fetchSystemUserInfo();
        if (res.code === 200 && res.data) {
          userStore.setSystemUser(res.data);
        }
      } catch (e) {
        console.error('Fetch system user failed', e);
      }
    }

    try {
      const res: any = await fetchProfilesList();
      const items = res.data?.items || [];
      if (items.length > 0) {
        // Update profiles list in store if available
        if (userStore.setProfiles) {
          userStore.setProfiles(items);
        }
        
        if (!userStore.userInfo) {
          const self = items.find((p: any) => p.is_self);
          if (self) {
            userStore.setUserInfo(self);
            if (userStore.setSelfProfileId) {
              userStore.setSelfProfileId(self.id);
            }
          } else {
            userStore.setUserInfo(items[0]);
          }
        } else {
          // If we already have a selected user, make sure it's up to date with the latest list
          const updatedUser = items.find((p: any) => p.id === userStore.userInfo?.id);
          if (updatedUser) {
            userStore.setUserInfo(updatedUser);
          }
        }
      }
    } catch (e) {
      console.error('Fetch profiles failed', e);
    }
  }
});

const showSidebar = ref(false);
const showUserPopup = ref(false);
const showUpgradePopup = ref(false);
const showProfilePopup = ref(false);
const isSwitchingProfile = ref(false);

const userInfo = computed({
  get: () => userStore.userInfo,
  set: (val) => {
    if (val) {
      userStore.setUserInfo(val);
    } else {
      userStore.clearUserInfo();
    }
  }
});

const currentProfileName = computed(() => {
  if (userStore.userInfo?.is_self) return '本人';
  const token = uni.getStorageSync('token');
  if (token && !userStore.userInfo?.name) {
    return '填写档案';
  }
  return userStore.userInfo?.name || '未登录';
});

const userAvatar = computed(() => {
  return 'https://api.dicebear.com/7.x/initials/svg?seed=BAZI&backgroundColor=f1f5f9&textColor=632ce5&fontSize=48&fontWeight=800';
});

const handleOpenUserCenter = () => {
  showSidebar.value = false;
  showUserPopup.value = true;
};

const handleOpenUpgrade = () => {
  showSidebar.value = false;
  showUserPopup.value = false;
  showUpgradePopup.value = true;
};

const handleSwitchProfile = async (profile: any) => {
  if (userInfo.value && userInfo.value.id === profile.id) {
    showSidebar.value = false;
    showProfilePopup.value = false;
    return;
  }

  showSidebar.value = false;
  showProfilePopup.value = false;
  isSwitchingProfile.value = true;

  // Simulate switching delay
  setTimeout(() => {
     userInfo.value = profile;
     isSwitchingProfile.value = false;
     // Since TrendSummaryCard listens to userStore (presumably), it should update automatically.
     // If not, we might need to trigger a refresh here.
  }, 500);
};

const navigateTo = (type: string) => {
  let agentType = '';
  switch (type) {
    case 'trend':
      agentType = 'life_trend';
      break;
    case 'emo':
      agentType = 'emotion';
      break;
    case 'biz':
      agentType = 'career';
      break;
    case 'bazi':
      if (!userStore.userInfo?.id) {
        uni.showToast({
          title: '请先登录或创建档案',
          icon: 'none'
        });
        return;
      }
      uni.navigateTo({
        url: `/pages/qushi/detail?id=${userStore.userInfo.id}`
      });
      return;
    case 'mbti':
      uni.navigateTo({ url: '/pages/mbti/index' });
      // uni.showToast({
      //   title: '功能开发中',
      //   icon: 'none'
      // });
      return;
    default:
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      });
      return;
  }
  
  uni.navigateTo({
    url: `/pages/chat/index?agentType=${agentType}`
  });
};
</script>

<style lang="scss" scoped>
.explore-page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #F8F9FF; /* Transcendental Ether base */
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  position: relative;
}

/* Ambient Background Blobs (Matched to welcome.html) */
.aura-blob {
  position: absolute;
  width: 1200rpx;
  height: 1200rpx;
  background: radial-gradient(circle, rgba(124, 77, 255, 0.12) 0%, rgba(124, 77, 255, 0) 70%);
  filter: blur(160rpx);
  z-index: 0;
  pointer-events: none;
}

.aura-blob-top {
  top: -300rpx;
  right: -300rpx;
}

.aura-blob-bottom {
  bottom: -300rpx;
  left: -300rpx;
}

.container {
  flex: 1;
  height: 0;
  overflow-y: auto;
  padding: 32rpx 32rpx 0 32rpx;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.feature-section {
  margin: 48rpx 0;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #191C20;
}

.section-action {
  font-size: 28rpx;
  font-weight: 700;
  color: #7C4DFF;
}

.vertical-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.insight-scroll {
  width: 100%;
  white-space: nowrap;
  /* Add padding to allow box-shadow to show without clipping */
  padding-bottom: 32rpx;
  margin-bottom: -32rpx;
}

.horizontal-list {
  display: inline-flex;
  gap: 24rpx;
  padding: 8rpx 4rpx;
}

.insight-card {
  width: 500rpx;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24rpx;
  padding: 24rpx;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 16rpx 32rpx rgba(124, 77, 255, 0.04);
  transition: transform 0.2s;
  box-sizing: border-box;
  white-space: normal;
  flex-shrink: 0;
  
  &:active {
    transform: scale(0.98);
  }
}

.card-text-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.border-trend { border-left: 6rpx solid #7C4DFF; }
.border-emo { border-left: 6rpx solid #6451a3; }
.border-biz { border-left: 6rpx solid #b55800; }

.color-trend { background: rgba(124, 77, 255, 0.1); color: #7C4DFF; }
.color-emo { background: rgba(100, 81, 163, 0.1); color: #6451a3; }
.color-biz { background: rgba(181, 88, 0, 0.1); color: #b55800; }

.icon-box {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
  flex-shrink: 0;
  overflow: hidden;
  background-color: transparent; /* Reset any default backgrounds */
}

.avatar-icon {
  width: 100%;
  height: 100%;
  border-radius: 24rpx; /* Ensure image respects the border radius */
  will-change: transform; /* Prevent clipping bugs in some WebViews */
}

.insight-card:active .icon-box {
  transform: scale(1.1);
}

.card-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #191C20;
  margin-bottom: 6rpx;
}

.card-desc {
  font-size: 24rpx;
  color: #94a3b8;
  line-height: 1.4;
}

/* Self Explore */
.explore-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 32rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 16rpx 32rpx rgba(124, 77, 255, 0.04);
  transition: transform 0.2s;
  box-sizing: border-box;

  &:active {
    transform: scale(0.98);
  }
}

.card-left-group {
  display: flex;
  align-items: center;
  gap: 32rpx;
  flex: 1;
}

.mbti-icon-bg {
  background: linear-gradient(135deg, rgba(124, 77, 255, 0.1), rgba(124, 77, 255, 0.05));
  box-shadow: inset 0 2rpx 8rpx rgba(124, 77, 255, 0.1);
}

.profile-icon-bg {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  box-shadow: inset 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.mbti-img-small {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  object-fit: contain;
}

.profile-img-small {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.tag-new {
  background: rgba(124, 77, 255, 0.1);
  color: #7C4DFF;
  font-size: 16rpx;
  font-weight: 800;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  text-transform: uppercase;
}

.footer {
  padding: 64rpx 0;
  text-align: center;
}

.footer-text {
  font-size: 24rpx;
  color: #7a7487;
  text-transform: uppercase;
  letter-spacing: 4rpx;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

/* Top Navigation Styles */
.nav-icon-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  margin: 0;
  padding: 0;
  transition: transform 0.2s;

  &::after { border: none; }
  &:active { transform: scale(0.95); }
}

.hamburger-icon {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  align-items: flex-start;
}

.bar {
  height: 4rpx;
  background-color: #191c20;
  border-radius: 4rpx;
}

.bar.long {
  width: 36rpx;
}

.bar.short {
  width: 24rpx;
}

.profile-switch-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 0 32rpx;
  background: #ffffff;
  border-radius: 999rpx;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  margin: 0;
  transition: transform 0.2s;

  &::after { border: none; }
  &:active { transform: scale(0.95); }
}

.profile-switch-text {
  font-size: 28rpx;
  font-weight: 800;
  color: #1e293b;
}

.nav-right-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.sidebar-wrapper-fixed {
    height: 100%;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transform: translate3d(0, 0, 0);
    will-change: transform;
  }

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  pointer-events: none;

  &.show {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
}

.sidebar-panel {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 600rpx;
  background-color: #fff;
  z-index: 1001;
  transform: translate3d(-100%, 0, 0);
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 4rpx 0 16rpx rgba(0, 0, 0, 0.05);

  &.show {
    transform: translate3d(0, 0, 0);
  }
}

:deep(.sidebar-menu-root) {
  flex: 1;
  height: 100%;
}
</style>
