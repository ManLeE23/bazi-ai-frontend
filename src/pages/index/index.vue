<template>
  <div class="root">
    <u-navbar
      :is-back="false"
      background="transparent"
      :border-bottom="false"
    />
    <div class="container">
      <!-- 顶部标题区域 -->
      <div class="header">
        <!-- <view class="line"></view> -->
        <h1 class="main-title">人生趋势</h1>
        <p class="sub-title">把复杂的人生，变成可行趋势</p>
      </div>

      <div class="action-bar">
        <div class="history-btn" @click="openArchivePicker">
          <text>历史档案</text>
        </div>
      </div>

      <!-- 表单卡片 -->
      <div class="form-card">
        <div class="col-2">
          <!-- 姓名输入 -->
          <FormItem label="姓名">
            <FormInput :value="userName" placeholder="输入姓名" @update:value="onUserNameUpdate" />
          </FormItem>
          <!-- 性别选择 -->
          <FormItem label="性别">
            <GenderSelector v-model="gender" />
          </FormItem>
        </div>
        
        <!-- 出生日期时间合并 -->
        <FormItem label="出生日期时间（阳历）">
          <DateTimePicker 
            :date="birthDate" 
            :time="birthTime"
            @update:date="birthDate = $event"
            @update:time="birthTime = $event"
          />
        </FormItem>
        
        <FormItem label="出生地">
          <RegionPicker :value="birthLocation" @update:birthLocation="onBirthLocationUpdate" />
        </FormItem>

        <div class="col-2">
          <!-- 工作状态 -->
          <FormItem label="工作状态（选填）">
            <div class="input-field" @click="showWorkStatusPicker = true">
              <span>{{ workStatus || '请选择' }}</span>
            </div>
          </FormItem>
          
          <!-- 感情状态 -->
          <FormItem label="感情状态（选填）">
            <div class="input-field" @click="showLoveStatusPicker = true">
              <span>{{ loveStatus || '请选择' }}</span>
            </div>
          </FormItem>
        </div>

        <!-- 当前最关注 -->
        <FormItem label="问题">
          <FormInput :value="mainConcern" placeholder="请输入问题或者从下方建议中选择" @update:value="onMainConcernUpdate" />
          <InterestSelector
            :options="interestOptions"
            :modelValue="selectedInterest"
            @change="handleSelectedInterests"
          />
        </FormItem>
      </div>

      <!-- 诊断按钮 -->
      <BaziButton
        type="secondary"
        show-shadow
        :disabled="isSubmitting"
        @click="onSubmitClick"
      >{{ isSubmitting ? '分析中...' : '开始趋势分析' }}</BaziButton>

      <!-- 底部说明文字 -->
      <!-- <p class="footer-text">AI 助你读懂命盘，理性决策</p> -->
    </div>

    <!-- 工作状态选择器 -->
    <u-picker
      mode="selector"
      :range="workStatusOptions"
      range-key="label"
      v-model="showWorkStatusPicker"
      confirm-color="#4f46e5"
      @confirm="handleWorkStatusConfirm"
    >
    </u-picker>
    
    <!-- 感情状态选择器 -->
    <u-picker
      mode="selector"
      :range="loveStatusOptions"
      range-key="label"
      v-model="showLoveStatusPicker"
      confirm-color="#4f46e5"
      @confirm="handleLoveStatusConfirm"
    >
    </u-picker>

    <ArchivePicker
      :show="showArchivePicker"
      :archives="archives"
      :is-loading="isLoading"
      @close="closeArchivePicker"
      @quick-load="quickLoad"
    />

    <!-- 底部导航 -->
    <Tabbar :current="0" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FormItem from './components/FormItem.vue';
import DateTimePicker from './components/DateTimePicker.vue';
import GenderSelector from './components/GenderSelector.vue';
import InterestSelector from './components/InterestSelector.vue';
import ArchivePicker from './components/ArchivePicker.vue';
import Tabbar from '@/components/Tabbar.vue';
import BaziButton from '@/components/BaziButton.vue';
import { fetchGenReport, fetchCreateSession } from '@/api/services';
import { fetchProfilesList } from '@/api/services';
import RegionPicker from './components/RegionPicker.vue';
import useFetchOpenId from '@/hooks/useFetchOpenId';
import FormInput from './components/FormInput.vue';

