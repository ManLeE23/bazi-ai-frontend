<template>
  <div class="chat-page">
    <!-- Header -->
    <div class="chat-header">
      <u-navbar
        :is-back="true"
        :is-fixed="true"
        background="transparent"
        back-icon-color="#fff"
        :border-bottom="false"
      />
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <image src="@/static/icon/chat.svg" class="icon" />
          </div>
          <div class="header-text">
            <h3 class="header-title">AI 命师</h3>
            <p class="header-subtitle">还剩 {{ remainingQuestions }} 次免费解答</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="messages-container">
      <div 
        v-for="(message, index) in messages" 
        :key="index"
        :class="['message-item', message.role === 'user' ? 'user-message' : 'ai-message']"
      >
        <div :class="['message-content', message.role === 'user' ? 'user-content' : 'ai-content']">
          <p class="message-text">{{ message.content }}</p>
        </div>
      </div>

      <div v-if="isTyping" class="message-item ai-message">
        <div class="ai-content typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>

      <div ref="messagesEndRef" />
    </div>

    <!-- Input Area -->
    <div class="input-container">
      <div v-if="remainingQuestions === 0" class="upgrade-section">
        <div class="upgrade-content">
          <p class="upgrade-text">免费次数已用完</p>
          <p class="upgrade-subtext">升级会员获取更多解答</p>
        </div>
        <div class="upgrade-button">
          <button class="upgrade-btn">立即升级会员</button>
        </div>
      </div>
      <div v-else class="input-area">
        <input
          ref="inputRef"
          type="text"
          v-model="input"
          @keypress="handleKeyPress"
          placeholder="输入你的疑问..."
          :disabled="isTyping"
          class="chat-input"
        />
        <button
          @click="handleSend"
          :disabled="!input.trim() || isTyping"
          class="send-btn"
        >
          <image src="@/static/icon/send.svg" class="send-icon" />
        </button>
      </div>
    </div>

    <!-- Tabbar -->
    <Tabbar :current="1" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import Tabbar from '@/components/Tabbar.vue';
import { onLoad } from '@dcloudio/uni-app';

type Message = {
  role: 'user' | 'ai';
  content: string;
};

const messages = ref<Message[]>([
  {
    role: 'ai',
    content: '你好！我是你的 AI 命师，可以基于你的八字报告为你解答疑问。请问有什么想了解的吗？',
  },
]);
const input = ref('');
const remainingQuestions = ref(3);
const isTyping = ref(false);
const messagesEndRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

let chatId: string | null = null;

onLoad((options) => {
  if (options.chatId) {
    chatId = options.chatId;
    // 这里可以添加加载聊天历史的逻辑
  }
  if (options.reportId) {
    // 这里可以添加加载报告相关信息的逻辑
  }
});

onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus();
  }
});

const scrollToBottom = async () => {
  await nextTick();
  if (messagesEndRef.value) {
    uni.pageScrollTo({
      scrollTop: messagesEndRef.value.offsetTop,
      duration: 300
    });
  }
};

// 每次消息更新后滚动到底部
const updateMessages = () => {
  nextTick(() => {
    scrollToBottom();
  });
};

updateMessages();

const handleSend = () => {
  if (!input.value.trim() || remainingQuestions.value === 0 || isTyping.value) return;

  const userMessage: Message = {
    role: 'user',
    content: input.value,
  };

  messages.value.push(userMessage);
  input.value = '';
  isTyping.value = true;
  remainingQuestions.value -= 1;

  updateMessages();

  // 模拟AI思考和回复
  setTimeout(() => {
    const aiResponse = generateAIResponse(input.value);
    messages.value.push({ role: 'ai', content: aiResponse });
    isTyping.value = false;
    updateMessages();
  }, 2000);
};

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};

