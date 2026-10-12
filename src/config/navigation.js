// =====================================================
// MÓDULOS DISPONIBLES EN EL HOME
// =====================================================

export const modules = [

  // ===================================================
  // ADMINISTRADOR
  // ===================================================

  {
    id: 'usuarios',
    title: 'Usuarios',
    description: 'Gestionar usuarios y roles',
    icon: '👥',
    screen: 'users-list',
    roles: ['ADMINISTRADOR'],
    section: 'Administración'
  },

  {
    id: 'emprendimientos',
    title: 'Emprendimientos',
    description: 'Gestionar emprendimientos',
    icon: '🏪',
    screen: 'businesses-list',
    roles: ['ADMINISTRADOR'],
    section: 'Administración'
  },

  {
    id: 'productos',
    title: 'Productos',
    description: 'Gestionar productos e inventario',
    icon: '📦',
    screen: 'products-list',
    roles: ['ADMINISTRADOR'],
    section: 'Administración'
  },

  {
    id: 'jornadas',
    title: 'Jornadas',
    description: 'Gestionar jornadas de venta',
    icon: '📅',
    screen: 'sessions-list',
    roles: ['ADMINISTRADOR'],
    section: 'Administración'
  },

  {
    id: 'resultados',
    title: 'Resultados',
    description: 'Consultar cierres y resultados',
    icon: '📊',
    screen: 'session-results',
    roles: ['ADMINISTRADOR'],
    section: 'Administración'
  },

  {
    id: 'metricas',
    title: 'Métricas',
    description: 'Consultar indicadores de ventas',
    icon: '📈',
    screen: 'metrics',
    roles: ['ADMINISTRADOR'],
    section: 'Administración'
  },


  // ===================================================
  // CAJERO
  // ===================================================

  {
    id: 'jornada-actual',
    title: 'Jornada actual',
    description: 'Consultar la jornada asignada',
    icon: '🗓️',
    screen: 'cashier-session',
    roles: ['CAJERO'],
    section: 'Operación'
  },

  {
    id: 'nueva-venta',
    title: 'Nueva venta',
    description: 'Registrar una nueva venta',
    icon: '🛒',
    screen: 'register-sale',
    roles: ['CAJERO'],
    section: 'Operación'
  },

  // ===================================================
  // MÓDULOS COMPARTIDOS
  // ===================================================

  {
    id: 'ventas',
    title: 'Ventas',
    description: 'Consultar ventas registradas',
    icon: '🧾',
    screen: 'sales-list',
    roles: [
      'ADMINISTRADOR',
      'CAJERO',
      'EMPRENDEDOR'
    ],
    section: 'Consultas'
  },

  {
    id: 'consulta',
    title: 'Consulta informativa',
    description: 'Consultar información mediante IA',
    icon: '🤖',
    screen: 'ai-query',
    roles: [
      'ADMINISTRADOR',
      'CAJERO',
      'EMPRENDEDOR'
    ],
    section: 'Consultas'
  }

]



// =====================================================
// PERMISOS DE PANTALLAS
// =====================================================

