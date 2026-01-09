<template>
  <div class="custom-tabbar">
    <div
      v-for="(item, index) in list"
      :key="index"
      class="tabbar-item"
      :class="{ active: current === index }"
      @click="handleTabChange(index)"
    >
      <image
        :src="current === index ? item.selectedIconPath : item.iconPath"
        class="tabbar-icon"
        :alt="item.text"
      />
      <span class="tabbar-text">{{ item.text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 使用import ?url的方式导入SVG文件
import homeSvg from '@/static/icon/home.svg?url';
import homeActiveSvg from '@/static/icon/home-active.svg?url';
import reportSvg from '@/static/icon/report.svg?url';
import reportActiveSvg from '@/static/icon/report-active.svg?url';
import userSvg from '@/static/icon/user.svg?url';
import userActiveSvg from '@/static/icon/user-active.svg?url';

const props = defineProps({
  current: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['update:current']);

const list = ref([
  {
    iconPath: homeSvg,
    selectedIconPath: homeActiveSvg,
    text: '首页',
    pagePath: '/pages/index/index',
  },
  {
    iconPath: reportSvg,
    selectedIconPath: reportActiveSvg,
    text: '报告',
    pagePath: '/pages/report-list/index',
  },
  {
    iconPath: userSvg,
    selectedIconPath: userActiveSvg,
    text: '我的',
    pagePath: '/pages/profile/index',
  },
]);

const handleTabChange = (index) => {
  emit('update:current', index);
  uni.redirectTo({
    url: list.value[index].pagePath,
  });
};
</script>

<style lang="scss" scoped>
.custom-tabbar {
  display: flex;
  height: 70px;
  background-color: $color-white;
  border-top: 1px solid $color-slate-200;
  justify-content: space-around;
  align-items: center;
  width: 100vw;
  position: sticky;
  bottom: 0;
}

.tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  transition: all 0.2s ease;

  &.active {
    .tabbar-text {
      color: $color-amber-600;
    }
  }
}

.tabbar-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}

.tabbar-text {
  font-size: 12px;
  color: $color-slate-400;
  transition: color 0.2s ease;
}
</style>