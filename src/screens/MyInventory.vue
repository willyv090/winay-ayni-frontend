<script setup>
import { computed, ref, watch } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import ProductoEstadoButton from '../components/ProductoEstadoButton.vue'
import { obtenerMiEmpresa } from '../services/empresaService.js'
import { listarMiInventario, obtenerMiProducto, crearProducto, editarProducto } from '../services/productoService.js'

const props = defineProps({ idEmpresa: { type: [Number, String], required: true } })
const emit = defineEmits(['navigate'])
const empresa = ref(null)
const productos = ref([])
const producto = ref(null)
const vista = ref('lista')
const loading = ref(true)
const guardando = ref(false)
const error = ref('')
const errorFormulario = ref('')
const aviso = ref('')
const busqueda = ref('')
const estado = ref('activos')
const formulario = ref({})
let solicitud = 0
const visibles = computed(() => productos.value.filter(p =>
  (estado.value === 'todos' || p.estado === (estado.value === 'activos')) &&
  p.nombre.toLocaleLowerCase('es').includes(busqueda.value.trim().toLocaleLowerCase('es'))
))
const dinero = valor => Number(valor).toFixed(2)
const fecha = valor => valor ? valor.split('-').reverse().join('/') : 'Sin fecha'
function volver() {
  if (guardando.value) return
  if (vista.value === 'lista') emit('navigate', 'my-business-detail', { idEmpresa: props.idEmpresa })
  else if (vista.value === 'editar') { vista.value = 'detalle'; cargar(idDetalle.value) }
  else { vista.value = 'lista'; cargar() }
}
async function cargar(idProducto = null) {
  const actual = ++solicitud
  loading.value = true
  error.value = ''
  empresa.value = null
  producto.value = null
  productos.value = []
  try {
    const id = Number(props.idEmpresa)
    if (!Number.isInteger(id) || id <= 0) throw new Error('Seleccione una empresa válida.')
    const datos = await obtenerMiEmpresa(id)
    if (actual !== solicitud) return
    if (!datos.empresa) throw new Error('No se encontró la empresa.')
    empresa.value = datos.empresa
    if (idProducto !== null) {
      const respuesta = await obtenerMiProducto(idProducto)
      if (actual !== solicitud) return
      if (!respuesta.producto || Number(respuesta.producto.empresa.id) !== id) throw new Error('El producto no pertenece a esta empresa.')
      producto.value = respuesta.producto
    } else {
      const respuesta = await listarMiInventario(id)
      if (actual !== solicitud) return
      if (!Array.isArray(respuesta.productos)) throw new Error('No se pudo obtener el inventario.')
      productos.value = respuesta.productos
    }
  } catch (err) {
    if (actual === solicitud) error.value = err.message || 'No se pudo cargar el inventario.'
  } finally {
    if (actual === solicitud) loading.value = false
  }
}
const idDetalle = ref(null)
function ver(id) {
  idDetalle.value = id
  vista.value = 'detalle'
  aviso.value = ''
  cargar(id)
}
function nuevo() {
  if (!empresa.value?.estado || loading.value) return
  const hoy = new Date()
  const local = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
  formulario.value = { nombre: '', cantidad: '', precio_u: '', rebaja: 0, fecha_ingreso: local, fecha_salida: '', notas: '' }
  errorFormulario.value = ''
  aviso.value = ''
  vista.value = 'crear'
}
function editar() {
  if (loading.value || guardando.value || !empresa.value?.estado || !producto.value?.estado) return
  const p = producto.value
  formulario.value = { nombre: p.nombre, precio_u: p.precio_u, rebaja: p.rebaja ?? 0,
    fecha_ingreso: p.fecha_ingreso, fecha_salida: p.fecha_salida || '', notas: p.notas || '' }
  errorFormulario.value = ''
  aviso.value = ''
  vista.value = 'editar'
}
async function guardar() {
  if (guardando.value || !empresa.value?.estado || !['crear', 'editar'].includes(vista.value)) return
  const editando = vista.value === 'editar'
  if (editando && !producto.value?.estado) return
  errorFormulario.value = ''
  const f = formulario.value
  const cantidad = Number(f.cantidad), precio = Number(f.precio_u), rebaja = Number(f.rebaja)
  if (!f.nombre.trim() || (!editando && (f.cantidad === '' || !Number.isSafeInteger(cantidad) || cantidad < 0)) ||
      f.precio_u === '' || !Number.isFinite(precio) || precio <= 0 || !Number.isFinite(rebaja) ||
      rebaja < 0 || rebaja > precio || !f.fecha_ingreso ||
      (f.fecha_salida && f.fecha_salida < f.fecha_ingreso)) {
    errorFormulario.value = 'Revise nombre, stock entero no negativo, precio mayor a cero, rebaja y fechas.'
    return
  }
  guardando.value = true
  try {
    const datos = { nombre: f.nombre.trim(), precio_u: precio, rebaja,
      fecha_ingreso: f.fecha_ingreso, fecha_salida: f.fecha_salida || null,
      notas: f.notas.trim() || null, id_empresa: Number(props.idEmpresa) }
    if (!editando) datos.cantidad = cantidad
    const respuesta = editando
      ? await editarProducto(idDetalle.value, datos)
      : await crearProducto(datos)
    if (!respuesta.producto?.id) throw new Error('No se recibió el producto guardado. Revise el listado antes de reintentar.')
    idDetalle.value = respuesta.producto.id
    vista.value = 'detalle'
    aviso.value = editando ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.'
    await cargar(idDetalle.value)
  } catch (err) {
    errorFormulario.value = err.message || 'No se pudo guardar el producto.'
  } finally {
    guardando.value = false
  }
}
async function actualizado() {
  aviso.value = 'Estado del producto actualizado.'
  await cargar(idDetalle.value)
}
watch(() => props.idEmpresa, () => {
  vista.value = 'lista'
  idDetalle.value = null
  aviso.value = ''
  cargar()
}, { immediate: true })
</script>

