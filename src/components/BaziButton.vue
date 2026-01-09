<template>
  <button
    :style="customStyle"
    :class="['custom-button', type, { 'show-shadow': showShadow, 'disabled': disabled }]" 
    @click="handleClick"
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'primary' | 'secondary';
  disabled?: boolean;
  showShadow?: boolean;
  customStyle: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  disabled: false,
  showShadow: false,
  customStyle: {}
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
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md 0;
  box-sizing: border-box;
  border-radius: $border-radius-base;
  font-size: 14px;
  transition: all 0.2s ease;
  // box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: none;
  outline: none;
  cursor: pointer;

  &:hover {
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }

  &.primary {
    background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
    color: $color-white;
  }

  &.secondary {
    background: $color-white;
    color: $color-orange-500;
    border: 1px solid $color-orange-500;
  }
  
  &.show-shadow {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  }

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
}
</style>