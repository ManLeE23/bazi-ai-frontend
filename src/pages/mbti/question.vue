<template>
  <view class="mbti-page-container min-h-screen flex flex-col relative pb-6 bg-surface">
    <!-- Ambient Background Elements -->
    <div class="bg-blob bg-blob-primary"></div>
    <div class="bg-blob bg-blob-secondary"></div>
    <div class="bg-blob bg-blob-container"></div>

    <HeaderBar title="人格类型探索" :fixed="true" :placeholder="true" background-color="transparent" />

    <view class="w-full px-8 mt-3 relative z-10 box-border flex-1 flex flex-col" v-if="questions.length > 0">
      
      <!-- Progress Bar -->
      <view class="flex justify-between items-end mb-3">
        <view class="flex items-baseline gap-1">
          <text class="text-3xl font-black text-on-surface leading-none question-title">{{ currentIndex + 1 }}</text>
          <text class="text-sm font-bold text-outline-variant leading-none">/ {{ questions.length }}</text>
        </view>
      </view>
      <view class="w-full h-2 progress-bar rounded-full overflow-hidden">
        <view class="h-full bg-primary rounded-full transition-all duration-500 ease-out" :style="{ width: progressPercent + '%' }"></view>
      </view>

      <!-- Question -->
      <view class="mt-3 text-center fade-in" :key="'q-' + currentIndex">
        <view class="text-2xl font-bold text-on-surface leading-relaxed px-2 min-h-question flex items-center justify-center" style="letter-spacing: -0.02em;">
          {{ currentQuestion.text }}
        </view>
      </view>

      <!-- Options -->
      <view class="mt-3 flex flex-col gap-4 fade-in" :key="'opt-' + currentIndex">
        <view 
          class="option-card group w-full relative flex items-center p-5 transition-all duration-300 border-2"
          :class="[
            answers[currentIndex] === optionIndex ? 'option-active' : 'border-transparent'
          ]"
          v-for="(option, optionIndex) in currentQuestion.options" 
          :key="optionIndex"
          @click="selectOption(optionIndex)"
        >
          <view class="w-6 h-6 rounded-full border-2 mr-4 flex-shrink-0 flex items-center justify-center transition-colors"
                :class="answers[currentIndex] === optionIndex ? 'border-primary bg-primary' : 'border-outline-variant'">
            <view class="w-2_5 h-2_5 bg-white rounded-full transition-transform duration-300" :class="answers[currentIndex] === optionIndex ? 'scale-100' : 'scale-0'"></view>
          </view>
          <text class="option-label text-lg font-bold transition-colors text-left flex-1" :class="answers[currentIndex] === optionIndex ? 'text-primary' : 'text-outline-variant'">
            {{ option }}
          </text>
        </view>
      </view>

      <!-- Bottom Navigation -->
      <view class="mt-auto w-full pt-10 pb-2 flex gap-4 box-border" style="min-height: 120rpx;">
        <view 
          v-if="currentIndex > 0"
          class="flex-1 h-16 rounded-full font-black text-sm tracking-widest transition-all flex items-center justify-center uppercase option-card text-on-surface fade-in"
          :class="currentIndex > 0 ? 'active-scale-95' : 'opacity-50 pointer-events-none'"
          @click="prevQuestion"
        >
          <text>上一题</text>
        </view>
        <view 
          v-if="currentIndex < questions.length - 1"
          class="flex-1 h-16 rounded-full font-black text-sm tracking-widest transition-all flex items-center justify-center uppercase fade-in active-scale-95 bg-primary text-white shadow-primary"
          @click="nextQuestion"
        >
          <text>下一题</text>
        </view>
        <view 
          v-else
          class="flex-1 h-16 rounded-full font-black text-sm tracking-widest transition-all flex items-center justify-center uppercase fade-in"
          :class="isSubmitting ? 'bg-gray-300 text-gray-500 pointer-events-none' : 'active-scale-95 bg-primary text-white shadow-primary'"
          @click="submitAnswers"
        >
          <text>{{ isSubmitting ? '提交中...' : '提交' }}</text>
        </view>
      </view>
      
      <!-- Footer Text -->
      <view class="mt-2 text-xxs font-bold tracking-widest text-outline-variant uppercase text-center w-full pb-4">
          已有 10W+ 人参与测试
      </view>

    </view>

    <!-- Loading State -->
    <view class="flex-1 flex items-center justify-center mt-20" v-else>
      <text class="text-base text-primary font-medium tracking-widest">正在加载题目...</text>
    </view>

    <MBTIAnalysisLoading
      v-model="showAnalysisLoading"
      :status="analysisStatus"
      @complete="handleAnalysisComplete"
    />

    <!-- Payment Popup -->
    <MBTIPaymentPopup
      :modelValue="showPaymentPopup"
      @update:modelValue="showPaymentPopup = $event"
      :originalPrice="paymentInfo.originalPrice"
      :discountPrice="paymentInfo.discountPrice"
      @pay="handlePayment"
      @close="closePaymentPopup"
    />

  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import HeaderBar from '@/components/HeaderBar.vue';
