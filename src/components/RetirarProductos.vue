<script setup>
import { computed, ref } from 'vue'
import BaseButton from './ui/BaseButton.vue'
import { retirarProductoJornada } from '../services/jornadaService.js'
const props = defineProps({ jornada: Object, productos: Array })
const emit = defineEmits(['updated', 'busy'])
const seleccionados = ref([])
const confirmar = ref(false)
const ocupado = ref(false)
const resultado = ref('')
const activos = computed(() => props.productos.filter(p => p.estado))
const elegidos = computed(() => activos.value.filter(p => seleccionados.value.includes(Number(p.producto.id))))
const todos = computed(() => activos.value.length > 0 && elegidos.value.length === activos.value.length)
function marcarTodos(marcar) {
  seleccionados.value = marcar ? activos.value.map(p => Number(p.producto.id)) : []
}
async function retirar() {
  if (ocupado.value || !confirmar.value || !elegidos.value.length || !props.jornada.estado) return
  const lista = [...elegidos.value]
  ocupado.value = true
  emit('busy', true)
  resultado.value = ''
  const fallos = []
  let retirados = 0
  try {
    for (const item of lista) {
      try {
        await retirarProductoJornada(props.jornada.id, item.producto.id)
        retirados++
      } catch (err) {
        fallos.push(item.producto.nombre + ': ' + (err.message || 'No se pudo confirmar el retiro.'))
      }
    }
    resultado.value = retirados + ' de ' + lista.length + ' productos retirados.' +
      (fallos.length ? ' Revisa el listado actualizado antes de reintentar. ' + fallos.join(' · ') : '')
    seleccionados.value = []
    confirmar.value = false
  } finally {
    ocupado.value = false
    emit('busy', false)
    emit('updated')
  }
}
</script>
<template>
  <section>
    <p v-if="resultado" role="status" class="text-sm bg-[#F7F4F0] rounded-xl p-3 mb-3">{{ resultado }}</p>
    <fieldset :disabled="ocupado" class="min-w-0">
      <template v-if="jornada.estado && activos.length">
        <label class="flex items-center gap-3 min-h-12 text-sm font-semibold mb-2">
          <input type="checkbox" :checked="todos" :indeterminate="elegidos.length > 0 && !todos"
            :disabled="confirmar" @change="marcarTodos($event.target.checked)" class="w-5 h-5 accent-[#2A6049]" />
          Seleccionar todos los activos
        </label>
        <p class="text-xs text-[#7A6558] mb-3">Marca los productos que deseas retirar de esta jornada.</p>
      </template>
      <p v-if="!productos.length" class="text-sm text-[#7A6558] py-3">No existen productos asignados a esta jornada.</p>
      <div class="space-y-2">
        <label v-for="item in productos" :key="item.id_jornada_producto" class="flex gap-3 border border-[#D8CFC4] rounded-xl p-3 bg-[#FAF9F7]">
          <input v-if="jornada.estado && item.estado" v-model="seleccionados" type="checkbox" :value="Number(item.producto.id)"
            :disabled="confirmar" class="w-5 h-5 mt-1 shrink-0 accent-[#2A6049]" />
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-semibold break-words">{{ item.producto.nombre }}</span>
            <span class="block text-xs text-[#7A6558] mt-1">{{ item.estado ? 'Activo' : 'Retirado' }} · Stock: {{ item.producto.cantidad }} · Bs {{ Number(item.producto.precio_final).toFixed(2) }}</span>
          </span>
        </label>
      </div>
      <template v-if="jornada.estado && activos.length">
        <p class="text-sm font-semibold mt-3" role="status">{{ elegidos.length }} seleccionados</p>
        <BaseButton v-if="!confirmar" full variant="danger" class="mt-3" :disabled="!elegidos.length"
          @click="confirmar = true">Retirar seleccionados</BaseButton>
        <section v-else class="bg-red-50 rounded-xl p-4 mt-3" aria-label="Confirmar retiro de productos">
          <h3 class="font-semibold text-sm">¿Retirar {{ elegidos.length }} productos de esta jornada?</h3>
          <ul class="text-sm list-disc pl-5 mt-2 max-h-36 overflow-y-auto">
            <li v-for="item in elegidos" :key="item.producto.id">{{ item.producto.nombre }}</li>
          </ul>
          <p class="text-sm mt-3">Dejarán de estar disponibles para nuevas ventas en esta jornada. El inventario y las ventas registradas se conservan.</p>
          <BaseButton full variant="danger" class="mt-3" :loading="ocupado" @click="retirar">{{ ocupado ? 'Retirando...' : 'Confirmar retiro' }}</BaseButton>
          <BaseButton full variant="outline" class="mt-2" @click="confirmar = false">Cancelar</BaseButton>
        </section>
      </template>
    </fieldset>
  </section>
</template>
