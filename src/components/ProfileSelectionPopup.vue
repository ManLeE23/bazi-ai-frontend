<template>
  <CommonPopup
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    height="70vh"
    background="#fbfbff"
  >
    <template #header-left>
      <view class="header-title-row">
        <text class="popup-title">档案列表</text>
        <view class="profile-add-btn-header" @click="navigateToAddProfile">
          <u-icon name="plus" size="32" color="#632ce5"></u-icon>
        </view>
      </view>
    </template>
    
    <view class="profile-popup-loading" v-if="isLoading">
      <view class="loading-dots">
        <view class="dot"></view>
        <view class="dot"></view>
        <view class="dot"></view>
      </view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <view class="profile-popup-list" v-else-if="orderedProfiles.length">
      <view
        v-for="item in orderedProfiles"
        :key="item.id"
        class="profile-popup-item"
        :class="{ active: isActiveProfile(item) }"
        @click="handleSelectProfile(item)"
      >
        <view v-if="isActiveProfile(item)" class="profile-popup-dot"></view>
        <view class="profile-popup-info">
          <view class="profile-popup-name-row">
            <text class="profile-popup-name">{{ item.name }}</text>
            <view v-if="item.is_self" class="profile-popup-self">本人</view>
          </view>
          <text class="profile-popup-desc">{{ getGenderLabel(item.gender) }} · {{ item.birth_date }}</text>
        </view>
      </view>
    </view>
    <view class="profile-popup-empty" v-else>
      <text class="profile-popup-empty-text">暂无档案</text>
    </view>
  </CommonPopup>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { userStore, type UserInfo } from '@/store/user';
import CommonPopup from '@/components/CommonPopup.vue';
import { fetchProfilesList } from '@/api/services';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'select']);

const isLoading = ref(false);
const hasToken = computed(() => !!uni.getStorageSync('token'));
const profiles = computed(() => userStore.profiles || []);
const orderedProfiles = computed(() => {
  return [...profiles.value].sort((a, b) => Number(!!b.is_self) - Number(!!a.is_self));
});

const currentProfileId = computed(() => userStore.userInfo?.id || userStore.selfProfileId || '');

const isActiveProfile = (profile: UserInfo) => {
  return String(profile.id) === String(currentProfileId.value);
};

const getGenderLabel = (gender: string) => {
  return gender === 'male' || gender === '男' ? '男' : '女';
};

const handleSelectProfile = (profile: UserInfo) => {
  emit('select', profile);
  emit('update:modelValue', false);
};

const navigateToAddProfile = () => {
  if (!hasToken.value) {
    uni.navigateTo({
      url: '/pages/login/index?redirect=step&from=index'
    });
    return;
  }
  uni.navigateTo({
    url: '/pages/step/index?from=index'
  });
};

const loadProfiles = async () => {
  if (!hasToken.value) return;
  isLoading.value = true;
  try {
    const profilesRes: any = await fetchProfilesList();
    const raw = profilesRes?.data;
    const list = Array.isArray(raw?.items)
      ? raw.items
      : (Array.isArray(raw) ? raw : []);
    userStore.setProfiles(list);
    
    // Ensure selfProfileId is set if not already
    if (!userStore.selfProfileId && list.length > 0) {
        const selfProfile = list.find((item: any) => item.is_self);
        userStore.setSelfProfileId(String(selfProfile?.id || list[0]?.id));
    }
  } catch (e) {
    // console.error(e);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
    loadProfiles();
})

</script>

<style lang="scss" scoped>
.header-title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.popup-title {
  font-size: 36rpx;
  font-weight: 800;
  color: #191c20;
}

.profile-add-btn-header {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(124, 77, 255, 0.1);
  border-radius: 50%;
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.9);
    background: rgba(124, 77, 255, 0.2);
  }
}

.profile-popup-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-dots {
  display: flex;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #94a3b8;
  font-weight: 500;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #7c4dff; /* primary_container */
  animation: dot-bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.profile-popup-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.profile-popup-item {
  display: flex;
  align-items: center;
  padding: 40rpx;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 48rpx;
  border: 0.5px solid rgba(202, 195, 216, 0.2);
  box-shadow: 0 4rpx 20rpx rgba(124, 77, 255, 0.03);
  transition: all 0.2s;

  &.active {
    border-color: rgba(124, 77, 255, 0.3);
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 8rpx 32rpx rgba(124, 77, 255, 0.08);
  }
  
  &:active {
      transform: scale(0.98);
  }
}

.profile-popup-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #7c4dff; /* primary_container */
  margin-right: 24rpx;
  box-shadow: 0 0 12rpx rgba(124, 77, 255, 0.4);
}

.profile-popup-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.profile-popup-name-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.profile-popup-name {
  font-size: 32rpx;
  font-weight: 800;
  color: #191c20;
}

.profile-popup-self {
  font-size: 20rpx;
  color: #632ce5; /* primary */
  background: rgba(124, 77, 255, 0.1);
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  font-weight: 600;
}

.profile-popup-desc {
  font-size: 24rpx;
  color: #64748b;
}

.profile-popup-empty {
  padding: 64rpx;
  display: flex;
  justify-content: center;
}

.profile-popup-empty-text {
  font-size: 28rpx;
  color: #94a3b8;
  font-weight: 500;
}

</style>
