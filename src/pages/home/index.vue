<template>
  <view class="root">
    <!-- Background Blobs -->
    <view class="energy-blob blob-1"></view>
    <view class="energy-blob blob-2"></view>

    <!-- Custom Header -->
    <HeaderBar :fixed="true" :show-back="false">
      <template #left>
        <button @click="showSidebar = true" class="sidebar-toggle-btn">
          <view class="hamburger-icon">
            <view class="bar long"></view>
            <view class="bar short"></view>
          </view>
        </button>
      </template>
    </HeaderBar>
    
    <!-- Sidebar -->
    <u-popup v-model="showSidebar" mode="left" width="600">
      <SidebarMenu 
        :current-profile="userInfo"
        @open-user-center="handleOpenUserCenter" 
        @switch-profile="handleSwitchProfile" 
        @open-fortune="handleOpenFortune"
      />
    </u-popup>

    <!-- User Center Popup -->
    <UserCenterPopup v-model="showUserPopup" @open-upgrade="handleOpenUpgrade" />

    <!-- Upgrade Popup -->
    <UpgradePopup v-model="showUpgradePopup" />

    <!-- Chat Messages -->
    <view class="scroll-box" :style="{ paddingTop: (headerHeight + 16) + 'px' }">
      
      <!-- Loading State for Profile Switch -->
      <view v-if="isSwitchingProfile" class="profile-switching-state">
        <view class="custom-loader">
          <view class="dot"></view>
          <view class="dot"></view>
          <view class="dot"></view>
        </view>
        <text class="loading-text">正在加载...</text>
      </view>

      <template v-else>

        <!-- Profile Guide Card -->
        <view v-if="showProfileGuide" class="profile-guide-wrapper">
        <view class="slogan-section">
          <view class="slogan-bar"></view>
          <view class="slogan-title">
            <text>看清</text><text class="text-gray">趋势，</text>
          </view>
          <view class="slogan-title">
            <text>走对</text><text class="text-indigo">下一步。</text>
          </view>
          <text class="slogan-sub">DIGITAL WISDOM & DESTINY ALGORITHMS</text>
        </view>
        <ProfileGuideCard />
      </view>

      <!-- Chat Message List -->
      <view class="chat-message-list">
        <!-- Initial Greeting (Static or Dynamic?) - keeping dynamic for now -->
        
        <view v-for="(message, index) in chatMessages" :key="index" class="message-wrapper message-in">
          
          <!-- Thinking Chain Display -->
          <view v-if="message.reasoning_content" class="thinking-box animate-fade-in">
            <view @click="toggleReasoning(message)" class="thinking-header">
              <view class="thinking-header-left">
                <view class="thinking-icon" :class="{ 'animate-spin': isThinking && index === chatMessages.length - 1 }">
                  <view class="icon-svg"></view>
                </view>
                <text class="status-text-thinking">
                  {{ (isThinking && index === chatMessages.length - 1) ? '深度思考中...' : '已完成深度思考' }}
                </text>
              </view>
            </view>
          </view>

          <!-- Message Bubble -->
          <view :class="['message-row', message.role === 'user' ? 'justify-end' : 'justify-start']">
            <template v-if="message.type === 'bazi' && userInfo">
               <BaziCard :data="message.baziData" :userInfo="userInfo" />
            </template>
            <view v-else :class="['bubble', message.role === 'user' ? 'user-bubble' : 'ai-bubble']">
              <view class="bubble-content">
                <text v-if="message.role === 'user' && message.content" :user-select="true" :selectable="true" class="message-text user-text">{{ message.content }}</text>
                <MarkDown v-else-if="message.role === 'assistant' && message.content" :content="message.content" />
              </view>
            </view>
          </view>
          
        </view>

        <!-- Typing indicator -->
        <view v-if="isTyping" class="message-wrapper">
          <view class="message-row justify-start">
             <view class="bubble ai-bubble typing-bubble">
                <LoadingIndicator />
             </view>
          </view>
        </view>

        <!-- Quick Questions -->
        <view v-if="showQuickQuestions" class="quick-questions-container">
          <!-- Header -->
          <view class="quick-header">
            <view class="quick-header-left">
              <view class="quick-header-bar"></view>
              <text class="quick-header-title">猜你想问</text>
            </view>
            <view class="quick-header-right" @click="loadQuickQuestions">
              <view class="refresh-icon">
                <image src="@/static/icon/refresh.svg" class="refresh-img" />
              </view>
              <text class="refresh-text">换一批</text>
            </view>
          </view>
          
          <!-- Questions List -->
          <view class="quick-list" v-if="isLoadingQuickQuestions">
            <view 
              v-for="i in 3" 
              :key="i" 
              class="quick-card skeleton-card"
            >
              <view class="skeleton-badge"></view>
              <view class="skeleton-text"></view>
            </view>
          </view>
          <view class="quick-list" v-else>
            <button 
              v-for="(q, index) in quickQuestions" 
              :key="index" 
              class="quick-card"
              @click="sendQuickQuestion(q)"
            >
              <view class="question-badge">
                <text class="badge-text">Q{{ index + 1 }}</text>
              </view>
              <text class="question-text">{{ q }}</text>
            </button>
          </view>
        </view>
        
        <view id="chat-bottom" style="height: 1rpx;"></view>
      </view>
      </template>
    </view>

    <!-- Scroll to Bottom Button -->
    <view class="scroll-to-bottom" v-if="!isUserAtBottom" @click.stop="scrollToBottom(true)">
      <view class="arrow-icon">
        <image :src="downSvg" class="icon-img" mode="aspectFit" />
      </view>
    </view>

    <!-- Input Area -->
    <InputWithButton 
      :model-value="inputText" 
      :show-bazi="hasProfile" 
      :is-a-i-sending="isGenerating"
      @update:model-value="onInputUpdate" 
      @click="sendQuestion"
      @show-bazi="handleShowBazi" 
    />
  </view>
