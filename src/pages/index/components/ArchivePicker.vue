<template>
  <div v-if="show" class="archive-overlay" @click="close">
    <div class="archive-sheet" @click.stop>
      <div class="archive-header">
        <span class="archive-title">选择历史档案</span>
        <button class="archive-close" @click="close">✕</button>
      </div>
      <div class="archive-list">
        <template v-if="isLoading">
          <div class="archive-loading">
            <LoadingIndicator />
            <text class="loading-text">加载中...</text>
          </div>
        </template>
        <template v-else-if="archives.length">
          <div
            class="archive-item"
            v-for="(item, idx) in archives"
            :key="idx"
            @click="quickLoad(item)"
          >
            <div class="archive-item-left">
              <div class="archive-item-title">{{ item.name }}</div>
              <div class="archive-item-sub">
                <span>{{ item.gender }}</span>
                <span>·</span>
                <span>{{ item.birth_date }}</span>
              </div>
              <div class="archive-item-info">
                <span>时辰：{{ item.birth_time }}</span>
                <span> · 出生地：{{ item.birth_location }}</span>
              </div>
            </div>
            <div class="archive-actions">
              <BaziButton 
                type="secondary" 
                size="small" 
                :custom-style="{ width: '64px', height: '32px', minHeight: '32px', padding: '0', fontSize: '13px', borderRadius: '12px', border: '1px solid #E5E7EB' }"
                @click.stop="quickLoad(item)"
              >选择</BaziButton>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="archive-empty">暂无数据</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import BaziButton from '@/components/BaziButton.vue';

interface ProfileItem {
  name: string;
  gender: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
}

const props = defineProps<{
  show: boolean;
  archives: ProfileItem[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  close: [];
  quickLoad: [item: ProfileItem];
}>();

const close = () => {
  emit('close');
};

const quickLoad = (item: ProfileItem) => {
  emit('quickLoad', item);
};

watch(() => props.show, (show) => {
  console.log('show', show);
})
</script>

<style lang="scss" scoped>
.archive-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
  z-index: 9999;
}

.archive-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 60vh;
  background: #fff;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  border-top: 2px solid #e0e7ff;
  display: flex;
  flex-direction: column;
  animation: slideUp 250ms ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.archive-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eef2ff;
}

.archive-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.archive-close {
  background: #fff;
  color: #9ca3af;
  border: none;
  font-size: 18px;
}

button {
  margin: 0;
}

.archive-close::after {
  border: none;
}

.archive-list {
  padding: 12px 16px;
  overflow-y: auto;
  flex: 1;
}

.archive-loading {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  padding: 40rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #6366f1;
  font-weight: 500;
}

.archive-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 14px;
}

.archive-item {
  padding: 12px;
  border: 1px solid #eef2ff;
  border-radius: 16px;
  margin-bottom: 12px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.archive-item-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.archive-item-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}

.archive-item-sub {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
  display: flex;
  gap: 6px;
}

.archive-actions {
  display: flex;
  align-items: center;
}

.archive-item-info {
  margin-top: 6px;
  font-size: 12px;
  color: #6366f1;
}

.option-arrow {
  color: #d1d5db;
  font-size: 36rpx;
}
</style>