<script setup>
import { ref, watch } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { obtenerMiEmpresa } from '../services/empresaService.js'

const props = defineProps({ idEmpresa: { type: [Number, String], required: true } })
const emit = defineEmits(['navigate'])
const empresa = ref(null)
const loading = ref(true)
const error = ref('')
let solicitud = 0
async function cargar() {
  const actual = ++solicitud
  loading.value = true
  error.value = ''
  empresa.value = null
  try {
    const id = Number(props.idEmpresa)
    if (!Number.isInteger(id) || id <= 0) throw new Error('Seleccione una empresa válida.')
    const respuesta = await obtenerMiEmpresa(id)
    if (actual !== solicitud) return
    if (!respuesta.empresa) throw new Error('No se encontró la empresa.')
    empresa.value = respuesta.empresa
  } catch (err) {
    if (actual === solicitud) error.value = err.message || 'No se pudo cargar la empresa.'
  } finally {
    if (actual === solicitud) loading.value = false
  }
}
watch(() => props.idEmpresa, cargar, { immediate: true })
</script>

<template>
  <div class="h-full flex flex-col">
    <AppHeader title="Mi empresa" show-back @back="emit('navigate', 'my-businesses')" />
    <div class="flex-1 overflow-y-auto p-4">
      <p v-if="loading" role="status" class="text-sm text-center text-[#7A6558] py-12">Cargando empresa...</p>
      <div v-else-if="error" role="alert" class="bg-red-50 text-red-700 rounded-xl p-4 text-sm">
        <p>{{ error }}</p>
        <BaseButton class="mt-3" @click="cargar">Reintentar</BaseButton>
      </div>
      <template v-else-if="empresa">
        <section class="bg-white border border-[#D8CFC4] rounded-2xl p-5">
          <h2 class="text-lg font-semibold break-words">{{ empresa.nombre }}</h2>
          <span class="inline-block text-xs px-3 py-1.5 rounded-full mt-3" :class="empresa.estado ? 'bg-[#E6F5EF] text-[#1E6B47]' : 'bg-[#EEE] text-[#666]'">{{ empresa.estado ? 'Activa' : 'Inactiva' }}</span>
          <dl class="mt-4 space-y-4 text-sm">
            <div><dt class="text-[#7A6558]">Dirección</dt><dd class="font-semibold break-words mt-1">{{ empresa.direccion || 'Sin dirección registrada' }}</dd></div>
            <div><dt class="text-[#7A6558]">Teléfono</dt><dd class="font-semibold mt-1">{{ empresa.telefono || 'Sin teléfono' }}</dd></div>
          </dl>
          <p v-if="!empresa.estado" class="text-sm text-[#7A6558] mt-4">Esta empresa está inactiva. Consulta con el administrador para reactivarla.</p>
        </section>
        <BaseButton v-if="empresa.estado" full class="mt-4" @click="emit('navigate', 'entrepreneur-sale', { idEmpresa: empresa.id })">Registrar venta</BaseButton>
        <section class="bg-white border border-[#D8CFC4] rounded-2xl p-4 mt-4">
          <h2 class="font-semibold">Inventario</h2>
          <p class="text-sm text-[#7A6558] mt-2">Aquí gestionarás los productos y las existencias de {{ empresa.nombre }}.</p>
          <BaseButton full class="mt-4" @click="emit('navigate', 'my-inventory', { idEmpresa: empresa.id })">Ver inventario</BaseButton>
        </section>
        <section class="bg-white border border-[#D8CFC4] rounded-2xl p-4 mt-4">
          <h2 class="font-semibold">Métricas de ventas</h2>
          <p class="text-sm text-[#7A6558] mt-2">Aquí consultarás las ventas correspondientes a {{ empresa.nombre }}.</p>
          <BaseButton full class="mt-4" @click="emit('navigate', 'my-business-metrics', { idEmpresa: empresa.id })">Ver métricas</BaseButton>
          <p class="text-xs text-[#7A6558] mt-3">Consulta por separado las ventas independientes y las ventas de feria.</p>
        </section>
      </template>
    </div>
  </div>
</template>
