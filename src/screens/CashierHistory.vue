<script setup>
import AppHeader from '../components/AppHeader.vue'
import MySalesHistory from './MySalesHistory.vue'
const emit = defineEmits(['navigate'])
</script>
<template>
  <div class="h-full flex flex-col">
    <AppHeader title="Mis ventas de caja" show-back @back="emit('navigate', 'home')" />
    <div class="flex-1 min-h-0"><MySalesHistory cajero /></div>
  </div>
</template>
