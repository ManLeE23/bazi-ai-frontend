<template>
  <view v-if="currentQuestion" class="recent-question-banner" @click="handleAsk">
    <view class="banner-left">
      <text class="question-text fade-in" :key="currentQuestion.text">{{ currentQuestion.text }}</text>
    </view>
    <view class="action-btn">
      <text class="btn-text">问一问</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { fetchRecentQuestions } from '@/api/services';

const currentQuestion = ref<any>(null);
const questionList = ref<any[]>([]);
const currentIndex = ref(0);
let timer: any = null;

const loadRecentQuestions = async () => {
  try {
    const res: any = await fetchRecentQuestions({ limit: 5, days: 30 });
    const list = res.data || res; 
    if (Array.isArray(list) && list.length > 0) {
      questionList.value = list;
      currentQuestion.value = list[0];
      startRotation();
    }
  } catch (e) {
    console.error('Failed to load recent questions:', e);
  }
};

const startRotation = () => {
  if (questionList.value.length <= 1) return;
  
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % questionList.value.length;
    currentQuestion.value = questionList.value[currentIndex.value];
  }, 10000);
};

const handleAsk = () => {
  if (!currentQuestion.value) return;
  uni.navigateTo({
    url: `/pages/chat/index?question=${encodeURIComponent(currentQuestion.value.text)}&agentType=${currentQuestion.value.agent_type || ''}`
  });
};

onMounted(() => {
  loadRecentQuestions();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style lang="scss" scoped>
.recent-question-banner {
  margin-top: 24rpx;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 999rpx;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 
    inset 0 2rpx 6rpx rgba(168, 85, 247, 0.1), 
    inset 0 -2rpx 4rpx rgba(255, 255, 255, 0.5),
    0 8rpx 20rpx rgba(168, 85, 247, 0.05);
  transition: transform 0.2s;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  &:active {
    transform: scale(0.98);
  }
}

.banner-left {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
  margin-right: 24rpx;
}

/* Removed icon-box style */

.question-text {
  font-size: 28rpx;
  color: #64748B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.5rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  background: #4f46e5;
  padding: 10rpx 28rpx;
  border-radius: 999rpx;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(109, 40, 217, 0.25);
}

.btn-text {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 500;
  letter-spacing: 1rpx;
}

.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
