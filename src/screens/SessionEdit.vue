<script setup>
import { onMounted, reactive, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import { obtenerJornada, editarJornada } from '../services/jornadaService.js'

const props = defineProps({
  idJornada: { type: [Number, String], required: true }
})
const emit = defineEmits(['navigate'])
const jornada = ref(null)
const loading = ref(true)
const guardando = ref(false)
const errorCarga = ref('')
const errorGuardado = ref('')
const form = reactive({ nombre: '', direccion: '', fecha_inicio: '', fecha_fin: '' })
const errors = reactive({ nombre: '', direccion: '', fecha_inicio: '', fecha_fin: '' })

function volver() {
  if (guardando.value) return
  emit('navigate', 'session-detail', { idJornada: props.idJornada })
}

async function cargarJornada() {
  loading.value = true
  errorCarga.value = ''
  jornada.value = null
  try {
    const response = await obtenerJornada(props.idJornada)
    if (!response.jornada) throw new Error('No se encontró la jornada.')
    jornada.value = response.jornada
    for (const campo of Object.keys(form)) {
      form[campo] = response.jornada[campo] || ''
    }
  } catch (err) {
    errorCarga.value = err.message || 'No se pudo cargar la jornada.'
  } finally {
    loading.value = false
  }
}

function validarFormulario() {
  Object.keys(errors).forEach(campo => { errors[campo] = '' })
  if (!form.nombre.trim()) errors.nombre = 'Ingrese el nombre de la jornada.'
  if (!form.direccion.trim()) errors.direccion = 'Ingrese la dirección.'
  if (!form.fecha_inicio) errors.fecha_inicio = 'Seleccione la fecha de inicio.'
  if (!form.fecha_fin) errors.fecha_fin = 'Seleccione la fecha de fin.'
  if (form.fecha_inicio && form.fecha_fin && form.fecha_fin < form.fecha_inicio) {
    errors.fecha_fin = 'La fecha de fin no puede ser anterior a la fecha de inicio.'
  }
  return !Object.values(errors).some(Boolean)
}

async function guardar() {
  if (guardando.value || loading.value || !jornada.value?.estado) return
  errorGuardado.value = ''
  if (!validarFormulario()) return
  guardando.value = true
  try {
    await editarJornada(props.idJornada, {
      nombre: form.nombre.trim(),
      direccion: form.direccion.trim(),
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin
    })
    // Al volver, el detalle consulta nuevamente los datos del servidor.
    emit('navigate', 'session-detail', { idJornada: props.idJornada })
  } catch (err) {
    errorGuardado.value = err.message || 'No se pudo actualizar la jornada.'
  } finally {
    guardando.value = false
  }
}

onMounted(cargarJornada)
</script>

<template>
  <div class="h-full flex flex-col">
    <AppHeader title="Editar jornada" show-back @back="volver" />
    <div class="flex-1 overflow-y-auto p-4">
      <p v-if="loading" class="text-center text-sm text-[#7A6558] py-12">
        Cargando jornada...
      </p>
      <div v-else-if="errorCarga" role="alert" class="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
        <p>{{ errorCarga }}</p>
        <BaseButton size="sm" class="mt-3" @click="cargarJornada">Reintentar</BaseButton>
      </div>
      <div v-else-if="jornada && !jornada.estado" class="bg-[#F7F4F0] border border-[#D8CFC4] rounded-xl p-4 text-sm">
        <p>No se puede modificar una jornada finalizada.</p>
        <BaseButton size="sm" variant="outline" class="mt-3" @click="volver">Volver al detalle</BaseButton>
      </div>
      <form v-else-if="jornada" class="bg-white border border-[#D8CFC4] rounded-2xl p-4" @submit.prevent="guardar">
        <fieldset :disabled="guardando" class="flex flex-col gap-4 min-w-0">
          <BaseInput v-model="form.nombre" label="Nombre *" placeholder="Nombre de la jornada" :error="errors.nombre" />
          <BaseInput v-model="form.direccion" label="Dirección *" placeholder="Lugar de la jornada" :error="errors.direccion" />
          <BaseInput v-model="form.fecha_inicio" label="Fecha de inicio *" type="date" :error="errors.fecha_inicio" />
          <BaseInput v-model="form.fecha_fin" label="Fecha de fin *" type="date" :min="form.fecha_inicio || undefined" :error="errors.fecha_fin" />
          <p v-if="errorGuardado" role="alert" class="bg-red-50 text-red-700 rounded-xl p-3 text-sm">{{ errorGuardado }}</p>
          <div class="flex gap-3">
            <BaseButton type="button" full variant="secondary" :disabled="guardando" @click="volver">Cancelar</BaseButton>
            <BaseButton type="submit" full :loading="guardando">{{ guardando ? 'Guardando...' : 'Guardar cambios' }}</BaseButton>
          </div>
        </fieldset>
      </form>
    </div>
  </div>
</template>
