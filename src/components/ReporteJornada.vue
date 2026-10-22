<script setup>
import { computed, ref, watch } from 'vue'
const props = defineProps({ reporte: { type: Object, required: true } })
const empresa = ref('')
const dinero = v => Number(v).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const empresas = computed(() => props.reporte.empresas.filter(e => !empresa.value || Number(e.id) === Number(empresa.value)))
const productos = computed(() => props.reporte.productos.filter(p => !empresa.value || Number(p.empresa_id) === Number(empresa.value)))
watch(() => props.reporte.jornada.id, () => { empresa.value = '' })
</script>
<template>
  <section class="bg-white border border-[#D8CFC4] rounded-2xl p-4 mb-4">
    <h2 class="font-semibold">Reporte completo de la feria</h2>
    <p class="text-xs text-[#7A6558] mt-2">Incluye toda la feria. El filtro de empresa solo cambia el desglose inferior.</p>
    <dl class="text-sm space-y-2 mt-3">
      <div><dt class="inline">Total general: </dt><dd class="inline font-semibold">Bs {{ dinero(reporte.total) }}</dd></div>
      <div><dt class="inline">Suma de empresas: </dt><dd class="inline font-semibold">Bs {{ dinero(reporte.total_empresas) }}</dd></div>
      <div><dt class="inline">Diferencia: </dt><dd class="inline font-semibold">Bs {{ dinero(reporte.diferencia) }}</dd></div>
    </dl>
    <p role="status" class="rounded-xl p-3 text-sm mt-3" :class="reporte.cuadra ? 'bg-[#E6F5EF] text-[#254c3b]' : 'bg-red-50 text-red-700'">{{ reporte.cuadra ? 'Totales verificados: el cuadre es correcto.' : 'Hay inconsistencias que impiden cerrar la jornada.' }}</p>
    <ul v-if="reporte.problemas.length" class="text-sm text-red-700 list-disc pl-5 mt-2"><li v-for="p in reporte.problemas" :key="p">{{ p }}</li></ul>
    <h3 class="font-semibold text-sm mt-4">Totales por método de pago</h3>
    <p v-if="!reporte.metodos_pago.length" class="text-sm mt-2">Sin ventas registradas.</p>
    <p v-for="m in reporte.metodos_pago" :key="m.nombre" class="text-sm mt-2">{{ m.nombre }}: Bs {{ dinero(m.total) }}</p>
    <label class="block text-sm font-semibold mt-4">Empresa
      <select v-model="empresa" class="w-full min-h-12 bg-white text-[#254c3b] border rounded-xl p-2 mt-1">
        <option value="">Todas las empresas</option><option v-for="e in reporte.empresas" :key="e.id" :value="e.id">{{ e.nombre }}</option>
      </select>
    </label>
    <p v-if="!empresas.length" class="text-sm mt-3">Sin empresas vinculadas mediante productos.</p>
    <article v-for="e in empresas" :key="e.id" class="border-b py-4 text-sm">
      <h3 class="font-semibold break-words">{{ e.nombre }}</h3>
      <p>{{ e.ventas }} ventas · {{ e.unidades }} unidades</p>
      <p class="font-semibold">Bs {{ dinero(e.total) }}</p>
      <p v-for="m in e.metodos_pago" :key="m.nombre" class="text-xs mt-1">{{ m.nombre }}: Bs {{ dinero(m.total) }}</p>
    </article>
    <p class="text-xs text-[#7A6558] mt-2">Una venta compartida puede contar en varias empresas; sus importes se reparten por producto.</p>
    <details class="mt-4">
      <summary class="font-semibold text-sm cursor-pointer">Productos, ventas e inventario actual</summary>
      <p class="text-xs text-[#7A6558] mt-2">El stock es el disponible hoy en la empresa, compartido con otras ventas. No representa el stock histórico al cierre.</p>
      <article v-for="p in productos" :key="p.id" class="py-3 border-b text-sm">
        <p class="font-semibold break-words">{{ p.nombre }}</p>
        <p class="text-xs">{{ reporte.empresas.find(e => e.id === p.empresa_id)?.nombre }}</p>
        <p>{{ p.unidades }} unidades vendidas · Bs {{ dinero(p.total) }}</p>
        <p>Stock actual: {{ p.stock_actual }}</p>
        <p class="text-xs">{{ p.asignado ? 'Asignado a la feria' : 'Retirado de la feria' }}{{ p.estado ? '' : ' · Producto archivado' }}</p>
      </article>
    </details>
  </section>
</template>
