<template>
  <button
    :style="customStyle"
    :class="['custom-button', type, `size-${size}`, { 'show-shadow': showShadow, 'disabled': disabled }]" 
    @click="handleClick"
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'primary' | 'secondary' | 'default';
  disabled?: boolean;
  showShadow?: boolean;
  customStyle: Record<string, any>;
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  disabled: false,
  showShadow: false,
  customStyle: {},
  size: 'large'
});

const emit = defineEmits<{
  click: []
}>();

const handleClick = () => {
  if (!props.disabled) {
    emit('click');
  }
};
</script>

<style lang="scss" scoped>
.custom-button {
  width: 100%;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md;
  box-sizing: border-box;
  border-radius: $border-radius-base;
  font-size: 14px;
  transition: all 0.2s ease;
  // box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: none;
  outline: none;
  cursor: pointer;

  &.size-small {
    height: 40px;
    font-size: 12px;
  }

  &.size-medium {
    height: 48px;
    font-size: 14px;
  }

  &.size-large {
    height: 56px;
    font-size: 14px;
  }

  &:hover {
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }

  &.primary {
    background: #4f46e5;
    color: $color-white;
  }

  &.secondary {
    background: #111827;
    color: #fff;
    border: 1px solid #111827;
  }

  &.default {
    background: #fff;
    color: #4f46e5;
    border: none;

    // &.show-shadow {
    //   box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    // }
  }
  
  &.show-shadow {
    box-shadow: 0 20px 25px -5px #e0e7ff, 0 8px 10px -6px #e0e7ff;
  }

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
}
</style>