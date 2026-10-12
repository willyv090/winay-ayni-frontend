import { apiRequest } from './api.js'

export async function listarProductosEmpresa(idEmpresa) {
  return await apiRequest(`/api/productos/empresa/${idEmpresa}`, { method: 'GET' })
}
