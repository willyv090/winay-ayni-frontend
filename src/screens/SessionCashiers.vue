<script setup>
import { computed, onMounted, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { listarUsuarios } from '../services/usuarioService.js'
import { obtenerJornada, obtenerCajerosJornada, asignarCajerosJornada } from '../services/jornadaService.js'

const props = defineProps({ idJornada: { type: [Number, String], required: true } })
const emit = defineEmits(['navigate'])
const jornada = ref(null)
const personas = ref([])
const asignados = ref([])
const seleccionados = ref([])
const busqueda = ref('')
const loading = ref(true)
const guardando = ref(false)
const errorCarga = ref('')
const errorGuardado = ref('')
const idsAsignados = computed(() => new Set(asignados.value
  .filter(asignacion => asignacion.estado === true)
  .map(asignacion => Number(asignacion.persona.id))))
const personasVisibles = computed(() => {
  const texto = busqueda.value.trim().toLocaleLowerCase('es')
  return personas.value.filter(persona =>
    `${persona.nombre} ${persona.usuario}`.toLocaleLowerCase('es').includes(texto)
  )
})

function volver() {
  if (!guardando.value) emit('navigate', 'session-detail', { idJornada: props.idJornada })
}

async function cargarDatos() {
  loading.value = true
  errorCarga.value = ''
  errorGuardado.value = ''
  jornada.value = null
  seleccionados.value = []
  try {
    const respuesta = await obtenerJornada(props.idJornada)
    if (!respuesta.jornada) throw new Error('No se encontró la jornada.')
    jornada.value = respuesta.jornada
    if (!jornada.value.estado) return
    const [usuarios, cajeros] = await Promise.all([
      listarUsuarios(), obtenerCajerosJornada(props.idJornada)
    ])
    const listado = Array.isArray(usuarios) ? usuarios : usuarios.personas
    if (!Array.isArray(listado) || !Array.isArray(cajeros.cajeros)) {
      throw new Error('No se pudo obtener el listado de usuarios y asignaciones.')
    }
    personas.value = listado.filter(persona => persona.estado === true)
    asignados.value = cajeros.cajeros
  } catch (err) {
    errorCarga.value = err.message || 'No se pudieron cargar los usuarios.'
  } finally {
    loading.value = false
  }
}

async function guardar() {
  if (guardando.value || loading.value || errorCarga.value || !jornada.value?.estado) return
  errorGuardado.value = ''
  const idsActivos = new Set(personas.value.map(persona => Number(persona.id)))
  const ids = [...new Set(seleccionados.value.map(Number))]
    .filter(id => idsActivos.has(id) && !idsAsignados.value.has(id))
  if (!ids.length) {
    errorGuardado.value = 'Seleccione al menos un usuario para asignar.'
    return
  }
  guardando.value = true
  try {
    await asignarCajerosJornada(props.idJornada, ids)
    // El detalle consulta nuevamente las asignaciones guardadas en el servidor.
    emit('navigate', 'session-detail', { idJornada: props.idJornada })
  } catch (err) {
    errorGuardado.value = err.message || 'No se pudieron asignar los cajeros.'
  } finally {
    guardando.value = false
  }
}

onMounted(cargarDatos)
</script>

<template>
  <div class="h-full flex flex-col">
    <AppHeader title="Asignar cajeros" show-back @back="volver" />
    <div class="flex-1 overflow-y-auto p-4">
      <p v-if="loading" class="text-center text-sm text-[#7A6558] py-12">Cargando usuarios...</p>
      <div v-else-if="errorCarga" role="alert" class="bg-red-50 text-red-700 rounded-xl p-4 text-sm">
        <p>{{ errorCarga }}</p>
        <BaseButton size="sm" class="mt-3" @click="cargarDatos">Reintentar</BaseButton>
      </div>
      <div v-else-if="jornada && !jornada.estado" class="bg-white border border-[#D8CFC4] rounded-2xl p-4 text-sm">
        <p>No se pueden asignar cajeros a una jornada finalizada.</p>
        <BaseButton size="sm" variant="outline" class="mt-3" @click="volver">Volver al detalle</BaseButton>
      </div>
      <form v-else-if="jornada" @submit.prevent="guardar">
        <div class="bg-[#2A6049] text-white rounded-2xl p-4 mb-4">
          <p class="font-semibold break-words">{{ jornada.nombre }}</p>
          <p class="text-sm text-white/80 mt-2">Seleccione los usuarios que atenderán como cajeros en esta jornada.</p>
        </div>
        <fieldset :disabled="guardando" class="min-w-0">
          <label class="block mb-4">
            <span class="text-sm font-semibold">Buscar usuario</span>
            <input v-model="busqueda" type="search" placeholder="Nombre o usuario" class="w-full h-11 border border-[#D8CFC4] rounded-xl bg-white px-3 mt-1" />
          </label>
          <p v-if="personas.length === 0" class="text-sm text-[#7A6558] py-6">No hay usuarios activos disponibles.</p>
          <p v-else-if="personasVisibles.length === 0" class="text-sm text-[#7A6558] py-6">No se encontraron usuarios con esa búsqueda.</p>
          <div class="space-y-3">
            <label v-for="persona in personasVisibles" :key="persona.id" class="flex items-center gap-3 bg-white border border-[#D8CFC4] rounded-2xl p-4 min-h-16">
              <input v-if="idsAsignados.has(Number(persona.id))" type="checkbox" checked disabled class="w-5 h-5 shrink-0 accent-[#2A6049]" />
              <input v-else v-model="seleccionados" type="checkbox" :value="Number(persona.id)" class="w-5 h-5 shrink-0 accent-[#2A6049]" />
              <span class="flex-1 min-w-0">
                <span class="block font-semibold text-sm break-words">{{ persona.nombre }}</span>
                <span class="block text-xs text-[#7A6558] break-words">@{{ persona.usuario }}</span>
                <span v-if="idsAsignados.has(Number(persona.id))" class="inline-block text-xs text-[#1E6B47] bg-[#E6F5EF] rounded-full px-2 py-1 mt-2">Ya asignado</span>
              </span>
            </label>
          </div>
          <p class="text-xs text-[#7A6558] mt-4">Seleccionados para asignar: {{ seleccionados.length }}. Los cajeros ya asignados se mantienen.</p>
          <p v-if="errorGuardado" role="alert" class="bg-red-50 text-red-700 rounded-xl p-3 text-sm mt-4">{{ errorGuardado }}</p>
          <div class="flex flex-col gap-3 mt-5 pb-4">
            <BaseButton type="submit" full :loading="guardando" :disabled="!seleccionados.length">{{ guardando ? 'Asignando...' : 'Asignar cajeros' }}</BaseButton>
            <BaseButton type="button" full variant="secondary" :disabled="guardando" @click="volver">Cancelar</BaseButton>
          </div>
        </fieldset>
      </form>
    </div>
  </div>
</template>
