<script setup>
import { computed, onMounted, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import ReporteJornada from '../components/ReporteJornada.vue'
import JornadaEstadoButton from '../components/JornadaEstadoButton.vue'
import MySalesHistory from './MySalesHistory.vue'
import { listarJornadas, obtenerReporteJornada } from '../services/jornadaService.js'
import { listarVentasFeriaAdmin } from '../services/ventaService.js'
const emit = defineEmits(['navigate'])
const jornadas = ref([]), ventas = ref([]), idJornada = ref(''), idPersona = ref('')
const loading = ref(true), cargando = ref(false), error = ref(''), errorVentas = ref('')
let solicitud = 0
const reporte = ref(null)
const usuarios = computed(() => {
  const grupos = new Map()
  for (const v of ventas.value) {
    const persona = v.cajero || v.responsable
    if (!grupos.has(persona.id)) grupos.set(persona.id, { ...persona, cantidad: 0, centavos: 0 })
    const g = grupos.get(persona.id)
    g.cantidad++
    g.centavos += Math.round(Number(v.total) * 100)
  }
  return [...grupos.values()].sort((a,b) => a.nombre.localeCompare(b.nombre, 'es'))
})
const total = computed(() => ventas.value.reduce((s,v) => s + Math.round(Number(v.total) * 100), 0) / 100)
const dinero = n => Number(n).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
async function cargar() {
  loading.value = true
  error.value = ''
  try {
    const r = await listarJornadas()
    const lista = Array.isArray(r) ? r : r.jornadas
    if (!Array.isArray(lista)) throw new Error('No se pudieron obtener las ferias.')
    jornadas.value = lista
  } catch (err) {
    error.value = err.message || 'No se pudieron cargar las ferias.'
  } finally { loading.value = false }
}
async function cargarVentas() {
  const actual = ++solicitud
  ventas.value = []
  reporte.value = null
  idPersona.value = ''
  errorVentas.value = ''
  cargando.value = false
  if (!idJornada.value) return
  cargando.value = true
  try {
    const [r, informe] = await Promise.all([listarVentasFeriaAdmin(idJornada.value), obtenerReporteJornada(idJornada.value)])
    if (actual !== solicitud) return
    if (!Array.isArray(r.ventas)) throw new Error('No se pudieron obtener las ventas.')
    ventas.value = r.ventas
    reporte.value = informe
    const j = jornadas.value.find(j => Number(j.id) === Number(idJornada.value))
    if (j) j.estado = informe.jornada.estado
  } catch (err) {
    if (actual === solicitud) errorVentas.value = err.message || 'No se pudieron cargar las ventas.'
  } finally { if (actual === solicitud) cargando.value = false }
}
onMounted(cargar)
</script>
<template>
  <div class="h-full flex flex-col">
    <AppHeader title="Resultados de feria" show-back @back="emit('navigate', 'home')" />
    <div class="flex-1 overflow-y-auto p-4">
      <p v-if="loading" role="status" class="text-sm py-6">Cargando ferias...</p>
      <div v-else-if="error" role="alert" class="text-sm text-red-700"><p>{{ error }}</p><BaseButton @click="cargar">Reintentar</BaseButton></div>
      <template v-else>
        <label class="block text-sm font-semibold mb-4">Feria
          <select v-model="idJornada" @change="cargarVentas" class="results-input">
            <option value="">Seleccione una feria</option>
            <option v-for="j in jornadas" :key="j.id" :value="j.id">{{ j.nombre }} · {{ j.estado ? 'Abierta' : 'Finalizada' }}</option>
          </select>
        </label>
        <p v-if="!jornadas.length" class="text-sm">No hay ferias registradas.</p>
        <p v-if="cargando" role="status" class="text-sm py-6">Cargando resultados...</p>
        <div v-else-if="errorVentas" role="alert" class="text-sm text-red-700"><p>{{ errorVentas }}</p><BaseButton @click="cargarVentas">Reintentar</BaseButton></div>
        <template v-else-if="idJornada">
          <section class="bg-[#2A6049] text-white rounded-2xl p-4 mb-4">
            <h2 class="font-semibold">Total de la feria · Todos los cajeros</h2>
            <p class="mt-2">{{ ventas.length }} ventas · Bs {{ dinero(total) }}</p>
            <p class="text-xs mt-2">Corresponde a toda la feria. El usuario y las fechas filtran el historial inferior.</p>
          </section>
          <ReporteJornada v-if="reporte" :reporte="reporte" />
          <div v-if="reporte" class="mb-4"><JornadaEstadoButton :jornada="reporte.jornada" @updated="cargarVentas" /></div>
          <label class="block text-sm font-semibold mb-3">Filtrar por usuario
            <select v-model="idPersona" class="results-input">
              <option value="">Todos los cajeros</option>
              <option v-for="u in usuarios" :key="u.id" :value="u.id">{{ u.usuario ? '@' + u.usuario + ' · ' : '' }}{{ u.nombre }}</option>
            </select>
          </label>
          <details v-if="usuarios.length" class="bg-white rounded-xl border p-3 mb-4">
            <summary class="font-semibold text-sm cursor-pointer">Resumen por cajero</summary>
            <ul class="divide-y mt-2">
              <li v-for="u in usuarios" :key="u.id" class="py-3 text-sm">
                <p class="font-semibold break-words">{{ u.usuario ? '@' + u.usuario + ' · ' : '' }}{{ u.nombre }}</p>
                <p>{{ u.cantidad }} ventas · Bs {{ dinero(u.centavos / 100) }}</p>
              </li>
            </ul>
          </details>
          <MySalesHistory :key="idJornada + ':' + idPersona" administrador :id-jornada="idJornada" :id-persona="idPersona || null" embedded />
        </template>
      </template>
    </div>
  </div>
</template>
<style scoped>
.results-input { display:block; width:100%; min-height:48px; margin-top:.3rem; padding:.5rem .7rem; border:1px solid #d8cfc4; border-radius:12px; background:#fff; color:#254c3b; }
</style>