const generateAIResponse = (question: string): string => {
  const lowerQuestion = question.toLowerCase();

  // 关键词匹配
  if (lowerQuestion.includes('工作') || lowerQuestion.includes('换') || lowerQuestion.includes('事业')) {
    return `从你的命盘来看，你当前处于"金水为喜"的阶段。

换工作适合寻找更结构化、流程清晰的团队。

你现在的犹豫来自"身弱容易多想"的特质。
你可以问自己两个问题：
1）这个新公司是否更稳定？
2）是否能提供明确角色定位？

如果两者都更明确，那换是对你有利的。`;
  }

  if (lowerQuestion.includes('感情') || lowerQuestion.includes('恋爱') || lowerQuestion.includes('结婚')) {
    return `根据你的八字分析，你对感情很敏感，也容易吸引异性注意。

但你可能会遇到需要做选择的情况，或者在两个人之间犹豫不决。

建议：
 选择那个让你感觉舒服、能理解你敏感内心的人
• 在感情中要更果断一些，不要拖泥带水
• 信任自己的直觉，它通常是对的

现在这个阶段适合理性思考感情问题，不要冲动做决定。`;
  }

  if (lowerQuestion.includes('财运') || lowerQuestion.includes('钱') || lowerQuestion.includes('投资')) {
    return `从你的命盘看，你有赚钱的机会和想法，但需要注意：

你的身弱特质意味着：如果步子迈太大，容易把自己累垮。

理财建议：
• 小步快跑比大刀阔斧更适合你
• 避免高风险投资
• 通过积累和复利的方式，长期来看会更有收获
• 稳健的投资策略会让你走得更远

记住：稳定增长比一夜暴富更适合你的命格。`;
  }

  if (lowerQuestion.includes('健康') || lowerQuestion.includes('身体') || lowerQuestion.includes('累')) {
    return `根据你的命盘，你可能容易感觉疲累，或者某些方面比较敏感。

健康建议：
• 每周保持 3 次以上的运动
• 多喝温水，保持充足睡眠
• 避免熬夜，这对你尤其重要
• 户外活动会让你精神状态更好

保持规律的作息和运动对你特别重要。你的能量需要通过良好的生活习惯来补充。`;
  }

  if (lowerQuestion.includes('什么时候') || lowerQuestion.includes('时间') || lowerQuestion.includes('何时')) {
    return `关于时机的问题，从命理角度来说：

你的命格特点是"思虑多而行动少"，所以与其等待完美时机，不如：

1. 先做小范围尝试，边做边调整
2. 不要等到完全准备好才开始
3. 给自己设定具体的启动日期

记住：对你来说，"开始行动"本身就是最好的时机。完美的时机往往是在行动中创造出来的。`;
  }

  // 默认回复
  return `感谢你的提问。

针对你的疑问，我建议：
• 多运用理性思考和清晰表达，这是你的强项
• 不要因为想太多而迟迟不行动
• 找到能支持你、理解你的伙伴很重要

如果你能具体描述一下你的情况，比如涉及事业、感情、还是财运方面，我可以给你更有针对性的建议。`;
};
</script>

<style lang="scss" scoped>
.chat-page {
  min-height: 100vh;
  background: $color-white;
  display: flex;
  flex-direction: column;
  padding-top: var(--status-bar-height) 0 70px 0;
}

.chat-header {
  background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
  padding: 24px 20px 24px 20px;
  box-sizing: border-box;
  position: relative;
  z-index: 10;
  margin-bottom: 0;
  
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .header-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .header-icon {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .icon {
          width: 20px;
          height: 20px;
        }
      }
      
      .header-text {
        .header-title {
          color: $color-white;
          font-size: $text-lg;
          margin: 0;
          font-weight: 600;
        }
        
        .header-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: $text-sm;
          margin: 0;
        }
      }
    }
  }
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
  background: $color-slate-50;
  
  .message-item {
    margin-bottom: 16px;
    display: flex;
    
    &.user-message {
      justify-content: flex-end;
    }
    
    &.ai-message {
      justify-content: flex-start;
    }
    
    .message-content {
      max-width: 80%;
      border-radius: 16px;
      padding: 12px 16px;
      
      &.user-content {
        background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
        color: $color-white;
      }
      
      &.ai-content {
        background: $color-slate-100;
        color: $color-slate-700;
      }
    }
    
    .message-text {
      margin: 0;
      line-height: 1.5;
      white-space: pre-wrap;
    }
  }
  
  .typing-indicator {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 8px 12px !important;
    
    .typing-dot {
      width: 8px;
      height: 8px;
      background: $color-slate-400;
      border-radius: 50%;
      animation: bounce 1.5s infinite ease-in-out;
      
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.input-container {
  padding: 16px 20px;
  background: $color-white;
  border-top: 1px solid $color-slate-200;
  
  .upgrade-section {
    background: linear-gradient(135deg, $color-amber-50, $color-orange-50);
    border: 2px solid $color-amber-400;
    border-radius: 16px;
    padding: 16px;
    
    .upgrade-content {
      text-align: center;
      margin-bottom: 12px;
      
      .upgrade-text {
        color: $color-amber-800;
        font-size: $text-base;
        font-weight: 600;
        margin: 0 0 4px 0;
      }
      
      .upgrade-subtext {
        color: $color-amber-600;
        font-size: $text-sm;
        margin: 0;
      }
    }
    
    .upgrade-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
      color: $color-white;
      border: none;
      border-radius: 12px;
      font-size: $text-base;
      font-weight: 600;
    }
  }
  
  .input-area {
    display: flex;
    gap: 12px;
    
    .chat-input {
      flex: 1;
      padding: 12px 16px;
      background: $color-slate-50;
      border: 1px solid $color-slate-200;
      border-radius: 12px;
      font-size: $text-base;
      
      &:focus {
        outline: none;
        border-color: $color-amber-400;
        box-shadow: 0 0 0 2px rgba($color-amber-400, 0.2);
      }
      
      &[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    
    .send-btn {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
      border: none;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .send-icon {
        width: 20px;
        height: 20px;
      }
      
      &[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
</style>