export const screenPermissions = {

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

  'products-list': [
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

  'my-inventory': [
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



// =====================================================
// FUNCIÓN PARA VERIFICAR SI UN USUARIO PUEDE
// ENTRAR A UNA PANTALLA
// =====================================================

export function puedeAcceder(screen, roles = []) {

  // Login siempre está permitido
  if (screen === 'login') {
    return true
  }


  const rolesPermitidos =
    screenPermissions[screen]


  // Si una pantalla no fue registrada,
  // la bloqueamos por seguridad.
  if (!rolesPermitidos) {

    console.warn(
      `La pantalla "${screen}" no tiene permisos configurados.`
    )

    return false
  }


  // Basta con que tenga UNO de los roles permitidos
  return rolesPermitidos.some(
    rol => roles.includes(rol)
  )
}



// =====================================================
// BOTTOM NAV SEGÚN LOS ROLES DEL USUARIO
// =====================================================

export function obtenerBottomTabs(roles = []) {

  const esAdmin =
    roles.includes('ADMINISTRADOR')

  const esCajero =
    roles.includes('CAJERO')

  const esEmprendedor =
    roles.includes('EMPRENDEDOR')


  // ===================================================
  // ADMIN + CAJERO + EMPRENDEDOR
  // ===================================================

  if (
    esAdmin &&
    esCajero &&
    esEmprendedor
  ) {

    return [
      {
        screen: 'home',
        icon: '⌂',
        label: 'Inicio'
      },

      {
        screen: 'register-sale',
        icon: '🛒',
        label: 'Venta'
      },

      {
        screen: 'sessions-list',
        icon: '📅',
        label: 'Jornadas'
      },

      {
        screen: 'sales-list',
        icon: '🧾',
        label: 'Ventas'
      },

      {
        screen: 'ai-query',
        icon: '🤖',
        label: 'Consulta'
      }
    ]
  }


  // ===================================================
  // ADMIN + CAJERO
  // ===================================================

  if (
    esAdmin &&
    esCajero
  ) {

    return [
      {
        screen: 'home',
        icon: '⌂',
        label: 'Inicio'
      },

      {
        screen: 'register-sale',
        icon: '🛒',
        label: 'Venta'
      },

      {
        screen: 'sessions-list',
        icon: '📅',
        label: 'Jornadas'
      },

      {
        screen: 'sales-list',
        icon: '🧾',
        label: 'Ventas'
      },

      {
        screen: 'ai-query',
        icon: '🤖',
        label: 'Consulta'
      }
    ]
  }


  // ===================================================
  // ADMIN + EMPRENDEDOR
  // ===================================================

  if (
    esAdmin &&
    esEmprendedor
  ) {

    return [
      {
        screen: 'home',
        icon: '⌂',
        label: 'Inicio'
      },

      {
        screen: 'users-list',
        icon: '👥',
        label: 'Usuarios'
      },

      {
        screen: 'sessions-list',
        icon: '📅',
        label: 'Jornadas'
      },

      {
        screen: 'sales-list',
        icon: '🧾',
        label: 'Ventas'
      },

      {
        screen: 'ai-query',
        icon: '🤖',
        label: 'Consulta'
      }
    ]
  }


  // ===================================================
  // CAJERO + EMPRENDEDOR
  // ===================================================

  if (
    esCajero &&
    esEmprendedor
  ) {

    return [
      {
        screen: 'home',
        icon: '⌂',
        label: 'Inicio'
      },

      {
        screen: 'register-sale',
        icon: '🛒',
        label: 'Venta'
      },

      {
        screen: 'sales-list',
        icon: '🧾',
        label: 'Ventas'
      },

      {
        screen: 'ai-query',
        icon: '🤖',
        label: 'Consulta'
      }
    ]
  }


  // ===================================================
  // SOLO ADMINISTRADOR
  // ===================================================

  if (esAdmin) {

    return [
      {
        screen: 'home',
        icon: '⌂',
        label: 'Inicio'
      },

      {
        screen: 'users-list',
        icon: '👥',
        label: 'Usuarios'
      },

      {
        screen: 'sessions-list',
        icon: '📅',
        label: 'Jornadas'
      },

      {
        screen: 'metrics',
        icon: '📊',
        label: 'Métricas'
      },

      {
        screen: 'ai-query',
        icon: '🤖',
        label: 'Consulta'
      }
    ]
  }


  // ===================================================
  // SOLO CAJERO
  // ===================================================

  if (esCajero) {

    return [
      {
        screen: 'home',
        icon: '⌂',
        label: 'Inicio'
      },

      {
        screen: 'register-sale',
        icon: '🛒',
        label: 'Venta'
      },

      {
        screen: 'sales-list',
        icon: '🧾',
        label: 'Ventas'
      },

      {
        screen: 'ai-query',
        icon: '🤖',
        label: 'Consulta'
      }
    ]
  }


  // ===================================================
  // SOLO EMPRENDEDOR
  // ===================================================

  if (esEmprendedor) {

    return [
      {
        screen: 'home',
        icon: '⌂',
        label: 'Inicio'
      },

      /*
      Cuando creemos estas pantallas,
      las agregamos al BottomNav.

      {
        screen: 'my-businesses',
        icon: '🏪',
        label: 'Empresas'
      },

      {
        screen: 'my-inventory',
        icon: '📦',
        label: 'Inventario'
      },
      */

      {
        screen: 'sales-list',
        icon: '🧾',
        label: 'Ventas'
      },

      {
        screen: 'ai-query',
        icon: '🤖',
        label: 'Consulta'
      }
    ]
  }


  // ===================================================
  // SIN ROL RECONOCIDO
  // ===================================================

  return [
    {
      screen: 'home',
      icon: '⌂',
      label: 'Inicio'
    }
  ]
}