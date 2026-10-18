<script setup>
import { computed, ref } from 'vue'
import BaseButton from './ui/BaseButton.vue'
import { ajustarStock } from '../services/productoService.js'
const props = defineProps({ producto: { type: Object, required: true } })
const emit = defineEmits(['updated', 'busy'])
const abierto = ref(false), confirmar = ref(false), cantidad = ref(''), modo = ref('entrada')
const ocupado = ref(false), error = ref(''), incierto = ref(false)
const ajuste = computed(() => Number(cantidad.value) * (modo.value === 'entrada' ? 1 : -1))
const previsto = computed(() => Number(props.producto.cantidad) + ajuste.value)
function revisar() {
  error.value = ''
  if (!Number.isSafeInteger(Number(cantidad.value)) || Number(cantidad.value) <= 0 ||
      !Number.isSafeInteger(previsto.value) || previsto.value < 0) {
    error.value = 'Indique una cantidad entera positiva que no deje el stock negativo.'
    return
  }
  confirmar.value = true
}
function cerrar() {
  if (ocupado.value) return
  abierto.value = false
  confirmar.value = false
  cantidad.value = ''
  error.value = ''
  incierto.value = false
}
async function guardar() {
  if (ocupado.value || incierto.value || !confirmar.value) return
  ocupado.value = true
  emit('busy', true)
  error.value = ''
  try {
    const r = await ajustarStock(props.producto.id, ajuste.value)
    if (!r.inventario) throw new Error('Respuesta inesperada.')
    cerrarTrasGuardar()
  } catch (err) {
    incierto.value = !err.status || err.status >= 500
    error.value = incierto.value
      ? 'No se pudo confirmar el resultado. Cierra y actualiza el producto antes de intentar otro ajuste.'
      : err.message
    if (!incierto.value) confirmar.value = false
  } finally {
    ocupado.value = false
    emit('busy', false)
  }
}
function cerrarTrasGuardar() {
  abierto.value = false
  confirmar.value = false
  cantidad.value = ''
  emit('updated')
}
function salir() {
  const recargar = incierto.value
  cerrar()
  if (recargar) emit('updated')
}
</script>
<template>
  <section class="mt-5 border-t border-[#D8CFC4] pt-4">
    <BaseButton v-if="!abierto" full variant="outline" @click="abierto = true">Reponer o ajustar stock</BaseButton>
    <form v-else @submit.prevent="confirmar ? guardar() : revisar()">
      <h3 class="font-semibold mb-3">Ajustar existencias</h3>
      <p class="text-sm mb-3">Stock actual: {{ producto.cantidad }}</p>
      <fieldset :disabled="ocupado || confirmar || incierto" class="space-y-3">
        <label class="block text-sm">Operación
          <select v-model="modo" class="w-full h-12 border rounded-xl px-3 mt-1 bg-white">
            <option value="entrada">Reponer unidades</option><option value="salida">Retirar unidades</option>
          </select>
        </label>
        <label class="block text-sm">Cantidad de unidades
          <input v-model="cantidad" type="number" inputmode="numeric" min="1" step="1" required class="w-full h-12 border rounded-xl px-3 mt-1" />
        </label>
      </fieldset>
      <div v-if="confirmar" role="status" class="bg-[#E6F5EF] rounded-xl p-3 my-3 text-sm">
        Confirma {{ modo === 'entrada' ? 'la entrada' : 'el retiro' }} de {{ cantidad }} unidades.
        Stock previsto: <strong>{{ previsto }}</strong>.
        <p class="mt-2">El stock final puede variar si se registran ventas al mismo tiempo.</p>
      </div>
      <p v-if="error" role="alert" class="text-red-700 text-sm my-3">{{ error }}</p>
      <BaseButton v-if="!incierto" full type="submit" :loading="ocupado" class="mt-3">{{ confirmar ? 'Confirmar ajuste' : 'Revisar ajuste' }}</BaseButton>
      <BaseButton full type="button" variant="ghost" :disabled="ocupado" class="mt-2" @click="salir">Cerrar</BaseButton>
    </form>
  </section>
</template>
