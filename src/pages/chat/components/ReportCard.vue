<template>
  <div 
    class="report-complete-card"
    @click="handleClick"
  >
    <div class="card-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 2V8H20" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 13H8" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 17H8" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 9H8" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="card-content">
      <div class="card-title">八字分析报告已生成</div>
      <div class="card-desc">点击查看详细分析结果</div>
    </div>
    <div class="card-arrow">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5 5L12.5 10L7.5 15" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义组件事件
const emit = defineEmits<{
  click: []
}>()

// 处理点击事件
const handleClick = () => {
  emit('click');
}
</script>

<style lang="scss" scoped>
.report-complete-card {
  margin-top: $spacing-lg;
  padding: $spacing-md;
  background: $color-white;
  border: 2px dashed $color-slate-200;
  border-radius: $border-radius-base;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: $color-blue-500;
    background: $color-blue-50;
    transform: translateY(-2px);
  }
  
  .card-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $color-slate-100;
    border-radius: $border-radius-base;
  }
  
  .card-content {
    flex: 1;
    
    .card-title {
      font-weight: 600;
      color: #1F2937;
      font-size: $text-base;
      margin-bottom: $spacing-xs;
    }
    
    .card-desc {
      color: #6B7280;
      font-size: $text-sm;
    }
  }
  
  .card-arrow {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }
}
</style>