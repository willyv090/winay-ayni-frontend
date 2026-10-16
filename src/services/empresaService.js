import { apiRequest } from './api.js'


export async function listarEmpresas() {
  return await apiRequest('/api/empresas', {
    method: 'GET'
  })
}

export async function obtenerEmpresa(id) {
  return await apiRequest(`/api/empresas/${id}`, {
    method: 'GET'
  })
}

export async function crearEmpresa(datos) {
  return await apiRequest('/api/empresas', {
    method: 'POST',
    body: JSON.stringify(datos)
  })
}

export async function editarEmpresa(id, datos) {
  return await apiRequest(`/api/empresas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  })
}

export async function desactivarEmpresa(id) {
  return await apiRequest(`/api/empresas/${id}`, {
    method: 'DELETE'
  })
}


export async function reactivarEmpresa(id) {
  return await apiRequest(`/api/empresas/${id}/reactivar`, {
    method: 'PUT'
  })
}
export async function listarMisEmpresas() {
  return await apiRequest('/api/empresas/mias', { method: 'GET' })
}

export async function obtenerMiEmpresa(idEmpresa) {
  return await apiRequest(`/api/empresas/mias/${idEmpresa}`, { method: 'GET' })
}
