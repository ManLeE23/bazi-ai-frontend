<template>
  <view class="input-banner" @click="handleAsk">
    <text class="placeholder-text fade-in" :key="currentQuestion?.text">{{ currentQuestion ? currentQuestion.text : '最近整体节奏怎么样?' }}</text>
    <view class="ask-btn">问一问</view>
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
  if (!currentQuestion.value) {
    uni.navigateTo({
      url: `/pages/chat/index?question=最近整体节奏怎么样?`
    });
    return;
  }
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
.input-banner {
  margin-top: 24rpx;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 32rpx;
  border: 1px solid rgba(255, 255, 255, 0.6);
  padding: 12rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.2s;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 16rpx 32rpx rgba(124, 77, 255, 0.05);

  &:active {
    transform: scale(0.98);
  }
}

.placeholder-text {
  flex: 1;
  font-size: 28rpx;
  color: #64748B;
  font-weight: 500;
  padding: 0 32rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ask-btn {
  display: flex;
  align-items: center;
  background: #7C4DFF;
  padding: 24rpx 48rpx;
  border-radius: 999rpx;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
}

.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>