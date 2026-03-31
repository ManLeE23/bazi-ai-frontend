<template>
  <view class="root">
    <!-- Background Blobs -->
    <view class="energy-blob blob-1"></view>
    <view class="energy-blob blob-2"></view>

    <!-- Custom Header -->
    <HeaderBar :fixed="true" :show-back="false">
      <template #left>
        <view class="header-left-group">
          <button @click="handleBackToHome" class="sidebar-toggle-btn">
            <view class="hamburger-icon">
              <view class="bar long"></view>
              <view class="bar short"></view>
            </view>
          </button>
        </view>
      </template>
    </HeaderBar>
    
    <!-- Custom Sidebar Implementation -->
    <!-- Mask -->
    <view 
      class="sidebar-overlay" 
      :class="{ 'show': showSidebar }" 
      @click="showSidebar = false"
      @touchmove.stop.prevent
    ></view>

    <!-- Sidebar Panel -->
    <view 
      class="sidebar-panel" 
      :class="{ 'show': showSidebar }"
    >
      <view class="sidebar-wrapper-fixed">
        <SidebarMenu 
          class="sidebar-menu-root"
          :current-profile="userInfo"
          @open-user-center="handleOpenUserCenter" 
          @switch-profile="handleSwitchProfile" 
          @open-upgrade="handleOpenUpgrade"
        />
      </view>
    </view>

    <!-- User Center Popup -->
    <UserCenterPopup v-model="showUserPopup" @open-upgrade="handleOpenUpgrade" />

    <!-- Upgrade Popup -->
    <UpgradePopup v-model="showUpgradePopup" />

    <!-- Chat Messages -->
    <view class="scroll-box" :style="{ paddingTop: (headerHeight + 16) + 'px' }">
      
      <!-- Loading State for Profile Switch -->
      <ProfileSwitchingState v-if="isSwitchingProfile || isInitialLoading" />

      <template v-else>

        <view v-if="showProfileGuide" class="profile-guide-wrapper">
          <view class="slogan-section">
            <view class="slogan-bar"></view>
            <view class="slogan-title">
              <text>看清</text><text class="text-gray">趋势，</text>
            </view>
            <view class="slogan-title">
              <text>走对</text><text class="text-indigo">下一步。</text>
            </view>
            <text class="slogan-sub">DIGITAL WISDOM & CULTURAL ANALYSIS</text>
          </view>
          <ProfileGuideCard :has-token="hasToken" :invite-code="currentInviteCode" :agent-type="currentAgentType" />
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
              <view class="thinking-arrow" :class="{ 'rotate': message.isReasoningExpanded }">
                <image :src="downSvg" class="arrow-icon-img" mode="aspectFit" />
              </view>
            </view>
            <view v-if="message.isReasoningExpanded" class="thinking-content">
              <scroll-view scroll-y class="thinking-scroll-view" :scroll-top="message.reasoningScrollTop">
                <text class="thinking-text" user-select>{{ message.reasoning_content }}</text>
              </scroll-view>
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
                <view v-else-if="message.role === 'assistant' && message.content" style="user-select: text; -webkit-user-select: text;">
                   <MarkDown :content="message.content" />
                </view>
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
            <!-- <view class="quick-header-right" @click="loadQuickQuestions">
              <view class="refresh-icon">
                <image src="@/static/icon/refresh.svg" class="refresh-img" />
              </view>
              <text class="refresh-text">换一批</text>
            </view> -->
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
              <!-- <view class="question-badge">
                <text class="badge-text">Q{{ index + 1 }}</text>
              </view> -->
              <text class="question-text">{{ q }}</text>
            </button>
          </view>
        </view>
        
        <view id="chat-bottom" style="height: 1rpx;"></view>
      </view>
      </template>
    </view>

    <!-- Scroll to Bottom Button -->
    <view class="scroll-to-bottom" v-if="!isUserAtBottom" @click="handleToBottom">
      <view class="arrow-icon">
        <image :src="downSvg" class="icon-img" mode="aspectFit" />
      </view>
    </view>

    <!-- Input Area -->
    <!-- Bazi Drawer (Compact) -->
    <view 
      v-if="hasProfile && currentBaziData"
      class="bazi-drawer-compact"
      :class="{ 'is-open': isBaziDrawerOpen }"
    >
      <!-- Handle -->
      <view class="drawer-handle-compact" @click.stop="toggleBaziDrawer">
        <image :src="starShineSvg" class="handle-icon-compact" mode="aspectFit" />
      </view>
      
      <!-- Content -->
      <view class="drawer-content-compact">
         <view class="pillar-group">
            <view class="pillar-item">
                <text class="pillar-label">年柱</text>
                <view class="pillar-value">
                   <text :class="getWuXingClass(currentBaziData.pillars?.year?.gan)">{{ currentBaziData.pillars?.year?.gan }}</text>
                   <text :class="getWuXingClass(currentBaziData.pillars?.year?.zhi)">{{ currentBaziData.pillars?.year?.zhi }}</text>
                </view>
             </view>
             <view class="pillar-item">
                <text class="pillar-label">日柱</text>
                <view class="pillar-value">
                   <text :class="getWuXingClass(currentBaziData.pillars?.day?.gan)">{{ currentBaziData.pillars?.day?.gan }}</text>
                   <text :class="getWuXingClass(currentBaziData.pillars?.day?.zhi)">{{ currentBaziData.pillars?.day?.zhi }}</text>
                </view>
             </view>
         </view>
         
         <view class="divider-vertical"></view>
         
         <button class="detail-btn-compact" @click="handleViewBaziDetail">
            查看详情
         </button>
      </view>
    </view>

    <!-- Chat Input -->
    <InputWithButton 
      :show-bazi="false"
      :is-a-i-sending="isGenerating"
      :deep-thinking="isDeepThinkingMode"
      :is-quota-exhausted="isQuotaExhausted"
      @click="getInputValue"
      @confirm="getInputValue"
      @show-bazi="handleShowBazi" 
      @toggle-deep-thinking="handleToggleDeepThinking(!isDeepThinkingMode)"
    >
      <template #top>
        <view v-if="isQuotaExhausted" class="quota-banner-inline">
          <text class="quota-text">今日免费额度已用完，升级会员或邀请好友获取更多</text>
          <view class="quota-btn" @click="handleOpenUserCenter">去获取</view>
        </view>
      </template>
    </InputWithButton>
  </view>