</template>

<script setup lang="ts">
import { onLoad, onPageScroll } from '@dcloudio/uni-app';
import { ref, onMounted, nextTick, computed, watch } from 'vue';
import { userStore, type UserInfo } from '@/store/user';
import HeaderBar from '@/components/HeaderBar.vue';
import ProfileGuideCard from './components/ProfileGuideCard.vue';
import SidebarMenu from './components/SidebarMenu.vue';
import UserCenterPopup from './components/UserCenterPopup.vue';
import UpgradePopup from './components/UpgradePopup.vue';
import useSSEMessage from './hooks/useSSEMessage'; // 导入新的hook
import { fetchChatHistory, fetchBaziCalculate, fetchSessionUserInfo, fetchProfilesList, fetchCreateSession, fetchSuggestedQuestions } from '@/api/services';
import InputWithButton from '@/components/InputWithButton.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import MarkDown from '../components/MarkDown/index.vue';
import BaziCard from './components/BaziCard.vue';
import downSvg from '@/static/icon/down.svg?url';
import { doLogin } from '@/utils/auth';

const isUserAtBottom = ref(true); // Track if user is at bottom

// Auth Check
onMounted(() => {
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.reLaunch({
      url: '/pages/login/index'
    });
  }
});

const isSwitchingProfile = ref(false);
const showSidebar = ref(false);
const showUserPopup = ref(false);
const showUpgradePopup = ref(false);
const headerHeight = ref(0);

const chatMessages = ref<{ 
  role: string; 
  content: string; 
  timestamp: Date; 
  id: string; 
  reasoning_content?: string; 
  isReasoningExpanded?: boolean; 
  isStreaming?: boolean;
  type?: 'text' | 'bazi';
  baziData?: any;
}[]>([]);
const inputText = ref('');
const isTyping = ref(false);
const isGenerating = ref(false);

const sessionId = ref<string>('');
const isFromIndexPage = ref(false);

// 思维链相关状态
const isThinking = ref(false);

const userInfo = computed({
  get: () => userStore.userInfo,
  set: (val) => {
    if (val) {
      userStore.setUserInfo(val);
    } else {
      userStore.clearUserInfo();
    }
  }
});

const isLoadingUserInfo = ref(true);
const baziFetchPromise = ref<Promise<any> | null>(null);

const showQuickQuestions = ref(false);
const quickQuestions = ref<string[]>([]);
const isLoadingQuickQuestions = ref(false);

const loadQuickQuestions = async () => {
  isLoadingQuickQuestions.value = true;
  try {
    const res: any = await fetchSuggestedQuestions({
      session_id: sessionId.value || undefined,
      limit: 3
    });
    if (res && res.data && Array.isArray(res.data.questions)) {
      quickQuestions.value = res.data.questions;
    }
  } catch (e) {
    console.error('Failed to load suggested questions:', e);
  } finally {
    isLoadingQuickQuestions.value = false;
  }
};

const isProfileListEmpty = ref(false);
const isScrollThrottled = ref(false);

const welcomeTimers = ref<number[]>([]);

const clearWelcomeTimers = () => {
  welcomeTimers.value.forEach(timer => clearTimeout(timer));
  welcomeTimers.value = [];
};

const sendQuickQuestion = (q: string) => {
  inputText.value = q;
  sendQuestion();
  showQuickQuestions.value = false;
};

const simulateWelcomeMessages = () => {
  clearWelcomeTimers();
  // Start loading questions early
  loadQuickQuestions();
  
  const name = userInfo.value?.name || '你';
  
  // Message 1
  chatMessages.value.push({
    role: 'assistant',
    content: `Hi，${name}`,
    timestamp: new Date(),
    id: `welcome-1-${Date.now()}`
  });
  
  const timer1 = setTimeout(() => {
    // Message 2
    chatMessages.value.push({
      role: 'assistant',
      content: '我是 Trenlify，现在可以聊聊你当下最关心的人生方向啦',
      timestamp: new Date(),
      id: `welcome-2-${Date.now()}`
    });
    scrollToBottom(true);
    
    const timer2 = setTimeout(() => {
      // Message 3
      chatMessages.value.push({
        role: 'assistant',
        content: '不管是事业、情感还是其他选择，都可以跟我说，我帮你拆解趋势～',
        timestamp: new Date(),
        id: `welcome-3-${Date.now()}`
      });
      scrollToBottom(true);
      
      const timer3 = setTimeout(() => {
        showQuickQuestions.value = true;
        nextTick(() => {
          scrollToBottom(true);
        });
      }, 600);
      welcomeTimers.value.push(timer3);
    }, 1000);
    welcomeTimers.value.push(timer2);
  }, 800);
  welcomeTimers.value.push(timer1);
};

