<template>
  <div class="bazi-pillar">
    <div class="pillar-value">
      {{ value }}
    </div>
    <div class="pillar-label">{{ label }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }
})
</script>

<style lang="scss" scoped>
.bazi-pillar {
  text-align: center;
}

.pillar-value {
  background: linear-gradient(
    135deg,
    $color-amber-400,
    $color-orange-500
  );
  color: $color-white;
  border-radius: $border-radius-base;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: $text-lg;
}

.pillar-label {
  color: $color-slate-500;
  font-size: $text-sm;
}
</style>
