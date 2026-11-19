# Distribuidora de Gas El Volcán — Frontend React (Evaluación Parcial 3, DSY1104)

Tienda de cilindros de gas + paneles de **Administrador, Operadora y Repartidor**, ahora **conectada a un backend Spring Boot** (REST + MySQL + JWT).
El backend está en el repositorio/carpeta `gasvolcan-backend`.

## Cómo ejecutarlo

1. **Levantar el backend primero** (ver el README de `gasvolcan-backend`): queda en `http://localhost:8080`.
2. Luego el frontend:

```bash
npm install      # (de nuevo: se agregó axios)
npm start        # abre http://localhost:3000
npm test         # Jasmine + Karma (ChromeHeadless) con cobertura; NO necesita el backend (usa espías)
```

Si el backend corre en otra dirección, crea un archivo `.env` con `REACT_APP_API_URL=http://otra-direccion:8080/api/v1`.
Si el backend está apagado, la app muestra *"No se pudieron cargar los datos"* con un botón **Reintentar**.

`npm test` necesita Google Chrome instalado. Si usas Brave/Edge/Chromium:
`set CHROME_BIN=C:\ruta\al\navegador.exe` (Windows) y vuelve a correr. El informe HTML de cobertura queda en `coverage/html/index.html`.

## Cuentas de prueba (las crea el backend la primera vez)
| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@duoc.cl | admin123 |
| Operadora de llamadas | operadora@duoc.cl | opera123 |
| Repartidores (Enzo, Javiera, Nicolás) | repenzo@duoc.cl, repjaviera@duoc.cl, repnico@duoc.cl | reparte123 |

Los clientes se crean desde **Crear Cuenta**. Los 4 actores del caso: Cliente, Administrador, Operadora y Repartidor.

## Integración con el backend
- **`src/api/http.js`**: instancia de Axios. Agrega `Authorization: Bearer <accessToken>` a cada petición y, si el backend responde 401 (token vencido), renueva el token con el refresh token y repite la petición. Si no se puede renovar, cierra la sesión.
- **`src/api/gasVolcanApi.js`**: todas las llamadas REST agrupadas por recurso (auth, productos, categorías, usuarios, camiones, órdenes).
- **`src/context/AuthContext.js`**: sesión. Login (`POST /auth/login`), guarda los tokens en `localStorage` y, al recargar la página, recupera al usuario con `GET /auth/me` (**la sesión persiste**).
- **`src/context/DatosContext.js`**: al abrir la app descarga los datos del rol (productos y categorías para todos; órdenes, usuarios y camiones según el rol) y los vuelve a pedir al cambiar de página.
- **`src/data/baseDatos.js`**: copia local (en memoria) de los datos descargados, para que las pantallas los lean al instante. Ya **no** se guardan datos en `localStorage` (solo el carrito y los tokens).
- **`src/components/RutaProtegida.js`**: restricciones por rol en el frontend (el backend además las valida con `@PreAuthorize`).

## Estructura (Anexo 1)
```
src/
  api/         http.js (Axios + JWT), gasVolcanApi.js (llamadas REST)
  data/        almacenamiento.js  -> helpers de localStorage (carrito y tokens)
               datos.js           -> constantes (regiones, roles, estados) y datos de ejemplo de las pruebas
               baseDatos.js       -> copia local de los datos del backend + sincronización por rol
  services/    carritoService, usuarioService, catalogoService, ordenService (llaman a la API)
  utils/       validaciones, productos (ofertas/filtros), reportes
  context/     AuthContext (sesión JWT), DatosContext (carga de datos), CartContext (carrito)
  components/  BotonAccion, BarraBusqueda, Navigation, ProductCard, ProductList, CategoriaCard,
               ShoppingCart, CheckoutForm, ResumenCompra, Boleta, AdminLayout, ...
  pages/       tienda: Inicio, Productos, DetalleProducto, Categorias, CategoriaDetalle, Ofertas,
               Carrito, Checkout, CompraExitosa, PagoError, Pedido, Seguimiento, Login, Registro, ...
  pages/admin  Dashboard, Órdenes/Boleta, Productos (nuevo/ver/editar), Críticos, Categorías,
               Usuarios (nuevo/ver/editar/historial), Reportes, Perfil
  pages/operadora  Despacho: registrar pedido por llamada, asignar camión + repartidor, pedidos del día
  pages/repartidor Mis entregas: solo los pedidos asignados al repartidor
  tests/       *.spec.js (Jasmine)
```

## Flujo de compra
Carrito → **Checkout** (se rellena solo si hay sesión) → `POST /ordenes`: el **backend** calcula los precios, descuenta el stock y procesa el pago simulado:
- Efectivo: siempre aprobado → **Pago correcto** (boleta, *Imprimir boleta en PDF*, *Enviar boleta por email* simulado).
- Tarjeta: 16 dígitos; si termina en `0000` se rechaza → **Pago con error** → *Volver a realizar el pago* (reutiliza la misma orden).

## Reparto (Operadora y Repartidor)
La empresa tiene 2 camiones, 3 repartidores y 1 operadora. La operadora registra los pedidos que llegan por llamada, elige el camión y el repartidor de cada pedido y deja instrucciones. El repartidor ve solo sus pedidos y los marca *en camino* / *entregado* (cobro en efectivo al entregar).
`pendiente → asignado → en camino → entregado` (la operadora puede cancelar).

## Pruebas (Jasmine + Karma)
78 pruebas en `src/tests`. Las llamadas al backend se simulan con espías de Jasmine (`spyOn(ordenesApi, 'comprar')`, etc.), por eso corren sin servidor ni base de datos.
Cubren: renderizado y props, estado (formularios, carrito), eventos, mocks, lógica (validaciones, copia local de datos, órdenes, reparto),
login con JWT, **persistencia de sesión** (tokens guardados → `GET /auth/me`), **restricción por rol** (`RutaProtegida`) y el flujo de checkout.
