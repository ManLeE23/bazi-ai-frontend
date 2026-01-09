<template>
  <view class="report-card">
    <!-- Header -->
    <view class="card-header">
      <text class="card-title">{{ report.userName }}</text>
      <view class="date-info">
        <text class="date-text">{{ report.date }}</text>
      </view>
    </view>

    <!-- Birth Info -->
    <view class="birth-info">
      <text class="birth-text">出生日期：{{ report.birthDate }} · {{ report.birthTime }}</text>
    </view>

    <!-- Dimensions -->
    <view class="dimensions-section">
      <text class="section-label">分析维度</text>
      <view class="dimensions-container">
        <view
          v-for="(dimension, index) in report.dimensions"
          :key="index"
          class="dimension-tag"
          :class="getDimensionClass(dimension)"
        >
          <uni-icons :type="getDimensionIcon(dimension)" size="16" :color="getDimensionColor(dimension)"></uni-icons>
          <text>{{ dimension }}</text>
        </view>
      </view>
    </view>

    <!-- Actions -->
    <view class="actions-container">
      <bazi-button
        @click="handleViewReport"
        :show-shadow="false"
        :custom-style="{height: '36px' }"
      >
        <uni-icons type="eye" size="16" color="#FFFFFF"></uni-icons>
        <text class="action-text">查看报告</text>
      </bazi-button>
      <bazi-button
        @click="handleContinueChat"
        :show-shadow="false"
        type="secondary"
        :custom-style="{height: '36px' }"
      >
        <uni-icons type="chatbubble" size="16" color="#D97706"></uni-icons>
        <text class="action-text chat-text">继续提问</text>
      </bazi-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import BaziButton from '@/components/BaziButton.vue';

interface HistoryReport {
  id: string;
  title: string;
  date: string;
  dimensions: string[];
  birthDate: string;
  birthTime: string;
  userName: string;
}

interface Props {
  report: HistoryReport;
  onViewReport: (reportId: string) => void;
  onContinueChat: (reportId: string) => void;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  viewReport: [string];
  continueChat: [string];
}>();


// 获取维度对应的图标
const getDimensionIcon = (dimension: string) => {
  const icons: Record<string, string> = {
    '事业': 'arrowup',
    '感情': 'heart',
    '财运': 'medal',
    '性格': 'person',
    '健康': 'contact',
  };
  return icons[dimension] || 'star';
};

// 获取维度对应的颜色
const getDimensionColor = (dimension: string) => {
  const colors: Record<string, string> = {
    '事业': '#2563EB',
    '感情': '#DB2777',
    '财运': '#059669',
    '性格': '#7E22CE',
    '健康': '#EA580C',
  };
  return colors[dimension] || '#6B7280';
};

// 获取维度对应的样式类
const getDimensionClass = (dimension: string) => {
  const classes: Record<string, string> = {
    '事业': 'dimension-business',
    '感情': 'dimension-love',
    '财运': 'dimension-fortune',
    '性格': 'dimension-character',
    '健康': 'dimension-health',
  };
  return classes[dimension] || 'dimension-default';
};

const handleViewReport = () => {
  console.log('handleViewReport', props);
  emit('viewReport', props.report.id);
};

const handleContinueChat = () => {
  emit('continueChat', props.report.id);
};
</script>

<style lang="scss" scoped>
.report-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.card-header {
  margin-bottom: 16rpx;
}

.card-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #111827;
  display: block;
  margin-bottom: 8px;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
}

.calendar-icon {
  margin-right: 4px;
}

.date-text {
  font-size: 28rpx;
}

.birth-info {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.birth-text {
  color: #475569;
  font-size: 28rpx;
}

.dimensions-section {
  padding: 12px 0;
}

.section-label {
  color: #64748b;
  font-size: 28rpx;
  display: block;
  margin-bottom: 8rpx;
}

.dimensions-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  padding: 4px 0;
}

.dimension-tag {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.dimension-business {
  color: #2563EB;
  background-color: #EFF6FF;
}

.dimension-love {
  color: #DB2777;
  background-color: #FCE7F3;
}

.dimension-fortune {
  color: #059669;
  background-color: #ECFDF5;
}

.dimension-character {
  color: #7E22CE;
  background-color: #F3E8FF;
}

.dimension-health {
  color: #EA580C;
  background-color: #FFFBEB;
}

.actions-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 12rpx;
  border-radius: 16rpx;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.view-btn {
  background: linear-gradient(to right, #FBBF24, #F97316);
  color: #FFFFFF;
  box-shadow: 0 4rpx 6rpx -1rpx rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -1rpx rgba(0, 0, 0, 0.06);
}

.view-btn:active {
  transform: scale(0.98);
}

.chat-btn {
  background-color: #FFFFFF;
  border: 2rpx solid #FBBF24;
  color: #D97706;
}

.chat-btn:active {
  transform: scale(0.98);
}

.action-text {
  color: #FFFFFF;
}

.chat-text {
  color: #D97706;
}
</style>