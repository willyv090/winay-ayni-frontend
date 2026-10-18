<script setup>
import { computed, ref, watch } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { obtenerMetricasIndependientes, obtenerMetricasFerias } from '../services/ventaService.js'

const props = defineProps({ embedded: Boolean, idEmpresa: { type: [Number, String], required: true } })
const emit = defineEmits(['navigate'])
const datos = ref(null)
const loading = ref(true)
const error = ref('')
const errorFechas = ref('')
const tipo = ref('INDEPENDIENTE')
const desde = ref('')
const hasta = ref('')
let solicitud = 0
const dinero = valor => Number(valor).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fecha = valor => valor.split('-').reverse().join('/')
const periodo = computed(() => {
  const p = datos.value?.periodo
  if (!p?.desde && !p?.hasta) return 'Todo el historial'
  if (!p.desde) return 'Hasta ' + fecha(p.hasta)
  if (!p.hasta) return 'Desde ' + fecha(p.desde)
  return fecha(p.desde) + ' — ' + fecha(p.hasta)
})
const maximo = computed(() => datos.value?.ranking[0]?.unidades_vendidas || 1)
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
    const id = Number(props.idEmpresa)
    if (!Number.isInteger(id) || id <= 0) throw new Error('Seleccione una empresa válida.')
    const respuesta = await (tipo.value === 'JORNADA' ? obtenerMetricasFerias : obtenerMetricasIndependientes)(id, desde.value, hasta.value)
    if (actual !== solicitud) return
    if (!respuesta.empresa || !respuesta.resumen || !Array.isArray(respuesta.ranking)) throw new Error('No se pudieron obtener las métricas.')
    datos.value = respuesta
  } catch (err) {
    if (actual === solicitud) error.value = err.message || 'No se pudieron cargar las métricas.'
  } finally {
    if (actual === solicitud) loading.value = false
  }
}
function limpiar() {
  desde.value = ''
  hasta.value = ''
  cargar()
}
watch(() => props.idEmpresa, limpiar, { immediate: true })
watch(tipo, limpiar)
</script>

<template>
  <div class="h-full flex flex-col">
    <AppHeader v-if="!embedded" title="Métricas de ventas" show-back @back="emit('navigate', 'my-business-detail', { idEmpresa: props.idEmpresa })" />
    <div class="flex-1 overflow-y-auto p-4">
      <label class="block text-sm font-semibold mb-4">Tipo de venta
        <select v-model="tipo" class="w-full min-h-12 border border-[#D8CFC4] rounded-xl px-3 mt-1 bg-white">
          <option value="INDEPENDIENTE">Ventas independientes</option>
          <option value="JORNADA">Ventas de feria</option>
        </select>
      </label>
      <form @submit.prevent="cargar" class="bg-white border border-[#D8CFC4] rounded-2xl p-4 mb-4">
        <p class="font-semibold text-sm mb-3">Periodo de ventas</p>
        <fieldset :disabled="loading" class="min-w-0">
          <div class="grid grid-cols-2 gap-3">
            <label class="text-sm min-w-0">Desde<input v-model="desde" type="date" :max="hasta || undefined" class="metrics-date" /></label>
            <label class="text-sm min-w-0">Hasta<input v-model="hasta" type="date" :min="desde || undefined" class="metrics-date" /></label>
          </div>
          <p v-if="errorFechas" role="alert" class="text-red-700 text-sm mt-3">{{ errorFechas }}</p>
          <div class="flex flex-col gap-2 mt-4">
            <BaseButton full type="submit">Aplicar filtros</BaseButton>
            <BaseButton full type="button" variant="outline" @click="limpiar">Ver todo el historial</BaseButton>
          </div>
        </fieldset>
      </form>
      <p v-if="loading" role="status" class="text-sm text-center text-[#7A6558] py-8">Cargando métricas...</p>
      <div v-else-if="error" role="alert" class="bg-red-50 text-red-700 rounded-xl p-4 text-sm">
        <p>{{ error }}</p><BaseButton class="mt-3" @click="cargar">Reintentar</BaseButton>
      </div>
      <template v-else-if="datos">
        <h2 class="text-lg font-semibold text-[#2A6049] break-words">{{ datos.empresa.nombre }}</h2>
        <p class="text-sm text-[#7A6558] mt-1 mb-4">{{ periodo }} · {{ datos.tipo === 'JORNADA' ? 'Solo ventas de feria' : 'Solo ventas independientes' }}</p>
        <div class="bg-[#2A6049] text-white rounded-2xl p-5 mb-3">
          <p class="text-sm text-white/80">Total vendido</p>
          <p class="text-2xl font-semibold mt-2 break-words">Bs {{ dinero(datos.resumen.total_vendido) }}</p>
        </div>
        <dl class="grid grid-cols-2 gap-3">
          <div class="metric-card"><dt>Ventas</dt><dd>{{ datos.resumen.ventas }}</dd></div>
          <div class="metric-card"><dt>Unidades vendidas</dt><dd>{{ datos.resumen.unidades_vendidas }}</dd></div>
          <div class="metric-card"><dt>Productos distintos</dt><dd>{{ datos.resumen.productos_vendidos }}</dd></div>
          <div class="metric-card"><dt>Promedio por venta</dt><dd class="!text-base">Bs {{ dinero(datos.resumen.promedio_por_venta) }}</dd></div>
        </dl>
        <section class="bg-white border border-[#D8CFC4] rounded-2xl p-4 mt-4">
          <h2 class="font-semibold">Productos más vendidos</h2>
          <p class="text-xs text-[#7A6558] mt-1">Los 10 primeros por unidades vendidas. En empate, se ordenan por importe vendido.</p>
          <p v-if="!datos.ranking.length" class="text-sm text-[#7A6558] py-6">No hay ventas de este tipo en este periodo.</p>
          <ol v-else class="space-y-5 mt-5">
            <li v-for="item in datos.ranking" :key="item.producto.id">
              <div class="flex gap-3">
                <span class="bg-[#E6F5EF] text-[#1E6B47] rounded-full w-7 h-7 shrink-0 flex items-center justify-center text-sm font-semibold">{{ item.posicion }}</span>
                <div class="min-w-0 flex-1">
                  <p class="font-semibold text-sm break-words">{{ item.producto.nombre }}</p>
                  <p v-if="!item.producto.estado" class="text-xs text-[#7A6558]">Archivado</p>
                  <p class="text-xs text-[#7A6558] mt-1">{{ item.unidades_vendidas }} unidades · Bs {{ dinero(item.total_vendido) }}</p>
                  <div aria-hidden="true" class="h-2 bg-[#F0ECE5] rounded-full mt-2 overflow-hidden">
                    <div class="h-full bg-[#2A6049] rounded-full" :style="{ width: (item.unidades_vendidas / maximo * 100) + '%' }"></div>
                  </div>
                </div>
              </div>
            </li>
          </ol>
        </section>
        <p class="text-xs text-[#7A6558] mt-4">Los importes incluyen las rebajas aplicadas y usan la fecha en que ocurrió la venta. Los productos archivados conservan sus ventas históricas.</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.metrics-date { display: block; width: 100%; min-width: 0; height: 3rem; margin-top: .25rem; border: 1px solid #D8CFC4; border-radius: .75rem; padding: .5rem; background: white; }
.metric-card { background: white; border: 1px solid #D8CFC4; border-radius: 1rem; padding: 1rem; }
.metric-card dt { font-size: .75rem; color: #7A6558; }
.metric-card dd { margin-top: .5rem; font-size: 1.5rem; font-weight: 600; overflow-wrap: anywhere; }
</style>
