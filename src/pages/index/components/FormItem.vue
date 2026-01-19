<template>
  <div class="form-item">
    <label class="label">
      <span class="prefix-icon">
        <slot name="icon"></slot>
      </span>
      {{ label }}
    </label>
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  }
});

const iconClass = computed(() => {
  switch(props.label) {
    case '出生日期':
      return 'icon-calendar';
    case '出生时辰':
      return 'icon-time';
    case '性别':
      return 'icon-gender';
    case '想了解的方面':
      return 'icon-star';
    default:
      return '';
  }
});
</script>

<style lang="scss" scoped>
.label {
  display: flex;
  align-items: center;
  color: #9ca3af;
  font-size: 12px;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.prefix-icon {
  margin-right: $spacing-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  image {
    width: 20px;
    height: 20px;
  }
}
</style>