<script setup>
import { computed, onMounted, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { listarEmpresas } from '../services/empresaService.js'
import { listarProductosEmpresa } from '../services/productoService.js'
import { obtenerJornada, obtenerProductosJornada, asignarProductosJornada } from '../services/jornadaService.js'

const props = defineProps({ idJornada: { type: [Number, String], required: true } })
const emit = defineEmits(['navigate'])
const jornada = ref(null)
const productos = ref([])
const empresas = ref([])
const idEmpresa = ref('')
const cargandoProductos = ref(false)
const errorProductos = ref('')
let solicitudProductos = 0
const asignados = ref([])
const seleccionados = ref([])
const busqueda = ref('')
const loading = ref(true)
const guardando = ref(false)
const errorCarga = ref('')
const errorGuardado = ref('')
const idsAsignados = computed(() => new Set(asignados.value
  .filter(asignacion => asignacion.estado === true)
  .map(asignacion => Number(asignacion.producto.id))))
const productosVisibles = computed(() => {
  const texto = busqueda.value.trim().toLocaleLowerCase('es')
  return productos.value.filter(producto =>
    producto.nombre.toLocaleLowerCase('es').includes(texto)
  )
})

const disponiblesVisibles = computed(() => productosVisibles.value
  .filter(p => !idsAsignados.value.has(Number(p.id))))
const todosVisiblesSeleccionados = computed(() => disponiblesVisibles.value.length > 0 &&
  disponiblesVisibles.value.every(p => seleccionados.value.includes(Number(p.id))))
function seleccionarVisibles(marcar) {
  if (guardando.value || cargandoProductos.value) return
  const visibles = new Set(disponiblesVisibles.value.map(p => Number(p.id)))
  seleccionados.value = marcar
    ? [...new Set([...seleccionados.value, ...visibles])]
    : seleccionados.value.filter(id => !visibles.has(id))
}
function limpiarSeleccion() {
  if (!guardando.value) seleccionados.value = []
}

function volver() {
  if (!guardando.value) emit('navigate', 'session-detail', { idJornada: props.idJornada })
}

async function cargarDatos() {
  loading.value = true
  errorCarga.value = ''
  errorGuardado.value = ''
  jornada.value = null
  seleccionados.value = []
  idEmpresa.value = ''
  productos.value = []
  try {
    const respuesta = await obtenerJornada(props.idJornada)
    if (!respuesta.jornada) throw new Error('No se encontró la jornada.')
    jornada.value = respuesta.jornada
    if (!jornada.value.estado) return
    const [respuestaEmpresas, respuestaAsignados] = await Promise.all([
      listarEmpresas(), obtenerProductosJornada(props.idJornada)
    ])
    if (!Array.isArray(respuestaEmpresas.empresas) || !Array.isArray(respuestaAsignados.productos)) {
      throw new Error('No se pudo obtener el listado de empresas y asignaciones.')
    }
    empresas.value = respuestaEmpresas.empresas.filter(empresa => empresa.estado === true)
    asignados.value = respuestaAsignados.productos
  } catch (err) {
    errorCarga.value = err.message || 'No se pudieron cargar los productos.'
  } finally {
    loading.value = false
  }
}

async function cargarProductos() {
  const solicitud = ++solicitudProductos
  seleccionados.value = []
  productos.value = []
  busqueda.value = ''
  errorProductos.value = ''
  errorGuardado.value = ''
  cargandoProductos.value = false
  const empresa = Number(idEmpresa.value)
  if (!empresas.value.some(item => Number(item.id) === empresa)) return
  cargandoProductos.value = true
  try {
    const respuesta = await listarProductosEmpresa(empresa)
    if (solicitud !== solicitudProductos) return
    if (!Array.isArray(respuesta.productos)) throw new Error('No se pudo obtener el listado de productos.')
    productos.value = respuesta.productos.filter(producto =>
      producto.estado === true && Number(producto.empresa.id) === empresa
    )
  } catch (err) {
    if (solicitud === solicitudProductos) errorProductos.value = err.message || 'No se pudieron cargar los productos.'
  } finally {
    if (solicitud === solicitudProductos) cargandoProductos.value = false
  }
}

function precio(valor) {
  return Number(valor).toFixed(2)
}

async function guardar() {
  if (guardando.value || loading.value || cargandoProductos.value || errorCarga.value || errorProductos.value || !jornada.value?.estado) return
  if (!empresas.value.some(empresa => Number(empresa.id) === Number(idEmpresa.value))) return
  errorGuardado.value = ''
  const idsActivos = new Set(productos.value.filter(producto => producto.estado === true && Number(producto.empresa.id) === Number(idEmpresa.value)).map(producto => Number(producto.id)))
  const ids = [...new Set(seleccionados.value.map(Number))]
    .filter(id => idsActivos.has(id) && !idsAsignados.value.has(id))
  if (!ids.length) {
    errorGuardado.value = 'Seleccione al menos un producto para asignar.'
    return
  }
  guardando.value = true
  try {
    await asignarProductosJornada(props.idJornada, Number(idEmpresa.value), ids)
    // El detalle consulta nuevamente las asignaciones guardadas en el servidor.
    emit('navigate', 'session-detail', { idJornada: props.idJornada })
  } catch (err) {
    errorGuardado.value = err.message || 'No se pudieron asignar los productos.'
  } finally {
    guardando.value = false
  }
}

onMounted(cargarDatos)
</script>

<template>
  <div class="h-full flex flex-col">
    <AppHeader title="Asignar productos" show-back @back="volver" />
    <div class="flex-1 overflow-y-auto p-4">
      <p v-if="loading" class="text-center text-sm text-[#7A6558] py-12">Cargando empresas...</p>
      <div v-else-if="errorCarga" role="alert" class="bg-red-50 text-red-700 rounded-xl p-4 text-sm">
        <p>{{ errorCarga }}</p>
        <BaseButton size="sm" class="mt-3" @click="cargarDatos">Reintentar</BaseButton>
      </div>
      <div v-else-if="jornada && !jornada.estado" class="bg-white border border-[#D8CFC4] rounded-2xl p-4 text-sm">
        <p>No se pueden asignar productos a una jornada finalizada.</p>
        <BaseButton size="sm" variant="outline" class="mt-3" @click="volver">Volver al detalle</BaseButton>
      </div>
      <form v-else-if="jornada" @submit.prevent="guardar">
        <div class="bg-[#2A6049] text-white rounded-2xl p-4 mb-4">
          <p class="font-semibold break-words">{{ jornada.nombre }}</p>
          <p class="text-sm text-white/80 mt-2">Seleccione una empresa, marque varios productos y asígnelos juntos con un solo botón.</p>
        </div>
        <fieldset :disabled="guardando" class="min-w-0">
          <label class="block mb-4">
            <span class="text-sm font-semibold">Empresa</span>
            <select v-model="idEmpresa" @change="cargarProductos" class="w-full h-12 border border-[#D8CFC4] rounded-xl bg-white px-3 mt-1">
              <option value="">Seleccione una empresa</option>
              <option v-for="empresa in empresas" :key="empresa.id" :value="empresa.id">{{ empresa.nombre }}</option>
            </select>
          </label>
          <p v-if="!empresas.length" class="text-sm text-[#7A6558] py-6">No hay empresas activas disponibles.</p>
          <p v-if="cargandoProductos" role="status" class="text-sm text-[#7A6558] py-6">Cargando productos...</p>
          <div v-else-if="errorProductos" role="alert" class="bg-red-50 text-red-700 rounded-xl p-3 text-sm">
            <p>{{ errorProductos }}</p>
            <BaseButton type="button" size="sm" class="mt-3" @click="cargarProductos">Reintentar</BaseButton>
          </div>
          <div v-else-if="idEmpresa">
          <label class="block mb-4">
            <span class="text-sm font-semibold">Buscar producto</span>
            <input v-model="busqueda" type="search" placeholder="Nombre del producto" class="w-full h-11 border border-[#D8CFC4] rounded-xl bg-white px-3 mt-1" />
          </label>
          <p v-if="productos.length === 0" class="text-sm text-[#7A6558] py-6">No hay productos activos disponibles.</p>
          <p v-else-if="productosVisibles.length === 0" class="text-sm text-[#7A6558] py-6">No se encontraron productos con esa búsqueda.</p>
          <div v-if="productos.length" class="bg-[#E6F5EF] rounded-xl p-3 mb-3">
            <label class="flex items-center gap-3 min-h-12 text-sm font-semibold">
              <input type="checkbox" :checked="todosVisiblesSeleccionados"
                :indeterminate="!todosVisiblesSeleccionados && disponiblesVisibles.some(p => seleccionados.includes(Number(p.id)))"
                :disabled="!disponiblesVisibles.length"
                @change="seleccionarVisibles($event.target.checked)"
                class="w-5 h-5 shrink-0 accent-[#2A6049]" />
              Seleccionar todos los visibles ({{ disponiblesVisibles.length }})
            </label>
            <p class="text-xs text-[#7A6558] mt-1">La búsqueda no borra los productos que ya marcaste. Al cambiar de empresa se limpia la selección.</p>
            <div class="flex items-center justify-between gap-2 mt-2">
              <p role="status" class="text-sm font-semibold">{{ seleccionados.length }} seleccionados</p>
              <BaseButton type="button" size="sm" variant="ghost" :disabled="!seleccionados.length" @click="limpiarSeleccion">Limpiar selección</BaseButton>
            </div>
          </div>
          <div class="space-y-3">
            <label v-for="producto in productosVisibles" :key="producto.id" class="flex items-center gap-3 bg-white border border-[#D8CFC4] rounded-2xl p-4 min-h-16">
              <input v-if="idsAsignados.has(Number(producto.id))" type="checkbox" checked disabled class="w-5 h-5 shrink-0 accent-[#2A6049]" />
              <input v-else v-model="seleccionados" type="checkbox" :value="Number(producto.id)" class="w-5 h-5 shrink-0 accent-[#2A6049]" />
              <span class="flex-1 min-w-0">
                <span class="block font-semibold text-sm break-words">{{ producto.nombre }}</span>
                <span class="block text-xs text-[#7A6558] mt-1">Stock actual: {{ producto.cantidad }} · Bs {{ precio(producto.precio_final) }}</span>
                <span v-if="idsAsignados.has(Number(producto.id))" class="inline-block text-xs text-[#1E6B47] bg-[#E6F5EF] rounded-full px-2 py-1 mt-2">Ya asignado</span>
              </span>
            </label>
          </div>
          <p class="text-xs text-[#7A6558] mt-4">Seleccionados para asignar: {{ seleccionados.length }}. Los productos ya asignados se mantienen.</p>
          </div>
          <p v-if="errorGuardado" role="alert" class="bg-red-50 text-red-700 rounded-xl p-3 text-sm mt-4">{{ errorGuardado }}</p>
          <div class="flex flex-col gap-3 mt-5 pb-4">
            <BaseButton type="submit" full :loading="guardando" :disabled="!seleccionados.length || cargandoProductos || !!errorProductos">{{ guardando ? 'Asignando...' : 'Asignar ' + seleccionados.length + (seleccionados.length === 1 ? ' producto' : ' productos') }}</BaseButton>
            <BaseButton type="button" full variant="secondary" :disabled="guardando" @click="volver">Cancelar</BaseButton>
          </div>
        </fieldset>
      </form>
    </div>
  </div>
</template>
