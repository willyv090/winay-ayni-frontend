<script setup>
import { computed, onMounted, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { obtenerMetricasAdmin } from '../services/ventaService.js'
const emit = defineEmits(['navigate'])
const datos = ref(null), ferias = ref([]), idJornada = ref(''), desde = ref(''), hasta = ref('')
const loading = ref(true), error = ref(''), errorFechas = ref('')
let solicitud = 0
const dinero = n => Number(n).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const comparacion = computed(() => [...(datos.value?.ferias || [])].sort((a,b) => b.total - a.total || a.id - b.id))
const maxFeria = computed(() => Math.max(1, ...comparacion.value.map(j => j.total)))
const maxDia = computed(() => Math.max(1, ...(datos.value?.dias || []).map(d => d.total)))
const titulo = computed(() => datos.value?.id_jornada
  ? datos.value.ferias.find(j => j.id === datos.value.id_jornada)?.nombre : 'Todas las ferias')
const periodo = computed(() => {
  const p = datos.value?.periodo
  return p?.desde || p?.hasta ? (p.desde || 'Inicio') + ' — ' + (p.hasta || 'Sin límite final') : 'Todo el historial'
})
async function cargar() {
  errorFechas.value = ''
  if (desde.value && hasta.value && desde.value > hasta.value) {
    errorFechas.value = 'La fecha inicial no puede ser posterior a la final.'
    return
  }
  const actual = ++solicitud
  loading.value = true
  error.value = ''
  datos.value = null
  try {
    const r = await obtenerMetricasAdmin(idJornada.value, desde.value, hasta.value)
    if (actual !== solicitud) return
    if (!r.resumen || !Array.isArray(r.ferias) || !Array.isArray(r.productos) || !Array.isArray(r.empresas) || !Array.isArray(r.dias)) {
      throw new Error('No se pudieron obtener las métricas.')
    }
    datos.value = r
    ferias.value = r.ferias
  } catch (err) {
    if (actual === solicitud) error.value = err.message || 'No se pudieron cargar las métricas.'
  } finally {
    if (actual === solicitud) loading.value = false
  }
}
function limpiar() {
  idJornada.value = ''
  desde.value = ''
  hasta.value = ''
  cargar()
}
onMounted(cargar)
</script>
<template>
  <div class="h-full flex flex-col">
    <AppHeader title="Métricas de ferias" show-back @back="emit('navigate', 'home')" />
    <div class="flex-1 overflow-y-auto p-4">
      <form @submit.prevent="cargar" class="panel mb-4">
        <fieldset :disabled="loading" class="min-w-0 space-y-3">
          <label class="block text-sm">Feria para indicadores y rankings
            <select v-model="idJornada" class="metric-input">
              <option value="">Todas las ferias</option>
              <option v-for="j in ferias" :key="j.id" :value="j.id">{{ j.nombre }}{{ j.estado ? '' : ' (finalizada)' }}</option>
            </select>
          </label>
          <div class="grid grid-cols-2 gap-2">
            <label class="text-sm min-w-0">Desde<input v-model="desde" type="date" :max="hasta || undefined" class="metric-input" /></label>
            <label class="text-sm min-w-0">Hasta<input v-model="hasta" type="date" :min="desde || undefined" class="metric-input" /></label>
          </div>
          <p v-if="errorFechas" role="alert" class="text-sm text-red-700">{{ errorFechas }}</p>
          <BaseButton full type="submit">Aplicar filtros</BaseButton>
          <BaseButton full type="button" variant="outline" @click="limpiar">Ver todo el historial</BaseButton>
        </fieldset>
      </form>
      <p v-if="loading" role="status" class="text-sm text-center py-8">Cargando métricas...</p>
      <div v-else-if="error" role="alert" class="text-sm text-red-700 panel">
        <p>{{ error }}</p><BaseButton class="mt-3" @click="cargar">Reintentar</BaseButton>
      </div>
      <template v-else-if="datos">
        <h2 class="font-semibold text-[#2A6049] break-words">{{ titulo }}</h2>
        <p class="text-xs text-[#7A6558] mt-1 mb-3">{{ periodo }} · Solo ventas de feria</p>
        <div class="bg-[#2A6049] text-white rounded-2xl p-4 mb-3">
          <p class="text-sm">Total vendido</p><p class="text-2xl font-semibold mt-2">Bs {{ dinero(datos.resumen.total) }}</p>
        </div>
        <dl class="grid grid-cols-2 gap-3">
          <div class="panel"><dt class="text-xs">Ventas</dt><dd class="text-xl font-semibold">{{ datos.resumen.ventas }}</dd></div>
          <div class="panel"><dt class="text-xs">Unidades</dt><dd class="text-xl font-semibold">{{ datos.resumen.unidades }}</dd></div>
        </dl>
        <section class="panel mt-4">
          <h2 class="font-semibold">Empresas con mayores ventas</h2>
          <p class="text-xs text-[#7A6558] mt-1">Top 10 por importe vendido.</p>
          <p v-if="!datos.empresas.length" class="empty">Sin ventas para estos filtros.</p>
          <ol class="divide-y mt-2">
            <li v-for="(e,i) in datos.empresas" :key="e.id" class="py-3 text-sm">
              <p class="font-semibold break-words">{{ i + 1 }}. {{ e.nombre }}</p>
              <p>{{ e.ventas }} ventas · {{ e.unidades }} unidades</p><p>Bs {{ dinero(e.total) }}</p>
            </li>
          </ol>
          <p v-if="datos.empresas.length" class="text-xs text-[#7A6558] mt-2">Una venta con productos de varias empresas cuenta para cada empresa involucrada. En el total general cuenta una sola vez.</p>
        </section>
        <section class="panel mt-4">
          <h2 class="font-semibold">Productos más vendidos</h2>
          <p class="text-xs text-[#7A6558] mt-1">Top 10 por unidades. En empate se prioriza el importe vendido.</p>
          <p v-if="!datos.productos.length" class="empty">Sin productos vendidos para estos filtros.</p>
          <ol class="divide-y mt-2">
            <li v-for="(p,i) in datos.productos" :key="p.id" class="py-3 text-sm">
              <p class="font-semibold break-words">{{ i + 1 }}. {{ p.nombre }}</p>
              <p class="text-xs text-[#7A6558] break-words">{{ p.empresa }}</p>
              <p>{{ p.unidades }} unidades · Bs {{ dinero(p.total) }}</p>
            </li>
          </ol>
        </section>
        <section class="panel mt-4">
          <h2 class="font-semibold">Evolución diaria</h2>
          <p class="text-xs text-[#7A6558] mt-1">Importe vendido por día. Se muestran los días con ventas registradas.</p>
          <p v-if="!datos.dias.length" class="empty">Sin ventas para estos filtros.</p>
          <div v-for="d in datos.dias" :key="d.fecha" class="mt-4">
            <p class="text-sm font-semibold">{{ d.fecha }}</p>
            <p class="text-xs">{{ d.ventas }} ventas · {{ d.unidades }} unidades · Bs {{ dinero(d.total) }}</p>
            <div class="bar-track" aria-hidden="true"><div class="bar-fill" :style="{ width: d.total / maxDia * 100 + '%' }"></div></div>
          </div>
        </section>
        <section class="panel mt-4">
          <h2 class="font-semibold">Comparación entre ferias</h2>
          <p class="text-xs text-[#7A6558] mt-1">Todas las ferias en el periodo aplicado, ordenadas por importe vendido.</p>
          <p v-if="!comparacion.length" class="empty">Todavía no hay ferias.</p>
          <div v-for="j in comparacion" :key="j.id" class="mt-4">
            <p class="text-sm font-semibold break-words">{{ j.nombre }}</p>
            <p class="text-xs">{{ j.ventas }} ventas · {{ j.unidades }} unidades · Bs {{ dinero(j.total) }}</p>
            <div class="bar-track" aria-hidden="true"><div class="bar-fill" :style="{ width: j.total / maxFeria * 100 + '%' }"></div></div>
          </div>
        </section>
        <p class="text-xs text-[#7A6558] mt-4">Importes históricos con las rebajas aplicadas. Se conservan las ventas de ferias finalizadas y productos archivados.</p>
      </template>
    </div>
  </div>
</template>
<style scoped>
.panel { background:#fff; border:1px solid #d8cfc4; border-radius:16px; padding:16px; }
.metric-input { display:block; width:100%; min-width:0; min-height:48px; margin-top:4px; border:1px solid #d8cfc4; border-radius:12px; padding:8px; background:#fff; color:#254c3b; }
.empty { font-size:14px; color:#7a6558; padding:20px 0; }
.bar-track { height:8px; background:#f0ece5; border-radius:8px; margin-top:8px; overflow:hidden; }
.bar-fill { height:100%; background:#2a6049; border-radius:8px; }
</style>
