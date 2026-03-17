<template>
  <view 
    class="immersive-card" 
    :class="[{ small: isSmall }]"
    @click="$emit('click')"
  >
    <!-- 前景图标 -->
    <view 
      class="icon-container" 
      :class="[colorClass.bgLight]"
    >
      <slot name="icon">
        <u-icon 
          :name="icon" 
          :size="48" 
          :color="iconColor"
        ></u-icon>
      </slot>
    </view>
    
    <!-- 卡片内容 -->
    <view class="card-content">
      <text 
        class="card-title" 
      >{{ title }}</text>
      <text 
        class="card-subtitle" 
      >{{ subtitle }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  /** 标题 */
  title: string;
  /** 副标题 */
  subtitle: string;
  /** 图标名称 (u-icon) */
  icon: string;
  /** 背景符号 (deprecated in new design) */
  symbol?: string;
  /** 主题颜色类型 */
  type: 'trend' | 'match' | 'emo' | 'biz' | 'mbti' | 'bazi';
  /** 尺寸 (deprecated in new design, kept for compatibility) */
  size?: 'normal' | 'small';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'normal'
});

const isSmall = computed(() => props.size === 'small');

// 颜色映射配置
const colorMap = {
  trend: { text: 'c-trend', bgLight: 'bg-trend-light', hex: '#4F46E5' },
  match: { text: 'c-match', bgLight: 'bg-match-light', hex: '#EC4899' },
  emo: { text: 'c-emo', bgLight: 'bg-emo-light', hex: '#8B5CF6' },
  biz: { text: 'c-biz', bgLight: 'bg-biz-light', hex: '#F59E0B' },
  mbti: { text: 'c-mbti', bgLight: 'bg-mbti-light', hex: '#10B981' },
  bazi: { text: 'c-bazi', bgLight: 'bg-bazi-light', hex: '#E11D48' }
};

const colorClass = computed(() => {
  const config = colorMap[props.type] || colorMap.trend;
  return {
    text: config.text,
    bgLight: config.bgLight
  };
});

const iconColor = computed(() => {
  const config = colorMap[props.type] || colorMap.trend;
  return config.hex;
});

defineEmits(['click']);
</script>

<style lang="scss" scoped>
.immersive-card {
  background: #FFFFFF;
  border-radius: 40rpx;
  padding: 32rpx;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  min-height: auto;
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:active {
    transform: scale(0.98);
  }
}

.icon-container {
  width: 96rpx;
  height: 96rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 32rpx;
  margin-bottom: 0;
  flex-shrink: 0;
}

.card-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.card-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: 12rpx;
}

.card-subtitle {
  font-size: 28rpx;
  color: #94a3b8;
  line-height: 1.4;
}

// 颜色工具类 - 浅色背景
.bg-trend-light { background: rgba(79, 70, 229, 0.08); }
.bg-match-light { background: rgba(236, 72, 153, 0.08); }
.bg-emo-light { background: rgba(139, 92, 246, 0.08); }
.bg-biz-light { background: rgba(245, 158, 11, 0.08); }
.bg-mbti-light { background: rgba(16, 185, 129, 0.08); }
.bg-bazi-light { background: rgba(225, 29, 72, 0.08); }
</style>
