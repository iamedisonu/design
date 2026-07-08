<template>
  <div class="skeleton-card" :class="variant">
    <div class="skeleton-line short"></div>
    <div class="skeleton-line medium"></div>
    <div v-if="variant !== 'compact'" class="skeleton-block"></div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'default' | 'compact'
  }>(),
  {
    variant: 'default',
  },
)
</script>
