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
        <h1 class="main-title">人生趋势</h1>
        <p class="sub-title">助你看清趋势，走稳人生</p>
      </div>

      <!-- 表单卡片 -->
      <div class="form-card">
        <div class="col-2">
          <!-- 姓名输入 -->
          <FormItem label="姓名">
            <FormInput :value="userName" placeholder="输入姓名" @update:value="(value) => userName = value" />
          </FormItem>
          <!-- 性别选择 -->
          <FormItem label="性别">
            <GenderSelector v-model="gender" />
          </FormItem>
        </div>
        <div class="col-2">
          <!-- 出生日期输入 -->
          <FormItem label="出生日期">
            <DatePicker v-model="birthDate" />
          </FormItem>

          <!-- 出生时辰选择 -->
          <FormItem label="出生时辰">
            <TimeSelect v-model="birthTime" />
          </FormItem>
        </div>
        
        <FormItem label="出生地">
          <RegionPicker @update:birthPlace="(value) => birthPlace = value" />
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
        <FormItem label="当前最关注">
          <FormInput :value="focus" placeholder="请输入当前最关注的问题或者选择下方标签" @update:value="(value) => focus = value" />
          <InterestSelector
            :options="interestOptions"
            :modelValue="selectedInterest"
            @change="handleSelectedInterests"
          />
        </FormItem>
      </div>

      <!-- 诊断按钮 -->
      <BaziButton type="secondary" show-shadow @click="onGenReport">开始 AI 诊断</BaziButton>

      <!-- 底部说明文字 -->
      <!-- <p class="footer-text">AI 助你读懂命盘，理性决策</p> -->
    </div>

    <!-- 工作状态选择器 -->
    <u-picker
      mode="selector"
      :range="workStatusOptions"
      range-key="label"
      v-model="showWorkStatusPicker"
      confirm-color="#f59e0b"
      @confirm="handleWorkStatusConfirm"
    >
    </u-picker>
    
    <!-- 感情状态选择器 -->
    <u-picker
      mode="selector"
      :range="loveStatusOptions"
      range-key="label"
      v-model="showLoveStatusPicker"
      confirm-color="#f59e0b"
      @confirm="handleLoveStatusConfirm"
    >
    </u-picker>

    <!-- 底部导航 -->
    <Tabbar :current="0" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import FormItem from './components/FormItem.vue';
import DatePicker from './components/DatePicker.vue';
import TimeSelect from './components/TimeSelect.vue';
import GenderSelector from './components/GenderSelector.vue';
import InterestSelector from './components/InterestSelector.vue';
import Tabbar from '@/components/Tabbar.vue';
import BaziButton from '@/components/BaziButton.vue';
import { fetchGenReport, fetchOpenId } from '@/api/services';
import RegionPicker from './components/RegionPicker.vue';
import { onLoad } from '@dcloudio/uni-app';
import useFetchOpenId from '@/hooks/useFetchOpenId';
import FormInput from './components/FormInput.vue';

const interestOptions = ['事业', '感情', '财运', '性格', '健康'];
const gender = ref('女');
const selectedInterest = ref('');
const birthDate = ref('1998-08-23');
const birthTime = ref('酉时');
const birthPlace = ref('广东省广州市荔湾区');
const userName = ref('陆敏怡');
const workStatus = ref('');
const loveStatus = ref('');
const focus = ref('');

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
  { label: '离异', value: '离异' },
  { label: '丧偶', value: '丧偶' },
  { label: '关系复杂', value: '关系复杂' }
];

// 控制选择器显示
const showWorkStatusPicker = ref(false);
const showLoveStatusPicker = ref(false);

useFetchOpenId();


const handleWorkStatusConfirm = (event) => {
  const selectedIndex = event;
  workStatus.value = workStatusOptions[selectedIndex].value;
};

const handleLoveStatusConfirm = (event) => {
  const selectedIndex = event;
  loveStatus.value = loveStatusOptions[selectedIndex].value;
};
const handleSelectedInterests = (newSelected) => {
  selectedInterest.value = newSelected;
  if (newSelected) {
    focus.value = `我想了解下${newSelected}发展`;
    return;
  }
  focus.value = '';
};

const onGenReport = async () => {
  try {
    const payload = {
      birth_date: birthDate.value,
      birth_hour: birthTime.value,
      gender: gender.value,
      focus: focus.value,
      birth_city: birthPlace.value,
      user_name: userName.value,
      work_status: workStatus.value,
      relationship_status: loveStatus.value,
    };
    const response = await fetchGenReport(payload);
    const reportId = response.data.id;
    onJump(reportId);
  } catch (error) {
    console.error('Error generating report:', error);
  }
};

const onJump = (id) => {
  uni.navigateTo({
    url: `/pages/new-chat/index?reportId=${id}`,
  });
};
</script>

<style lang="scss" scoped>
$tw-shadow-color: rgba(226, 232, 240, 0.5 * 0.8);

.root {
  background: radial-gradient(circle at 0% 0%, rgba(212, 226, 255, 0.5) 0, transparent 50%),
    radial-gradient(circle at 100% 0%, rgba(255, 226, 241, 0.5) 0, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(226, 255, 241, 0.5) 0, transparent 50%),
    radial-gradient(circle at 0% 100%, rgba(241, 226, 255, 0.5) 0, transparent 50%),
    #ffffff;
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
  margin-bottom: $spacing-lg;
}

.main-title {
  color: #1F2937;
  font-size: $text-2lg; // 文本尺寸变量
  font-weight: 700;
}

.sub-title {
  color: #6B7280;
  font-size: 12px;
  margin: 0;
}

.form-card {
  margin-bottom: $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  &:active, &:focus-within, &:focus {
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