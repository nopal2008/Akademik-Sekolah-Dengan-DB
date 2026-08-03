<template>
  <div :class="['premium-card p-6 md:p-8', classOverride]">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  classOverride?: string
}

withDefaults(defineProps<Props>(), {
  classOverride: ''
})
</script>

