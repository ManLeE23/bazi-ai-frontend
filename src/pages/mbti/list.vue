<template>
  <view class="mbti-list-page min-h-screen flex flex-col relative pb-6 bg-surface">
    <!-- Ambient Background Elements -->
    <div class="bg-blob bg-blob-primary"></div>
    <div class="bg-blob bg-blob-secondary"></div>

    <HeaderBar title="MBTI 报告" :fixed="true" :placeholder="true" background-color="transparent" />

    <view class="w-full px-5 mt-4 relative z-10 box-border flex-1 flex flex-col">
      <view v-if="isLoading" class="flex-1 flex items-center justify-center mt-20">
        <text class="text-sm text-primary font-medium tracking-widest">加载中...</text>
      </view>

      <view v-else-if="reports.length === 0" class="flex-1 flex flex-col items-center justify-center mt-20">
        <u-icon name="file-text" size="64" color="#cbd5e1" class="mb-4"></u-icon>
        <text class="text-base font-bold text-on-surface mb-2">暂无记录</text>
        <text class="text-sm text-outline-variant mb-6 text-center px-8">你还没有完成过 MBTI 测试，去测一测吧</text>
        <button class="primary-btn active-scale-95" @click="goToTest">
          开始测试
        </button>
      </view>

      <view v-else class="flex flex-col gap-4">
        <view 
          v-for="(item, index) in reports" 
          :key="item.report_id || index"
          class="report-card group relative flex items-center p-5 transition-all duration-300 active-scale-95 fade-in"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @click="goToReport(item.report_id)"
        >
          <!-- Avatar Icon -->
          <view class="icon-box mbti-icon-bg flex-shrink-0 mr-4">
             <text class="text-2xl font-black text-primary">{{ item.type?.charAt(0) || 'M' }}</text>
          </view>
          
          <view class="flex-1 flex flex-col">
            <view class="flex items-baseline gap-2 mb-1">
              <text class="text-xl font-black text-on-surface leading-none">{{ item.type || 'MBTI' }}</text>
              <text v-if="getMBTITitle(item.type)" class="text-xs font-bold text-primary bg-primary-light px-2 py-0_5 rounded-md">
                {{ getMBTITitle(item.type) }}
              </text>
            </view>
            <text class="text-xs font-medium text-outline-variant">{{ formatDate(item.created_at) }}</text>
          </view>

          <view class="flex-shrink-0">
             <u-icon name="arrow-right" size="32" color="#cbd5e1"></u-icon>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import HeaderBar from '@/components/HeaderBar.vue';
import { fetchMBTIReportsList } from '@/api/services';
import { formatDate } from '@/utils/date';

interface MBTIReportItem {
  report_id: string;
  type: string;
  created_at: string;
  dimension_scores?: any;
}

const isLoading = ref(true);
const reports = ref<MBTIReportItem[]>([]);

const mbtiMap: Record<string, string> = {
  'INTJ': '提倡者',
  'INTP': '逻辑学家',
  'ENTJ': '指挥官',
  'ENTP': '辩论家',
  'INFJ': '提倡者',
  'INFP': '调停者',
  'ENFJ': '主人公',
  'ENFP': '竞选者',
  'ISTJ': '物流师',
  'ISFJ': '守卫者',
  'ESTJ': '总经理',
  'ESFJ': '执政官',
  'ISTP': '鉴赏家',
  'ISFP': '探险家',
  'ESTP': '企业家',
  'ESFP': '表演者'
};

const getMBTITitle = (type: string) => {
  return mbtiMap[type?.toUpperCase()] || '';
};

const loadData = async () => {
  isLoading.value = true;
  try {
    const res: any = await fetchMBTIReportsList({ paid: true });
    reports.value = res.data || res || [];
  } catch (err: any) {
    console.error('Failed to load MBTI reports:', err);
    if (err?.code === 401) {
      uni.redirectTo({ url: '/pages/login/index' });
    } else {
      uni.showToast({ title: '加载失败，请重试', icon: 'none' });
    }
  } finally {
    isLoading.value = false;
  }
};

