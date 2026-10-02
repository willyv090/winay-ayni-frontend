import { apiRequest } from './api.js'


export async function iniciarSesion(usuario, contrasenia) {
  const data = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      usuario: usuario,
      contrasenia: contrasenia
    })
  })

  localStorage.setItem('token', data.token)

  return data
}


export function cerrarSesion() {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
}


export function obtenerUsuarioGuardado() {
  const usuario = localStorage.getItem('usuario')

  if (!usuario) {
    return null
  }

  try {
    return JSON.parse(usuario)
  } catch {
    return null
  }
}