<template>
  <div class="form-input" @click="$emit('click')">
    <input
      :type="type"
      :value="value"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input-field"
      placeholder-style="color: #90a1b9; font-weight: 400;"
      @input="$emit('update:value', $event.target.value)"
    >
      <slot name="suffix-icon" class="suffix-icon"></slot>
    </input>
  </div>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'text',
  },
  value: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.form-input {
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
  .input-field {
    flex: 1;
    width: 0;
  }
  .suffix-icon {
    margin-left: $spacing-sm;
  }
  &:active, &:focus-within, &:focus {
    // border-color: $color-amber-400;
    // border-width: 2px;
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }
}
</style>