const hasProfile = computed(() => {
  return !!(userInfo.value && userInfo.value.name);
});

const showProfileGuide = computed(() => {
  // if (chatMessages.value.length > 0) return false;
  return isProfileListEmpty.value || (!isLoadingUserInfo.value && !hasProfile.value);
});

const initBaziData = (info: any) => {
  baziFetchPromise.value = fetchBaziCalculate(info)
    .then(res => ({ success: true, res }))
    .catch(error => {
      console.error('Bazi pre-fetch failed:', error);
      return { success: false, error };
    });
};

onLoad(async (options: any) => {
  try {
    const profilesRes: any = await fetchProfilesList();
    if (profilesRes.data && Array.isArray(profilesRes.data.items) && profilesRes.data.items.length === 0) {
      // No profiles, show guide
      isProfileListEmpty.value = true;
      userInfo.value = null;
    } else {
      // Has profiles, try to get history for current or first profile
      const profiles = profilesRes.data?.items || (Array.isArray(profilesRes.data) ? profilesRes.data : []);
      if (profiles.length > 0) {
        let targetProfile = profiles[0];
        
        try {
          const lastUser = userStore.userInfo;
          if (lastUser && lastUser.id) {
            const foundProfile = profiles.find((p: any) => p.id === lastUser.id);
            if (foundProfile) {
              targetProfile = foundProfile;
            }
          }
        } catch (e) {
          console.error('Restoring last profile failed:', e);
        }

       userInfo.value = targetProfile;

        if (targetProfile.session_id) {
          sessionId.value = targetProfile.session_id;
          await getChatHistory();
        } else {
          // Profile exists but no session, simulate welcome
          simulateWelcomeMessages();
        }
      } else {
        // Fallback
        simulateWelcomeMessages();
      }
    }
  } catch (e) {
    console.error('Failed to check profiles:', e);
    // Fallback to welcome messages on error
    simulateWelcomeMessages();
  }
  if (options.sessionId) {
    sessionId.value = options.sessionId;

    // 检查是否从首页进入
    isFromIndexPage.value = options.from === 'index' || !options.from;

    getChatHistory();
  }

  if (options.userInfo) {
    try {
      const parsedInfo = JSON.parse(decodeURIComponent(options.userInfo));
      userInfo.value = parsedInfo;
      initBaziData(parsedInfo);

      // Handle new profile creation flow
      if (options.isNewProfile === 'true') {
         simulateWelcomeMessages();
      }
    } catch (e) {
      console.error('Parse userInfo error:', e);
    }
    isLoadingUserInfo.value = false;
  } else if (sessionId.value && (options.sessionId || !userInfo.value)) {
    // Historical session: fetch user info (only if deep linked or no user loaded)
    fetchSessionUserInfo(sessionId.value).then(res => {
      if (res.data) {
        userInfo.value = res.data as UserInfo;
        initBaziData(res.data);
      }
    }).catch(err => {
      console.error('Fetch session user info error:', err);
    }).finally(() => {
      isLoadingUserInfo.value = false;
    });
  } else {
    // New session: do not create session immediately if user profile is missing
    // Instead, let showProfileGuide handle the UI
    isLoadingUserInfo.value = false;
  }
});

onPageScroll(() => {
  checkIfAtBottom();
});

const checkIfAtBottom = () => {
  const query = uni.createSelectorQuery();
  query.select('#chat-bottom').boundingClientRect();
  query.exec((res) => {
    if (!res[0]) return;
    const bottomRect = res[0];
    const windowHeight = uni.getSystemInfoSync().windowHeight;
    // 阈值设为 windowHeight - 130，比 padding-bottom (160) 稍大，允许用户上滑 30px 后即停止自动滚动
    isUserAtBottom.value = bottomRect.top <= windowHeight - 130;
  });
};

const scrollToBottom = (force = false, delay = 150) => {
  // If sidebar is open, do not auto-scroll as it may block UI interactions
  if (showSidebar.value) return;

  // First check
  if (!force && !isUserAtBottom.value) return;

  // Throttling for streaming updates
  if (delay === 0 && !force) {
    if (isScrollThrottled.value) return;
    isScrollThrottled.value = true;
    setTimeout(() => {
      isScrollThrottled.value = false;
    }, 100);
  }

  nextTick(() => {
    // Add a delay to ensure layout (including header height) is complete
    setTimeout(() => {
      // Double check: active user scrolling might have changed this state
      if (!force && !isUserAtBottom.value) return;
      if (showSidebar.value) return; // Re-check sidebar state

      uni.pageScrollTo({
        scrollTop: 9999999,
        duration: delay === 0 ? 100 : 300, // Faster duration for streaming updates
        success: () => {
           if (force) {
              isUserAtBottom.value = true;
           }
        }
      });
    }, delay);
  });
};

watch(headerHeight, () => {
  if (isUserAtBottom.value) {
    scrollToBottom(true);
  }
});