import MBTIPaymentPopup from './components/MBTIPaymentPopup.vue';
import MBTIAnalysisLoading from './components/MBTIAnalysisLoading.vue';
import { fetchMBTIQuestions, fetchMBTISubmit, fetchWechatOrderQuery } from '@/api/services';
import { useMBTIReport } from '@/hooks/useMBTIReport';
import { handleMBTIWechatPayment } from '@/utils/payment';

const { loadReport } = useMBTIReport();

interface Question {
  id: number;
  text: string;
  dimension: 'E/I' | 'S/N' | 'T/F' | 'J/P';
  scene: 'general' | 'work' | 'private' | 'social';
  options: string[];
  score_rule: Record<string, string>;
}

const questions = ref<Question[]>([]);
const currentIndex = ref(0);
const answers = ref<Record<number, number>>({});

const currentQuestion = computed(() => questions.value[currentIndex.value] || {});
const progressPercent = computed(() => {
  if (questions.value.length === 0) return 0;
  return ((currentIndex.value + 1) / questions.value.length) * 100;
});

const loadQuestions = async () => {
  try {
    const res: any = await fetchMBTIQuestions();
    questions.value = res.data;
  } catch(err: any) {
    console.log('err', err);
    if (err.code === 401) {
      uni.redirectTo({ url: '/pages/login/index' });
    }
  }
};

let advanceTimer: ReturnType<typeof setTimeout> | null = null;

const selectOption = (index: number) => {
  answers.value[currentIndex.value] = index;
  
  if (advanceTimer) {
    clearTimeout(advanceTimer);
  }

  // Auto advance to next question after a short delay to show the selection state
  advanceTimer = setTimeout(() => {
    if (currentIndex.value < questions.value.length - 1) {
      currentIndex.value++;
    }
    advanceTimer = null;
  }, 400);
};

const prevQuestion = () => {
  if (advanceTimer) {
    clearTimeout(advanceTimer);
    advanceTimer = null;
  }
  
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const nextQuestion = () => {
  if (answers.value[currentIndex.value] === undefined) {
    uni.showToast({ title: '请先选择一个选项', icon: 'none' });
    return; // Do not proceed if no option is selected
  }

  if (advanceTimer) {
    clearTimeout(advanceTimer);
    advanceTimer = null;
  }
  
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++;
  }
};



onMounted(() => {
  loadQuestions();
});

let isSubmitting = ref(false);

const showPaymentPopup = ref(false);
const showAnalysisLoading = ref(false);
const analysisStatus = ref('analyzing');
const isPaymentRequired = ref(false);

const paymentInfo = ref({
  originalPrice: 0,
  discountPrice: 0,
  reportId: ''
});

const closePaymentPopup = () => {
  showPaymentPopup.value = false;
};

