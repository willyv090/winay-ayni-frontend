# Auditoría de la interfaz frente al documento

## Ajustes realizados durante la migración

- Migración completa de React/TSX/TypeScript a Vue 3 SFC con JavaScript.
- Se añadieron Ionic Vue y Capacitor al proyecto para alinear la tecnología con el documento.
- El inicio de sesión utiliza **usuario y contraseña**, consistente con el backend actual.
- Los usuarios emprendedores se asocian a un emprendimiento desde el formulario.
- Se conserva un solo rol principal por usuario en la interfaz para mantener el flujo claro según los casos de uso.
- Se agregó código/ítem único para productos.
- La rebaja acepta 0 o un monto entre **5 y 10 Bs**, según RF-007 del documento vigente.
- Se agregaron movimientos de inventario: ingreso, ajuste, adelanto, reposición y venta automática.
- Se agregó selección exacta de productos por jornada.
- El cambio de cajero conserva cajero anterior, nuevo cajero, motivo y fecha.
- Una venta admite uno o varios productos y conserva el emprendimiento de cada producto.
- La venta valida jornada activa, cajero, método de pago, producto habilitado, producto activo y stock.
- El cierre de jornada muestra resumen por emprendimiento, método de pago y valida el cuadre antes de cerrar.
- Se incluyeron resultados y métricas.
- La consulta informativa se cambió del flujo antiguo “¿Qué es?” a una consulta de lenguaje natural sobre productos, disponibilidad e inventario.
- El emprendedor queda principalmente en modo consulta para emprendimiento/inventario/ventas; las altas y cambios administrativos se reservan al Administrador.

## Pendiente de integración real

- Reemplazar datos simulados por llamadas HTTP a la API Flask.
- Aplicar JWT real y autorizaciones del backend.
- Persistir movimientos y cierre en PostgreSQL.
- Conectar el módulo de consulta informativa al servicio de IA definitivo.