const goToReport = (reportId: string) => {
  if (!reportId) return;
  uni.navigateTo({
    url: `/pages/mbti/report?reportId=${reportId}`
  });
};

const goToTest = () => {
  uni.navigateTo({
    url: '/pages/mbti/index'
  });
};

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.bg-surface { background-color: #F8F9FF; }
.bg-primary-light { background-color: rgba(124, 77, 255, 0.1); }

.mbti-list-page {
  font-family: "Manrope", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif;
  overflow-x: hidden;
}

/* Ambient Background Blobs */
.bg-blob {
  position: fixed;
  border-radius: 50%;
  filter: blur(80rpx);
  z-index: 0;
  pointer-events: none;
}
.bg-blob-primary {
  top: -10%; left: -20%; width: 120vw; height: 120vw; 
  background: radial-gradient(circle at 50% 50%, rgba(124, 77, 255, 0.15) 0%, rgba(124, 77, 255, 0) 60%);
}
.bg-blob-secondary {
  bottom: -20%; right: -20%; width: 100vw; height: 100vw; 
  background: radial-gradient(circle at 50% 50%, rgba(124, 77, 255, 0.1) 0%, rgba(124, 77, 255, 0) 60%);
}

/* Report Card (Glassmorphism) */
.report-card {
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 32rpx;
  box-shadow: 0px 8rpx 24rpx rgba(124, 77, 255, 0.04);
}

.icon-box {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mbti-icon-bg {
  background: linear-gradient(135deg, rgba(124, 77, 255, 0.1), rgba(124, 77, 255, 0.05));
  box-shadow: inset 0 2rpx 8rpx rgba(124, 77, 255, 0.1);
}

.primary-btn {
  background-color: #7c4dff;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 800;
  border-radius: 999rpx;
  padding: 0 64rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 32rpx rgba(124, 77, 255, 0.2);
  border: none;
  
  &::after { border: none; }
}

/* Utility Classes */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.items-baseline { align-items: baseline; }
.justify-center { justify-content: center; }
.flex-1 { flex: 1; }
.flex-shrink-0 { flex-shrink: 0; }

.w-full { width: 100%; }
.min-h-screen { min-height: 100vh; }

.relative { position: relative; }
.z-10 { z-index: 10; }

.text-center { text-align: center; }
.font-bold { font-weight: bold; }
.font-black { font-weight: 900; }
.font-medium { font-weight: 500; }

.text-xs { font-size: 24rpx; }
.text-sm { font-size: 28rpx; }
.text-base { font-size: 32rpx; }
.text-xl { font-size: 40rpx; }
.text-2xl { font-size: 48rpx; }

.leading-none { line-height: 1; }
.tracking-widest { letter-spacing: 0.1em; }

.text-on-surface { color: #191c20; }
.text-outline-variant { color: #64748b; }
.text-primary { color: #7c4dff; }

.px-2 { padding-left: 16rpx; padding-right: 16rpx; }
.px-5 { padding-left: 40rpx; padding-right: 40rpx; }
.px-8 { padding-left: 64rpx; padding-right: 64rpx; }
.py-0_5 { padding-top: 4rpx; padding-bottom: 4rpx; }
.p-5 { padding: 40rpx; }

.mt-4 { margin-top: 32rpx; }
.mt-20 { margin-top: 160rpx; }
.mb-1 { margin-bottom: 8rpx; }
.mb-2 { margin-bottom: 16rpx; }
.mb-4 { margin-bottom: 32rpx; }
.mb-6 { margin-bottom: 48rpx; }
.mr-4 { margin-right: 32rpx; }
.pb-6 { padding-bottom: 48rpx; }

.gap-2 { gap: 16rpx; }
.gap-4 { gap: 32rpx; }

.rounded-md { border-radius: 12rpx; }
.box-border { box-sizing: border-box; }

.transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.duration-300 { transition-duration: 300ms; }
.active-scale-95:active { transform: scale(0.95); }

.fade-in {
  opacity: 0;
  animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(15rpx); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
