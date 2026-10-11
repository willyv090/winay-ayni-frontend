<script setup>
import { reactive, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import { crearJornada } from '../services/jornadaService.js'

const emit = defineEmits(['navigate'])
const guardando = ref(false)
const error = ref('')
const form = reactive({ nombre: '', direccion: '', fecha_inicio: '', fecha_fin: '' })
const errors = reactive({ nombre: '', direccion: '', fecha_inicio: '', fecha_fin: '' })

function volver() {
  if (guardando.value) return
  emit('navigate', 'sessions-list')
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
  if (guardando.value) return
  error.value = ''
  if (!validarFormulario()) return
  guardando.value = true
  try {
    await crearJornada({
      nombre: form.nombre.trim(),
      direccion: form.direccion.trim(),
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin
    })
    // El listado vuelve a consultar las jornadas del servidor.
    emit('navigate', 'sessions-list')
  } catch (err) {
    error.value = err.message || 'No se pudo crear la jornada.'
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div class="h-full flex flex-col">
    <AppHeader title="Nueva jornada" show-back @back="volver" />
    <div class="flex-1 overflow-y-auto p-4">
      <form class="bg-white border border-[#D8CFC4] rounded-2xl p-4" @submit.prevent="guardar">
        <fieldset :disabled="guardando" class="flex flex-col gap-4 min-w-0">
          <BaseInput v-model="form.nombre" label="Nombre *" placeholder="Ej. Feria Septiembre" :error="errors.nombre" />
          <BaseInput v-model="form.direccion" label="Dirección *" placeholder="Ej. Av. Principal #123" :error="errors.direccion" />
          <BaseInput v-model="form.fecha_inicio" label="Fecha de inicio *" type="date" :error="errors.fecha_inicio" />
          <BaseInput v-model="form.fecha_fin" label="Fecha de fin *" type="date" :min="form.fecha_inicio || undefined" :error="errors.fecha_fin" />
          <p v-if="error" role="alert" class="bg-red-50 text-red-700 rounded-xl p-3 text-sm">{{ error }}</p>
          <div class="flex gap-3">
            <BaseButton type="button" full variant="secondary" :disabled="guardando" @click="volver">Cancelar</BaseButton>
            <BaseButton type="submit" full :loading="guardando">{{ guardando ? 'Guardando...' : 'Crear jornada' }}</BaseButton>
          </div>
        </fieldset>
      </form>
    </div>
  </div>
</template>