const interestOptions = ['事业', '感情', '财运', '性格', '健康'];
const gender = ref('');
const selectedInterest = ref('');
const birthDate = ref('');
const birthTime = ref('');
const birthLocation = ref('');
const userName = ref('');
const workStatus = ref('');
const loveStatus = ref('');
const mainConcern = ref('');

const isSubmitting = ref(false);
const isLoading = ref(false);
let submitTimer: number | null = null;

const showArchivePicker = ref(false);
type ProfileItem = {
  name: string;
  gender: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
};
const archives = ref<ProfileItem[]>([]);

// 工作状态选项
const workStatusOptions = [
  { label: '待业', value: '待业' },
  { label: '就业', value: '就业' },
  { label: '创业', value: '创业' },
  { label: '学生', value: '学生' }
];

// 感情状态选项
const loveStatusOptions = [
  { label: '单身', value: '单身' },
  { label: '恋爱中', value: '恋爱中' },
  { label: '已婚', value: '已婚' },
  { label: '离异', value: '离异' },
  { label: '丧偶', value: '丧偶' },
  { label: '关系复杂', value: '关系复杂' }
];

// 控制选择器显示
const showWorkStatusPicker = ref(false);
const showLoveStatusPicker = ref(false);

// 加载档案库
const loadArchives = async () => {
  try {
    isLoading.value = true;
    const res: any = await fetchProfilesList();
    if (res && res.data && Array.isArray(res.data.items)) {
      archives.value = res.data.items as ProfileItem[];
    } else {
      archives.value = [];
    }
  } catch (e) {
    archives.value = [];
  } finally {
    isLoading.value = false;
  }
};

useFetchOpenId(loadArchives);

const handleWorkStatusConfirm = (event: number) => {
  const selectedIndex = event;
  workStatus.value = workStatusOptions[selectedIndex].value;
};

const handleLoveStatusConfirm = (event: number) => {
  const selectedIndex = event;
  loveStatus.value = loveStatusOptions[selectedIndex].value;
};
const onUserNameUpdate = (value: string) => {
  userName.value = value;
};
const onBirthLocationUpdate = (value: string) => {
  console.log('value', value);
  birthLocation.value = value;
};
const onMainConcernUpdate = (value: string) => {
  mainConcern.value = value;
};
const handleSelectedInterests = (newSelected: string) => {
  selectedInterest.value = newSelected;
  if (newSelected) {
    mainConcern.value = `基于我的八字，分析下未来3-5年的${newSelected}发展`;
    return;
  }
  mainConcern.value = '';
};

const validateForm = () => {
  if (!userName.value) {
    uni.showToast({ title: '请填写姓名', icon: 'none' });
    return false;
  }
  if (!gender.value) {
    uni.showToast({ title: '请选择性别', icon: 'none' });
    return false;
  }
  if (!birthDate.value) {
    uni.showToast({ title: '请选择出生日期', icon: 'none' });
    return false;
  }
  if (!birthTime.value) {
    uni.showToast({ title: '请选择出生时辰', icon: 'none' });
    return false;
  }
  if (!birthLocation.value) {
    uni.showToast({ title: '请选择出生地', icon: 'none' });
    return false;
  }
  if (!mainConcern.value) {
    uni.showToast({ title: '请填写问题', icon: 'none' });
    return false;
  }
  return true;
};

const onSubmitClick = () => {
  if (isSubmitting.value) return;
  if (!validateForm()) return;
  isSubmitting.value = true;
  if (submitTimer) {
    clearTimeout(submitTimer);
  }
  submitTimer = setTimeout(async () => {
    try {
      await onCreateChat();
      // 创建会话后才可以创建档案库
      await loadArchives();
    } catch (e) {
      uni.showToast({ title: '提交失败，请稍后重试', icon: 'none' });
      console.error('create chat failed', e);
    } finally {
      isSubmitting.value = false;
      submitTimer = null;
    }
  }, 500) as unknown as number;
};

