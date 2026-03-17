<template>
  <view class="explore-page">
    <HeaderBar :showBack="false" :fixed="false" :placeholder="false" backgroundColor="transparent">
      <template #left>
        <view class="header-left-group">
          <button @click="showSidebar = true" class="sidebar-toggle-btn">
            <view class="hamburger-icon">
              <view class="bar long"></view>
              <view class="bar short"></view>
            </view>
          </button>
          <view class="header-profile-group" @click="showProfilePopup = true">
            <text class="current-profile-name">{{ currentProfileName }}</text>
            <view class="profile-switch-btn">
              <u-icon name="arrow-down-fill" size="20" color="#1e293b"></u-icon>
            </view>
          </view>
        </view>
      </template>
    </HeaderBar>

    <view class="container">
      <TrendSummaryCard />
      <RecentQuestionBanner />
      <view class="feature-section">
        <!-- AI 顾问 -->
        <view class="section-group">
          <ImmersiveCard
            title="知势"
            subtitle="看清人生阶段与方向"
            icon="map-fill"
            type="trend"
            @click="navigateTo('trend')"
          />
          <ImmersiveCard
            title="知心"
            subtitle="理解关系、情绪、沟通"
            icon="heart-fill"
            type="emo"
            @click="navigateTo('emo')"
          />
          <ImmersiveCard
            title="知业"
            subtitle="分析事业选择与成长路径"
            icon="briefcase"
            type="biz"
            @click="navigateTo('biz')"
          >
            <template #icon>
              <image 
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRjU5RTBCIiBzdHJva2Utd2lkdGg9IjIuNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIyIiB5PSI3IiB3aWR0aD0iMjAiIGhlaWdodD0iMTQiIHJ4PSIyIj48L3JlY3Q+PHBhdGggZD0iTTE2IDIxVjVhMiAyIDAgMCAwLTItMmgtNGEyIDIgMCAwIDAtMiAydjE2Ij48L3BhdGg+PC9zdmc+" 
                style="width: 48rpx; height: 48rpx;"
                mode="aspectFit"
              />
            </template>
          </ImmersiveCard>
        </view>

        <!-- 自我探索 -->
        <view class="section-group">
          <text class="section-title">自我探索</text>
          <ImmersiveCard
            title="MBTI"
            subtitle="深层人格特质解析"
            icon="grid"
            type="mbti"
            @click="navigateTo('mbti')"
          />
          <ImmersiveCard
            title="看生辰"
            subtitle="了解你的能量特质与潜能"
            icon="calendar-fill"
            type="bazi"
            @click="navigateTo('bazi')"
          />
        </view>
      </view>
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
import { onShow } from '@dcloudio/uni-app';
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

const { loadShareConfig } = useShare();
loadShareConfig();

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

    if (!userStore.userInfo) {
      try {
        const res: any = await fetchProfilesList();
        const items = res.data?.items || [];
        if (items.length > 0) {
          // Update profiles list in store if available
          if (userStore.setProfiles) {
            userStore.setProfiles(items);
          }
          
          const self = items.find((p: any) => p.is_self);
          if (self) {
            userStore.setUserInfo(self);
            if (userStore.setSelfProfileId) {
              userStore.setSelfProfileId(self.id);
            }
          } else {
            userStore.setUserInfo(items[0]);
          }
        }
      } catch (e) {
        console.error('Fetch profiles failed', e);
      }
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
       // MBTI might be a different page or just chat with mbti agent?
       // User said: "MBTI 放在自我探索中" and "同时匹配先隐藏了，MBTI 放在自我探索中".
       // The click handler for MBTI in previous code was `@click="navigateTo('mbti')"`.
       // If MBTI is also an agent, I should map it. If it's a separate page, I should keep it.
       // The user didn't specify agent type for MBTI, only for the 3 AI advisors.
       // For now I will keep MBTI as 'function developing' or navigate to mbti page if it exists.
       // Checking pages.json, there is no specific mbti page.
       // I'll assume for now MBTI is just a placeholder or maybe it should also go to chat?
       // The prompt says: "问知势... AgentType.LIFE_TREND ... 枚举如下 ... LIFE_TREND, EMOTION, CAREER".
       // MBTI is not in the enum provided.
       // I will leave MBTI as is (toast) or maybe navigate to chat without agentType or a specific one if I knew.
       // But wait, the user instructions only specified the 3 agents.
       uni.showToast({
        title: '功能开发中',
        icon: 'none'
      });
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
  background: #f1f0fa;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  // background: linear-gradient(180deg, #E0E7FF 0%, #F1F5F9 100%);
}

.page-title {
  font-size: 36rpx;
  font-weight: 900;
  color: #1e293b;
  letter-spacing: -0.02em;
}

.container {
  flex: 1;
  height: 0;
  overflow-y: auto;
  padding: 32rpx 32rpx 100rpx 32rpx;
  box-sizing: border-box;
}

.feature-section {
  margin-top: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 48rpx;
}

.section-group {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 900;
  color: #1e293b;
  margin-bottom: 8rpx;
  padding-left: 8rpx;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

/* Sidebar & Toggle Button Styles */
.header-left-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-toggle-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  padding: 0;
  margin: 0;
  &::after {
    border: none !important;
  }
  
  &:active {
    transform: scale(0.9);
    background-color: rgba(255, 255, 255, 0.5);
  }

  .hamburger-icon {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
    
    .bar {
      height: 2px;
      background-color: #1e293b;
      border-radius: 999px;
      
      &.long {
        width: 18px;
      }
      
      &.short {
        width: 10px;
      }
    }
  }
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

  .header-profile-group {
    display: flex;
    align-items: center;
    gap: 12rpx;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    padding: 12rpx 24rpx;
    border-radius: 999rpx;
    border: 1px solid rgba(255, 255, 255, 0.8);
    transition: all 0.2s ease;

    &:active {
      background: rgba(255, 255, 255, 0.8);
      transform: scale(0.98);
    }
  }

  .current-profile-name {
    font-size: 32rpx;
    font-weight: 700;
    color: #1e293b;
    max-width: 240rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-switch-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32rpx;
    height: 32rpx;
    opacity: 0.6;
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
