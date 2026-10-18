<script setup>
import { onMounted, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import MySalesHistory from './MySalesHistory.vue'
import MyBusinessMetrics from './MyBusinessMetrics.vue'
import { listarMisEmpresas } from '../services/empresaService.js'

const emit = defineEmits(['navigate'])
const seccion = ref('metricas')
const empresas = ref([])
const idEmpresa = ref('')
const loading = ref(true)
const error = ref('')
async function cargar() {
  loading.value = true
  error.value = ''
  empresas.value = []
  idEmpresa.value = ''
  try {
    const respuesta = await listarMisEmpresas()
    if (!Array.isArray(respuesta.empresas)) throw new Error('No se pudieron obtener sus empresas.')
    empresas.value = respuesta.empresas
    idEmpresa.value = empresas.value[0]?.id || ''
  } catch (err) {
    error.value = err.message || 'No se pudieron cargar sus empresas.'
  } finally {
    loading.value = false
  }
}
onMounted(cargar)
</script>

<template>
  <div class="h-full flex flex-col">
    <AppHeader title="Mis ventas" show-back @back="emit('navigate', 'home')" />
    <p v-if="loading" role="status" class="text-sm text-center text-[#7A6558] p-8">Cargando empresas...</p>
    <div v-else-if="error" role="alert" class="m-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm">
      <p>{{ error }}</p><BaseButton class="mt-3" @click="cargar">Reintentar</BaseButton>
    </div>
    <p v-else-if="!empresas.length" class="m-4 p-4 bg-white rounded-xl text-sm text-[#7A6558]">Todavía no tienes empresas vinculadas para consultar sus ventas.</p>
    <template v-else>
      <label class="block px-4 pt-3 pb-1 text-sm font-semibold shrink-0">Empresa
        <select v-model="idEmpresa" class="w-full min-h-12 border border-[#D8CFC4] rounded-xl px-3 mt-1 bg-white">
          <option v-for="empresa in empresas" :key="empresa.id" :value="empresa.id">{{ empresa.nombre }}{{ empresa.estado ? '' : ' (inactiva)' }}</option>
        </select>
      </label>
      <div class="grid grid-cols-2 gap-2 px-4 py-2">
        <BaseButton :variant="seccion === 'metricas' ? 'primary' : 'outline'" :aria-pressed="seccion === 'metricas'" @click="seccion = 'metricas'">Métricas</BaseButton>
        <BaseButton :variant="seccion === 'historial' ? 'primary' : 'outline'" :aria-pressed="seccion === 'historial'" @click="seccion = 'historial'">Historial</BaseButton>
      </div>
      <div class="flex-1 min-h-0 overflow-hidden">
        <MySalesHistory v-if="seccion === 'historial'" :key="idEmpresa" :id-empresa="idEmpresa" />
        <MyBusinessMetrics v-else :key="idEmpresa" :id-empresa="idEmpresa" embedded @navigate="(...args) => emit('navigate', ...args)" />
      </div>
    </template>
  </div>
</template>
