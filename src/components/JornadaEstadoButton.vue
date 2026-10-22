<script setup>
import { nextTick, ref } from 'vue'
import BaseButton from './ui/BaseButton.vue'
import { finalizarJornada, reactivarJornada, obtenerReporteJornada } from '../services/jornadaService.js'

const props = defineProps({ jornada: { type: Object, required: true } })
const emit = defineEmits(['updated'])
const procesando = ref(false)
const reporte = ref(null)
const cargandoReporte = ref(false)
const error = ref('')
const abierta = ref(false)
const seleccion = ref(null)
const cancelarBoton = ref(null)
const confirmarBoton = ref(null)
let focoAnterior

async function abrirConfirmacion() {
  if (procesando.value || abierta.value) return
  error.value = ''
  reporte.value = null
  seleccion.value = { id: props.jornada.id, nombre: props.jornada.nombre, finalizar: props.jornada.estado }
  focoAnterior = document.activeElement
  abierta.value = true
  await nextTick()
  cancelarBoton.value?.focus()
  if (seleccion.value.finalizar) {
    const objetivo = seleccion.value
    cargandoReporte.value = true
    try {
      const r = await obtenerReporteJornada(objetivo.id)
      if (seleccion.value === objetivo) reporte.value = r
    } catch (err) {
      if (seleccion.value === objetivo) error.value = err.message || 'No se pudo verificar el cuadre.'
    } finally {
      if (seleccion.value === objetivo) cargandoReporte.value = false
    }
  }
}

function cancelar() {
  if (procesando.value) return
  abierta.value = false
  focoAnterior?.focus()
}

function manejarTeclado(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    cancelar()
  }
  if (event.key === 'Tab') {
    event.preventDefault()
    if (procesando.value) return
    const siguiente = document.activeElement === cancelarBoton.value
      ? confirmarBoton.value : cancelarBoton.value
    siguiente?.focus()
  }
}

async function confirmarCambio() {
  if (procesando.value || !abierta.value || (seleccion.value.finalizar && (cargandoReporte.value || !reporte.value?.cuadra))) return
  procesando.value = true
  error.value = ''
  try {
    if (seleccion.value.finalizar) {
      await finalizarJornada(seleccion.value.id)
    } else {
      await reactivarJornada(seleccion.value.id)
    }
    abierta.value = false
    focoAnterior?.focus()
    emit('updated')
  } catch (err) {
    error.value = err.message || 'No se pudo cambiar el estado de la jornada.'
  } finally {
    procesando.value = false
  }
}
</script>

<template>
  <div>
    <BaseButton size="sm" :variant="jornada.estado ? 'danger' : 'primary'" :disabled="abierta" @click="abrirConfirmacion">
      {{ jornada.estado ? 'Finalizar' : 'Reactivar' }}
    </BaseButton>
    <Teleport to="#phone-screen">
      <Transition name="jornada-sheet">
        <div v-if="abierta" class="absolute inset-0 z-[100] bg-black/45 flex items-end" @click.self="cancelar" @keydown="manejarTeclado">
          <section
            role="dialog"
            aria-modal="true"
            :aria-label="seleccion.finalizar ? 'Finalizar jornada' : 'Reactivar jornada'"
            :aria-busy="procesando"
            class="jornada-panel bg-white rounded-t-3xl w-full max-h-[90%] overflow-y-auto px-5 pt-3 pb-8 shadow-2xl"
            style="padding-bottom: max(2rem, env(safe-area-inset-bottom))"
          >
            <div aria-hidden="true" class="w-10 h-1 rounded-full bg-[#D8CFC4] mx-auto mb-5"></div>
            <h2 class="font-display font-bold text-xl text-[#1C1108]">{{ seleccion.finalizar ? '¿Finalizar jornada?' : '¿Reactivar jornada?' }}</h2>
            <p class="font-semibold text-sm text-[#1C1108] mt-2 break-words">{{ seleccion.nombre }}</p>
            <p class="text-sm leading-relaxed text-[#7A6558] mt-3">
              {{ seleccion.finalizar
                ? 'Se conservarán los datos. Mientras esté finalizada, no se podrán registrar nuevas ventas ni editar la jornada.'
                : 'La jornada volverá a estar abierta. Se podrá editar y registrar ventas con las asignaciones que sigan activas.' }}
            </p>
            <p v-if="cargandoReporte" role="status" class="text-sm mt-3">Verificando totales...</p>
            <div v-if="seleccion.finalizar && reporte" class="text-sm mt-3">
              <p>{{ reporte.ventas }} ventas · Total Bs {{ Number(reporte.total).toFixed(2) }}</p>
              <p>Suma de empresas: Bs {{ Number(reporte.total_empresas).toFixed(2) }}</p>
              <p :class="reporte.cuadra ? 'text-green-800' : 'text-red-700'">{{ reporte.cuadra ? 'Cuadre verificado. Se validará nuevamente al cerrar.' : 'No se puede cerrar: hay inconsistencias.' }}</p>
              <ul class="text-red-700"><li v-for="p in reporte.problemas" :key="p">{{ p }}</li></ul>
            </div>
            <p v-if="error" role="alert" class="bg-red-50 text-red-700 rounded-xl p-3 text-sm mt-4">{{ error }}</p>
            <div class="flex flex-col gap-3 mt-6">
              <button ref="confirmarBoton" type="button" :disabled="procesando || (seleccion.finalizar && (cargandoReporte || !reporte?.cuadra))" @click="confirmarCambio" class="w-full min-h-12 rounded-xl px-4 py-3 font-semibold text-white disabled:opacity-50" :class="seleccion.finalizar ? 'bg-[#C23B22]' : 'bg-[#2A6049]'">
                {{ procesando ? 'Procesando...' : seleccion.finalizar ? 'Sí, finalizar jornada' : 'Sí, reactivar jornada' }}
              </button>
              <button ref="cancelarBoton" type="button" :disabled="procesando" @click="cancelar" class="w-full min-h-12 rounded-xl px-4 py-3 font-semibold bg-[#E8DDD0] text-[#4A3728] disabled:opacity-50">Cancelar</button>
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.jornada-sheet-enter-active, .jornada-sheet-leave-active { transition: opacity .2s ease; }
.jornada-sheet-enter-active .jornada-panel, .jornada-sheet-leave-active .jornada-panel { transition: transform .2s ease; }
.jornada-sheet-enter-from, .jornada-sheet-leave-to { opacity: 0; }
.jornada-sheet-enter-from .jornada-panel, .jornada-sheet-leave-to .jornada-panel { transform: translateY(100%); }
@media (prefers-reduced-motion: reduce) {
  .jornada-sheet-enter-active, .jornada-sheet-leave-active,
  .jornada-sheet-enter-active .jornada-panel, .jornada-sheet-leave-active .jornada-panel { transition: none; }
}
</style>
