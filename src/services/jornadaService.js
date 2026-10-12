import { apiRequest } from './api.js'


export async function listarJornadas() {
  return await apiRequest('/api/jornadas', {
    method: 'GET'
  })
}

export async function obtenerJornada(id) {
  return await apiRequest(`/api/jornadas/${id}`, {
    method: 'GET'
  })
}

export async function obtenerCajerosJornada(id) {
  return await apiRequest(`/api/jornadas/${id}/cajeros`, {
    method: 'GET'
  })
}

export async function editarJornada(id, datos) {
  return await apiRequest(`/api/jornadas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  })
}


export async function crearJornada(datos) {
  return await apiRequest('/api/jornadas', {
    method: 'POST',
    body: JSON.stringify(datos)
  })
}


export async function finalizarJornada(id) {
  return await apiRequest(`/api/jornadas/${id}/cerrar`, { method: 'PUT' })
}

export async function reactivarJornada(id) {
  return await apiRequest(`/api/jornadas/${id}/reactivar`, { method: 'PUT' })
}


export async function asignarCajerosJornada(id, personas) {
  return await apiRequest(`/api/jornadas/${id}/cajeros`, {
    method: 'POST',
    body: JSON.stringify({ personas })
  })
}


export async function retirarCajeroJornada(idJornada, idPersona) {
  return await apiRequest(`/api/jornadas/${idJornada}/cajeros/${idPersona}`, {
    method: 'DELETE'
  })
}

export async function obtenerProductosJornada(idJornada) {
  return await apiRequest(`/api/jornadas/${idJornada}/productos`, { method: 'GET' })
}

export async function asignarProductosJornada(idJornada, idEmpresa, productos) {
  return await apiRequest(`/api/jornadas/${idJornada}/empresas/${idEmpresa}/productos`, {
    method: 'POST',
    body: JSON.stringify({ productos })
  })
}

export async function retirarProductoJornada(idJornada, idProducto) {
  return await apiRequest(`/api/jornadas/${idJornada}/productos/${idProducto}`, {
    method: 'DELETE'
  })
}
