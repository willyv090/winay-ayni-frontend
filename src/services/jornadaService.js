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