onMounted(() => {
  // Calculate header height for padding
  const sysInfo = uni.getSystemInfoSync();
  const statusBarHeight = sysInfo.statusBarHeight || 20;
  let navBarHeight = 44;

  // #ifdef MP-WEIXIN
  const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
  const gap = menuButtonInfo.top - statusBarHeight;
  navBarHeight = menuButtonInfo.height + (gap * 2);
  // #endif

  headerHeight.value = statusBarHeight + navBarHeight;
});

const handleOpenUserCenter = () => {
  showSidebar.value = false;
  showUserPopup.value = true;
};

const handleOpenFortune = () => {
  showSidebar.value = false;
  uni.navigateTo({
    url: '/pages/daily-fortune/index'
  });
};

const handleOpenUpgrade = () => {
  showUserPopup.value = false; // Ensure previous popup is closed
  showUpgradePopup.value = true;
};

const handleSwitchProfile = async (profile: UserInfo) => {
  // 如果切换的是同一个档案，直接关闭侧边栏返回
  if (userInfo.value && userInfo.value.id === profile.id) {
    showSidebar.value = false;
    return;
  }

  showSidebar.value = false;
  isSwitchingProfile.value = true;

  try {
    // 重置状态
    showQuickQuestions.value = false;
    clearWelcomeTimers();

    // Update local user info
    userInfo.value = profile;
    
    // Initialize/Update Bazi data for the new profile
    initBaziData(profile);
    
    // Check if session exists
    if (profile.session_id) {
      sessionId.value = profile.session_id;
      chatMessages.value = [];
      await getChatHistory();
    } else {
      // No session yet, just show welcome messages
      sessionId.value = '';
      chatMessages.value = [];
      simulateWelcomeMessages();
    }
  } catch (error) {
    console.error('Switch profile failed:', error);
  } finally {
    isSwitchingProfile.value = false;
    nextTick(() => {
      scrollToBottom(false);
    });
  }
};

const getChatHistory = async () => {
  try {
    const res = await fetchChatHistory(sessionId.value);
    console.log('Chat history response:', res);

    if (Array.isArray(res.data)) {
      // 如果有历史记录，确保隐藏快捷提问
      if (res.data.length > 0) {
        showQuickQuestions.value = false;
        // 加载输入框上方的推荐问题
        loadQuickQuestions();
        showQuickQuestions.value = true;
      }

      // 清空现有消息
      chatMessages.value = [];

      // 遍历聊天历史数据并添加到消息列表
      res.data.forEach(item => {
        // 添加用户消息
        if (item.role === 'user') {
          chatMessages.value.push({
            role: 'user',
            content: item.content,
            timestamp: new Date(item.created_at),
            id: item.id
          });
        } else if (item.role === 'assistant') {
          // 如果有AI消息，也可以添加
          chatMessages.value.push({
            role: 'assistant',
            reasoning_content: item.reasoning_content,
            content: item.content,
            timestamp: new Date(item.created_at),
            id: item.id,
            isReasoningExpanded: false // 历史消息默认收起
          });
        }
      });

      scrollToBottom(true);

      // 检查是否需要自动触发 (如果历史记录为空，且已录入档案)
      if (res.data.length === 0 && hasProfile.value) {
        simulateWelcomeMessages();
      } else if (hasProfile.value && isFromIndexPage.value) {
        // 如果不是空历史，且是从首页进入（或者是初始化加载），不需要发 "回来啦"
        // 只有在特定场景下才可能需要，但根据用户需求："if the chat history is empty, you can display the welcome message, if not, you should show the chat history"
        // 所以这里不需要额外发消息，除非有明确需求。
        // 为了保持逻辑简洁，只在空历史时发欢迎语。
        // 如果需要 "回来啦" 提示，可以在这里加，但目前先注释掉，严格遵循用户指令。
        // const name = userInfo.value?.name || '你';
        // chatMessages.value.push({
        //   role: 'assistant',
        //   content: `Hi, ${name} 你回来啦～`,
        //   timestamp: new Date(),
        //   id: `welcome-back-${Date.now()}`
        // });
        // scrollToBottom(true);
      }
    }
  } catch (error) {
    console.error('获取聊天历史失败:', error);
  }
};

// 切换思维链显示/隐藏
const toggleReasoning = (message: any) => {
  message.isReasoningExpanded = !message.isReasoningExpanded;
};

const handleShowBazi = async () => {
  // 新增：交互时立即隐藏快捷提问并清除可能存在的欢迎语定时器
  showQuickQuestions.value = false;
  clearWelcomeTimers();

  // Check if profile exists
  if (showProfileGuide.value) {
    uni.showToast({
      title: '请先录入档案',
      icon: 'none'
    });
    return;
  }

  // Simulate user asking "看生辰"
  chatMessages.value.push({
    role: 'user',
    content: '看生辰',
    timestamp: new Date(),
    id: `user_${Date.now()}`,
    type: 'text'
  });
  
  scrollToBottom(true);
  isTyping.value = true;
  isGenerating.value = true;
  
  try {
    let result;
    
    // Use pre-fetched promise if available
    if (baziFetchPromise.value) {
      result = await baziFetchPromise.value;
    } else {
      // Fallback if promise is missing (e.g. component reloaded but onLoad didn't fire appropriately?)
      // or just direct call if logic changes.
      try {
        if (!userInfo.value) {
           throw new Error('User info not ready');
        }
        const res = await fetchBaziCalculate(userInfo.value);
        result = { success: true, res };
      } catch (error) {
        result = { success: false, error };
      }
    }

    if (result.success && result.res && result.res.data) {
       chatMessages.value.push({
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        id: `ai_${Date.now()}`,
        type: 'bazi',
        baziData: result.res.data
      });
      scrollToBottom(true);
    } else {
       throw result.error || new Error('Unknown error');
    }
  } catch (error) {
    console.error('获取八字数据失败:', error);
    chatMessages.value.push({
        role: 'assistant',
        content: '获取八字数据失败，请稍后再试。',
        timestamp: new Date(),
        id: `ai_${Date.now()}`,
        type: 'text'
    });
  } finally {
    isTyping.value = false;
    isGenerating.value = false;
    scrollToBottom(true);
  }
};