const handleAnalysisComplete = () => {
  if (isPaymentRequired.value) {
    showPaymentPopup.value = true;
  } else {
    uni.redirectTo({ url: `/pages/mbti/report?reportId=${paymentInfo.value.reportId}` });
  }
};

const submitAnswers = async () => {
  if (isSubmitting.value) return;

  // ensure all answered
  const missing = questions.value.findIndex((_, i) => answers.value[i] === undefined);
  if (missing !== -1) {
    uni.showToast({ title: `请完成第 ${missing + 1} 题`, icon: 'none' });
    // Optional: auto navigate to the missing question
    currentIndex.value = missing;
    return;
  }
  
  isSubmitting.value = true;
  const payload = {
    answers: questions.value.map((q, i) => ({
      question_id: q.id,
      option: q.options[answers.value[i]] || '' // Provide fallback to prevent undefined
    }))
  };

  try {
    const res: any = await fetchMBTISubmit(payload);
    
    // Store returned info
    const reportId = res?.data?.report_id || res?.report_id || '';
    const discountPrice = res?.data?.discount_price_cents || 0;
    const originalPrice = res?.data?.original_price_cents || 0;
    
    if (reportId) {
      paymentInfo.value = {
        originalPrice,
        discountPrice,
        reportId
      };
      
      // Request report interface to trigger generation process in background
      // showing analyzing process
      showAnalysisLoading.value = true;
      analysisStatus.value = 'analyzing';
      isPaymentRequired.value = false;
      
      try {
        await loadReport(reportId);
        // If it successfully loads without 402, it means it's already paid or free
        analysisStatus.value = 'success';
      } catch (err: any) {
        // 402 means Payment Required, which is the expected flow for new reports
        if (err?.code === 402 || err?.statusCode === 402 || err?.message?.includes('402')) {
          // Mark as payment required, but still consider analysis "success" to finish animation
          isPaymentRequired.value = true;
          analysisStatus.value = 'success';
        } else if (err?.code === 401) {
          showAnalysisLoading.value = false;
          uni.redirectTo({ url: '/pages/login/index' });
        } else {
          analysisStatus.value = 'error';
          showAnalysisLoading.value = false;
          uni.showToast({ title: err?.message || '分析失败，请重试', icon: 'none' });
        }
      }
    } else {
      uni.showToast({ title: '提交成功，但未返回报告ID', icon: 'none' });
    }
    
  } catch (err: any) {
    showAnalysisLoading.value = false;
    if (err?.code === 401) {
      uni.redirectTo({ url: '/pages/login/index' });
    } else {
      uni.showToast({ title: err?.message || '提交失败，请重试', icon: 'none' });
    }
  } finally {
    isSubmitting.value = false;
  }
};

const handlePayment = async () => {
  if (!paymentInfo.value.reportId) {
    uni.showToast({ title: '未获取到报告ID', icon: 'none' });
    return;
  }

  try {
    uni.showLoading({ title: '准备支付中...', mask: true });
    const loginRes: any = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject,
      });
    });

    if (!loginRes.code) {
      throw new Error('获取登录凭证失败');
    }

    const outTradeNo = await handleMBTIWechatPayment({
      amount_total: paymentInfo.value.discountPrice,
      description: 'MBTI 报告',
      currency: 'CNY',
      code: loginRes.code,
      report_id: paymentInfo.value.reportId,
    });

    if (outTradeNo) {
      uni.showLoading({ title: '确认订单中...', mask: true });
      await fetchWechatOrderQuery(outTradeNo);
    }
    
    uni.hideLoading();
    showPaymentPopup.value = false;
    uni.showToast({ title: '支付成功', icon: 'success' });
    
    // Navigate to report
    uni.redirectTo({ url: `/pages/mbti/report?reportId=${paymentInfo.value.reportId}` });
    
  } catch (err: any) {
    uni.hideLoading();
    if (err?.code === 401) {
      uni.redirectTo({ url: '/pages/login/index' });
    } else if (err?.message === '支付已取消') {
      uni.showToast({ title: '您已取消支付', icon: 'none' });
    } else {
      uni.showToast({ title: err?.message || '支付失败，请重试', icon: 'none' });
    }
  }
};
</script>

