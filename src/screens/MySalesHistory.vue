<script setup>
import { computed, ref, watch } from 'vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { listarMisVentas, obtenerDetalleMiVenta, listarVentasCaja, detalleVentaCaja, listarVentasFeriaAdmin, detalleVentaAdmin } from '../services/ventaService.js'
const props = defineProps({ embedded: Boolean, administrador: Boolean, idPersona: { type: [Number, String], default: null }, cajero: Boolean, idJornada: { type: [Number, String], default: null }, idEmpresa: { type: [Number, String], default: null } })
const ventas = ref([]), detalle = ref(null), seleccionado = ref(null)
const loading = ref(false), error = ref(''), tipo = ref(''), desde = ref(''), hasta = ref('')
let solicitud = 0
const dinero = n => Number(n).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fecha = n => new Date(n).toLocaleString('es-BO')
const rangoInvalido = computed(() => desde.value && hasta.value && desde.value > hasta.value)
const visibles = computed(() => rangoInvalido.value ? [] : ventas.value.filter(v =>
  (!tipo.value || v.tipo === tipo.value) && (!desde.value || v.fecha.slice(0,10) >= desde.value) &&
  (!hasta.value || v.fecha.slice(0,10) <= hasta.value)))
const totalVisible = computed(() => visibles.value.reduce((total, v) => total + Math.round(Number(v.total) * 100), 0) / 100)
async function cargar(id = null) {
  const actual = ++solicitud
  seleccionado.value = id
  loading.value = true
  error.value = ''
  detalle.value = null
  try {
    if (id !== null) {
      const r = await (props.administrador ? detalleVentaAdmin(id) : props.cajero ? detalleVentaCaja(id) : obtenerDetalleMiVenta(id, props.idEmpresa))
      if (actual !== solicitud) return
      if (!r.venta || !Array.isArray(r.detalles)) throw new Error('No se pudo obtener el detalle.')
      detalle.value = r
    } else {
      ventas.value = []
      const r = await (props.administrador ? listarVentasFeriaAdmin(props.idJornada, props.idPersona) : props.cajero ? listarVentasCaja(props.idJornada) : listarMisVentas(props.idEmpresa))
      if (actual !== solicitud) return
      if (!Array.isArray(r.ventas)) throw new Error('No se pudo obtener el historial.')
      ventas.value = r.ventas
    }
  } catch (err) {
    if (actual === solicitud) error.value = err.message || 'No se pudieron cargar las ventas.'
  } finally {
    if (actual === solicitud) loading.value = false
  }
}
watch(() => [props.idEmpresa, props.idJornada, props.idPersona], () => cargar(), { immediate: true })
</script>
<template>
  <div :class="props.embedded ? 'py-2' : 'h-full overflow-y-auto p-4'">
    <BaseButton v-if="seleccionado !== null" full variant="outline" class="mb-4" @click="cargar()">Volver al historial</BaseButton>
    <template v-else>
      <h2 class="font-semibold mb-3">{{ props.cajero ? "Mis ventas en esta feria" : "Historial de ventas" }}</h2>
      <label v-if="!props.cajero && !props.administrador" class="block text-sm mb-3">Tipo de venta
        <select v-model="tipo" class="w-full h-12 border rounded-xl px-3 mt-1 bg-white">
          <option value="">Todas</option><option value="INDEPENDIENTE">Independientes</option><option value="JORNADA">De feria</option>
        </select>
      </label>
      <div class="grid grid-cols-2 gap-2 mb-4">
        <label class="text-sm min-w-0">Desde<input v-model="desde" type="date" class="w-full min-w-0 h-12 border rounded-xl p-2 bg-white" /></label>
        <label class="text-sm min-w-0">Hasta<input v-model="hasta" type="date" class="w-full min-w-0 h-12 border rounded-xl p-2 bg-white" /></label>
      </div>
      <p v-if="rangoInvalido" role="alert" class="text-sm text-red-700 mb-3">La fecha inicial no puede ser posterior a la final.</p>
    </template>
    <p v-if="loading" role="status" class="text-sm py-8 text-center">Cargando ventas...</p>
    <div v-else-if="error" role="alert" class="text-sm text-red-700 bg-red-50 rounded-xl p-4">
      <p>{{ error }}</p><BaseButton class="mt-3" @click="cargar(seleccionado)">Reintentar</BaseButton>
    </div>
    <article v-else-if="detalle" class="bg-white border rounded-2xl p-4">
      <h2 class="font-semibold">Detalle de venta</h2>
      <p class="text-sm mt-2">{{ fecha(detalle.venta.fecha) }}</p>
      <p class="text-sm mt-2">{{ detalle.venta.tipo === 'JORNADA' ? 'Feria: ' + detalle.venta.jornada?.nombre : 'Venta independiente' }}</p>
      <p class="text-sm mt-2">Pago: {{ detalle.venta.metodo_pago.nombre }}</p>
      <div v-if="detalle.venta.cajero" class="bg-[#E6F5EF] text-[#254c3b] rounded-xl p-3 mt-3">
        <p class="text-xs font-semibold">Vendido por · Cajero</p>
        <p class="text-sm font-semibold break-words mt-1">{{ detalle.venta.cajero.nombre }}</p>
        <p class="text-sm break-all">@{{ detalle.venta.cajero.usuario }}</p>
      </div>
      <p v-else class="text-sm mt-2">Registrada por: {{ detalle.venta.responsable.nombre }}</p>
      <ul class="divide-y mt-4">
        <li v-for="d in detalle.detalles" :key="d.id" class="py-4">
          <p class="font-semibold break-words">{{ d.producto.nombre }}</p>
          <p v-if="props.cajero || props.administrador" class="text-xs text-[#2A6049]">{{ d.producto.empresa_nombre }}</p>
          <p class="text-sm mt-1">{{ d.cantidad }} unidades × Bs {{ dinero(d.precio_final) }}</p>
          <p class="text-xs mt-1">Precio: Bs {{ dinero(d.precio_u) }} · Rebaja por unidad: Bs {{ dinero(d.rebaja) }}</p>
          <p class="font-semibold mt-2">Bs {{ dinero(d.subtotal) }}</p>
        </li>
      </ul>
      <p class="font-semibold border-t pt-4">{{ (props.cajero || props.administrador) ? "Total de la venta" : "Total de esta empresa" }}: Bs {{ dinero(detalle.venta.total) }}</p>
      <p class="text-xs text-[#7A6558] mt-3">Los importes corresponden a los precios registrados al realizar la venta.</p>
    </article>
    <template v-else>
      <dl v-if="!rangoInvalido" class="grid grid-cols-2 gap-3 mb-4">
        <div class="bg-white border border-[#D8CFC4] rounded-xl p-3"><dt class="text-xs text-[#7A6558]">Cantidad de ventas</dt><dd class="font-semibold text-xl mt-1">{{ visibles.length }}</dd></div>
        <div class="bg-[#2A6049] text-white rounded-xl p-3"><dt class="text-xs">Total vendido</dt><dd class="font-semibold mt-1 break-words">Bs {{ dinero(totalVisible) }}</dd></div>
      </dl>
      <p v-if="!visibles.length && !rangoInvalido" class="text-sm py-6">No hay ventas para estos filtros.</p>
      <article v-for="v in visibles" :key="v.id" class="bg-white border rounded-2xl p-4 mb-3">
        <h3 class="font-semibold">{{ v.tipo === 'JORNADA' ? 'Venta de feria' : 'Venta independiente' }}</h3>
        <p class="text-sm mt-2">{{ fecha(v.fecha) }}</p>
        <p v-if="v.jornada" class="text-sm mt-1 break-words">{{ v.jornada.nombre }}</p>
        <p class="text-sm mt-1">{{ v.metodo_pago.nombre }}</p>
        <p v-if="v.cajero" class="text-sm text-[#254c3b] mt-2 break-words">
          Cajero: <strong>@{{ v.cajero.usuario }}</strong> · {{ v.cajero.nombre }}
        </p>
        <p v-else class="text-sm mt-2 break-words">Registrada por: {{ v.responsable.nombre }}</p>
        <p class="font-semibold mt-3">Bs {{ dinero(v.total) }}</p>
        <BaseButton full variant="outline" class="mt-3" @click="cargar(v.id)">Ver detalle</BaseButton>
      </article>
      <p class="text-xs text-[#7A6558]">{{ props.administrador ? "Ventas de la feria y el usuario seleccionados." : props.cajero ? "Solo se muestran las ventas registradas por ti como cajero." : "Solo se muestran los productos e importes de la empresa seleccionada." }}</p>
    </template>
  </div>
</template>