const sendQuestion = async () => {
  // Check if profile exists
  if (showProfileGuide.value) {
    uni.showToast({
      title: '请先录入档案',
      icon: 'none'
    });
    return;
  }

  if (inputText.value.trim()) {
    // 新增：发送消息时同样执行隐藏和清除操作
    showQuickQuestions.value = false;
    clearWelcomeTimers();

    // 添加用户消息到聊天列表
    chatMessages.value.push({
      role: 'user',
      content: inputText.value,
      timestamp: new Date(),
      id: `temp_${Date.now()}`
    });

    scrollToBottom(true);

    // 清空输入框
    const question = inputText.value;
    inputText.value = '';

    // 显示打字指示器
    isTyping.value = true;
    isThinking.value = true;
    isGenerating.value = true;

    try {
      // If no session ID, create one first
      if (!sessionId.value) {
        if (userInfo.value && userInfo.value.id) {
          try {
            const sessionRes: any = await fetchCreateSession({
              profile_id: userInfo.value.id
            });
            if (sessionRes && sessionRes.data && sessionRes.data.session_id) {
              sessionId.value = sessionRes.data.session_id;
              // Update local user info with new session ID
              const updatedUser = { ...userInfo.value, session_id: sessionId.value };
              userInfo.value = updatedUser;
            } else {
              throw new Error('Invalid session response');
            }
          } catch (e) {
            console.error('Failed to create session:', e);
            uni.showToast({ title: '创建会话失败', icon: 'none' });
            isTyping.value = false;
            isThinking.value = false;
            isGenerating.value = false;
            return;
          }
        } else {
          console.error('Missing user info for session creation');
          isTyping.value = false;
          isThinking.value = false;
          isGenerating.value = false;
          return;
        }
      }

      // 使用SSE获取流式响应
      const { messageList, isLoading, startSSE } = useSSEMessage({
        session_id: sessionId.value,
        user_input: question
      });

      // 开始SSE连接
      startSSE();

      // 监听SSE消息更新
      const unwatch = watch(messageList, (newMessages) => {
        if (newMessages.length > 0) {
          const latestMessage = newMessages[newMessages.length - 1];
          const existingMessage = chatMessages.value.find((msg) => msg.id === latestMessage.id);
          const startedContent =
            latestMessage.role === 'assistant' &&
            typeof latestMessage.content === 'string' &&
            latestMessage.content.length > 0;

          if (startedContent) {
            isTyping.value = false;
            isThinking.value = false;
            if (existingMessage) {
              existingMessage.isReasoningExpanded = false;
            }
          }
          if (existingMessage) {
            existingMessage.content = latestMessage.content;
            existingMessage.reasoning_content = latestMessage.reasoning_content;
            existingMessage.timestamp = new Date(latestMessage.created_at || Date.now());
            existingMessage.isStreaming = true;
            scrollToBottom(false, 0);
          } else if (latestMessage.role === 'assistant') {
            chatMessages.value.push({
              role: 'assistant',
              reasoning_content: latestMessage.reasoning_content,
              content: latestMessage.content,
              timestamp: new Date(latestMessage.created_at || Date.now()),
              id: latestMessage.id,
              isStreaming: true,
              isReasoningExpanded: true // 新消息默认展开思维链
            });
            scrollToBottom(true);
          }
        }
      });

      // 监听加载状态，完成后获取推荐问题
      const unwatchLoading = watch(isLoading, (newVal) => {
        if (!newVal) {
          // 加载完成，停止监听
          unwatch();
          unwatchLoading();
          
          isTyping.value = false;
          isThinking.value = false;
          isGenerating.value = false;
          
          // 更新消息流状态
          for (let i = chatMessages.value.length - 1; i >= 0; i--) {
            const msg = chatMessages.value[i];
            if (msg.role === 'assistant' && msg.isStreaming) {
              msg.isStreaming = false;
              break;
            }
          }
          
          scrollToBottom();

          // 获取推荐问题
          nextTick(() => {
            loadQuickQuestions();
            showQuickQuestions.value = true;
            nextTick(() => {
              scrollToBottom(true);
            });
          });
        }
      });

    } catch (error) {
      console.error('发送问题失败:', error);
      isTyping.value = false;
      isThinking.value = false;
      isGenerating.value = false;
    }
  }
};

const onInputUpdate = (value: string) => {
  inputText.value = value;
};

</script>

