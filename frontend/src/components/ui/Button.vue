<template>
  <button
    :type="type"
    :disabled="loading || disabled"
    :class="[
      'inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      block ? 'w-full' : ''
    ]"
    @click="$emit('click')"
  >
    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">


interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  block: false,
  disabled: false,
  loading: false
})

defineEmits(['click'])

const variantClasses = {
  primary: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/20',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-slate-500/10',
  outline: 'bg-transparent text-indigo-600 border border-indigo-200 hover:bg-indigo-50',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus:ring-2 focus:ring-rose-500/20'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-button',
  md: 'px-4 py-2 text-sm rounded-button',
  lg: 'px-6 py-2.5 text-sm rounded-button'
}
</script>
