<template>
  <div
    class="check-tag"
    :class="{ 'check-tag--selected': selected, 'check-tag--large': size === 'large' }"
    @click="$emit('update:selected', !selected)"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CheckTag',
  props: {
    selected: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'normal'
    }
  },
  emits: ['update:selected']
})
</script>

<style lang="scss" scoped>
.check-tag {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  width: 100%;
  box-sizing: border-box;
  border: 1.5px solid rgba(99, 102, 241, 0.2);
  border-radius: $border-radius-base;
  background-color: #fff;
  color: #4b5563;
  transition: all 0.2s ease;
  text-align: center;
  outline: none;
  &--large {
    padding: 12px 16px;
    font-size: 14px;
    height: 48px;
  }

  &--selected {
    font-weight: 700;
    color: #fff;
    background-color: #4f46e5;
    border-color: #4f46e5;
    box-shadow:  0 4px 6px -1px #c7d2fe, 0 2px 4px -2px #c7d2fe, 0 4px 6px -1px #c7d2fe, 0 2px 4px -2px #c7d2fe;
  }
}
</style>
