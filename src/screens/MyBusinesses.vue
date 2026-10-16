<script setup>
import { computed, onMounted, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { listarMisEmpresas } from '../services/empresaService.js'

const emit = defineEmits(['navigate'])
const empresas = ref([])
const loading = ref(true)
const error = ref('')
const busqueda = ref('')
const estado = ref('todas')
const visibles = computed(() => empresas.value.filter(empresa => {
  const coincide = `${empresa.nombre} ${empresa.direccion || ''}`.toLocaleLowerCase('es')
    .includes(busqueda.value.trim().toLocaleLowerCase('es'))
  return coincide && (estado.value === 'todas' || empresa.estado === (estado.value === 'activas'))
}))
async function cargar() {
  loading.value = true
  error.value = ''
  empresas.value = []
  try {
    const respuesta = await listarMisEmpresas()
    if (!Array.isArray(respuesta.empresas)) throw new Error('No se pudo obtener el listado de empresas.')
    empresas.value = respuesta.empresas
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
    <AppHeader title="Mis empresas" show-back @back="emit('navigate', 'home')" />
    <div class="flex-1 overflow-y-auto p-4">
      <p v-if="loading" role="status" class="text-sm text-center text-[#7A6558] py-12">Cargando mis empresas...</p>
      <div v-else-if="error" role="alert" class="bg-red-50 text-red-700 rounded-xl p-4 text-sm">
        <p>{{ error }}</p>
        <BaseButton class="mt-3" @click="cargar">Reintentar</BaseButton>
      </div>
      <template v-else>
        <p class="text-sm text-[#7A6558] mb-4">Empresas vinculadas a tu cuenta. Entra a una empresa para consultar su información.</p>
        <label class="block mb-3">
          <span class="text-sm font-semibold">Buscar empresa</span>
          <input v-model="busqueda" type="search" placeholder="Nombre o dirección" class="w-full h-12 mt-1 rounded-xl border border-[#D8CFC4] bg-white px-3" />
        </label>
        <label class="block mb-4">
          <span class="text-sm font-semibold">Estado</span>
          <select v-model="estado" class="w-full h-12 mt-1 rounded-xl border border-[#D8CFC4] bg-white px-3">
            <option value="todas">Todas</option><option value="activas">Activas</option><option value="inactivas">Inactivas</option>
          </select>
        </label>
        <p v-if="!empresas.length" class="bg-white rounded-xl p-4 text-sm text-[#7A6558]">Todavía no tienes empresas vinculadas. El administrador puede asignarte una.</p>
        <p v-else-if="!visibles.length" class="text-sm text-[#7A6558] py-6">No hay empresas que coincidan con los filtros.</p>
        <div v-else class="space-y-3">
          <article v-for="empresa in visibles" :key="empresa.id" class="bg-white border border-[#D8CFC4] rounded-2xl p-4">
            <div class="flex justify-between gap-3">
              <h2 class="font-semibold min-w-0 break-words">{{ empresa.nombre }}</h2>
              <span class="text-xs px-2 py-1 rounded-full h-fit shrink-0" :class="empresa.estado ? 'bg-[#E6F5EF] text-[#1E6B47]' : 'bg-[#EEE] text-[#666]'">{{ empresa.estado ? 'Activa' : 'Inactiva' }}</span>
            </div>
            <p class="text-sm text-[#7A6558] mt-2 break-words">{{ empresa.direccion || 'Sin dirección registrada' }}</p>
            <p class="text-sm text-[#7A6558] mt-1">Teléfono: {{ empresa.telefono || 'Sin teléfono' }}</p>
            <BaseButton full variant="outline" class="mt-4" @click="emit('navigate', 'my-business-detail', { idEmpresa: empresa.id })">Ver empresa</BaseButton>
          </article>
        </div>
      </template>
    </div>
  </div>
</template>
