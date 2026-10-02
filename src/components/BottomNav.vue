<script setup>
import { computed } from 'vue'
const props = defineProps({ user: Object, currentScreen: String })
const emit = defineEmits(['navigate'])

const tabs = computed(() => {

  if (props.user.roles.includes('ADMINISTRADOR')) {
    return [
      ['admin-home', '⌂', 'Inicio'],
      ['users-list', '👥', 'Gestión'],
      ['sessions-list', '📅', 'Jornadas'],
      ['metrics', '📊', 'Métricas'],
      ['ai-query', '🤖', 'Consulta']
    ]
  }

  if (props.user.roles.includes('CAJERO')) {
    return [
      ['cashier-home', '⌂', 'Inicio'],
      ['register-sale', '🛒', 'Nueva venta'],
      ['sales-list', '📋', 'Ventas'],
      ['ai-query', '🤖', 'Consulta']
    ]
  }

  return [
    ['entrepreneur-home', '⌂', 'Inicio'],
    ['businesses-list', '🏪', 'Emprend.'],
    ['products-list', '📦', 'Inventario'],
    ['sales-list', '📋', 'Ventas'],
    ['ai-query', '🤖', 'Consulta']
  ]
})
</script>
<template>
  <div class="sticky bottom-0 bg-white/95 backdrop-blur border-t border-[#D8CFC4]/60 px-1 safe-bottom">
    <div class="flex items-center justify-around py-1">
      <button v-for="tab in tabs" :key="tab[0]" @click="emit('navigate', tab[0])" class="flex flex-col items-center gap-0.5 py-2 px-2 rounded-xl" :class="currentScreen===tab[0] ? 'text-[#2A6049]' : 'text-[#7A6558]'">
        <span class="text-lg">{{ tab[1] }}</span>
        <span class="text-[9px] font-semibold">{{ tab[2] }}</span>
        <span v-if="currentScreen===tab[0]" class="w-1 h-1 rounded-full bg-[#2A6049]"></span>
      </button>
    </div>
  </div>
</template>
