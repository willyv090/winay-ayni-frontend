import { apiRequest } from './api.js'

export async function listarMetodosPago() {
  return await apiRequest('/api/metodos-pago?estado=true', { method: 'GET' })
}
