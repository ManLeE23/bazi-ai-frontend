<template>
  <div class="step-bar" ref="containerRef">
    <div 
      v-for="(step, index) in steps" 
      :key="index"
      :class="[
        'step-item', 
        { 
          'completed': step.content.type === 'completed',
          'active': index === steps.length - 1
        }
      ]"
    >
      <!-- 步骤图标 -->
      <div class="step-icon">
        <span v-if="step.content.type === 'completed'">✓</span>
        <span v-else>●</span>
      </div>
      
      <!-- 步骤内容 -->
      <div class="step-content">
        <div class="step-title">{{ step.title }}</div>
        <div 
          v-if="step.content.type === 'llm_stream'" 
          class="llm-content"
          v-html="formatContent(step.content.content)"
        ></div>
        <div 
          v-else-if="step.content.type === 'system_message'" 
          class="system-message"
          v-html="formatContent(step.content.content)"
        ></div>
        <div 
          v-else-if="step.content.type === 'thinking'" 
          class="thinking-content"
          v-html="formatContent(step.content.content)"
        ></div>
        <div 
          v-else-if="step.content.type === 'generater_report'" 
          class="generate-report-content"
          v-html="formatContent(step.content.content)"
        ></div>
        <div 
          v-else-if="step.content.type === 'completed'" 
          class="completed-content"
          v-html="formatContent(step.content.content)"
        ></div>
        <div 
          v-else 
          class="default-content"
          v-html="formatContent(step.content.content)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

interface StepContent {
  type: string;
  content: string;
  timestamp?: string;
}

interface Step {
  stage: number;
  title: string;
  content: StepContent;
  timestamp: string;
}

const props = defineProps<{
  messages: Array<{
    stage: number;
    title: string;
    messages: StepContent;
    timestamp: string;
  }>;
}>();

const steps = ref<Step[]>([]);
const containerRef = ref<HTMLDivElement | null>(null);

// 处理接收到的消息
watch(() => props.messages, async (newMessages) => {
  console.log('Processing new messages:', newMessages);
  let shouldScroll = false;
  
  newMessages.forEach(msg => {
    if (msg && msg.stage && msg.title && msg.messages) {
      const existingStepIndex = steps.value.findIndex(step => step.stage === msg.stage);
      
      if (existingStepIndex !== -1) {
        if (msg.messages.type === 'llm_stream') {
          console.log(`Appending content to stage ${msg.stage}:`, msg.messages.content);
          steps.value[existingStepIndex].content.content += msg.messages.content;
          shouldScroll = true;
        } else {
          console.log(`Updating content for stage ${msg.stage}:`, msg.messages);
          steps.value[existingStepIndex].content = msg.messages;
        }
      } else {
        console.log(`Adding new stage ${msg.stage}:`, msg.messages);
        steps.value.push({
          stage: msg.stage,
          title: msg.title,
          content: msg.messages,
          timestamp: msg.timestamp
        });
        shouldScroll = true;
      }
    } else {
      console.log('Skipping invalid message:', msg);
    }
  });
  
  console.log('Current steps:', steps.value);
  
  // 如果有新内容或流式更新，滚动到最新位置
  if (shouldScroll) {
    await nextTick();
    scrollToBottom();
  }
}, { deep: true, immediate: true });

// 格式化内容，将换行符转换为<br>标签
const formatContent = (content: string) => {
  return content.replace(/\n/g, '<br>');
};

// 滚动到底部
const scrollToBottom = () => {
  if (containerRef.value) {
    // 使用平滑滚动
    containerRef.value.scrollTo({
      top: containerRef.value.scrollHeight,
      behavior: 'smooth'
    });
  }
};
</script>

<style lang="scss" scoped>
/* 步骤条容器 - 实现滚动跟随 */
.step-bar {
  position: sticky; /* 滚动跟随核心属性 */
  top: 20px; /* 距离顶部20px固定 */
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  max-height: 600px;
  overflow-y: auto;
  
  /* 自定义滚动条样式 */
  /* &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: $color-slate-300;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: $color-slate-400;
  } */
}

/* 单个步骤项 - 核心布局 */
.step-item {
  display: flex; /* 横向排列：icon + 内容 */
  position: relative; /* 用于连接线定位 */
  padding-left: 30px; /* 给icon留位置 */
  margin-bottom: 25px; /* 步骤间间距 */
}

/* 最后一个步骤去掉底部间距 */
.step-item:last-child {
  margin-bottom: 0;
}

/* 步骤icon容器 */
.step-icon {
  position: absolute;
  left: 0;
  top: 0;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  color: #fff; /* icon文字颜色 */
  font-size: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 未完成步骤：圆点icon */
.step-item .step-icon {
  color: #f59e0b; /* 圆点颜色=主题色 */
  font-size: 16px;
}

/* 已完成步骤：对勾icon + 背景 */
.step-item.completed .step-icon {
  background-color: #f59e0b; /* 完成态背景=主题色 */
  color: #fff; /* 对勾白色 */
  border-radius: 50%; /* 圆形背景 */
  font-size: 12px;
}

/* 当前激活步骤：圆点放大+加粗 */
.step-item.active .step-icon {
  font-size: 20px;
  color: #f59e0b;
  font-weight: bold;
}

/* 步骤间的连接线（核心） */
.step-item::before {
  content: '';
  position: absolute;
  left: 9px; /* 与icon居中对齐 */
  top: 20px; /* 从icon底部开始 */
  bottom: -25px; /* 延伸到下一个步骤 */
  width: 1px; /* 线宽 */
  background-color: #f59e0b33; /* 主题色半透明 */
  z-index: -1; /* 放在内容下方 */
}

/* 最后一个步骤去掉连接线 */
.step-item:last-child::before {
  display: none;
}

/* 步骤内容样式 */
.step-content {
  margin-left: 10px;
  color: #1F2937; /* 黑色文字 */
}

.step-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
  font-weight: bold;
}

/* 激活步骤的标题高亮 */
.step-item.active .step-title {
  color: #f59e0b; /* 主题色 */
}

.step-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 3px;
}

/* 不同类型内容的样式 */
.llm-content {
  font-size: 14px;
  color: #1F2937; /* 黑色文字 */
  line-height: 1.5;
}

.system-message {
  color: #1F2937; /* 黑色文字 */
  font-style: italic;
}

.thinking-content {
  color: #1F2937; /* 黑色文字 */
  font-style: italic;
}

.generate-report-content {
  color: #1F2937; /* 黑色文字 */
}

.completed-content {
  color: #1F2937; /* 黑色文字 */
  font-weight: bold;
}

.default-content {
  color: #1F2937; /* 黑色文字 */
}
</style>