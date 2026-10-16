import { apiRequest } from './api.js'

export async function listarProductosEmpresa(idEmpresa) {
  return await apiRequest(`/api/productos/empresa/${idEmpresa}`, { method: 'GET' })
}

export async function listarMiInventario(idEmpresa) {
  return await apiRequest(`/api/productos/empresa/${idEmpresa}?estado=todos&ambito=propio`, { method: 'GET' })
}

export async function obtenerMiProducto(idProducto) {
  return await apiRequest(`/api/productos/${idProducto}?ambito=propio`, { method: 'GET' })
}

export async function crearProducto(datos) {
  return await apiRequest('/api/productos', { method: 'POST', body: JSON.stringify(datos) })
}

export async function archivarProducto(idProducto) {
  return await apiRequest(`/api/productos/${idProducto}`, { method: 'DELETE' })
}

export async function desarchivarProducto(idProducto) {
  return await apiRequest(`/api/productos/${idProducto}/reactivar`, { method: 'PUT' })
}

export async function editarProducto(idProducto, datos) {
  return await apiRequest(`/api/productos/${idProducto}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  })
}
