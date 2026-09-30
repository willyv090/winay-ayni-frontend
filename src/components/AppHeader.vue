<script setup>
defineProps({ title: { type: String, required: true }, showBack: { type: Boolean, default: false } })
defineEmits(['back'])
</script>
<template>
  <div class="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#D8CFC4]/60 px-4 py-3 flex items-center gap-3">
    <button v-if="showBack" @click="$emit('back')" class="w-9 h-9 rounded-xl bg-[#F5F0E8] flex items-center justify-center text-[#2A6049] text-lg active:scale-95">‹</button>
    <h1 class="font-display font-bold text-lg text-[#1C1108] flex-1 truncate">{{ title }}</h1>
    <slot name="right" />
  </div>
</template>