<style lang="scss" scoped>
.profile-switching-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  width: 100%;
  
  .loading-text {
    margin-top: 32rpx;
    font-size: 28rpx;
    color: #6366f1; /* indigo-500, matching app theme */
    font-weight: 500;
    letter-spacing: 0.05em;
  }
}

.custom-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  
  .dot {
    width: 24rpx;
    height: 24rpx;
    background-color: #6366f1;
    border-radius: 50%;
    animation: loader-bounce 1.4s infinite ease-in-out both;
    
    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes loader-bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.root {
  width: 100%;
  min-height: 100vh;
  background-color: #f4f7ff;
  position: relative;
  display: flex;
  flex-direction: column;

  view {
    box-sizing: border-box;
  }
}

.fortune-content-wrapper {
  padding: 32rpx;
}

.profile-guide-wrapper {
  padding: 0 16rpx;
  margin-top: 32rpx;
  animation: fade-in 0.5s ease-out;
}

/* Energy Blobs - Updated for Soft Glow */
.energy-blob {
  position: fixed;
  width: 100vw;
  height: 800rpx;
  filter: blur(120px);
  z-index: 0;
  opacity: 0.5;
  border-radius: 50%;
  pointer-events: none;
}

.blob-1 {
  background: radial-gradient(circle at center, #E0E7FF 0%, rgba(199, 210, 254, 0.5) 100%);
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
}

.blob-2 {
  background: radial-gradient(circle at center, #F3E8FF 0%, rgba(233, 213, 255, 0.5) 100%);
  top: -10%;
  right: -20%;
  width: 600rpx;
  height: 600rpx;
}

/* Custom Header */
/* .custom-header removed - replaced by HeaderBar component */

.header-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  color: #94a3b8;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.95);
  }
}

/* .header-center, .app-title removed */


@keyframes pulse-green {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.7;
    transform: scale(0.9);
  }
}

.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.insight-card {
  margin: 16px 0;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 12px;
  width: 100%;
}

.scroll-box {
  width: 100%;
  box-sizing: border-box;
  padding-bottom: 172px;
}

.scroll-to-bottom {
  position: fixed;
  bottom: 240rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.8);

  .arrow-icon {
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-img {
    width: 100%;
    height: 100%;
  }

  &:active {
    transform: translateX(-50%) scale(0.95);
    background: rgba(255, 255, 255, 1);
  }
}

/* Chat Message Styles */
.chat-message-list {
  padding: 0 16px;
}

.loading-icon {
  background: transparent !important;
  width: fit-content !important;
}

.message-item {
  &:last-child {
    margin-bottom: 0;
  }
  margin-bottom: 32rpx;
}

.message-content {
  display: flex;
  align-items: flex-start;
}

.ai-message {
  flex-direction: row;
}

.user-message {
  flex-direction: row-reverse;
}

.message-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: 28rpx;
  line-height: 1.8;
}

.bubble {
  padding: 24rpx;
  border-radius: 24rpx;
  max-width: 95%;
  position: relative;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.user-bubble {
  background: #6366f1;
  // background: linear-gradient(to bottom, #6366f1, #6b72e8, #8b5cf6);
  color: white;
  // border-bottom-right-radius: 8rpx;
  margin-left: auto;
  box-shadow: none;
  border-radius: 24px;
  border-top-right-radius: 4rpx;
}

.ai-bubble {
  background-color: rgba(255, 255, 255, 0.65);
  color: #334155;
  border-radius: 24rpx;
  border-top-left-radius: 4rpx;
  box-shadow: none;
  border: none;
  backdrop-filter: none;
}

.response-content {
  display: block;
  font-weight: bold;
  color: #4f46e5;
  margin-bottom: 8rpx;
  font-size: 30rpx;
  line-height: 1.5;
}

.typing-indicator {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx !important;
  background: transparent;
  border: none;
  box-shadow: none;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  background-color: #a5b4fc;
  border-radius: 50%;
  margin-right: 12rpx;
  animation: bounce 1.5s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5rpx);
  }
}

.message-time {
  margin-top: 8rpx;
  text-align: right;
  padding-right: 16rpx;
}

.bg-indigo-50-opacity {
  background-color: rgba(238, 242, 255, 0.4);
}

.bg-white-opacity {
  background-color: rgba(255, 255, 255, 0.8);
}

.bg-white-40 {
  background-color: rgba(255, 255, 255, 0.4);
}

.bg-white-50 {
  background-color: rgba(255, 255, 255, 0.5);
}

.bg-white-70 {
  background-color: rgba(255, 255, 255, 0.7);
}