const onCreateChat = async () => {
  const res: any = await fetchCreateSession({
    birth_date: birthDate.value,
    birth_time: birthTime.value,
    gender: gender.value,
    main_concern: mainConcern.value,
    birth_location: birthLocation.value,
    name: userName.value,
    work_status: workStatus.value,
    relationship_status: loveStatus.value,
  });
  console.log('res', res);
  const sessionId = (res as any).data.session_id;
  const userInfo = (res as any).data.user_info;
  uni.navigateTo({
    url: `/pages/new-chat/index?sessionId=${sessionId}&message=${mainConcern.value}&userInfo=${encodeURIComponent(JSON.stringify(userInfo))}`,
  });
};

const onGenReport = async () => {
  try {
    const payload = {
      birth_date: birthDate.value,
      birth_hour: birthTime.value,
      gender: gender.value,
      mainConcern: mainConcern.value,
      birth_city: birthLocation.value,
      user_name: userName.value,
      work_status: workStatus.value,
      relationship_status: loveStatus.value,
    };
    const response: any = await fetchGenReport(payload as any);
    const reportId = (response as any).data.id;
    onJump(reportId);
  } catch (error) {
    console.error('Error generating report:', error);
  }
};

const onJump = (id: string) => {
  uni.navigateTo({
    url: `/pages/new-chat/index?reportId=${id}`,
  });
};

const openArchivePicker = () => {
  showArchivePicker.value = true;
};

const closeArchivePicker = () => {
  showArchivePicker.value = false;
};

const quickLoad = (item: ProfileItem) => {
  if (item.name) userName.value = item.name;
  if (item.gender) gender.value = item.gender;
  if (item.birth_date) birthDate.value = item.birth_date;
  if (item.birth_time) birthTime.value = item.birth_time;
  if (item.birth_location) birthLocation.value = item.birth_location;
  showArchivePicker.value = false;
};
</script>

<style lang="scss" scoped>
$tw-shadow-color: rgba(226, 232, 240, 0.5 * 0.8);

.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.history-btn {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.6);
  padding: 6px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  font-size: 14px;
  color: #4b5563;
  font-weight: 500;
  backdrop-filter: blur(8px);
  transition: all 0.2s;
  
  &:active {
    background: rgba(255, 255, 255, 0.8);
    transform: scale(0.98);
  }
}

.root {
  background: #fbfbff;
  // background: #fff;
  // background: radial-gradient(circle at 0% 0%, rgba(212, 226, 255, 0.5) 0, transparent 50%),
  //   radial-gradient(circle at 100% 0%, rgba(255, 226, 241, 0.5) 0, transparent 50%),
  //   radial-gradient(circle at 100% 100%, rgba(226, 255, 241, 0.5) 0, transparent 50%),
  //   radial-gradient(circle at 0% 100%, rgba(241, 226, 255, 0.5) 0, transparent 50%),
  //   #ffffff;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.container {
  padding: $spacing-md;
  flex: 1;
  height: 100%;
  overflow-y: auto;
}

.header {
  margin-bottom: 4px;
}

// .line {
//   background: #4f46e5;
//   width: 40px;
//   height: 4px;
//   margin-bottom: 16px;
// }

.main-title {
  color: #1F2937;
  font-size: $text-2lg; // 文本尺寸变量
  font-weight: 700;
}

.sub-title {
  color: #6B7280;
  font-size: 14px;
  margin: 0;
}

.archive-icon-btn {
  width: 20px;
  height: 20px;
  border-radius: 12px;
  padding: 8px;
  background: #fff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.form-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
  .col-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}

.input-field {
  height: 48px;
  padding: 12px 16px;
  border: 1.5px solid rgba(99, 102, 241, 0.2);
  border-radius: $border-radius-base;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  background-color: #fff;
  outline: none;
  font-size: 14px;
  justify-content: space-between;
  color: $color-slate-900;
  &:active, &:mainConcern-within, &:mainConcern {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }
}

.footer-text {
  color: #fff;
  font-size: 12px;
  text-align: center;
  margin: 24px;
  opacity: 0.8;
}
</style>