<script setup>
import { computed, onMounted, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'


import { listarMetodosPago } from '../services/metodoPagoService.js'
import { listarJornadasCaja, listarCatalogoCaja, registrarVentaCaja } from '../services/ventaService.js'

const props = defineProps({ idJornada: { type: [Number, String], default: null } })
const emit = defineEmits(['navigate', 'busy'])
const jornadas = ref([])
const metodos = ref([])
const productos = ref([])
const idJornada = ref('')
const idMetodo = ref('')
const cantidades = ref({})
const descuentos = ref({})
const precioVenta = p => (Math.round(Number(p.precio_u) * 100) - (descuentos.value[p.id] ? Math.round(Number(p.rebaja || 0) * 100) : 0)) / 100
const busqueda = ref('')
const filtroEmpresa = ref('')
const recibido = ref('')
const empresasCatalogo = computed(() => [...new Map(productos.value.map(p => [p.empresa.id, p.empresa])).values()])
const cambio = computed(() => Math.round((Number(recibido.value) - total.value) * 100) / 100)
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
const jornada = computed(() => jornadas.value.find(e => Number(e.id) === Number(idJornada.value)))
const metodo = computed(() => metodos.value.find(m => Number(m.id) === Number(idMetodo.value)))
const visibles = computed(() => productos.value.filter(p => (!filtroEmpresa.value || Number(p.empresa.id) === Number(filtroEmpresa.value)) && (String(p.id) === busqueda.value.trim() || (p.nombre + ' ' + p.empresa.nombre).toLocaleLowerCase('es').includes(busqueda.value.trim().toLocaleLowerCase('es')))))
const seleccionados = computed(() => productos.value.filter(p => cantidades.value[p.id] !== undefined))
const total = computed(() => seleccionados.value.reduce((suma, p) =>
  suma + Math.round(precioVenta(p) * 100) * (Number(cantidades.value[p.id]) || 0), 0) / 100)
const dinero = valor => Number(valor).toFixed(2)

async function cargar() {
  loading.value = true
  errorCarga.value = ''
  try {
    const [e, m] = await Promise.all([listarJornadasCaja(), listarMetodosPago()])
    if (!Array.isArray(e.jornadas) || !Array.isArray(m.metodos_pago)) throw new Error('No se pudieron cargar las jornadas y los métodos de pago.')
    jornadas.value = e.jornadas
    metodos.value = m.metodos_pago.filter(item => item.estado === true)
    const inicial = jornadas.value.find(item => Number(item.id) === Number(props.idJornada))
    if (inicial || jornadas.value.length === 1) {
      idJornada.value = (inicial || jornadas.value[0]).id
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
  descuentos.value = {}
  busqueda.value = ''
  filtroEmpresa.value = ''
  recibido.value = ''
  errorProductos.value = ''
  error.value = ''
  paso.value = 'seleccion'
  cargandoProductos.value = false
  if (!jornada.value) return
  const id = Number(idJornada.value)
  cargandoProductos.value = true
  try {
    const respuesta = await listarCatalogoCaja(id)
    if (actual !== solicitud) return
    if (!Array.isArray(respuesta.productos)) throw new Error('No se pudieron obtener los productos.')
    productos.value = respuesta.productos
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
  if (!jornada.value || !metodo.value || cargandoProductos.value || errorProductos.value || !seleccionados.value.length) {
    error.value = 'Seleccione una jornada, un método de pago y al menos un producto.'
    return false
  }
  for (const p of seleccionados.value) {
    const cantidad = Number(cantidades.value[p.id])
    if (!Number.isSafeInteger(cantidad) || cantidad <= 0 || cantidad > Number(p.cantidad)) {
      error.value = `Revise la cantidad de «${p.nombre}». Debe ser entera, mayor a cero y no superar el stock.`
      return false
    }
  }
  if (recibido.value !== '' && (!Number.isFinite(Number(recibido.value)) || cambio.value < 0)) {
    error.value = 'El importe recibido debe cubrir el total.'
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
      id_jornada_cajero: jornada.value.id_jornada_cajero,
      total_esperado: total.value,
      detalles: seleccionados.value.map(p => ({ id_jornada_producto: Number(p.id_jornada_producto), cantidad: Number(cantidades.value[p.id]), aplicar_descuento: !!descuentos.value[p.id] }))
    }
    const respuesta = await registrarVentaCaja(datos)
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
  await cargarProductos()
}
function volver() {
  if (guardando.value) return
  if (paso.value === 'resumen' && !resultadoIncierto.value) {
    paso.value = 'seleccion'
    error.value = ''
    return
  }
  emit('navigate', 'home')
}
onMounted(cargar)
</script>

<template>
  <div class="h-full flex flex-col">
    <AppHeader title="Caja de jornada" show-back @back="volver" />
    <div class="flex-1 overflow-y-auto p-4">
      <p v-if="loading" role="status" class="text-sm text-center text-[#7A6558] py-12">Cargando datos...</p>
      <div v-else-if="errorCarga" role="alert" class="bg-red-50 text-red-700 rounded-xl p-4 text-sm">
        <p>{{ errorCarga }}</p><BaseButton class="mt-3" @click="cargar">Reintentar</BaseButton>
      </div>
      <section v-else-if="paso === 'exito'" class="bg-white border border-[#D8CFC4] rounded-2xl p-5">
        <h2 class="font-semibold text-xl text-[#2A6049]" role="status">Venta registrada</h2>
        <p class="font-semibold mt-4 break-words">{{ jornada?.nombre }}</p>
        <p class="text-sm mt-2">Pago: {{ venta.metodo_pago.nombre }}</p>
        <p class="text-2xl font-semibold mt-4">Total: Bs {{ dinero(venta.total) }}</p>
        <p class="text-sm text-[#7A6558] mt-3">Se actualizaron las existencias de los productos vendidos.</p>
        <BaseButton full class="mt-5" @click="otraVenta">Registrar otra venta</BaseButton>
        <BaseButton full variant="outline" class="mt-3" @click="emit('navigate', 'sales-list')">Ver mis ventas</BaseButton>
      </section>
      <template v-else>
        <p v-if="!jornadas.length" class="bg-white rounded-xl p-4 text-sm">No tienes una asignación activa en una jornada abierta. Consulta con el administrador.</p>
        <p v-else-if="!metodos.length" class="bg-white rounded-xl p-4 text-sm">No hay métodos de pago activos. Consulta con el administrador.</p>
        <form v-else @submit.prevent="paso === 'seleccion' ? revisar() : guardar()">
          <fieldset :disabled="guardando || resultadoIncierto" class="min-w-0 space-y-4">
            <template v-if="paso === 'seleccion'">
              <label class="block text-sm font-semibold">Jornada asignada
                <select v-model="idJornada" @change="cargarProductos" required class="sale-input">
                  <option value="">Seleccione una jornada</option>
                  <option v-for="e in jornadas" :key="e.id" :value="e.id">{{ e.nombre }}</option>
                </select>
              </label>
              <p class="text-xs text-[#7A6558]">Puedes cobrar productos de varias empresas en una sola venta. Al cambiar de jornada se limpia la selección.</p>
              <p v-if="cargandoProductos" role="status" class="text-sm text-[#7A6558] py-4">Cargando productos...</p>
              <div v-else-if="errorProductos" role="alert" class="bg-red-50 text-red-700 rounded-xl p-3 text-sm">
                <p>{{ errorProductos }}</p><BaseButton type="button" class="mt-3" @click="cargarProductos">Reintentar</BaseButton>
              </div>
              <template v-else-if="jornada">
                <p class="text-sm text-[#7A6558]">{{ jornada.direccion }} · {{ jornada.fecha_inicio }} al {{ jornada.fecha_fin }}</p>
                <label class="block text-sm font-semibold">Empresa
                  <select v-model="filtroEmpresa" class="sale-input">
                    <option value="">Todas las empresas</option>
                    <option v-for="e in empresasCatalogo" :key="e.id" :value="e.id">{{ e.nombre }}</option>
                  </select>
                </label>
                <label class="block text-sm font-semibold">Buscar producto
                  <input v-model="busqueda" type="search" placeholder="Nombre o código del producto" class="sale-input" />
                </label>
                <p v-if="!productos.length" class="text-sm text-[#7A6558]">Esta jornada no tiene productos habilitados para vender.</p>
                <p v-else-if="!visibles.length" class="text-sm text-[#7A6558]">No hay productos que coincidan con la búsqueda.</p>
                <article v-for="p in visibles" :key="p.id" class="bg-white border border-[#D8CFC4] rounded-2xl p-4">
                  <label class="flex gap-3 items-center min-h-12">
                    <input type="checkbox" :checked="cantidades[p.id] !== undefined" :disabled="p.cantidad <= 0" @change="seleccionar(p, $event.target.checked)" class="w-5 h-5 shrink-0 accent-[#2A6049]" />
                    <span class="min-w-0">
                      <span class="block font-semibold text-sm break-words">{{ p.nombre }}</span>
                      <span class="block text-xs text-[#2A6049]">{{ p.empresa.nombre }}</span>
                      <span class="block text-xs text-[#7A6558] mt-1">Bs {{ dinero(precioVenta(p)) }} · {{ p.cantidad > 0 ? 'Stock: ' + p.cantidad : 'Sin stock' }}</span>
                    </span>
                  </label>
                  <label v-if="cantidades[p.id] !== undefined && Number(p.rebaja) > 0" class="flex items-center gap-3 text-sm mt-3 min-h-12">
                    <input v-model="descuentos[p.id]" type="checkbox" class="w-5 h-5 accent-[#2A6049]" />
                    Aplicar descuento de Bs {{ dinero(p.rebaja) }} por unidad
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
              <p class="font-semibold">Total estimado: Bs {{ dinero(total) }}</p>
              <BaseButton full type="submit" :disabled="cargandoProductos || !seleccionados.length">Revisar venta</BaseButton>
            </template>
            <section v-else class="bg-white border border-[#D8CFC4] rounded-2xl p-5">
              <h2 class="font-semibold text-lg">Confirmar venta</h2>
              <p class="font-semibold text-[#2A6049] mt-3 break-words">{{ jornada?.nombre }}</p>
              <ul class="divide-y divide-[#D8CFC4] mt-3">
                <li v-for="p in seleccionados" :key="p.id" class="py-3 text-sm">
                  <p class="font-semibold break-words">{{ p.nombre }}</p><p class="text-xs text-[#2A6049]">{{ p.empresa.nombre }}</p>
                  <p class="text-xs">{{ descuentos[p.id] ? "Con descuento de Bs " + dinero(p.rebaja) + " por unidad" : "Sin descuento" }}</p>
                  <p>{{ cantidades[p.id] }} × Bs {{ dinero(precioVenta(p)) }} = Bs {{ dinero(Number(cantidades[p.id]) * precioVenta(p)) }}</p>
                </li>
              </ul>
              <p class="text-sm mt-3">Pago: {{ metodo?.nombre }}</p>

              <p class="font-semibold text-xl mt-4">Total estimado: Bs {{ dinero(total) }}</p>
              <p class="text-xs text-[#7A6558] mt-2">Verifica que el pago fue recibido antes de confirmar. Se registrará la venta y se descontará el stock; esta pantalla no procesa pagos bancarios.</p>

              <label class="block text-sm mt-4">Importe recibido (opcional, para calcular cambio)
                <input v-model="recibido" type="number" min="0" step="0.01" inputmode="decimal" class="sale-input" />
              </label>
              <p v-if="recibido !== '' && Number.isFinite(cambio)" class="text-sm mt-2">{{ cambio >= 0 ? 'Cambio: Bs ' + dinero(cambio) : 'Falta: Bs ' + dinero(-cambio) }}</p>
              <p class="text-xs text-[#7A6558] mt-1">El importe recibido y el cambio son una ayuda de cálculo; no se guardan.</p>
              <BaseButton full class="mt-5" type="submit" :loading="guardando">{{ guardando ? 'Registrando...' : 'Pago recibido: registrar venta' }}</BaseButton>
              <BaseButton full class="mt-3" type="button" variant="secondary" @click="volver">Volver a editar</BaseButton>
            </section>
          </fieldset>
          <BaseButton v-if="error && !resultadoIncierto" full type="button" variant="outline" class="mt-3" :disabled="guardando" @click="cargarProductos">Actualizar productos y volver a seleccionar</BaseButton>
          <BaseButton v-if="resultadoIncierto" full type="button" variant="outline" class="mt-3" @click="emit('navigate', 'sales-list')">Comprobar mis ventas</BaseButton>
          <p v-if="error" role="alert" class="bg-red-50 text-red-700 rounded-xl p-3 mt-4 text-sm">{{ error }}</p>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped>
.sale-input { display: block; width: 100%; min-width: 0; min-height: 3rem; margin-top: .25rem; border: 1px solid #D8CFC4; border-radius: .75rem; padding: .5rem .75rem; background: white; }
</style>
