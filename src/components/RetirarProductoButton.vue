<script setup>
import { nextTick, ref } from 'vue'
import BaseButton from './ui/BaseButton.vue'
import { retirarProductoJornada } from '../services/jornadaService.js'

const props = defineProps({
  jornada: { type: Object, required: true },
  producto: { type: Object, required: true }
})
const emit = defineEmits(['updated'])
const procesando = ref(false)
const error = ref('')
const abierta = ref(false)
const seleccion = ref(null)
const cancelarBoton = ref(null)
const confirmarBoton = ref(null)
let focoAnterior

async function abrirConfirmacion() {
  if (procesando.value || abierta.value || !props.jornada.estado || !props.producto.estado) return
  error.value = ''
  seleccion.value = { idJornada: props.jornada.id, idProducto: props.producto.producto.id, nombre: props.producto.producto.nombre, jornada: props.jornada.nombre }
  focoAnterior = document.activeElement
  abierta.value = true
  await nextTick()
  cancelarBoton.value?.focus()
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
  if (procesando.value || !abierta.value) return
  procesando.value = true
  error.value = ''
  try {
    await retirarProductoJornada(seleccion.value.idJornada, seleccion.value.idProducto)
    abierta.value = false
    focoAnterior?.focus()
    emit('updated')
  } catch (err) {
    error.value = err.message || 'No se pudo retirar el producto de la jornada.'
  } finally {
    procesando.value = false
  }
}
</script>

<template>
  <div>
    <BaseButton v-if="jornada.estado && producto.estado" size="sm" variant="danger" :disabled="abierta" @click="abrirConfirmacion">
      Retirar
    </BaseButton>
    <Teleport to="#phone-screen">
      <Transition name="jornada-sheet">
        <div v-if="abierta" class="absolute inset-0 z-[100] bg-black/45 flex items-end" @click.self="cancelar" @keydown="manejarTeclado">
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Retirar producto"
            :aria-busy="procesando"
            class="jornada-panel bg-white rounded-t-3xl w-full max-h-[90%] overflow-y-auto px-5 pt-3 pb-8 shadow-2xl"
            style="padding-bottom: max(2rem, env(safe-area-inset-bottom))"
          >
            <div aria-hidden="true" class="w-10 h-1 rounded-full bg-[#D8CFC4] mx-auto mb-5"></div>
            <h2 class="font-display font-bold text-xl text-[#1C1108]">¿Retirar producto?</h2>
            <p class="font-semibold text-sm text-[#1C1108] mt-2 break-words">{{ seleccion.nombre }}</p>
            <p class="text-sm leading-relaxed text-[#7A6558] mt-3">
              Se retirará este producto de «{{ seleccion.jornada }}». Se conservarán las ventas registradas y el historial de la asignación. Puede volver a asignarlo después.
            </p>
            <p v-if="error" role="alert" class="bg-red-50 text-red-700 rounded-xl p-3 text-sm mt-4">{{ error }}</p>
            <div class="flex flex-col gap-3 mt-6">
              <button ref="confirmarBoton" type="button" :disabled="procesando" @click="confirmarCambio" class="w-full min-h-12 rounded-xl px-4 py-3 font-semibold text-white bg-[#C23B22] disabled:opacity-50">
                {{ procesando ? 'Retirando...' : 'Sí, retirar producto' }}
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
