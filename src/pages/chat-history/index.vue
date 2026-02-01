<template>
  <view class="chat-history-page">
    <view class="fixed-header">
      <HeaderBar title="全部对话" />
      <!-- <u-navbar
        :is-back="true"
        :is-fixed="false"
        title="全部对话"
        background="transparent"
        back-icon-color="#1f2937"
        :border-bottom="false"
        @click-left="handleBack"
      >
      </u-navbar> -->
      <view class="search-container">
        <view class="search-box">
          <u-icon name="search" color="#9ca3af" size="32" class="search-icon"></u-icon>
          <input 
            type="text" 
            v-model="searchKeyword"
            placeholder="搜索对话标题..." 
            class="search-input"
            confirm-type="search"
            @confirm="onSearch"
            @input="onSearchInput"
          />
          <view v-if="searchKeyword" class="clear-icon" @click="clearSearch">
            <u-icon name="close-circle-fill" color="#c1c1c1" size="32"></u-icon>
          </view>
        </view>
      </view>
    </view>

    <view class="page-content">
      <scroll-view class="chats-scroll" scroll-y>
        <view class="list-container">
          <template v-if="chatList.length">
            <ChatItem 
              v-for="chat in chatList"
              :key="chat.session_id"
              :chat="chat"
              @chat-click="handleChatClick"
            />
            <view v-if="chatList.length > 0" class="no-more">没有更多了</view>
          </template>
          <view v-else-if="!loading" class="empty-state">
            <u-empty mode="message" :text="searchKeyword ? '未找到匹配的对话' : '暂无对话记录'"></u-empty>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchSessionsList } from '@/api/services';
import ChatItem from '@/components/ChatItem.vue';
import HeaderBar from '@/components/HeaderBar.vue';

interface UserInfo {
  name: string;
  gender: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  work_status: string;
  relationship_status: string;
}

interface ChatItem {
  session_id: string;
  title: string;
  last_message: string;
  last_message_time: string;
  message_count: number;
  created_at: string;
  updated_at: string;
  user_info: UserInfo;
}

const searchKeyword = ref('');
const chatList = ref<ChatItem[]>([]);
const loading = ref(false);
let searchTimer: any = null;

const loadChats = async (keyword: string = '') => {
  loading.value = true;
  try {
    const res: any = await fetchSessionsList({ search: keyword });
    if (res && res.data && Array.isArray(res.data.sessions)) {
      chatList.value = res.data.sessions;
    } else {
      chatList.value = [];
    }
  } catch (error) {
    console.error('Failed to load chats:', error);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const onSearchInput = (e: any) => {
  const keyword = e.detail.value;
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    loadChats(keyword);
  }, 500);
};

const onSearch = () => {
  loadChats(searchKeyword.value);
};

const clearSearch = () => {
  searchKeyword.value = '';
  loadChats('');
};

const handleBack = () => {
  uni.navigateBack();
};

const handleChatClick = (chat: ChatItem) => {
  uni.navigateTo({
    url: `/pages/home/index?sessionId=${chat.session_id}`,
  });
};

onMounted(() => {
  loadChats();
});
</script>

<style lang="scss" scoped>
.chat-history-page {
  height: 100vh;
  // background: #fbfbff;
  background: #fbfbff;
  display: flex;
  flex-direction: column;
}

.fixed-header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  z-index: 100;
  padding-bottom: 20rpx;
}

.search-container {
  padding: 0 32rpx;
  margin-top: 10rpx;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1rpx solid #e5e7eb;
  border-radius: 48rpx;
  height: 80rpx;
  padding: 0 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.02);
  transition: all 0.3s;

  &:focus-within {
    border-color: #4f46e5;
    box-shadow: 0 4rpx 12rpx rgba(79, 70, 229, 0.1);
  }
}

.search-icon {
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
  color: #1f2937;
}

.clear-icon {
  padding: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-content {
  flex: 1;
  height: 0; // Important for flex scroll
  position: relative;
}

.chats-scroll {
  height: 100%;
}

.list-container {
  padding: 20rpx 32rpx 40rpx;
}

.no-more {
  text-align: center;
  color: #9ca3af;
  font-size: 24rpx;
  padding: 30rpx 0;
}

.empty-state {
  display: flex;
  justify-content: center;
  padding-top: 100rpx;
}
</style>