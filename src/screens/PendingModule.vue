<script setup>
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
defineProps({ title: String, roleLabel: String, description: String })
const emit = defineEmits(['navigate'])
</script>
<template>
  <div class="h-full flex flex-col">
    <AppHeader :title="title" show-back @back="emit('navigate', 'home')" />
    <div class="flex-1 overflow-y-auto p-4">
      <div class="bg-white border border-[#D8CFC4] rounded-2xl p-5">
        <p class="text-xs text-[#2A6049] font-semibold mb-2">{{ roleLabel }}</p>
        <h2 class="font-semibold">Pendiente de conexión</h2>
        <p class="text-sm text-[#7A6558] mt-3">{{ description }}</p>
        <p class="text-sm text-[#7A6558] mt-3">Esta función todavía no está disponible con datos reales.</p>
        <BaseButton class="mt-5" full @click="emit('navigate', 'home')">Volver al inicio</BaseButton>
      </div>
    </div>
  </div>
</template>