<template>
  <div class="h-full flex flex-col">
    <AppHeader :title="vista === 'editar' ? 'Editar producto' : vista === 'crear' ? 'Crear producto' : vista === 'detalle' ? 'Detalle de producto' : 'Inventario'" show-back @back="volver" />
    <div class="flex-1 overflow-y-auto p-4">
      <p v-if="aviso" role="status" class="bg-[#E6F5EF] text-[#1E6B47] rounded-xl p-3 text-sm mb-3">{{ aviso }}</p>
      <p v-if="loading" role="status" class="text-center text-sm text-[#7A6558] py-12">Cargando inventario...</p>
      <div v-else-if="error" role="alert" class="bg-red-50 text-red-700 rounded-xl p-4 text-sm">
        <p>{{ error }}</p>
        <BaseButton class="mt-3" @click="cargar(vista === 'detalle' ? idDetalle : null)">Reintentar</BaseButton>
      </div>
      <template v-else-if="empresa">
        <p class="font-semibold text-[#2A6049] mb-3 break-words">{{ empresa.nombre }}</p>
        <p v-if="!empresa.estado" class="text-sm text-[#7A6558] mb-4">Empresa inactiva: el inventario está disponible solo para consulta.</p>
        <template v-if="vista === 'lista'">
          <BaseButton v-if="empresa.estado" full class="mb-4" @click="nuevo">Crear producto</BaseButton>
          <label class="block mb-3 text-sm font-semibold">Buscar por nombre
            <input v-model="busqueda" type="search" class="w-full h-12 border border-[#D8CFC4] rounded-xl px-3 mt-1 bg-white" placeholder="Nombre del producto" />
          </label>
          <label class="block mb-4 text-sm font-semibold">Estado
            <select v-model="estado" class="w-full h-12 border border-[#D8CFC4] rounded-xl px-3 mt-1 bg-white">
              <option value="activos">Activos</option><option value="archivados">Archivados</option><option value="todos">Todos</option>
            </select>
          </label>
          <p v-if="!productos.length" class="text-sm text-[#7A6558] py-6">Esta empresa todavía no tiene productos.</p>
          <p v-else-if="!visibles.length" class="text-sm text-[#7A6558] py-6">No hay productos que coincidan con los filtros.</p>
          <div class="space-y-3">
            <article v-for="p in visibles" :key="p.id" class="bg-white border border-[#D8CFC4] rounded-2xl p-4">
              <h2 class="font-semibold break-words">{{ p.nombre }}</h2>
              <p class="text-xs text-[#7A6558] mt-1">{{ p.estado ? 'Activo' : 'Archivado' }}</p>
              <p class="text-sm mt-3">Stock: {{ p.cantidad }} · Precio final: Bs {{ dinero(p.precio_final) }}</p>
              <BaseButton full variant="outline" class="mt-3" @click="ver(p.id)">Ver producto</BaseButton>
            </article>
          </div>
        </template>
        <section v-else-if="vista === 'detalle' && producto" class="bg-white border border-[#D8CFC4] rounded-2xl p-5">
          <h2 class="text-lg font-semibold break-words">{{ producto.nombre }}</h2>
          <p class="text-sm text-[#7A6558] mt-2">{{ producto.estado ? 'Activo' : 'Archivado' }}</p>
          <dl class="grid grid-cols-2 gap-4 text-sm mt-5">
            <div><dt class="text-[#7A6558]">Stock actual</dt><dd class="font-semibold">{{ producto.cantidad }}</dd></div>
            <div><dt class="text-[#7A6558]">Precio unitario</dt><dd>Bs {{ dinero(producto.precio_u) }}</dd></div>
            <div><dt class="text-[#7A6558]">Rebaja</dt><dd>Bs {{ dinero(producto.rebaja) }}</dd></div>
            <div><dt class="text-[#7A6558]">Precio final</dt><dd>Bs {{ dinero(producto.precio_final) }}</dd></div>
            <div><dt class="text-[#7A6558]">Ingreso</dt><dd>{{ fecha(producto.fecha_ingreso) }}</dd></div>
            <div><dt class="text-[#7A6558]">Salida</dt><dd>{{ fecha(producto.fecha_salida) }}</dd></div>
            <div class="col-span-2"><dt class="text-[#7A6558]">Notas</dt><dd class="whitespace-pre-wrap break-words">{{ producto.notas || 'Sin notas' }}</dd></div>
          </dl>
          <BaseButton v-if="empresa.estado && producto.estado" full variant="outline" class="mt-5" @click="editar">Editar producto</BaseButton>
          <ProductoEstadoButton :empresa="empresa" :producto="producto" class="mt-5" @updated="actualizado" />
        </section>
        <form v-else-if="vista === 'crear' || vista === 'editar'" @submit.prevent="guardar">
          <fieldset :disabled="guardando" class="space-y-4 min-w-0">
            <label class="block text-sm font-semibold">Nombre
              <input v-model="formulario.nombre" required maxlength="200" class="inventory-input" />
            </label>
            <label v-if="vista === 'crear'" class="block text-sm font-semibold">Stock inicial
              <input v-model="formulario.cantidad" required type="number" min="0" step="1" inputmode="numeric" class="inventory-input" />
            </label>
            <label class="block text-sm font-semibold">Precio unitario (Bs)
              <input v-model="formulario.precio_u" required type="number" min="0.01" step="0.01" inputmode="decimal" class="inventory-input" />
            </label>
            <label class="block text-sm font-semibold">Rebaja (Bs)
              <input v-model="formulario.rebaja" required type="number" min="0" :max="formulario.precio_u" step="0.01" inputmode="decimal" class="inventory-input" />
            </label>
            <label class="block text-sm font-semibold">Fecha de ingreso
              <input v-model="formulario.fecha_ingreso" required type="date" class="inventory-input" />
            </label>
            <label class="block text-sm font-semibold">Fecha de salida (opcional)
              <input v-model="formulario.fecha_salida" type="date" :min="formulario.fecha_ingreso" class="inventory-input" />
            </label>
            <label class="block text-sm font-semibold">Notas (opcional)
              <textarea v-model="formulario.notas" rows="3" class="inventory-input !h-auto py-3"></textarea>
            </label>
            <p v-if="errorFormulario" role="alert" class="bg-red-50 text-red-700 rounded-xl p-3 text-sm">{{ errorFormulario }}</p>
            <BaseButton full type="submit" :loading="guardando">{{ guardando ? 'Guardando...' : vista === 'editar' ? 'Guardar cambios' : 'Crear producto' }}</BaseButton>
            <BaseButton full type="button" variant="secondary" @click="volver">Cancelar</BaseButton>
          </fieldset>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped>
.inventory-input { display: block; width: 100%; min-width: 0; height: 3rem; margin-top: .25rem; border: 1px solid #D8CFC4; border-radius: .75rem; padding-left: .75rem; padding-right: .75rem; background: white; }
</style>