</template>

<script setup lang="ts">
import { onLoad, onUnload, onPageScroll, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { ref, onMounted, nextTick, computed, watch, getCurrentInstance } from 'vue';
import { userStore, type UserInfo, type SystemUser, MembershipType } from '@/store/user';
import HeaderBar from '@/components/HeaderBar.vue';
import ProfileGuideCard from './components/ProfileGuideCard.vue';
import SidebarMenu from '@/components/SidebarMenu.vue';
import UserCenterPopup from './components/UserCenterPopup.vue';
import UpgradePopup from './components/UpgradePopup.vue';
import ProfileSwitchingState from './components/ProfileSwitchingState.vue';
import useSSEMessage from './hooks/useSSEMessage'; // 导入新的hook
import { useShare } from '@/hooks/useShare';
import { useSWR } from '@/hooks/useSWR';
import { fetchChatHistory, fetchWelcomeMessage, fetchBaziCalculate, fetchSessionUserInfo, fetchProfilesList, fetchCreateSession, fetchSuggestedQuestions, fetchSystemUserInfo, fetchApplyInvite, fetchAgentSession } from '@/api/services';
import InputWithButton from '@/components/InputWithButton.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import MarkDown from '../components/MarkDown/index.vue';
import BaziCard from './components/BaziCard.vue';
import downSvg from '@/static/icon/down.svg?url';
import starShineSvg from '@/static/icon/star-shine.svg?url';
import debounce from 'lodash-es/debounce';

// 适配小程序：移除 window 依赖，改用 ref 存储定时器（小程序无 window 对象）
const scrollResetTimer = ref<number | null>(null);
//  新增：标记是否是用户手动触发的滚动（用于优先级判断）
const isManualScroll = ref(false);
const isAutoScrolling = ref(false);
const currentInviteCode = ref('');
const isUserAtBottom = ref(true);
const hasToken = ref(false);

const getWuXingClass = (char: string | undefined) => {
    if (!char) return '';
    const map: Record<string, string> = {
        '甲': 'mu', '乙': 'mu', '寅': 'mu', '卯': 'mu',
        '丙': 'huo', '丁': 'huo', '巳': 'huo', '午': 'huo',
        '戊': 'tu', '己': 'tu', '辰': 'tu', '戌': 'tu', '丑': 'tu', '未': 'tu',
        '庚': 'jin', '辛': 'jin', '申': 'jin', '酉': 'jin',
        '壬': 'shui', '癸': 'shui', '亥': 'shui', '子': 'shui'
    };
    return map[char] || '';
};

const { shareConfig, loadShareConfig } = useShare();
loadShareConfig();

onShareAppMessage(() => {
  return {
    title: shareConfig.value.title,
    path: shareConfig.value.path,
    imageUrl:shareConfig.value.imageUrl,
  };
});

onShareTimeline(() => {
  const query = shareConfig.value.path.split('?')[1] || '';
  return {
    title: shareConfig.value.title,
    query: query,
    imageUrl:shareConfig.value.imageUrl,
  };
});

const isSwitchingProfile = ref(false);
const isInitialLoading = ref(true);
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
  reasoningScrollTop?: number;
}[]>([]);
const inputText = ref('');
const isTyping = ref(false);
const isGenerating = ref(false);

const sessionId = ref<string>('');
const isFromIndexPage = ref(false);
const currentAgentType = ref<string>('');
const pendingAutoQuestion = ref('');

// 思维链相关状态
const isThinking = ref(false);
const isDeepThinkingMode = ref(uni.getStorageSync('isDeepThinkingMode') === true);

const handleToggleDeepThinking = (val: boolean) => {
  isDeepThinkingMode.value = val;
  uni.setStorageSync('isDeepThinkingMode', val);
  uni.showToast({
    title: val ? '深度思考模式已开启' : '深度思考模式已关闭',
    icon: 'none'
  });
};

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

const { data: currentBaziData, mutate: mutateBazi, error: baziError, isValidating: isBaziValidating } = useSWR(
  () => userInfo.value?.id ? `/api/bazi/calculate/profile/${userInfo.value.id}` : null,
  () => {
    if (!userInfo.value?.id) return Promise.reject('No profile ID');
    return fetchBaziCalculate(userInfo.value.id);
  },
  {
    revalidateOnFocus: false
  }
);
const isBaziDrawerOpen = ref(false);
const toggleBaziDrawer = () => {
  isBaziDrawerOpen.value = !isBaziDrawerOpen.value;
};