<style lang="scss" scoped>
.bg-surface { background-color: #F8F9FF; }
.bg-white-40 { background-color: rgba(255, 255, 255, 0.4); }

.mbti-page-container {
  min-height: 100vh;
  font-family: "Manrope", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif;
  overflow-y: hidden;
  overflow-x: hidden;
}

/* Ambient Background Blobs (Mobile Optimized) */
.bg-blob {
  position: fixed;
  border-radius: 50%;
  filter: blur(80rpx);
  z-index: 0;
  pointer-events: none;
}
.bg-blob-primary {
  top: -15%; left: -30%; width: 150vw; height: 150vw; 
  background: radial-gradient(circle at 50% 50%, rgba(124, 77, 255, 0.15) 0%, rgba(124, 77, 255, 0) 60%);
}
.bg-blob-secondary {
  top: 30%; right: -40%; width: 130vw; height: 130vw; 
  background: radial-gradient(circle at 50% 50%, rgba(124, 77, 255, 0.12) 0%, rgba(124, 77, 255, 0) 60%);
}
.bg-blob-container {
  bottom: -10%; left: -30%; width: 140vw; height: 140vw; 
  background: radial-gradient(circle at 50% 50%, rgba(124, 77, 255, 0.1) 0%, rgba(124, 77, 255, 0) 60%);
}

/* Option Cards (Glassmorphism) */
.option-card {
  background-color: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(202, 195, 216, 0.2);
  border-radius: 40px; /* From Figma: 40px */
}
.option-active {
  background-color: #FFFFFF !important;
  border-color: rgba(124, 77, 255, 0.3) !important;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05) !important; /* Subtle Figma style */
  transform: translateY(-4rpx);
}
.border-transparent { border-color: transparent; }
.bg-white-50 { background-color: rgba(255, 255, 255, 0.5); }
.bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
.from-purple-400 { --tw-gradient-from: #C084FC; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(192, 132, 252, 0)); }
.to-purple-600 { --tw-gradient-to: #9333EA; }
.border-2 { border-width: 4rpx; border-style: solid; }
.border { border-width: 2rpx; border-style: solid; }
.border-gray-100 { border-color: #F3F4F6; }

/* Utility Classes */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.items-baseline { align-items: baseline; }
.flex-1 { flex: 1; }
.flex-shrink-0 { flex-shrink: 0; }
.inline-flex { display: inline-flex; }

.w-full { width: 100%; }
.h-full { height: 100%; }
.min-h-screen { min-height: 100vh; }
.min-h-question { min-height: 156rpx; }
.w-16 { width: 128rpx; }
.h-16 { height: 128rpx; }
.h-1_5 { height: 12rpx; }
.h-2 { height: 16rpx; }
.w-8 { width: 64rpx; }
.h-8 { height: 64rpx; }
.w-6 { width: 48rpx; }
.h-6 { height: 48rpx; }
.w-2_5 { width: 20rpx; }
.h-2_5 { height: 20rpx; }

.relative { position: relative; }
.absolute { position: absolute; }
.z-10 { z-index: 10; }
.pointer-events-none { pointer-events: none; }

.text-center { text-align: center; }
.text-left { text-align: left; }
.font-bold { font-weight: bold; }
.font-black { font-weight: 900; }
.font-medium { font-weight: 500; }

.text-xxs { font-size: 20rpx; }
.text-xs { font-size: 24rpx; }
.text-sm { font-size: 28rpx; }
.text-base { font-size: 32rpx; }
.text-lg { font-size: 36rpx; }
.text-xl { font-size: 40rpx; }
.text-2xl { font-size: 48rpx; }
.text-3xl { font-size: 60rpx; }

.leading-none { line-height: 1; }
.leading-relaxed { line-height: 1.625; }
.tracking-widest { letter-spacing: 0.1em; }
.tracking-tighter { letter-spacing: -0.05em; }

.text-white { color: #FFFFFF; }
.text-gray-300 { color: #D1D5DB; }
.text-gray-500 { color: #6B7280; }
.text-on-surface { color: #191c20; }
.text-outline-variant { color: #494455; }
.text-primary { color: #7c4dff; }
.border-outline-variant { border-color: rgba(202, 195, 216, 0.4); }
.border-primary { border-color: #7c4dff; }
.bg-primary { background-color: #7c4dff; }

.shadow-primary {
  box-shadow: 0px 0px 40rpx 0px rgba(124, 77, 255, 0.1), 0px 0px 20rpx 0px rgba(124, 77, 255, 0.3);
}

.bg-white { background-color: #FFFFFF; }
.bg-gray-100 { background-color: #F3F4F6; }

.px-2 { padding-left: 16rpx; padding-right: 16rpx; }
.px-3 { padding-left: 24rpx; padding-right: 24rpx; }
.px-8 { padding-left: 64rpx; padding-right: 64rpx; }
.py-1 { padding-top: 8rpx; padding-bottom: 8rpx; }
.p-5 { padding: 40rpx; }
.pt-6 { padding-top: 48rpx; }
.pt-10 { padding-top: 80rpx; }
.pb-2 { padding-bottom: 16rpx; }
.pb-4 { padding-bottom: 32rpx; }
.pb-6 { padding-bottom: 48rpx; }
.pb-10 { padding-bottom: 80rpx; }

.mt-0_5 { margin-top: 4rpx; }
.mt-2 { margin-top: 16rpx; }
.mt-3 { margin-top: 24rpx; }
.mt-10 { margin-top: 80rpx; }
.mt-12 { margin-top: 96rpx; }
.mt-14 { margin-top: 112rpx; }
.mt-20 { margin-top: 160rpx; }
.mt-auto { margin-top: auto; }
.mb-3 { margin-bottom: 24rpx; }
.mb-4 { margin-bottom: 32rpx; }
.mb-6 { margin-bottom: 48rpx; }

.gap-1 { gap: 8rpx; }
.gap-1_5 { gap: 12rpx; }
.gap-4 { gap: 32rpx; }

.mr-4 { margin-right: 32rpx; }

.rounded-md { border-radius: 12rpx; }
.rounded-xl { border-radius: 24rpx; }
.rounded-2xl { border-radius: 32rpx; }
.rounded-3xl { border-radius: 48rpx; }
.rounded-full { border-radius: 9999px; }

.overflow-hidden { overflow: hidden; }
.box-border { box-sizing: border-box; }
.uppercase { text-transform: uppercase; }

.shadow-sm { box-shadow: 0 2rpx 4rpx 0 rgba(0,0,0,0.05); }
.shadow-xl { box-shadow: 0 40rpx 50rpx -24rpx rgba(0,0,0,0.25); }
.shadow-inner { box-shadow: inset 0 4rpx 8rpx 0 rgba(0,0,0,0.06); }

.opacity-20 { opacity: 0.2; }
.opacity-50 { opacity: 0.5; }
.opacity-80 { opacity: 0.8; }
.opacity-100 { opacity: 1; }

.transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.transition-colors { transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease; }
.transition-transform { transition: transform 0.3s ease; }
.duration-300 { transition-duration: 300ms; }
.duration-500 { transition-duration: 500ms; }
.ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }

.scale-110 { transform: scale(1.1); }
.scale-100 { transform: scale(1); }
.scale-0 { transform: scale(0); }
.active-scale-95:active { transform: scale(0.95); }

.fade-in {
  animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(15rpx); }
  100% { opacity: 1; transform: translateY(0); }
}

.progress-bar {
  background: #E7E8EE;
  height: 20rpx;
}

.question-title {
  text-align: left;
}
</style>
