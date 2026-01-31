<template>
  <section class="recent-chats-section" v-if="recentChats.length > 0">
    <view class="section-header">
      <text class="section-title">最近对话</text>
      <text class="section-more" @click="handleViewMore">查看更多</text>
    </view>
    <view class="chats-list">
      <ChatItem 
        v-for="(chat, index) in recentChats"
        :key="chat.session_id"
        :chat="chat"
        @chat-click="handleChatClick"
      />

    </view>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchSessionsList } from '@/api/services';
import ChatItem from '@/components/ChatItem.vue';

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

interface Props {
  limit?: number;
}

const props = withDefaults(defineProps<Props>(), {
  limit: 3,
});

const emit = defineEmits<{
  viewMore: []
  chatClick: [chat: ChatItem]
}>();

const recentChats = ref<ChatItem[]>([]);

const formatTime = (time: string) => {
  if (!time) return '';
  // 确保时间字符串是 UTC 格式，添加 Z 后缀
  const utcTime = time.endsWith('Z') ? time : `${time}Z`;
  const date = new Date(utcTime);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) {
    const minutes = Math.floor(diff / (1000 * 60));
    return minutes < 1 ? '刚刚' : `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (hours < 48) {
    return '昨天';
  } else {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
  }
};

const loadRecentChats = async () => {
  try {
    const res: any = await fetchSessionsList();
    if (res && res.data && Array.isArray(res.data.sessions)) {
      recentChats.value = res.data.sessions.slice(0, props.limit);
    }
  } catch (error) {
    console.error('Failed to load recent chats:', error);
  }
};

const handleViewMore = () => {
  emit('viewMore');
};

const handleChatClick = (chat: ChatItem) => {
  emit('chatClick', chat);
};

onMounted(() => {
  loadRecentChats();
});

defineExpose({
  loadRecentChats,
});
</script>

<style lang="scss" scoped>
.recent-chats-section {
  margin-bottom: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
  padding-left: 8rpx;
  padding-right: 8rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 900;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-more {
  font-size: 24rpx;
  color: #6366f1;
  font-weight: 500;
}

.chats-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}






</style>