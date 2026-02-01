<template>
  <view class="report-detail-page">
    <header class="report-header">
      <view class="header-content">
        <view class="header-info">
          <h1 class="header-title">{{ reportData.user_info.user_name }}</h1>
          <view class="header-dates">
            <p class="date-item">
              <span class="date-label">阳历</span> {{ reportData.user_info.birth_date }}({{ reportData.user_info.true_solar_hour }})
            </p>
            <p class="date-item">
              <span class="date-label">阴历</span> {{ reportData.user_info.chinese_birth_date }}({{ reportData.user_info.true_solar_hour }})
            </p>
          </view>
        </view>
      </view>
    </header>

    <main class="report-main">
      <!-- 核心诊断结论 -->
      <section class="core-diagnosis">
        <p class="diagnosis-label">核心诊断结论</p>
        <h2 class="diagnosis-title">{{ reportData.agent_c_report.core_conclusion.summary }}</h2>
        <view class="diagnosis-content">
          <p class="diagnosis-text">
            <span class="diagnosis-highlight">为什么是现在：</span>
            {{ reportData.agent_c_report.core_conclusion.why_now }}
          </p>
        </view>
      </section>

      <!-- 八字四柱 -->
      <section class="bazi-section">
        <view class="bazi-columns">
          <view class="bazi-column">
            <p class="column-label">年柱</p>
            <view class="pillar-content">
              <span class="wu-xing tu">戊</span>
              <span class="wu-xing mu">寅</span>
            </view>
          </view>
          <view class="bazi-column active">
            <p class="column-label">月柱</p>
            <view class="pillar-content">
              <span class="wu-xing jin">庚</span>
              <span class="wu-xing jin">申</span>
            </view>
          </view>
          <view class="bazi-column">
            <p class="column-label">日柱</p>
            <view class="pillar-content">
              <span class="wu-xing shui">壬</span>
              <span class="wu-xing mu">寅</span>
            </view>
          </view>
          <view class="bazi-column">
            <p class="column-label">时柱</p>
            <view class="pillar-content">
              <span class="wu-xing tu">己</span>
              <span class="wu-xing jin">酉</span>
            </view>
          </view>
        </view>

        <view class="energy-section">
          <p class="info-label">日主能量定性</p>
          <view class="energy-info">
            <h3 class="info-value">壬水 · <span class="strong">身强</span></h3>
            <span class="energy-percent">旺 72%</span>
          </view>
          <view class="energy-bar">
            <view class="energy-fill" style="width: 72%"></view>
          </view>
        </view>

        <view class="wuxing-section">
          <view class="wuxing-group">
            <p class="group-label">喜用五行</p>
            <view class="wuxing-tags">
              <span class="wuxing-tag tag-mu">木</span>
              <span class="wuxing-tag tag-huo">火</span>
            </view>
          </view>
          <view class="wuxing-group">
            <p class="group-label">忌讳五行</p>
            <view class="wuxing-tags">
              <span class="wuxing-tag tag-jin">金</span>
              <span class="wuxing-tag tag-shui">水</span>
            </view>
          </view>
        </view>
      </section>

      <!-- 主线维度和当前节奏 -->
      <section class="dimension-section">
        <div class="dimension-card career">
          <p class="card-label">主线维度</p>
          <span class="card-value">
            {{ getDominantDimensionLabel(reportData?.agent_c_report?.meta?.dominant_dimension) }}
          </span>
        </div>
        <div class="dimension-card rhythm">
          <p class="card-label">当前节奏</p>
          <div class="card-value status">
            <div class="pulse-dot"></div>
            <span class="status-text">{{ reportData?.agent_c_report?.meta?.current_phase || '暂无数据' }}</span>
          </div>
        </div>
      </section>

      <!-- 结构优势分析和核心局限提醒 -->
      <section class="analysis-section">
        <div class="advantage-analysis analysis-item">
          <div class="analysis-header">
            <div class="analysis-indicator green"></div>
            <h4 class="analysis-title">结构优势分析</h4>
          </div>
          <p class="analysis-content">
            {{ reportData?.agent_c_report?.structure_analysis?.strength || '暂无数据' }}
          </p>
        </div>
        <div class="limitation-analysis analysis-item">
          <div class="analysis-header">
            <div class="analysis-indicator red"></div>
            <h4 class="analysis-title">核心局限提醒</h4>
          </div>
          <p class="analysis-content">
            {{ reportData?.agent_c_report?.structure_analysis?.constraint || '暂无数据' }}
          </p>
        </div>
        
        <!-- 错位风险预警 -->
        <div class="misalignment-risk analysis-item">
          <div class="analysis-header">
            <div class="analysis-indicator amber"></div>
            <h4 class="analysis-title">错位风险预警</h4>
          </div>
          <p class="analysis-content">
            {{ reportData?.agent_c_report?.structure_analysis?.misalignment_risk || '暂无数据' }}
          </p>
        </div>
      </section>

      <!-- 内心独白 -->
      <section class="anxiety-profile-section">
        <div class="section-header">
          <div class="primary"></div>
          <p class="section-label">潜在焦虑心理画像</p>
        </div>

        <div class="anxiety-cards">
          <div 
            v-for="(item, index) in reportData?.agent_c_report?.latent_concerns?.items" 
            :key="index" 
            class="anxiety-card"
            :class="{'primary-card': index % 2 === 0, 'secondary-card': index % 2 !== 0}"
          >
            <div class="card-header">
              <span class="card-number">{{ formatIndex(index) }} /</span>
              <p class="anxiety-question">{{ item.question }}</p>
            </div>
            <div class="card-divider"></div>
            <div class="card-details">
              <span class="detail-label">分析</span>
              <p class="anxiety-reason">{{ item.reason }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 专家建议与行动指南 -->
      <section class="action-plan">
        <view class="plan-header">
          行动指南
        </view>
        <view class="plan-content">
          <view class="plan-item">
            <p class="item-label">节奏建议</p>
            <p class="item-content">{{ reportData.agent_c_report.guidance.pace_advice }}</p>
          </view>
          <view class="plan-focus">
            <p class="focus-label">重点分配</p>
            <p class="focus-content">{{ reportData.agent_c_report.guidance.focus_suggestion }}</p>
          </view>
          <view class="plan-warning">
            <p class="warning-label">避坑提醒</p>
            <p class="warning-content">{{ reportData.agent_c_report.guidance.risk_reminder }}</p>
          </view>
        </view>
      </section>
    </main>

    <footer class="report-footer">
      <button class="deep-talk-btn" @click="jumpToChat">深度对话追问</button>
    </footer>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { fetchReportById } from '@/api/services';
import { ref } from 'vue';

// 页面参数接收
let reportId: string | undefined;
const reportData = ref(null);

// 格式化序号显示
const formatIndex = (index: number): string => {
  const paddedIndex = String(index + 1).padStart(2, '0');
  return paddedIndex;
};

onLoad((options) => {
  if (options.id) {
    reportId = options.id;
    getReportById(reportId);
  }
});

const getReportById = async (id: string) => {
  try {
    const res: any = await fetchReportById(id);
    console.log('Report Data:', res);
    reportData.value = res.data;
    // 在这里处理返回的数据，更新页面状态
  } catch (error) {
    console.error('获取报告详情失败', error);
  }
};

const getDominantDimensionLabel = (dimension: string): string => {
  switch(dimension) {
    case 'CAREER':
      return '事业';
    case 'RELATIONSHIP':
      return '感情';
    case 'LIFE_PATH':
      return '生活/家庭';
    case 'COMPOSITE':
      return '综合';
    default:
      return dimension || '暂无数据';
  }
};

const jumpToChat = () => {
  // 判断上个页面是否从new-chat/index 过来的
  const pages = getCurrentPages();
  console.log('pages', pages);
  const prevPage = pages[pages.length - 2];
  console.log('prevPage.route', prevPage.route);
  if (prevPage.route?.includes('pages/new-chat/index')) {
    uni.navigateBack();
    return;
  }
  uni.navigateTo({
    url: '/pages/home/index',
  });
}

</script>

<style lang="scss">
page {
  background-color: #f8faff;
}

.report-detail-page {
  width: 100%;
  min-height: 100vh;
  background-color: #f8faff;
  position: relative;
  padding-bottom: 144rpx; // 底部按钮高度
  font-family: 'Plus Jakarta Sans', 'Noto Sans SC', sans-serif;
  color: #1e293b;
}

/* Header Styles */
.report-header {
  padding: 0 30rpx;
  padding-top: 160rpx;
  padding-bottom: 30rpx;
  background: rgba(255, 255, 255, 0.6);
  // position: sticky;
  // top: 0;
  z-index: 20;
  backdrop-filter: blur(20rpx);
  border-bottom: 1rpx solid rgba(99, 102, 241, 0.1);
}

.header-content {
  max-width: 70%;
}

.header-info {
  .header-title {
    font-size: 50rpx;
    /* 原来是48rpx */
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
    margin: 0;
  }

  .header-dates {
    margin-top: 20rpx;
    space-y: 10rpx;

    .date-item {
      font-size: 24rpx;
      /* 原来是20rpx */
      font-weight: 700;
      color: #6b7280;
      margin: 0 0 10rpx 0;
      display: flex;
      align-items: center;

      .date-label {
        width: 60rpx;
        opacity: 0.5;
      }
    }
  }
}

/* Main Content Styles */
.report-main {
  padding: 30rpx;
  padding-top: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.core-diagnosis {
  background: #ffffff;
  border-radius: 64rpx;
  padding: 40rpx;
  text-align: left;
  position: relative;
  overflow: hidden;
  border: 3rpx solid rgba(99, 102, 241, 0.12);
  box-shadow: 0 24rpx 60rpx rgba(99, 102, 241, 0.05);
  border-top: 8rpx solid #4f46e5;
}

.diagnosis-label {
  font-size: 24rpx;
  /* 原来是20rpx */
  text-align: center;
  font-weight: 900;
  color: #4f46e5;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 32rpx;
}

.diagnosis-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #111827;
  line-height: 1.3;
  margin: 0 0 32rpx;
}

.diagnosis-content {
  background: #f8fafc;
  padding: 32rpx;
  border-radius: 32rpx;
  border: 2rpx solid #e2e8f0;
}

.diagnosis-text {
  font-size: 24rpx;
  /* 原来是22rpx */
  color: #94a3b8;
  line-height: 1.6;
  margin: 0;
}

.diagnosis-highlight {
  font-weight: 700;
  color: #334155;
  display: block;
  margin-bottom: 12rpx;
  text-align: left;
}

/* Bazi Section */
.bazi-section {
  background: #ffffff;
  border-radius: 64rpx;
  padding: 48rpx;
  border: 3rpx solid rgba(99, 102, 241, 0.12);
  box-shadow: 0 24rpx 60rpx rgba(99, 102, 241, 0.05);
}

.bazi-columns {
  display: flex;
  gap: 16rpx;
}

.bazi-column {
  flex: 1;
  text-align: center;
  padding: 24rpx 8rpx;
  background: #f8fafc;
  border-radius: 32rpx;
  border: 2rpx solid #e2e8f0;
}

.bazi-column.active {
  background: #eef2ff;
  border-color: #c7d2fe;
  box-shadow: inset 0 2rpx 4rpx rgba(0, 0, 0, 0.06);
}

.column-label {
  font-size: 24rpx;
  /* 原来是18rpx */
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 16rpx;
  letter-spacing: -0.02em;
}

.pillar-content {
  font-size: 38rpx;
  /* 原来是36rpx */
  font-weight: 900;
  line-height: 1.5;
}

.wu-xing {
  display: block;
}

.tu {
  color: #92400e;
}

.mu {
  color: #16a34a;
}

.shui {
  color: #2563eb;
}

.huo {
  color: #dc2626;
}

.jin {
  color: #D99014;
}

.energy-section {
  padding-top: 40rpx;
  border-top: 2rpx dashed #e2e8f0;
  margin-top: 32rpx;
}

.energy-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.info-label {
  font-size: 24rpx;
  /* 原来是20rpx */
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 16rpx;
}

.info-value {
  font-size: 30rpx;
  /* 原来是28rpx */
  font-weight: 900;
  color: #1e293b;
}

.energy-percent {
  font-size: 24rpx;
  /* 原来是18rpx */
  font-weight: 700;
  color: #4f46e5;
  background: #eef1ff;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
}

.energy-bar {
  width: 100%;
  height: 24rpx;
  background: #f1f5f9;
  border-radius: 12rpx;
  overflow: hidden;
}

.energy-fill {
  height: 100%;
  background: #6366f1;
  border-radius: 12rpx;
  box-shadow: 0 0 16rpx rgba(99, 102, 241, 0.4);
}

.wuxing-section {
  display: flex;
  gap: 40rpx;
  margin-top: 32rpx;
}

.wuxing-group {
  flex: 1;
}

.wuxing-group:last-child {
  border-left: 2rpx solid #e2e8f0;
  padding-left: 40rpx;
}

.group-label {
  font-size: 24rpx;
  /* 原来是18rpx */
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 24rpx;
}

.wuxing-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.wuxing-tag {
  padding: 16rpx 20rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
  /* 原来是20rpx */
  font-weight: 900;
  border: 2rpx solid transparent;
}

.tag-mu {
  background: rgba(22, 163, 74, 0.08);
  color: #16a34a;
  border-color: #d1fae5;
}

.tag-huo {
  background: rgba(220, 38, 38, 0.08);
  color: #dc2626;
  border-color: #fecaca;
}

.tag-jin {
  background: #f1f5f9;
  color: #64748b;
}

.tag-shui {
  background: #f1f5f9;
  color: #64748b;
}

/* Dimension Section */
.dimension-section {
  display: flex;
  gap: 32rpx;
}

.dimension-card {
  flex: 1;
  background: #ffffff;
  border-radius: 48rpx;
  padding: 40rpx;
  border: 3rpx solid rgba(99, 102, 241, 0.12);
  box-shadow: 0 24rpx 60rpx rgba(99, 102, 241, 0.05);
}

.dimension-card.career {
  border-left: 8rpx solid #1e293b;
}

.dimension-card.rhythm {
  border-left: 8rpx solid #4f46e5;
}

.card-label {
  font-size: 24rpx;
  /* 原来是18rpx */
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 20rpx;
  letter-spacing: -0.01em;
}

.card-value {
  font-size: 26rpx;
  /* 原来是24rpx */
  font-weight: 900;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

.status {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.pulse-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #6366f1;
  animation: pulse 2s infinite;
}

.status-text {
  color: #4f46e5;
  font-size: 26rpx;
  /* 原来是24rpx */
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Analysis Section */
.analysis-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.analysis-item {
  padding: 40rpx;
  border-radius: 32rpx;
  background: #ffffff;
  border: 2rpx solid #e2e8f0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.analysis-indicator {
  width: 8rpx;
  height: 24rpx;
  border-radius: 4rpx;

  &.green {
    background: #22c55e;
  }

  &.red {
    background: #ef4444;
  }
  
  &.amber {
    background: #f59e0b;
  }
}

.analysis-title {
  font-size: 24rpx; /* 原来是20rpx */
  font-weight: 900;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.analysis-content {
  font-size: 24rpx; /* 原来是22rpx */
  font-weight: 700;
  color: rgb(71 85 105);
  line-height: 1.6;
  margin: 0;
}

.italic {
  font-style: italic;
}

.misalignment-risk {
  background: #fffbeb80;
  border-style: dashed;
  border-color: #fde68a99;
  border-width: 4rpx;
  color: #78350fb3;
}

/* Anxiety Profile Section */
.anxiety-profile-section {
  margin: 16px 0;
  .section-header {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-bottom: 32rpx;
    .primary {
      width: 8rpx;
      height: 24rpx;
      border-radius: 4rpx;
      background: #6366f1;
    }
  }
}

.section-label {
  font-size: 24rpx;
  font-weight: 900;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  text-align: center;
}

.anxiety-cards {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.anxiety-card {
  padding: 40rpx;
  border-radius: 32rpx;
  position: relative;
}

.primary-card {
  background: rgb(238 242 255 / 0.5);
  border: 2rpx solid rgb(224 231 255 / 0.5);
}

.secondary-card {
  background: #f8fafc;
  border: 2rpx solid rgb(226 232 240 / 0.6);
  .anxiety-question {
    color: #1e293b;
  }
  .detail-label {
    color: rgb(148 163 184);
  }
  .anxiety-reason {
    color: rgb(100 116 139);
  }
}

.card-header {
  display: flex;
  // align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.card-number {
  font-size: 24rpx;
  font-weight: 900;
  color: rgb(99, 102, 241);
  font-style: italic;
}

.anxiety-question {
  font-size: 24rpx;
  font-weight: 900;
  color: rgb(49, 46, 129);
  margin: 0;
  flex: 1;
  line-height: 1.5;
}

.card-divider {
  border-top: 2rpx solid currentColor;
  opacity: 0.2;
  margin: 0 0 24rpx 0;
}

.card-details {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.detail-label {
  font-size: 20rpx;
  font-weight: 900;
  color: rgb(129 140 248);
  text-transform: uppercase;
  flex-shrink: 0;
}

.anxiety-reason {
  font-size: 24rpx;
  font-weight: 700;
  color: rgb(79 70 229 / 0.8);
  margin: 0;
  flex: 1;
  line-height: 1.5;
}

/* Action Plan */
.action-plan {
  background: #ffffff;
  border-radius: 64rpx;
  overflow: hidden;
  border: 3rpx solid rgba(99, 102, 241, 0.12);
  box-shadow: 0 24rpx 60rpx rgba(99, 102, 241, 0.05);
}

.plan-header {
  background: #4f46e5;
  padding: 32rpx;
  font-size: 24rpx; /* 原来是20rpx */
  font-weight: 900;
  color: #ffffff;
  text-align: center;
  text-transform: uppercase;
}

.plan-content {
  padding: 48rpx;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plan-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-label {
  font-size: 24rpx;
  /* 原来是20rpx */
  font-weight: 900;
  color: #4f46e5;
  text-transform: uppercase;
  margin-bottom: 16rpx;
}

.item-content {
  font-size: 24rpx;
  /* 原来是22rpx */
  font-weight: 700;
  color: #374151;
  line-height: 1.6;
  margin: 0;
}

.plan-focus {
  padding: 32rpx;
  background: #eef2ff;
  border-radius: 32rpx;
  border: 2rpx solid #c7d2fe;
  text-align: center;
}

.focus-label {
  font-size: 24rpx;
  /* 原来是20rpx */
  font-weight: 900;
  color: #4f46e5;
  text-transform: uppercase;
  text-align: left;
  margin-bottom: 16rpx;
}

.focus-content {
  font-size: 24rpx;
  /* 原来是22rpx */
  font-weight: 900;
  color: #312e81;
  line-height: 1.6;
  margin: 0;
  text-align: left;
}

.plan-warning {
  padding-top: 32rpx;
  border-top: 2rpx solid #e2e8f0;
}

.warning-label {
  font-size: 24rpx;
  /* 原来是20rpx */
  font-weight: 900;
  color: #ef4444;
  text-transform: uppercase;
  margin-bottom: 16rpx;
}


.warning-content {
  font-size: 24rpx;
  /* 原来是22rpx */
  font-weight: 700;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.warning-highlight {
  color: #ef4444;
  font-weight: 900;
  margin-right: 10rpx;
  text-transform: uppercase;
}

/* Footer */
.report-footer {
  position: sticky;
  bottom: 0;
  padding: 30rpx;
  background: linear-gradient(to top, #f8faff, rgba(248, 250, 255, 0.8));
}

.deep-talk-btn {
  width: 100%;
  height: 112rpx;
  background: #111827;
  color: #ffffff;
  border-radius: 40rpx;
  font-size: 26rpx;
  /* 原来是24rpx */
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>