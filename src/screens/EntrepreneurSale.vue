<script setup>
import { computed, onMounted, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { listarMisEmpresas } from '../services/empresaService.js'
import { listarMiInventario } from '../services/productoService.js'
import { listarMetodosPago } from '../services/metodoPagoService.js'
import { registrarVentaIndependiente } from '../services/ventaService.js'

const props = defineProps({ idEmpresa: { type: [Number, String], default: null } })
const emit = defineEmits(['navigate', 'busy'])
const empresas = ref([])
const metodos = ref([])
const productos = ref([])
const idEmpresa = ref('')
const idMetodo = ref('')
const cantidades = ref({})
const busqueda = ref('')
const fecha = ref('')
const loading = ref(true)
const cargandoProductos = ref(false)
const guardando = ref(false)
const errorCarga = ref('')
const errorProductos = ref('')
const error = ref('')
const paso = ref('seleccion')
const venta = ref(null)
const resultadoIncierto = ref(false)
let solicitud = 0
const empresa = computed(() => empresas.value.find(e => Number(e.id) === Number(idEmpresa.value)))
const metodo = computed(() => metodos.value.find(m => Number(m.id) === Number(idMetodo.value)))
const visibles = computed(() => productos.value.filter(p => p.nombre.toLocaleLowerCase('es').includes(busqueda.value.trim().toLocaleLowerCase('es'))))
const seleccionados = computed(() => productos.value.filter(p => cantidades.value[p.id] !== undefined))
const total = computed(() => seleccionados.value.reduce((suma, p) =>
  suma + Math.round(Number(p.precio_final) * 100) * (Number(cantidades.value[p.id]) || 0), 0) / 100)
const dinero = valor => Number(valor).toFixed(2)

async function cargar() {
  loading.value = true
  errorCarga.value = ''
  try {
    const [e, m] = await Promise.all([listarMisEmpresas(), listarMetodosPago()])
    if (!Array.isArray(e.empresas) || !Array.isArray(m.metodos_pago)) throw new Error('No se pudieron cargar las empresas y los métodos de pago.')
    empresas.value = e.empresas.filter(item => item.estado === true)
    metodos.value = m.metodos_pago.filter(item => item.estado === true)
    const inicial = empresas.value.find(item => Number(item.id) === Number(props.idEmpresa))
    if (inicial || empresas.value.length === 1) {
      idEmpresa.value = (inicial || empresas.value[0]).id
      await cargarProductos()
    }
  } catch (err) {
    errorCarga.value = err.message || 'No se pudieron cargar los datos.'
  } finally {
    loading.value = false
  }
}
async function cargarProductos() {
  const actual = ++solicitud
  productos.value = []
  cantidades.value = {}
  busqueda.value = ''
  errorProductos.value = ''
  error.value = ''
  paso.value = 'seleccion'
  cargandoProductos.value = false
  if (!empresa.value) return
  const id = Number(idEmpresa.value)
  cargandoProductos.value = true
  try {
    const respuesta = await listarMiInventario(id)
    if (actual !== solicitud) return
    if (!Array.isArray(respuesta.productos)) throw new Error('No se pudieron obtener los productos.')
    productos.value = respuesta.productos.filter(p => p.estado === true && Number(p.empresa.id) === id)
  } catch (err) {
    if (actual === solicitud) errorProductos.value = err.message || 'No se pudieron cargar los productos.'
  } finally {
    if (actual === solicitud) cargandoProductos.value = false
  }
}
function seleccionar(p, checked) {
  if (guardando.value || resultadoIncierto.value || p.cantidad <= 0) return
  if (checked) cantidades.value[p.id] = 1
  else delete cantidades.value[p.id]
}
function validar() {
  error.value = ''
  if (!empresa.value || !metodo.value || cargandoProductos.value || errorProductos.value || !seleccionados.value.length) {
    error.value = 'Seleccione una empresa, un método de pago y al menos un producto.'
    return false
  }
  for (const p of seleccionados.value) {
    const cantidad = Number(cantidades.value[p.id])
    if (!Number.isSafeInteger(cantidad) || cantidad <= 0 || cantidad > Number(p.cantidad)) {
      error.value = `Revise la cantidad de «${p.nombre}». Debe ser entera, mayor a cero y no superar el stock.`
      return false
    }
  }
  if (fecha.value && !Number.isFinite(new Date(fecha.value).getTime())) {
    error.value = 'Ingrese una fecha de venta válida.'
    return false
  }
  return true
}
function revisar() {
  if (guardando.value || resultadoIncierto.value || !validar()) return
  paso.value = 'resumen'
}
async function guardar() {
  if (guardando.value || resultadoIncierto.value || venta.value || paso.value !== 'resumen' || !validar()) return
  guardando.value = true
  emit('busy', true)
  try {
    const datos = {
      id_metodo_pago: Number(idMetodo.value),
      detalles: seleccionados.value.map(p => ({ id_producto: Number(p.id), cantidad: Number(cantidades.value[p.id]) }))
    }
    if (fecha.value) datos.fecha = fecha.value
    const respuesta = await registrarVentaIndependiente(datos)
    if (!respuesta.venta?.id) throw new Error('Respuesta de registro incompleta.')
    venta.value = respuesta.venta
    paso.value = 'exito'
  } catch (err) {
    // Sin respuesta HTTP no sabemos si el servidor alcanzó a guardar.
    resultadoIncierto.value = !err.status || err.status >= 500
    error.value = resultadoIncierto.value
      ? 'No se pudo confirmar el resultado del registro. Comprueba si la venta quedó guardada antes de volver a registrarla.'
      : err.message || 'No se pudo registrar la venta.'
  } finally {
    guardando.value = false
    emit('busy', false)
  }
}
async function otraVenta() {
  if (guardando.value) return
  venta.value = null
  idMetodo.value = ''
  fecha.value = ''
  await cargarProductos()
}
function volver() {
  if (guardando.value) return
  if (paso.value === 'resumen' && !resultadoIncierto.value) {
    paso.value = 'seleccion'
    error.value = ''
    return
  }
  if (props.idEmpresa) emit('navigate', 'my-business-detail', { idEmpresa: props.idEmpresa })
  else emit('navigate', 'home')
}
onMounted(cargar)
</script>

<template>
  <div class="h-full flex flex-col">
    <AppHeader title="Registrar venta" show-back @back="volver" />
    <div class="flex-1 overflow-y-auto p-4">
      <p v-if="loading" role="status" class="text-sm text-center text-[#7A6558] py-12">Cargando datos...</p>
      <div v-else-if="errorCarga" role="alert" class="bg-red-50 text-red-700 rounded-xl p-4 text-sm">
        <p>{{ errorCarga }}</p><BaseButton class="mt-3" @click="cargar">Reintentar</BaseButton>
      </div>
      <section v-else-if="paso === 'exito'" class="bg-white border border-[#D8CFC4] rounded-2xl p-5">
        <h2 class="font-semibold text-xl text-[#2A6049]" role="status">Venta registrada</h2>
        <p class="font-semibold mt-4 break-words">{{ empresa?.nombre }}</p>
        <p class="text-sm mt-2">Pago: {{ venta.metodo_pago.nombre }}</p>
        <p class="text-2xl font-semibold mt-4">Total: Bs {{ dinero(venta.total) }}</p>
        <p class="text-sm text-[#7A6558] mt-3">Se actualizaron las existencias de los productos vendidos.</p>
        <BaseButton full class="mt-5" @click="otraVenta">Registrar otra venta</BaseButton>
        <BaseButton full variant="outline" class="mt-3" @click="emit('navigate', 'my-business-metrics', { idEmpresa: idEmpresa })">Ver métricas</BaseButton>
        <BaseButton full variant="outline" class="mt-3" @click="emit('navigate', 'my-inventory', { idEmpresa: idEmpresa })">Ver inventario</BaseButton>
      </section>
      <template v-else>
        <p v-if="!empresas.length" class="bg-white rounded-xl p-4 text-sm">No tienes empresas activas vinculadas para registrar ventas.</p>
        <p v-else-if="!metodos.length" class="bg-white rounded-xl p-4 text-sm">No hay métodos de pago activos. Consulta con el administrador.</p>
        <form v-else @submit.prevent="paso === 'seleccion' ? revisar() : guardar()">
          <fieldset :disabled="guardando || resultadoIncierto" class="min-w-0 space-y-4">
            <template v-if="paso === 'seleccion'">
              <label class="block text-sm font-semibold">Emprendimiento
                <select v-model="idEmpresa" @change="cargarProductos" required class="sale-input">
                  <option value="">Seleccione una empresa</option>
                  <option v-for="e in empresas" :key="e.id" :value="e.id">{{ e.nombre }}</option>
                </select>
              </label>
              <p class="text-xs text-[#7A6558]">Al cambiar de empresa se limpia la selección de productos.</p>
              <p v-if="cargandoProductos" role="status" class="text-sm text-[#7A6558] py-4">Cargando productos...</p>
              <div v-else-if="errorProductos" role="alert" class="bg-red-50 text-red-700 rounded-xl p-3 text-sm">
                <p>{{ errorProductos }}</p><BaseButton type="button" class="mt-3" @click="cargarProductos">Reintentar</BaseButton>
              </div>
              <template v-else-if="empresa">
                <label class="block text-sm font-semibold">Buscar producto
                  <input v-model="busqueda" type="search" placeholder="Nombre del producto" class="sale-input" />
                </label>
                <p v-if="!productos.length" class="text-sm text-[#7A6558]">Esta empresa no tiene productos activos.</p>
                <p v-else-if="!visibles.length" class="text-sm text-[#7A6558]">No hay productos que coincidan con la búsqueda.</p>
                <article v-for="p in visibles" :key="p.id" class="bg-white border border-[#D8CFC4] rounded-2xl p-4">
                  <label class="flex gap-3 items-center min-h-12">
                    <input type="checkbox" :checked="cantidades[p.id] !== undefined" :disabled="p.cantidad <= 0" @change="seleccionar(p, $event.target.checked)" class="w-5 h-5 shrink-0 accent-[#2A6049]" />
                    <span class="min-w-0">
                      <span class="block font-semibold text-sm break-words">{{ p.nombre }}</span>
                      <span class="block text-xs text-[#7A6558] mt-1">Bs {{ dinero(p.precio_final) }} · {{ p.cantidad > 0 ? 'Stock: ' + p.cantidad : 'Sin stock' }}</span>
                    </span>
                  </label>
                  <label v-if="cantidades[p.id] !== undefined" class="block text-sm mt-3">Cantidad
                    <input v-model="cantidades[p.id]" required type="number" min="1" :max="p.cantidad" step="1" inputmode="numeric" class="sale-input" />
                  </label>
                </article>
              </template>
              <label class="block text-sm font-semibold">Método de pago
                <select v-model="idMetodo" required class="sale-input">
                  <option value="">Seleccione un método</option>
                  <option v-for="m in metodos" :key="m.id" :value="m.id">{{ m.nombre }}</option>
                </select>
              </label>
              <label class="block text-sm font-semibold">Fecha de venta (opcional)
                <input v-model="fecha" type="datetime-local" class="sale-input" />
                <span class="block text-xs font-normal text-[#7A6558] mt-1">Déjala vacía para registrar la venta con la fecha y hora actuales.</span>
              </label>
              <p class="font-semibold">Total estimado: Bs {{ dinero(total) }}</p>
              <BaseButton full type="submit" :disabled="cargandoProductos || !seleccionados.length">Revisar venta</BaseButton>
            </template>
            <section v-else class="bg-white border border-[#D8CFC4] rounded-2xl p-5">
              <h2 class="font-semibold text-lg">Confirmar venta</h2>
              <p class="font-semibold text-[#2A6049] mt-3 break-words">{{ empresa?.nombre }}</p>
              <ul class="divide-y divide-[#D8CFC4] mt-3">
                <li v-for="p in seleccionados" :key="p.id" class="py-3 text-sm">
                  <p class="font-semibold break-words">{{ p.nombre }}</p>
                  <p>{{ cantidades[p.id] }} × Bs {{ dinero(p.precio_final) }} = Bs {{ dinero(Number(cantidades[p.id]) * Number(p.precio_final)) }}</p>
                </li>
              </ul>
              <p class="text-sm mt-3">Pago: {{ metodo?.nombre }}</p>
              <p class="text-sm mt-2">Fecha: {{ fecha ? fecha.replace('T', ' ') : 'Al registrar' }}</p>
              <p class="font-semibold text-xl mt-4">Total estimado: Bs {{ dinero(total) }}</p>
              <p class="text-xs text-[#7A6558] mt-2">Al confirmar se aplicarán los precios vigentes y se descontarán las existencias.</p>
              <BaseButton full class="mt-5" type="submit" :loading="guardando">{{ guardando ? 'Registrando...' : 'Confirmar y registrar' }}</BaseButton>
              <BaseButton full class="mt-3" type="button" variant="secondary" @click="volver">Volver a editar</BaseButton>
            </section>
          </fieldset>
          <p v-if="error" role="alert" class="bg-red-50 text-red-700 rounded-xl p-3 mt-4 text-sm">{{ error }}</p>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped>
.sale-input { display: block; width: 100%; min-width: 0; min-height: 3rem; margin-top: .25rem; border: 1px solid #D8CFC4; border-radius: .75rem; padding: .5rem .75rem; background: white; }
</style>
