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
        <h1 class="main-title">八字 AI 诊断</h1>
        <p class="sub-title">AI 让命理变得清晰易懂</p>
      </div>

      <!-- 表单卡片 -->
      <div class="form-card">
        <!-- 出生日期输入 -->
        <FormItem label="姓名">
          <!-- <template #icon>
            <image
              src="@/static/form/calendar.svg"
              alt="calendar"
              style="width: 20px; height: 20px"
            />
          </template> -->
          <FormInput :value="userName" placeholder="输入姓名" @update:value="(value) => userName = value" />
        </FormItem>
        <!-- 出生日期输入 -->
        <FormItem label="出生日期">
          <!-- <template #icon>
            <image
              src="@/static/form/calendar.svg"
              alt="calendar"
              style="width: 20px; height: 20px"
            />
          </template> -->
          <DatePicker v-model="birthDate" />
        </FormItem>

        <!-- 出生时辰选择 -->
        <FormItem label="出生时辰">
          <!-- <template #icon>
            <image
              src="@/static/form/clock.svg"
              alt="clock"
              style="width: 20px; height: 20px"
            />
          </template> -->
          <TimeSelect v-model="birthTime" />
        </FormItem>

        <FormItem label="出生地">
          <!-- <template #icon>
            <u-icon name="map" color="#f59e0b" size="22px"></u-icon>
          </template> -->
          <RegionPicker @update:birthPlace="(value) => birthPlace = value" />
        </FormItem>

        <!-- 性别选择 -->
        <FormItem label="性别">
          <!-- <template #icon>
            <image
              src="@/static/form/user.svg"
              alt="user"
              style="width: 20px; height: 20px"
            />
          </template> -->
          <GenderSelector v-model="gender" />
        </FormItem>

        <!-- 想了解的方面 -->
        <FormItem label="想了解的方面（可多选）">
          <!-- <template #icon>
            <image
              src="@/static/logo.svg"
              alt="logo"
              style="width: 20px; height: 20px"
            />
          </template> -->
          <InterestSelector
            :options="interestOptions"
            v-model="selectedInterests"
          />
        </FormItem>
      </div>

      <!-- 诊断按钮 -->
      <BaziButton type="secondary" show-shadow @click="onGenReport">开始 AI 诊断</BaziButton>

      <!-- 底部说明文字 -->
      <p class="footer-text">AI 助你读懂命盘，理性决策</p>
    </div>

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
const selectedInterests = ref(['事业', '财运']);
const birthDate = ref('1998-08-23');
const birthTime = ref('酉时');
const birthPlace = ref('广东省广州市荔湾区');
const userName = ref('陆敏怡');

useFetchOpenId();

const onGenReport = async () => {
  try {
    const payload = {
      birth_date: birthDate.value,
      birth_hour: birthTime.value,
      gender: gender.value,
      focus_dimensions: selectedInterests.value,
      birth_city: birthPlace.value,
      user_name: userName.value,
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
    url: `/pages/chat/index?reportId=${id}`,
  });
};
</script>

<style lang="scss" scoped>
$tw-shadow-color: rgba(226, 232, 240, 0.5 * 0.8);

.root {
  background: linear-gradient(
    to bottom,
    $color-amber-400,
    $color-orange-400,
    $color-orange-500
  );
  min-height: 100vh;
}

.container {
  padding: $spacing-md;
}

.header {
  text-align: center;
  margin-bottom: $spacing-lg;
}

.main-title {
  color: $color-white; // 白色变量
  font-size: $text-2lg; // 文本尺寸变量
  font-weight: 700;
  margin-bottom: $spacing-md;
}

.sub-title {
  color: $color-white;
  font-size: $text-base;
  margin: 0;
  opacity: 0.9;
}

.form-card {
  background-color: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px $tw-shadow-color;
  margin-bottom: $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// .button {
//   background: $color-white;
//   height: 56px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   box-shadow: 0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a;
//   color: $color-orange-500;
//   width: 100%;
//   padding: $spacing-md;
//   font-size: $text-base;
//   border-radius: 12px;
//   transition: all 0.2s ease;
//   margin-bottom: $spacing-lg;
//   &::after {
//     border: none !important;
//   }
//   &:active {
//     transform: scale(0.98);
//   }
// }

.footer-text {
  color: #fff;
  font-size: 12px;
  text-align: center;
  margin: 24px;
  opacity: 0.8;
}
</style>
