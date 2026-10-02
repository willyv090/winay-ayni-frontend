import { apiRequest } from './api.js'


export async function listarUsuarios() {
  return await apiRequest('/api/personas', {
    method: 'GET'
  })
}

export async function obtenerUsuario(id) {
  return await apiRequest(`/api/personas/${id}`, {
    method: 'GET'
  })
}

export async function crearUsuario(datos) {
  return await apiRequest('/api/personas', {
    method: 'POST',
    body: JSON.stringify(datos)
  })
}

export async function listarRoles() {
  return await apiRequest('/api/roles', {
    method: 'GET'
  })
}

export async function editarUsuario(id, datos) {
  return await apiRequest(`/api/personas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  })
}