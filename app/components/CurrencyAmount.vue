<template>
  <span :class="classes">
    <span v-if="showSign">{{ type === 'income' ? '+' : '-' }}</span>{{ formatted }}
  </span>
</template>

<script setup lang="ts">
import { formatCurrency, type CurrencyCode } from '~/utils/currency'

const props = withDefaults(
  defineProps<{
    amount: number | string
    currency: CurrencyCode
    type?: 'income' | 'expense' | 'neutral'
    showSign?: boolean
    colorize?: boolean
  }>(),
  {
    type: 'neutral',
    showSign: false,
    colorize: false
  }
)

const formatted = computed(() => {
  return formatCurrency(props.amount, props.currency)
})

const classes = computed(() => {
  if (!props.colorize) return ''
  if (props.type === 'income') return 'text-emerald-600 font-semibold'
  if (props.type === 'expense') return 'text-rose-600 font-semibold'
  return 'text-slate-900 font-semibold'
})
</script>
