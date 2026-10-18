// La cuenta conserva sus roles; la navegación usa solamente el rol activo.
export const roleLabels = {
  ADMINISTRADOR: 'Administrador',
  EMPRENDEDOR: 'Emprendedor',
  CAJERO: 'Cajero'
}

export function rolesDisponibles(roles = []) {
  return Object.keys(roleLabels).filter(rol => Array.isArray(roles) && roles.includes(rol))
}

export function elegirRol(roles, preferido = '') {
  const disponibles = rolesDisponibles(roles)
  return disponibles.includes(preferido) ? preferido : disponibles[0] || ''
}

export const modules = [
  { id: 'venta-independiente', title: 'Registrar venta', description: 'Vender productos de mi empresa', icon: '🛒', screen: 'entrepreneur-sale', roles: ['EMPRENDEDOR'], section: 'Mi emprendimiento' },
  { id: 'usuarios', title: 'Usuarios', description: 'Gestionar usuarios y roles', icon: '👥', screen: 'users-list', roles: ['ADMINISTRADOR'], section: 'Administración' },
  { id: 'empresas', title: 'Empresas', description: 'Gestionar empresas y sus integrantes', icon: '🏪', screen: 'businesses-list', roles: ['ADMINISTRADOR'], section: 'Administración' },
  { id: 'jornadas', title: 'Jornadas', description: 'Organizar jornadas, cajeros y productos', icon: '📅', screen: 'sessions-list', roles: ['ADMINISTRADOR'], section: 'Administración' },
  { id: 'resultados', title: 'Resultados', description: 'Consultar cierres de jornadas', icon: '📊', screen: 'session-results', roles: ['ADMINISTRADOR'], section: 'Consultas', pendiente: true },
  { id: 'metricas', title: 'Métricas', description: 'Consultar indicadores generales', icon: '📈', screen: 'metrics', roles: ['ADMINISTRADOR'], section: 'Consultas', pendiente: true },
  { id: 'mis-empresas', title: 'Mis empresas', description: 'Consultar mis empresas vinculadas', icon: '🏪', screen: 'my-businesses', roles: ['EMPRENDEDOR'], section: 'Mi emprendimiento' },
  { id: 'jornada-actual', title: 'Jornada asignada', description: 'Operar en una jornada con asignación activa', icon: '🗓️', screen: 'cashier-session', roles: ['CAJERO'], section: 'Caja', pendiente: true },
  { id: 'nueva-venta', title: 'Nueva venta', description: 'Vender productos de la jornada asignada', icon: '🛒', screen: 'register-sale', roles: ['CAJERO'], section: 'Caja', pendiente: true },
  { id: 'ventas', title: 'Ventas', description: 'Consultar ventas según mi función', icon: '🧾', screen: 'sales-list', roles: Object.keys(roleLabels), section: 'Consultas', pendiente: true },
  { id: 'consulta', title: 'Consulta informativa', description: 'Consultar información de productos', icon: '🤖', screen: 'ai-query', roles: Object.keys(roleLabels), section: 'Consultas', pendiente: true }
]

export function obtenerModulos(roles, rolActivo) {
  if (!rolesDisponibles(roles).includes(rolActivo)) return []
  return modules.filter(modulo => modulo.roles.includes(rolActivo)).map(modulo => {
    if (rolActivo === 'EMPRENDEDOR' && ['sales-list', 'ai-query'].includes(modulo.screen)) {
      return {
        ...modulo,
        title: modulo.screen === 'sales-list' ? 'Ventas' : 'Consultas',
        description: 'Consultar métricas y productos más vendidos',
        pendiente: false
      }
    }
    if (rolActivo === 'CAJERO' && ['cashier-session', 'register-sale', 'sales-list'].includes(modulo.screen)) return { ...modulo, pendiente: false }
    return modulo
  })
}

export const screenPermissions = {
  'my-business-metrics': ['EMPRENDEDOR'],
  'entrepreneur-sale': ['EMPRENDEDOR'],

  // ===================================================
  // GENERAL
  // ===================================================

  home: [
    'ADMINISTRADOR',
    'CAJERO',
    'EMPRENDEDOR'
  ],


  // ===================================================
  // ADMINISTRADOR
  // ===================================================

  'users-list': [
    'ADMINISTRADOR'
  ],

  'user-detail': [
    'ADMINISTRADOR'
  ],

  'user-create': [
    'ADMINISTRADOR'
  ],

  'user-edit': [
    'ADMINISTRADOR'
  ],

  'businesses-list': [
    'ADMINISTRADOR'
  ],
  'business-detail': [
    'ADMINISTRADOR'
  ],
  'business-create': [
    'ADMINISTRADOR'
  ],
  'business-edit': [
    'ADMINISTRADOR'
  ],


  'sessions-list': [
    'ADMINISTRADOR'
  ],

  'session-detail': [
    'ADMINISTRADOR'
  ],

  'session-edit': [
    'ADMINISTRADOR'
  ],

  'session-create': [
    'ADMINISTRADOR'
  ],

  'session-products': [
    'ADMINISTRADOR'
  ],

  'session-cashiers': [
    'ADMINISTRADOR'
  ],

  'session-results': [
    'ADMINISTRADOR'
  ],

  metrics: [
    'ADMINISTRADOR'
  ],


  // ===================================================
  // CAJERO
  // ===================================================

  'register-sale': [
    'CAJERO'
  ],

  'cashier-session': [
    'CAJERO'
  ],


  // ===================================================
  // EMPRENDEDOR
  // ===================================================

  'my-businesses': [
    'EMPRENDEDOR'
  ],

  'my-inventory': ['EMPRENDEDOR'],

  'my-business-detail': [
    'EMPRENDEDOR'
  ],


  // ===================================================
  // COMPARTIDOS
  // ===================================================

  'sales-list': [
    'ADMINISTRADOR',
    'CAJERO',
    'EMPRENDEDOR'
  ],

  'sale-detail': [
    'ADMINISTRADOR',
    'CAJERO',
    'EMPRENDEDOR'
  ],

  'ai-query': [
    'ADMINISTRADOR',
    'CAJERO',
    'EMPRENDEDOR'
  ]

}




export function puedeAcceder(screen, roles = [], rolActivo = '') {
  if (screen === 'login') return true
  if (!rolesDisponibles(roles).includes(rolActivo)) return false
  return screenPermissions[screen]?.includes(rolActivo) === true
}

export function obtenerBottomTabs(roles = [], rolActivo = '') {
  const inicio = { screen: 'home', icon: '⌂', label: 'Inicio' }
  const opciones = {
    ADMINISTRADOR: ['users-list', 'sessions-list', 'sales-list', 'ai-query'],
    EMPRENDEDOR: ['my-businesses', 'entrepreneur-sale', 'sales-list', 'ai-query'],
    CAJERO: ['cashier-session', 'register-sale', 'sales-list', 'ai-query']
  }
  if (!rolesDisponibles(roles).includes(rolActivo)) return [inicio]
  return [inicio, ...(opciones[rolActivo] || []).map(screen => {
    const modulo = modules.find(item => item.screen === screen)
    const label = { 'entrepreneur-sale': 'Vender', 'users-list': 'Usuarios', 'sessions-list': 'Jornadas', 'my-businesses': 'Empresas', 'my-inventory': 'Inventario', 'cashier-session': 'Jornada', 'register-sale': 'Vender', 'sales-list': 'Ventas', 'ai-query': 'Consulta' }[screen]
    return { screen, icon: modulo.icon, label }
  })]
}
