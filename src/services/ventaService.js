import { apiRequest } from './api.js'

export async function registrarVentaIndependiente(datos) {
  return await apiRequest('/api/ventas', {
    method: 'POST',
    body: JSON.stringify({ ...datos, tipo: 'INDEPENDIENTE' })
  })
}

export async function obtenerMetricasIndependientes(idEmpresa, desde = '', hasta = '') {
  const filtros = new URLSearchParams({ id_empresa: String(idEmpresa) })
  if (desde) filtros.set('desde', desde)
  if (hasta) filtros.set('hasta', hasta)
  return await apiRequest(`/api/ventas/metricas/independientes?${filtros}`, { method: 'GET' })
}

export async function obtenerMetricasFerias(idEmpresa, desde = '', hasta = '') {
  const filtros = new URLSearchParams({ id_empresa: String(idEmpresa) })
  if (desde) filtros.set('desde', desde)
  if (hasta) filtros.set('hasta', hasta)
  return await apiRequest(`/api/ventas/metricas/ferias?${filtros}`, { method: 'GET' })
}
export async function listarMisVentas(idEmpresa) {
  const filtros = new URLSearchParams({ id_empresa: String(idEmpresa), rol: 'EMPRENDEDOR' })
  return await apiRequest(`/api/ventas?${filtros}`, { method: 'GET' })
}
export async function obtenerDetalleMiVenta(idVenta, idEmpresa) {
  const filtros = new URLSearchParams({ id_empresa: String(idEmpresa), rol: 'EMPRENDEDOR' })
  return await apiRequest(`/api/ventas/${idVenta}/detalles?${filtros}`, { method: 'GET' })
}

export const listarJornadasCaja = () => apiRequest('/api/jornadas/cajero/mias', { method: 'GET' })
export const listarCatalogoCaja = id => apiRequest(`/api/jornadas/${id}/productos/caja`, { method: 'GET' })
export const registrarVentaCaja = datos => apiRequest('/api/ventas', {
  method: 'POST', body: JSON.stringify({ ...datos, tipo: 'JORNADA' })
})
export const listarVentasCaja = (idJornada = null) => {
  const filtros = new URLSearchParams({ rol: 'CAJERO' })
  if (idJornada !== null) filtros.set('id_jornada', String(idJornada))
  return apiRequest(`/api/ventas?${filtros}`, { method: 'GET' })
}
export const detalleVentaCaja = id => apiRequest(`/api/ventas/${id}/detalles?rol=CAJERO`, { method: 'GET' })

export const listarVentasFeriaAdmin = (idJornada, idPersona = null) => {
  const filtros = new URLSearchParams({ rol: 'ADMINISTRADOR', tipo: 'JORNADA', id_jornada: String(idJornada) })
  if (idPersona) filtros.set('id_persona', String(idPersona))
  return apiRequest(`/api/ventas?${filtros}`, { method: 'GET' })
}
export const detalleVentaAdmin = id => apiRequest(`/api/ventas/${id}/detalles?rol=ADMINISTRADOR`, { method: 'GET' })

export const obtenerMetricasAdmin = (idJornada = '', desde = '', hasta = '') => {
  const filtros = new URLSearchParams()
  if (idJornada) filtros.set('id_jornada', String(idJornada))
  if (desde) filtros.set('desde', desde)
  if (hasta) filtros.set('hasta', hasta)
  return apiRequest(`/api/ventas/metricas/admin?${filtros}`, { method: 'GET' })
}
