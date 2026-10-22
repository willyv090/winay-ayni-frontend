<script setup>
import { computed, onMounted, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import MySalesHistory from './MySalesHistory.vue'
import { listarVentasCaja } from '../services/ventaService.js'
const emit = defineEmits(['navigate'])
const ventas = ref([]), feria = ref(null), loading = ref(true), error = ref(''), busqueda = ref('')
const dinero = valor => Number(valor).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const ferias = computed(() => {
  const grupos = new Map()
  for (const venta of ventas.value) {
    if (!venta.jornada) continue
    const id = venta.jornada.id
    if (!grupos.has(id)) grupos.set(id, { ...venta.jornada, cantidad: 0, centavos: 0, ultima: venta.fecha })
    const grupo = grupos.get(id)
    grupo.cantidad++
    grupo.centavos += Math.round(Number(venta.total) * 100)
    if (venta.fecha > grupo.ultima) grupo.ultima = venta.fecha
  }
  return [...grupos.values()].filter(g => g.nombre.toLocaleLowerCase('es').includes(busqueda.value.trim().toLocaleLowerCase('es')))
    .sort((a,b) => b.ultima.localeCompare(a.ultima) || Number(b.id) - Number(a.id))
})
async function cargar() {
  loading.value = true
  error.value = ''
  ventas.value = []
  try {
    const respuesta = await listarVentasCaja()
    if (!Array.isArray(respuesta.ventas)) throw new Error('No se pudo obtener el historial de ferias.')
    ventas.value = respuesta.ventas
  } catch (err) {
    error.value = err.message || 'No se pudieron cargar las ferias.'
  } finally {
    loading.value = false
  }
}
function volver() {
  if (feria.value) { feria.value = null; cargar() }
  else emit('navigate', 'home')
}
onMounted(cargar)
</script>
<template>
  <div class="h-full flex flex-col">
    <AppHeader :title="feria ? 'Mis ventas de la feria' : 'Mis ventas por feria'" show-back @back="volver" />
    <template v-if="feria">
      <div class="px-4 pt-3">
        <p class="font-semibold text-[#2A6049] break-words">{{ feria.nombre }}</p>
        <BaseButton full variant="outline" class="mt-2" @click="volver">Cambiar de feria</BaseButton>
      </div>
      <div class="flex-1 min-h-0"><MySalesHistory :key="feria.id" cajero :id-jornada="feria.id" /></div>
    </template>
    <div v-else class="flex-1 overflow-y-auto p-4">
      <p class="text-sm text-[#7A6558] mb-4">Selecciona una feria para consultar las ventas que registraste en ella. También se incluyen ferias finalizadas con ventas tuyas.</p>
      <p v-if="loading" role="status" class="text-sm py-8 text-center">Cargando ferias...</p>
      <div v-else-if="error" role="alert" class="text-sm text-red-700 bg-red-50 rounded-xl p-4">
        <p>{{ error }}</p><BaseButton class="mt-3" @click="cargar">Reintentar</BaseButton>
      </div>
      <template v-else>
        <label class="block text-sm mb-4">Buscar feria
          <input v-model="busqueda" type="search" class="w-full min-h-12 border border-[#D8CFC4] rounded-xl bg-white px-3 mt-1" placeholder="Nombre de la feria" />
        </label>
        <p v-if="!ventas.length" class="text-sm py-6">Todavía no registraste ventas como cajero.</p>
        <p v-else-if="!ferias.length" class="text-sm py-6">No hay ferias que coincidan con la búsqueda.</p>
        <article v-for="grupo in ferias" :key="grupo.id" class="bg-white border border-[#D8CFC4] rounded-2xl p-4 mb-3">
          <h2 class="font-semibold break-words">{{ grupo.nombre }}</h2>
          <p class="text-sm mt-2">{{ grupo.cantidad }} ventas registradas por ti</p>
          <p class="font-semibold text-[#2A6049] mt-2">Mi total vendido: Bs {{ dinero(grupo.centavos / 100) }}</p>
          <BaseButton full variant="outline" class="mt-3" @click="feria = grupo">Ver mis ventas</BaseButton>
        </article>
      </template>
    </div>
  </div>
</template>
