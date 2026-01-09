<template>
  <div
    class="loading-step"
    :style="stepStyle"
  >
    <div class="step-dot"></div>
    <span class="step-text">{{ text }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  delay: {
    type: Number,
    default: 0
  }
})

const stepStyle = computed(() => ({
  animationDelay: `${props.delay}ms`,
  animationFillMode: 'forwards'
}))
</script>

<style lang="scss" scoped>
.loading-step {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: $color-white;
  border-radius: $border-radius-base;
  padding: 12px 16px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  opacity: 0;
  animation: fadeIn 0.6s ease-out;
  border-color: $color-slate-200;
}

.step-dot {
  width: 8px;
  height: 8px;
  background-color: $color-amber-500;
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.step-text {
  color: $color-slate-600;
  font-size: $text-sm;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
