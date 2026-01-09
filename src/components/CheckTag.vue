<template>
  <div
    class="check-tag"
    :class="{ 'check-tag--selected': selected }"
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
    }
  },
  emits: ['update:selected']
})
</script>

<style lang="scss" scoped>
.check-tag {
  padding: 12px 16px;
  font-size: 16px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid $color-slate-200;
  border-radius: $border-radius-base;
  background-color: $color-slate-50;
  color: $color-slate-600;
  transition: all 0.2s ease;
  text-align: center;
  outline: none;

  &--selected {
    color: $color-orange-500;
    background-color: $color-amber-50;
    border-color: $color-amber-500;
  }
}
</style>
