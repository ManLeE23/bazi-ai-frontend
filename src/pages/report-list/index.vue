<template>
  <div class="report-page">
    <!-- Header -->
    <div class="report-header">
      <div class="circle-bg"></div>
      <div class="bottom-circle"></div>
      <u-navbar
        :is-back="false"
        :is-fixed="true"
        background="transparent"
        :border-bottom="false"
      />
      <div class="report-title">历史报告</div>
      <div class="report-subtitle">查看你的往期命理分析记录</div>
    </div>
    
    <div class="container">
      <view v-if="reports.length === 0" class="empty-content">
        <uni-icons type="calendar" size="80" color="#9CA3AF" class="empty-icon"></uni-icons>
        <text class="empty-title">暂无历史报告</text>
        <text class="empty-desc" @click="handleStartAnalysis">开始你的第一次命理分析</text>
      </view>
      
      <view v-else class="reports-list">
        <ReportCard
          v-for="report in reports"
          :key="report.id"
          :report="report"
          @viewReport="handleViewReport"
          @continueChat="handleContinueChat"
        />
      </view>
    </div>
    
    <Tabbar :current="1" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchReportList } from '@/api/services';
import Tabbar from '@/components/Tabbar.vue';
import ReportCard from './components/ReportCard.vue';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';

// 定义报告类型
type HistoryReport = {
  id: string;
  title: string;
  date: string;
  dimensions: string[];
  birthDate: string;
  birthTime: string;
};

const reports = ref<HistoryReport[]>([]);

onLoad(() => {
  getReportList();
});

const getReportList = async () => {
  try {
    // 在这里调用 fetchReportList 并处理返回的数据
    const res: any = await fetchReportList();
    console.log('res', res);
    
    // 假设API返回的数据格式为 { data: [...] }
    if (res && res.data) {
      reports.value = res.data.list.map((item: any) => ({
        id: item.id,
        title: item.title || '八字命理分析',
        date: dayjs(item.created_at).format('YYYY-MM-DD HH:mm'),
        dimensions: item.focus_dimensions || [],
        birthDate: item.user_info.birth_date || '未知',
        birthTime: item.user_info.birth_hour || '未知',
        userName: item.user_info.user_name || '未知'
      }));
    }
  } catch (error) {
    console.error('获取报告列表失败', error);
    // 发生错误时也使用模拟数据
    reports.value = [
      {
        id: '1',
        title: '2024 事业·命理分析',
        date: '2024-12-05 14:30',
        dimensions: ['事业', '财运'],
        birthDate: '1990-05-15',
        birthTime: '辰时',
      },
    ];
  }
};

const handleViewReport = (reportId: string) => {
  console.log('查看报告', reportId);
  // 实现查看报告逻辑，跳转到报告详情页
  uni.navigateTo({
    url: `/pages/report-detail/index?id=${reportId}`
  });
};

const handleContinueChat = (reportId: string) => {
  console.log('继续提问', reportId);
  // 实现继续提问逻辑
  uni.navigateTo({
    url: `/pages/new-chat/index?reportId=${reportId}` // 假设有一个聊天页面
  });
};

const handleStartAnalysis = () => {
  uni.redirectTo({
    url: '/pages/index/index'
  });
}
</script>

<style lang="scss" scoped>
.report-page {
  height: 100vh;
  background: #f6f8fb;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.report-header {
  background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
  position: relative;
  overflow: hidden;
  padding: 48px 24px 96px 24px;
  box-sizing: border-box;
  .circle-bg {
    position: absolute;
    top: 0;
    right: 0;
    /* 尺寸：w-64/h-64 转换 */
    width: 256px;
    height: 256px;
    /* 背景色：白色 10% 透明度 */
    background-color: rgba(255, 255, 255, 0.1);
    /* 圆形 */
    border-radius: 50%;
    /* 负外边距：-mr-32/-mt-32 转换 */
    margin-right: -128px;
    margin-top: -128px;
  }
  .bottom-circle {
    /* 定位：绝对定位，左下角 */
    position: absolute;
    bottom: 0;
    left: 0;

    /* 尺寸：w-48/h-48 转换（Tailwind 1单位=0.25rem，48×0.25rem=12rem=192px；用rpx适配多端：192px=384rpx） */
    width: 384rpx;
    height: 384rpx;

    /* 背景色：白色10%透明度 */
    background-color: rgba(255, 255, 255, 0.1);

    /* 圆形 */
    border-radius: 50%;

    /* 负外边距：-ml-24/-mb-24 转换（24×0.25rem=6rem=96px；rpx适配：96px=192rpx） */
    margin-left: -192rpx;
    margin-bottom: -192rpx;
  }
  .report-title {
    font-size: 24px;
    color: #fff;
    margin-bottom: 8px;
    font-weight: 500;
  }
  .report-subtitle {
    font-size: 14px;
    color: #fff;
  }
}

.container {
  flex: 1;
  height: 100%;
  margin-top: -60px;
  padding: 0 16px;
  z-index: 1;
  overflow-y: auto;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: 200px;
}

.empty-icon {
  margin-bottom: 20rpx;
}

.empty-title {
  font-size: 32rpx;
  color: #1f2937;
  margin-bottom: 10rpx;
  font-weight: 500;
}

.empty-desc {
  font-size: 28rpx;
  color: #9ca3af;
}
</style>