<template>
  <view class="chat-item" @click="handleChatClick(chat)">
    <view class="chat-item-content">
      <view class="chat-header">
        <text class="chat-title">{{ chat.title }}</text>
        <text class="chat-time">{{ formatTime(chat.last_message_time) }}</text>
      </view>
      <text class="user-info">
        {{ chat.user_info.name }} · {{ chat.user_info.birth_date.split('-')[0] }}年
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

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
  chat: ChatItem;
}

interface Emits {
  (e: 'chatClick', chat: ChatItem): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formatTime = (time: string) => {
  if (!time) return '';
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

const handleChatClick = (chat: ChatItem) => {
  emit('chatClick', chat);
};
</script>

<style lang="scss" scoped>
.chat-item {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(14px);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
  border-radius: 48rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.chat-item:active {
  transform: scale(0.98);
}

.chat-item-content {
  flex: 1;
  min-width: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4rpx;
  gap: 16rpx;
}

.chat-title {
  font-size: 32rpx;
  font-weight: 900;
  color: #1e293b;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  margin-bottom: 4rpx;
  flex: 1;
}

.chat-time {
  font-size: 22rpx;
  color: #9ca3af;
  min-width: 120rpx;
  text-align: right;
  line-height: 1.4;
}

.user-info {
  font-size: 24rpx;
  color: #6b7280;
  margin-top: 8rpx;
  display: block;
}
</style>