.border-white-80 {
  border-color: rgba(255, 255, 255, 0.8);
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

/* Font sizes */
.text-xs-tiny {
  font-size: 22rpx;
  /* 增加4rpx */
}

.text-xs-small {
  font-size: 24rpx;
  /* 增加4rpx */
}

.text-sm {
  font-size: 28rpx;
  /* 增加4rpx */
}

.text-base {
  font-size: 32rpx;
  /* 增加4rpx */
}

.text-lg {
  font-size: 36rpx;
  /* 增加4rpx */
}

.text-xl {
  font-size: 40rpx;
  /* 增加4rpx */
}

.text-2xl {
  font-size: 52rpx;
  /* 增加4rpx */
}

.text-3xl {
  font-size: 52rpx;
  /* 增加4rpx */
}

.text-4xl {
  font-size: 68rpx;
  /* 增加4rpx */
}

.leading-relaxed {
  line-height: 1.625;
}

.font-bold {
  font-weight: 700;
}

.font-black {
  font-weight: 900;
}

.font-mono {
  font-family: monospace;
}

.uppercase {
  text-transform: uppercase;
}

.tracking-tighter {
  letter-spacing: -0.05em;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.tracking-widest {
  letter-spacing: 0.1em;
}

.text-gray-300 {
  color: #d1d5db
}

;

.text-gray-800 {
  color: #1f2937;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.text-indigo-500 {
  color: #6366f1;
}

.text-indigo-400 {
  color: #818cf8;
}

.text-indigo-600 {
  color: #4f46e5;
}

.border-indigo-100 {
  border-color: #e0e7ff;
}

.rounded-3xl {
  border-radius: 48rpx;
}

.rounded-2xl {
  border-radius: 32rpx;
}

.rounded-xl {
  border-radius: 24rpx;
}

.w-8 {
  width: 64rpx;
}

.h-8 {
  height: 64rpx;
}

.w-full {
  width: 100%;
}

.h-12 {
  height: 96rpx;
}

.h-20 {
  height: 160rpx;
}

.w-20 {
  width: 160rpx;
}

.w-1 {
  width: 8rpx;
}

.h-3 {
  height: 24rpx;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.top-0 {
  top: 0;
}

.z-10 {
  z-index: 10;
}

.z-40 {
  z-index: 40;
}

.z-50 {
  z-index: 50;
}

.px-6 {
  padding-left: 24rpx;
  padding-right: 24rpx;
}

.py-4 {
  padding-top: 16rpx;
  padding-bottom: 16rpx;
}

.mt-2 {
  margin-top: 16rpx;
}

.mb-2 {
  margin-bottom: 16rpx;
}

.mt-4 {
  margin-top: 32rpx;
}

.mb-10 {
  margin-bottom: 80rpx;
}

.mt-1 {
  margin-top: 8rpx;
}

.mb-1 {
  margin-bottom: 8rpx;
}

.p-5 {
  padding: 40rpx;
}

.p-6 {
  padding: 48rpx;
}

.py-8 {
  padding-top: 64rpx;
  padding-bottom: 64rpx;
}

.pt-12 {
  padding-top: 96rpx;
}

.pb-24 {
  padding-bottom: 192rpx;
}

.pt-20 {
  padding-top: 160rpx;
}

.pb-20 {
  padding-bottom: 160rpx;
}

.px-4 {
  padding-left: 24px;
  padding-right: 24px;
}

.px-7 {
  padding-left: 56rpx;
  padding-right: 56rpx;
}

.py-6 {
  padding-top: 48rpx;
  padding-bottom: 48rpx;
}

.space-y-8 {
  margin-top: 64rpx;
}

.space-y-6 {
  margin-top: 48rpx;
}

.space-y-4 {
  margin-top: 32rpx;
}

.space-y-2 {
  margin-top: 16rpx;
}

.gap-4 {
  gap: 32rpx;
}

.gap-3 {
  gap: 24rpx;
}

.gap-2 {
  gap: 16rpx;
}

.gap-5 {
  gap: 40rpx;
}

.items-start {
  align-items: flex-start;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-around {
  justify-content: space-around;
}

.justify-center {
  justify-content: center;
}

.text-center {
  text-align: center;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.flex-col {
  flex-direction: column;
}

.overflow-y-auto {
  overflow-y: auto;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

.backdrop-filter {
  backdrop-filter: blur(14px);
}

/* Thinking Chain Styles */
.thinking-box {
  background-color: rgba(238, 242, 255, 0.5); /* bg-indigo-50/50 */
  border-left: 8rpx solid rgba(129, 140, 248, 0.3); /* border-l-4 border-indigo-400/30 */
  border-top-right-radius: 24rpx; /* rounded-r-[20px] */
  border-bottom-right-radius: 24rpx;
  border-bottom-left-radius: 24rpx; /* rounded-bl-[20px] */
  border-top-left-radius: 0;
  overflow: hidden;
  box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
  margin-bottom: 24rpx;
  max-width: 95%;
}

.thinking-header {
  padding: 20rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.3s;

  &:active {
    background-color: rgba(224, 231, 255, 0.3); /* hover:bg-indigo-100/30 equivalent */
  }
}

.thinking-header-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.thinking-icon {
  width: 28rpx;
  height: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .icon-svg {
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234f46e5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M13 10V3L4 14h7v7l9-11h-7z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }

  &.animate-spin .icon-svg {
    animation: spin 1s linear infinite;
  }
}

.status-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #818cf8; /* text-indigo-400 */
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.toggle-text {
  font-size: 26rpx;
  font-weight: 500;
  color: #a5b4fc; /* text-indigo-300 */
}

.thinking-content {
  padding: 24rpx 32rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.5); /* border-white/50 */
}

.thought-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.thought-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: #818cf8; /* bg-indigo-400 */
  margin-top: 12rpx;
  flex-shrink: 0;
  box-shadow: 0 0 8rpx rgba(129, 140, 248, 0.5); /* shadow-[0_0_4px_rgba(129,140,248,0.5)] */
}

.thought-text {
  font-size: 28rpx;
  color: #475569; /* text-slate-600 */
  font-weight: 500;
  line-height: 1.625;
}

.thinking-loading {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 8rpx;
}

.loading-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: #6366f1; /* bg-indigo-500 */
  animation: pulse 2s infinite;
}

.loading-bar {
  height: 12rpx;
  width: 128rpx;
  background-color: rgba(199, 210, 254, 0.5); /* bg-indigo-200/50 */
  border-radius: 9999rpx;
  animation: pulse 1.5s infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.message-wrapper {
  width: 100%;
  margin-bottom: 32rpx;
  &:last-child {
    margin-bottom: 0;
  }
}

.message-row {
  display: flex;
  width: 100%;
}

.justify-end {
  justify-content: flex-end;
}

.justify-start {
  justify-content: flex-start;
}

.message-in {
  animation: springUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.2) both;
}

@keyframes springUp {
  0% {
    opacity: 0;
    transform: translateY(30rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.sidebar-toggle-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  padding: 0;
  margin: 0;
  &::after {
    border: none !important;
  }
  
  &:active {
    transform: scale(0.9);
    background-color: rgba(255, 255, 255, 0.5);
  }

  .hamburger-icon {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
    
    .bar {
      height: 2px;
      background-color: #1e293b;
      border-radius: 999px;
      
      &.long {
        width: 18px;
      }
      
      &.short {
        width: 10px;
      }
    }
  }
}

.sidebar-content {
  padding: 40px 20px;
}

.quick-questions-container {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
  animation: springUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.2) both;

  .quick-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 8rpx;

    .quick-header-left {
      display: flex;
      align-items: center;
      gap: 12rpx;
    }

    .quick-header-bar {
      width: 6rpx;
      height: 24rpx;
      background-color: #6366f1;
      border-radius: 4rpx;
    }

    .quick-header-title {
      font-size: 26rpx;
      // font-weight: 700;
      color: #94a3b8;
    }

    .quick-header-right {
      display: flex;
      align-items: center;
      gap: 6rpx;
      padding: 8rpx;
      opacity: 0.8;
      
      &:active {
        opacity: 0.6;
      }
    }

    .refresh-icon {
      width: 24rpx;
      height: 24rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .refresh-img {
      width: 100%;
      height: 100%;
    }

    .refresh-text {
      font-size: 24rpx;
      color: #94a3b8;
      font-weight: 500;
    }
  }

  .quick-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }
  
  .quick-card {
    margin: 0;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 24rpx;
    padding: 24rpx;
    display: flex;
    align-items: flex-start;
    gap: 20rpx;
    box-shadow: 0 4rpx 16rpx rgba(31, 38, 135, 0.05);
    transition: all 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.6);
    
    &:active {
      transform: scale(0.98);
      background-color: rgba(255, 255, 255, 0.85);
    }

    &::after {
      border: none;
    }

    .question-badge {
      flex-shrink: 0;
      width: 48rpx;
      height: 48rpx;
      border-radius: 50%;
      background-color: #eef2ff; /* bg-indigo-50 */
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .badge-text {
      font-size: 24rpx;
      font-weight: 800;
      color: #818cf8; /* text-indigo-400 */
      font-style: italic;
    }

    .question-text {
      font-size: 28rpx;
      color: #1e293b;
      line-height: 1.4;
      text-align: left;
      padding-top: 4rpx;
    }

    &.skeleton-card {
      pointer-events: none;
      
      .skeleton-badge {
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        background-color: rgba(203, 213, 225, 0.4);
        animation: skeleton-pulse 1.5s infinite ease-in-out;
      }
      
      .skeleton-text {
        height: 32rpx;
        width: 80%;
        border-radius: 8rpx;
        background-color: rgba(203, 213, 225, 0.4);
        animation: skeleton-pulse 1.5s infinite ease-in-out;
        animation-delay: 0.1s;
      }
    }
  }
}

@keyframes skeleton-pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}

.empty-sidebar {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #94a3b8;
  font-size: 28rpx;
}

.slogan-section {
  padding: 40rpx 32rpx 20rpx;
  margin-bottom: 20rpx;
}

.slogan-bar {
  width: 96rpx;
  height: 12rpx;
  background-color: #4f46e5;
  margin-bottom: 32rpx;
  border-radius: 999rpx;
}

.slogan-title {
  font-size: 60rpx;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.2;
  display: flex;
  align-items: center;
}

.text-gray {
  color: #000000;
}

.text-indigo {
  color: #4f46e5;
}

.slogan-sub {
  font-size: 24rpx;
  color: #94a3b8;
  letter-spacing: 0.1em;
  font-weight: 500;
  display: block;
  margin-top: 24rpx;
}

/* Fortune Popup Styles */
.fortune-popup-wrapper {
  background-color: #f8fafc;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.popup-header {
  padding: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: #fff;
  border-bottom: 1px solid #f1f5f9;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  position: absolute;
  right: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  padding: 8rpx;
}

.popup-content {
  padding: 32rpx;
  box-sizing: border-box;
  max-height: 60vh;
}
</style>
