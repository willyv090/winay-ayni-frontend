# Wiñay Ayni — interfaz móvil en Vue 3

Conversión del prototipo generado por Figma Make desde React + TypeScript a **Vue 3 + Ionic Vue + Capacitor**, usando componentes `.vue` con JavaScript (`<script setup>`) y Vite.

## Ejecutar

```bash
npm install
npm run dev
```

## Compilar

```bash
npm run build
```

## Preparar Android con Capacitor

```bash
npx cap add android
npm run build
npx cap sync android
npx cap open android
```

## Usuarios demo

- `admin` / `1234`
- `cajero1` / `1234`
- `emprendedor1` / `1234`

## Alcance del prototipo

Incluye maquetado y lógica simulada para:

1. Inicio de sesión y roles.
2. Usuarios y emprendimientos.
3. Productos, descuentos e inventario.
4. Jornadas, productos habilitados y cambio de cajero.
5. Ventas con uno o varios productos.
6. Cierre, cuadre, resultados y métricas.
7. Consulta informativa en lenguaje natural.

La persistencia es temporal en memoria; debe conectarse posteriormente con la API Flask real.