const isQuotaExhausted = computed(() => {
  const user = userStore.systemUser;
  // Check membership_type (1=VIP)
  if (!user || user.membership_type === MembershipType.VIP) return false;
  // Default to 5 if undefined, or handle based on API contract. 
  // If backend sends these fields, they should be numbers.
  const total = user.free_quota_total ?? 5; 
  const used = user.free_quota_used ?? 0;
  return used >= total;
});

const isLoadingUserInfo = ref(true);
// const baziFetchPromise = ref<Promise<any> | null>(null);

const showQuickQuestions = ref(false);
const quickQuestions = ref<string[]>([]);
const isLoadingQuickQuestions = ref(false);

const loadQuickQuestions = async () => {
  if (isQuotaExhausted.value) {
    isLoadingQuickQuestions.value = false;
    showQuickQuestions.value = false;
    quickQuestions.value = [];
    return;
  }
  isLoadingQuickQuestions.value = true;
  try {
    const res: any = await fetchSuggestedQuestions({
      session_id: sessionId.value || undefined,
      limit: 3,
      prev_questions: [],
      agent_type: currentAgentType.value
    });
    if (res && res.data && Array.isArray(res.data.questions) && res.data.questions.length > 0) {
      quickQuestions.value = res.data.questions;
      showQuickQuestions.value = true;
    } else {
      quickQuestions.value = [];
      showQuickQuestions.value = false;
    }
  } catch (e) {
    console.error('Failed to load suggested questions:', e);
    quickQuestions.value = [];
    showQuickQuestions.value = false;
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

type WelcomeMessage = {
  role?: string;
  content?: string;
  timestamp?: string | Date;
  id?: string;
};

const normalizeWelcomeMessages = (items: any[]) => {
  return items
    .map((item) => {
      if (item && typeof item === 'object') {
        return {
          role: item.role || 'assistant',
          content: item.content,
          timestamp: item.timestamp,
          id: item.id
        } as WelcomeMessage;
      }
      return null;
    })
    .filter((item) => item && item.content);
};

const getWelcomeMessages = async (name: string) => {
  try {
    const params: any = { 
      name,
      agent_type: currentAgentType.value 
    };
    const res: any = await fetchWelcomeMessage(params);
    const payload = res?.data ?? res;
    if (Array.isArray(payload)) {
      return normalizeWelcomeMessages(payload);
    }
  } catch (e) {
    console.error('Fetch welcome message failed:', e);
  }
  return [
    { role: 'assistant', content: `Hi，${name}，很高兴认识你` },
    { role: 'assistant', content: '我是知势，你的个人成长与趋势分析助手。帮你识别个人周期中的“季节”与“潮汐”，让你在规划重要事项时，多一个参考维度' },
    { role: 'assistant', content: '我们可以先聊聊你当下的情况' }
  ];
};

const simulateWelcomeMessages = async () => {
  // 如果有待发送的自动问题，跳过欢迎语
  if (pendingAutoQuestion.value) return;

  clearWelcomeTimers();
  showQuickQuestions.value = false;
  
  const name = userInfo.value?.name || '你';

  const messages = await getWelcomeMessages(name);
  if (!messages.length) return;

  const finalizeWelcome = async () => {
    if (userInfo.value && userInfo.value.id) {
      if (currentAgentType.value !== 'emotion' && currentAgentType.value !== 'career') {
        await execShowBaziCard(true);
      }
    }

    if (!isQuotaExhausted.value) {
      await loadQuickQuestions();
      if (quickQuestions.value.length > 0) {
        nextTick(() => {
          scrollToBottom(false);
        });
      }
    }
  };

  const pushMessage = (message: any, index: number) => {
    chatMessages.value.push({
      role: message.role || 'assistant',
      content: message.content,
      timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
      id: message.id || `welcome-${index}-${Date.now()}`
    });
  };

  pushMessage(messages[0], 1);
  scrollToBottom(true);

  const scheduleNext = (index: number) => {
    if (index >= messages.length) return;
    const delay = index === 1 ? 1000 : 1200;
    const timer = setTimeout(() => {
      pushMessage(messages[index], index + 1);
      scrollToBottom(true);
      if (index === messages.length - 1) {
        const finalTimer = setTimeout(async () => {
          await finalizeWelcome();
        }, 1000);
        welcomeTimers.value.push(finalTimer);
      } else {
        scheduleNext(index + 1);
      }
    }, delay);
    welcomeTimers.value.push(timer);
  };

  if (messages.length > 1) {
    scheduleNext(1);
  } else {
    const finalTimer = setTimeout(async () => {
      await finalizeWelcome();
    }, 1000);
    welcomeTimers.value.push(finalTimer);
  }
};

const hasProfile = computed(() => {
  return !!(userInfo.value && userInfo.value.name);
});

const showProfileGuide = computed(() => {
  // if (chatMessages.value.length > 0) return false;
  return isProfileListEmpty.value || (!isLoadingUserInfo.value && !hasProfile.value);
});

// initBaziData removed - handled by useSWR

onLoad(async (options: any) => {
  if (options.inviteCode) {
    currentInviteCode.value = options.inviteCode;
  }
  if (options.agentType) {
    currentAgentType.value = options.agentType;
  }
  if (options.question) {
    pendingAutoQuestion.value = decodeURIComponent(options.question);
    inputText.value = pendingAutoQuestion.value;
  }
  loadShareConfig();

  const token = uni.getStorageSync('token');
  hasToken.value = !!token;

  if (!token && userStore.systemUser) {
    userStore.clearSystemUser();
  }

  if (!hasToken.value) {
    isProfileListEmpty.value = true;
    isLoadingUserInfo.value = false;
    isInitialLoading.value = false;
    return;
  }

  if (!options.userInfo && !options.sessionId) {
    try {
      const profilesRes: any = await fetchProfilesList();
      const raw = profilesRes.data;
      const profiles = Array.isArray(raw?.items)
        ? raw.items
        : (Array.isArray(raw) ? raw : []);

      if (profiles.length === 0) {
        // 已登录但没有任何档案：只展示建档引导，不展示欢迎对话流
        isProfileListEmpty.value = true;
        userInfo.value = null;
      } else {
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
        
        // initBaziData(targetProfile); // Removed

        // Initialize session ID
        let targetSessionId = '';

        // If agent type is specified, try to find existing session or create one
        if (currentAgentType.value) {
          try {
            const sessionRes: any = await fetchAgentSession(targetProfile.id, currentAgentType.value);
            if (sessionRes?.data?.session_id) {
              targetSessionId = sessionRes.data.session_id;
            } else {
              // No session found, create a new one
              const createRes: any = await fetchCreateSession({
                profile_id: targetProfile.id,
                agent_type: currentAgentType.value
              });
              if (createRes?.data?.session_id) {
                targetSessionId = createRes.data.session_id;
              }
            }
          } catch (e) {
            console.error('Agent session resolution failed:', e);
            // Fallback: try to create a new session
            try {
              const createRes: any = await fetchCreateSession({
                profile_id: targetProfile.id,
                agent_type: currentAgentType.value
              });
              if (createRes?.data?.session_id) {
                targetSessionId = createRes.data.session_id;
              }
            } catch (createErr) {
              console.error('Fallback session creation failed:', createErr);
            }
          }
        } else {
          // Default behavior: use profile's last session
          if (targetProfile.session_id) {
            targetSessionId = targetProfile.session_id;
          }
        }

        if (targetSessionId) {
          sessionId.value = targetSessionId;
          await getChatHistory();
          // If history is empty (newly created session), show welcome messages
          if (chatMessages.value.length === 0) {
            await simulateWelcomeMessages();
          }
        } else {
          await simulateWelcomeMessages();
        }
      }
    } catch (e) {
      console.error('Failed to check profiles:', e);
      // 档案接口异常时，保守起见只展示建档引导
      isProfileListEmpty.value = true;
      userInfo.value = null;
    }
  }
  if (options.sessionId) {
    sessionId.value = options.sessionId;

    // 检查是否从首页进入
    isFromIndexPage.value = options.from === 'index' || !options.from;

    if (options.isNewProfile !== 'true') {
      await getChatHistory();
    }
  }

  // Fetch latest system user info (quota)
  fetchSystemUserInfo().then(res => {
      if (res.data) userStore.setSystemUser(res.data as SystemUser);
  }).catch(console.error);

  if (options.userInfo) {
    try {
      const parsedInfo = JSON.parse(decodeURIComponent(options.userInfo));
      userInfo.value = parsedInfo;
      // initBaziData(parsedInfo); // Removed

      // Handle new profile creation flow
      if (options.isNewProfile === 'true') {
         await simulateWelcomeMessages();
      }
    } catch (e) {
      console.error('Parse userInfo error:', e);
    }
    isLoadingUserInfo.value = false;
  } else if (sessionId.value && (options.sessionId || !userInfo.value)) {
    // Historical session: fetch user info (only if deep linked or no user loaded)
    try {
      const res = await fetchSessionUserInfo(sessionId.value);
      if (res.data) {
        userInfo.value = res.data as UserInfo;
        // initBaziData(res.data);
      }
    } catch (err) {
      console.error('Fetch session user info error:', err);
    } finally {
      isLoadingUserInfo.value = false;
    }
  } else {
    // New session: do not create session immediately if user profile is missing
    // Instead, let showProfileGuide handle the UI
    isLoadingUserInfo.value = false;
  }
  
  // Check if we have a pending auto question
   if (pendingAutoQuestion.value && !isGenerating.value) {
       // Send question (skip suggested, do not skip push)
       inputText.value = pendingAutoQuestion.value;
       
       // Use nextTick to ensure UI updates before sending
       nextTick(() => {
         sendQuestion(true); // skipSuggestedQuestions=true, skipPush=false
         // Clear pending
         pendingAutoQuestion.value = '';
       });
   }

  isInitialLoading.value = false;
});

onUnload(() => {
  if (scrollResetTimer.value) clearTimeout(scrollResetTimer.value);
  welcomeTimers.value.forEach(timer => clearTimeout(timer));
});

// 优化 onPageScroll - 更精准的底部检测
onPageScroll(debounce((e: { scrollTop: number }) => {
  if (isAutoScrolling.value) {
    checkIfAtBottom();
    return;
  }

  isManualScroll.value = true;
  checkIfAtBottom();
  
  // 小程序中清理旧定时器，避免内存泄漏
  if (scrollResetTimer.value) clearTimeout(scrollResetTimer.value);
  scrollResetTimer.value = setTimeout(() => {
    isManualScroll.value = false;
  }, 1000);
}, 100));

const checkIfAtBottom = () => {
  const bottomThreshold = 160;
  const query = uni.createSelectorQuery();
  query.select('#chat-bottom').boundingClientRect();
  query.exec((res) => {
    if (!res[0]) return;
    const bottomRect = res[0];
    const windowHeight = uni.getWindowInfo().windowHeight;
    console.log('bottomRect.top <= windowHeight - 50;', bottomRect.top <= windowHeight - 50);
    // 阈值设为 windowHeight - 130，比 padding-bottom (160) 稍大，允许用户上滑 30px 后即停止自动滚动
    isUserAtBottom.value = bottomRect.top <= windowHeight - bottomThreshold;
  });
};


const checkScrollPosition = () => {
  const bottomThreshold = 160;
  const query = uni.createSelectorQuery();
  query.selectViewport().scrollOffset((res) => {
    if (!res || Array.isArray(res)) return;
    const scrollTop = res.scrollTop || 0;
    const windowHeight = uni.getWindowInfo().windowHeight;
    
    // 获取页面总高度
    uni.createSelectorQuery().select('.root').boundingClientRect((rect) => {
      if (!rect || Array.isArray(rect)) return;
      const scrollHeight = rect.height || 0;
      // 阈值设为 windowHeight - 130，与 onPageScroll 保持一致
      isUserAtBottom.value = (scrollTop + windowHeight) >= (scrollHeight - bottomThreshold);
    }).exec();
  }).exec();
};

const handleToBottom = () => {
  isManualScroll.value = false;
  if (scrollResetTimer.value) clearTimeout(scrollResetTimer.value);
  scrollToBottom(true, 0);
  scrollResetTimer.value = setTimeout(() => {
    isManualScroll.value = false;
  }, 500);
};

const scrollToBottom = (force = false, delay = 150) => {
  console.log('scrollToBottom触发:', { force, delay, isUserAtBottom: isUserAtBottom.value, isManualScroll: isManualScroll.value });
  
  if (showSidebar.value) return;
  if (isManualScroll.value && !force) return;
  if (!force && !isUserAtBottom.value) return;

  if (delay === 0 && !force && isScrollThrottled.value) return;
  
  if (delay === 0 && !force) {
    isScrollThrottled.value = true;
    setTimeout(() => {
      isScrollThrottled.value = false;
    }, 100);
  }

  nextTick(() => {
    setTimeout(() => {
      if (!force && !isUserAtBottom.value) return;
      if (showSidebar.value) return;
      if (isManualScroll.value && !force) return;

      isAutoScrolling.value = true;
      uni.pageScrollTo({
        success: () => {
          isAutoScrolling.value = false;
          if (force) {
            isUserAtBottom.value = true;
          }
        },
        scrollTop: 9999999,
        duration: delay === 0 ? 100 : 300,
        selector: '#chat-bottom', // 小程序兜底 selector
        fail: () => {
          isAutoScrolling.value = false;
        }
      });
    }, delay);
  });
};

const execShowBaziCard = async (isAuto = false) => {
  if (showProfileGuide.value) {
    if (!isAuto) {
      uni.showToast({
        title: '请先录入档案',
        icon: 'none'
      });
    }
    return;
  }

  // Simulate user asking "看生辰" only if not auto
  if (!isAuto) {
    // 新增：交互时立即隐藏快捷提问并清除可能存在的欢迎语定时器
    showQuickQuestions.value = false;
    clearWelcomeTimers();

    chatMessages.value.push({
      role: 'user',
      content: '查看深度解读',
      timestamp: new Date(),
      id: `user_${Date.now()}`,
      type: 'text'
    });
    scrollToBottom(true);
  }
  
  isTyping.value = true;
  isGenerating.value = true;
  
  try {
    const messageId = `ai_${Date.now()}`;
    let showedCache = false;

    // SWR: Show cache immediately if available
    if (currentBaziData.value) {
       chatMessages.value.push({
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        id: messageId,
        type: 'bazi',
        baziData: currentBaziData.value
      });
      scrollToBottom(true);
      showedCache = true;
    }

    let resultData;
    let fetchError;

    try {
      // Trigger SWR revalidation to get latest data
    // mutateBazi() returns the fresh data after revalidation
    if (!currentBaziData.value) {
      if (isBaziValidating.value) {
         // If already validating, wait for it to finish
         await new Promise<void>((resolve) => {
            const unwatch = watch(isBaziValidating, (val) => {
               if (!val) {
                  unwatch();
                  resolve();
               }
            });
         });
      } else {
         await mutateBazi();
      }
    }
      resultData = currentBaziData.value;
      if (baziError.value) {
        fetchError = baziError.value;
      }
    } catch (error) {
      fetchError = error;
    }

    if (resultData) {
       // We have data (either fresh or validated cache)
       
       if (showedCache) {
          // Update existing message with fresh data
          const msgIndex = chatMessages.value.findIndex(m => m.id === messageId);
          if (msgIndex !== -1) {
             chatMessages.value[msgIndex].baziData = resultData;
          }
       } else {
          // No cache showed, push new message
          chatMessages.value.push({
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            id: messageId,
            type: 'bazi',
            baziData: resultData
          });
          scrollToBottom(true);
       }
    } else {
       // Fetch failed and no data returned
       if (!showedCache) {
          throw fetchError || new Error('Unknown error');
       }
       // If showed cache, suppress error (maybe log it), keep showing cache
       console.warn('Network fetch failed, keeping cached Bazi data.', fetchError);
    }
  } catch (error) {
    console.error('获取分析数据失败:', error);
    if (!isAuto) {
      chatMessages.value.push({
          role: 'assistant',
          content: '获取分析数据失败，请稍后再试。',
          timestamp: new Date(),
          id: `ai_${Date.now()}`,
          type: 'text'
      });
    }
  } finally {
    isTyping.value = false;
    isGenerating.value = false;
    scrollToBottom(true);
  }
};

onMounted(() => {
  // Calculate header height for padding
  const windowInfo = uni.getWindowInfo();
  const statusBarHeight = windowInfo.statusBarHeight || 20;
  let navBarHeight = 44;

  // #ifdef MP-WEIXIN
  const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
  const gap = menuButtonInfo.top - statusBarHeight;
  navBarHeight = menuButtonInfo.height + (gap * 2);
  // #endif

  // Add extra buffer for the two-row title/selector layout
  headerHeight.value = statusBarHeight + navBarHeight + 12;
});

const handleViewBaziDetail = () => {
  if (showProfileGuide.value) {
    uni.showToast({
      title: '请先录入档案',
      icon: 'none'
    });
    return;
  }
  
  if (userInfo.value && userInfo.value.id) {
    uni.navigateTo({
        url: `/pages/qushi/detail?id=${userInfo.value.id}`
    });
  }
};

const handleOpenUserCenter = () => {
  showSidebar.value = false;
  showUserPopup.value = true;
};

const handleOpenUpgrade = () => {
  showSidebar.value = false;
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
    // initBaziData(profile); // Removed
    
    // Check if session exists
    let targetSessionId = '';

    if (currentAgentType.value) {
        try {
            const sessionRes: any = await fetchAgentSession(profile.id!, currentAgentType.value);
            if (sessionRes?.data?.session_id) {
                targetSessionId = sessionRes.data.session_id;
            } else {
                 const createRes: any = await fetchCreateSession({
                     profile_id: profile.id,
                     agent_type: currentAgentType.value
                 });
                 if (createRes?.data?.session_id) {
                     targetSessionId = createRes.data.session_id;
                 }
            }
        } catch (e) {
            console.error('Agent session resolution failed:', e);
             // Fallback create
              try {
                 const createRes: any = await fetchCreateSession({
                     profile_id: profile.id,
                     agent_type: currentAgentType.value
                 });
                 if (createRes?.data?.session_id) {
                     targetSessionId = createRes.data.session_id;
                 }
             } catch (err) {}
        }
    } else {
        if (profile.session_id) {
            targetSessionId = profile.session_id;
        }
    }

    if (targetSessionId) {
      sessionId.value = targetSessionId;
      chatMessages.value = [];
      await getChatHistory();
      if (chatMessages.value.length === 0) {
        await simulateWelcomeMessages();
      }
    } else {
      // No session yet, just show welcome messages
      sessionId.value = '';
      chatMessages.value = [];
      await simulateWelcomeMessages();
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

const handleBackToHome = () => {
  uni.navigateBack();
};

const getChatHistory = async () => {
  try {
    const res = await fetchChatHistory(sessionId.value, currentAgentType.value);
    console.log('Chat history response:', res);

    if (Array.isArray(res.data)) {
      // 如果有历史记录，确保隐藏快捷提问
      if (res.data.length > 0) {
        showQuickQuestions.value = false;
        // 加载输入框上方的推荐问题
        if (!isQuotaExhausted.value) {
           loadQuickQuestions();
           showQuickQuestions.value = true;
        }
      }

      // 清空现有消息
      chatMessages.value = [];

      // 遍历聊天历史数据并添加到消息列表
      res.data.forEach((item: any) => {
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
        await simulateWelcomeMessages();
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
      } else {
        // 如果有历史记录且不发欢迎语，不要强制滚动到底部
        // scrollToBottom(false) 会检查 isUserAtBottom 状态
        nextTick(() => {
          checkScrollPosition();
        });
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
  await execShowBaziCard(false);
};

const getInputValue = (value: string) => {
  inputText.value = value;
  if (value.trim()) {
    sendQuestion();
  } else {
    uni.showToast({
      title: '请输入问题',
      icon: 'none'
    });
  }
}

const sendQuestion = async (skipSuggestedQuestions = false, skipPush = false) => {
  if (!hasToken.value) {
    goToLogin();
    return;
  }

  // Check quota
  if (isQuotaExhausted.value) {
     uni.showModal({
        title: '额度不足',
        content: '您的免费对话额度已用完，升级会员解锁无限对话，或邀请好友获取更多额度。',
        confirmText: '去获取',
        success: (res) => {
          if (res.confirm) {
            handleOpenUserCenter();
          }
        }
     });
     return;
  }

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
    if (!skipPush) {
      chatMessages.value.push({
        role: 'user',
        content: inputText.value,
        timestamp: new Date(),
        id: `temp_${Date.now()}`
      });
      scrollToBottom(true);
    }

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
            const params: any = {
              profile_id: userInfo.value.id
            };
            if (currentAgentType.value) {
              params.agent_type = currentAgentType.value;
            }
            const sessionRes: any = await fetchCreateSession(params);
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
      const { messageList, isLoading, startSSE, error } = useSSEMessage({
        session_id: sessionId.value,
        user_input: question,
        deep_thinking: isDeepThinkingMode.value,
        agent_type: currentAgentType.value
      });

      // 开始SSE连接
      startSSE();

      // 监听错误
      const unwatchError = watch(error, (newVal) => {
        if (newVal) {
           if (newVal === 'no_quota' || newVal.includes('no_quota')) {
              // no-op: banner will show based on updated store state from SSE response
              // uni.showModal({ ... }) removed
           } else {
              uni.showToast({ title: newVal, icon: 'none' });
           }
        }
      });

      // 监听SSE消息更新
      const unwatch = watch(messageList, (newMessages) => {
  if (newMessages.length > 0) {
    const latestMessage = newMessages[newMessages.length - 1];
    const existingMessage = chatMessages.value.find((msg) => msg.id === latestMessage.id);
    const startedContent =
      latestMessage.role === 'assistant' &&
      typeof latestMessage.content === 'string' &&
      latestMessage.content.length > 0;

    const startedReasoning = 
      latestMessage.role === 'assistant' &&
      typeof latestMessage.reasoning_content === 'string' &&
      latestMessage.reasoning_content.length > 0;

    if (startedContent || startedReasoning) {
      isTyping.value = false;
    }

    if (startedContent) {
      isThinking.value = false;
      if (existingMessage) {
        existingMessage.isReasoningExpanded = false;
      }
    }
    
    if (existingMessage) {
      // 思维链内容更新时的滚动逻辑优化
      if (latestMessage.reasoning_content && latestMessage.reasoning_content.length > (existingMessage.reasoning_content?.length || 0)) {
         existingMessage.reasoningScrollTop = (existingMessage.reasoningScrollTop || 0) + 9999;
      }

      existingMessage.content = latestMessage.content;
      existingMessage.reasoning_content = latestMessage.reasoning_content;
      existingMessage.timestamp = new Date(latestMessage.created_at || Date.now());
      existingMessage.isStreaming = true;
      
      // 修复：只在用户原本在底部时才滚动
      if (isUserAtBottom.value && !isManualScroll.value) {
        scrollToBottom(false, 0);
      }
    } else if (latestMessage.role === 'assistant') {
      chatMessages.value.push({
        role: 'assistant',
        reasoning_content: latestMessage.reasoning_content,
        content: latestMessage.content,
        timestamp: new Date(latestMessage.created_at || Date.now()),
        id: latestMessage.id,
        isStreaming: true,
        isReasoningExpanded: true
      });
      
      // 修复：新消息只有在用户在底部时才滚动
      if (isUserAtBottom.value && !isManualScroll.value) {
        scrollToBottom(true);
      }
    }
  }
});

      // 监听加载状态，完成后获取推荐问题
      const unwatchLoading = watch(isLoading, (newVal) => {
        if (!newVal) {
          // 加载完成，停止监听
          unwatch();
          unwatchLoading();
          unwatchError();
          
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

          // 获取推荐问题 (仅当没有错误时)
          if (!error.value) {
            // 如果是普通用户，对话结束后刷新额度信息
            if (userStore.systemUser && userStore.systemUser.membership_type !== MembershipType.VIP) {
               // Use fetchSystemUserInfo to get the latest quota status (api/auth/me now contains quota)
               fetchSystemUserInfo().then(res => {
                  const data = (res as any).data || res;
                  if (data) {
                    userStore.setSystemUser({
                      ...userStore.systemUser,
                      ...data
                    });
                    
                    const total = data.free_quota_total ?? 5;
                    const used = data.free_quota_used ?? 0;
                    const remaining = Math.max(0, total - used);
                    uni.showToast({
                      title: `免费额度剩余 ${remaining} 次`,
                      icon: 'none',
                      position: 'top',
                      duration: 2000
                    });
                  }
               }).finally(() => {
                  nextTick(() => {
                    if (!isQuotaExhausted.value && !skipSuggestedQuestions) {
                      loadQuickQuestions();
                      showQuickQuestions.value = true;
                    } else {
                      showQuickQuestions.value = false;
                    }
                    nextTick(() => {
                      scrollToBottom(false);
                    });
                  });
               });
            } else {
               nextTick(() => {
                 if (!isQuotaExhausted.value && !skipSuggestedQuestions) {
                   loadQuickQuestions();
                   showQuickQuestions.value = true;
                 } else {
                   showQuickQuestions.value = false;
                 }
                 nextTick(() => {
                   scrollToBottom(false);
                 });
               });
            }
          }
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

const goToLogin = () => {
  let url = '/pages/login/index';
  if (currentInviteCode.value) {
    url += `?inviteCode=${currentInviteCode.value}`;
  }
  uni.navigateTo({
    url
  });
};

</script>

<style lang="scss" scoped>
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

.sidebar-wrapper-fixed {
  height: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

/* Custom Sidebar Implementation */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  pointer-events: none;

  &.show {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
}

.sidebar-panel {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 600rpx;
  background-color: #fff;
  z-index: 1001;
  transform: translate3d(-100%, 0, 0);
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 4rpx 0 16rpx rgba(0, 0, 0, 0.05);
  /* Handle safe area */

  &.show {
    transform: translate3d(0, 0, 0);
  }
}

:deep(.sidebar-menu-root) {
  flex: 1;
  height: 100%;
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
  bottom: 280rpx;
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
  pointer-events: auto;

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

.quota-banner-inline {
  margin: 0 -32rpx 24rpx -32rpx;
  background: #eef2ff;
  padding: 20rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  // border-top: 1px solid rgba(99, 102, 241, 0.2);
  // border-bottom: 1px solid rgba(99, 102, 241, 0.2);
  
  .quota-text {
    font-size: 26rpx;
    color: #6366f1;
    font-weight: 500;
  }
  
  .quota-btn {
    background: #6366f1;
    color: #ffffff;
    font-size: 24rpx;
    padding: 8rpx 24rpx;
    border-radius: 24rpx;
    flex-shrink: 0;
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
  background-color: rgba(255, 255, 255, 0.6); /* Translucent background */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.8); /* Very subtle border */
  border-left: 6rpx solid #818cf8; /* Lighter indigo accent */
  border-top-right-radius: 20rpx;
  border-bottom-right-radius: 20rpx;
  border-bottom-left-radius: 20rpx;
  border-top-left-radius: 0;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(31, 38, 135, 0.05); /* Softer shadow */
  margin-bottom: 24rpx;
  max-width: 95%;
  transition: all 0.3s ease;
  
  &:hover {
     background-color: rgba(255, 255, 255, 0.75);
     box-shadow: 0 8rpx 24rpx rgba(31, 38, 135, 0.08);
  }
}

.thinking-header {
  padding: 20rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.3s;
  background-color: transparent;
}

.thinking-header:active {
  background-color: rgba(255, 255, 255, 0.5);
}

.thinking-header-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.thinking-icon {
  width: 28rpx;
  height: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thinking-icon .icon-svg {
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236366f1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13 10V3L4 14h7v7l9-11h-7z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.thinking-icon.animate-spin .icon-svg {
  animation: spin 1s linear infinite;
}

.status-text-thinking {
  font-size: 24rpx;
  font-weight: 500;
  color: #6366f1; /* Indigo-500 */
  letter-spacing: 0.02em;
}

.thinking-arrow {
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  opacity: 0.5;
}

.thinking-arrow.rotate {
  transform: rotate(180deg);
}

.arrow-icon-img {
  width: 20rpx;
  height: 20rpx;
}

.thinking-content {
  padding: 0 24rpx 24rpx 24rpx;
  border-top: 1rpx solid rgba(99, 102, 241, 0.05); /* Almost invisible separator */
  margin-top: 0;
  padding-top: 16rpx;
  background-color: transparent; /* Seamless background */
}

.thinking-scroll-view {
  max-height: 400rpx;
  width: 100%;
  overflow-y: auto;
  padding-right: 12rpx;
}

.thinking-text {
  font-size: 26rpx;
  color: #475569; /* Slate-600 */
  line-height: 1.8;
  letter-spacing: 0.01em;
  white-space: pre-wrap;
  word-break: break-all;
  font-weight: 400;
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

.header-left-group {
  display: flex;
  align-items: center;
  gap: 12px;
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
}

.sidebar-toggle-btn {
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

/* Bazi Drawer (Compact) Styles */
.bazi-drawer-compact {
  position: fixed;
  top: 18vh;
  right: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  background-color: #1e293b; /* Slate 800 */
  border-radius: 44rpx 0 0 44rpx;
  padding: 12rpx;
  box-shadow: -4rpx 8rpx 24rpx rgba(0, 0, 0, 0.15);
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  transform: translateX(calc(100% - 88rpx)); /* Only handle visible */
  width: auto;
  max-width: 90vw;
  
  &.is-open {
    transform: translateX(0);
  }
}

.drawer-handle-compact {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.handle-icon-compact {
  width: 40rpx;
  height: 40rpx;
  opacity: 0.9;
  filter: brightness(0) invert(1);
}

.drawer-content-compact {
  display: flex;
  align-items: center;
  gap: 32rpx;
  padding-right: 12rpx;
  white-space: nowrap;
  opacity: 1; /* Always rendered but off-screen */
}

.pillar-group {
  display: flex;
  gap: 32rpx;
}

.pillar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.pillar-label {
  font-size: 20rpx;
  color: #94a3b8; /* Slate 400 */
  font-weight: 500;
}

.pillar-value {
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.2;
  
  &.year { color: #fbbf24; } /* Amber 400 */
  &.day { color: #f87171; } /* Red 400 */
}

/* Wu Xing Colors */
.mu { color: #10B981; }
.huo { color: #EF4444; }
.tu { color: #B45309; }
.jin { color: #D99014; }
.shui { color: #3B82F6; }

.divider-vertical {
  width: 1px;
  height: 48rpx;
  background-color: rgba(255, 255, 255, 0.1);
}

.detail-btn-compact {
  font-size: 26rpx;
  color: #1e293b;
  background-color: #ffffff;
  padding: 0 32rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 32rpx;
  margin: 0;
  border: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

.header-center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.brand-title {
  font-size: 36rpx;
  font-weight: 900;
  color: #1e293b;
  line-height: 1.2;
  letter-spacing: 0.05em;
}

.mode-selector {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 4rpx 16rpx;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 24rpx;
  margin-top: 4rpx;
  position: relative;
  transition: background 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.6);

  &:active {
    background: rgba(0, 0, 0, 0.05);
  }
}

.mode-text {
  font-size: 22rpx;
  color: #64748b;
  font-weight: 500;
}

.mode-arrow {
  width: 20rpx;
  height: 20rpx;
  opacity: 0.6;
  transition: transform 0.2s;

  &.rotate {
    transform: rotate(180deg);
  }
}

.mode-dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 12rpx;
  background: white;
  border-radius: 20rpx;
  box-shadow: 0 10rpx 30rpx -10rpx rgba(0, 0, 0, 0.15), 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  padding: 8rpx;
  min-width: 220rpx;
  z-index: 100;
  border: 1rpx solid rgba(0, 0, 0, 0.05);
}

.mode-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  transition: background 0.2s;

  &:active {
    background: #f1f5f9;
  }

  &.active {
    background: #f8fafc;
    .option-label text, & > text {
      color: #6366f1;
      font-weight: 600;
    }
  }

  text {
    font-size: 26rpx;
    color: #334155;
  }
}

.option-label {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.vip-badge {
  font-size: 18rpx;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  padding: 2rpx 6rpx;
  border-radius: 6rpx;
  font-weight: 700;
  line-height: 1.2;
}

.check-mark {
  width: 10rpx;
  height: 20rpx;
  border-bottom: 3rpx solid #6366f1;
  border-right: 3rpx solid #6366f1;
  transform: rotate(45deg) translate(-2rpx, -2rpx);
}
</style>
