# Distribuidora de Gas El Volcán — Frontend React (Evaluación Parcial 2, DSY1104)

Migración del sitio HTML/JS a **React** (local, sin backend). Tienda de cilindros de gas + panel de administración + panel de vendedor/reparto.

## Cómo ejecutarlo

```bash
npm install
npm start        # abre http://localhost:3000
npm test         # Jasmine + Karma (ChromeHeadless) con cobertura
```

`npm test` busca solo Chrome o Edge instalado. Si no lo encuentra, define `CHROME_BIN`
(Windows PowerShell: `$env:CHROME_BIN="C:\ruta\al\navegador.exe"`) y vuelve a correr.
El informe HTML de cobertura queda en `coverage/html/index.html`.

## Cuentas de prueba
| Rol | Correo | Contraseña | Qué puede hacer |
|---|---|---|---|
| Administrador | admin@duoc.cl | admin123 | Dashboard, órdenes, productos, categorías, usuarios, reportes |
| Vendedor | vendedor@duoc.cl | vende123 | Ver catálogo y gestionar el reparto: salir a repartir, entregar/cobrar, cancelar |

Los clientes se crean desde **Crear Cuenta** y compran desde la tienda.

## Estructura
```
src/
  data/        almacenamiento.js  -> helpers de localStorage
               datos.js           -> datos semilla (categorías, productos, usuarios)
               baseDatos.js       -> "base de datos" simulada con CRUD
  services/    carritoService, usuarioService, ordenService (pago simulado, stock, órdenes, reparto)
  utils/       validaciones, productos (ofertas/filtros), reportes
  context/     AuthContext, CartContext (estado compartido)
  components/  BotonAccion, BarraBusqueda, Navigation, ProductCard, ProductList, ShoppingCart,
               CheckoutForm, Boleta, AccionesReparto, RutaProtegida, AdminLayout, ...
  pages/       tienda: Inicio, Productos, Carrito, Checkout, Seguimiento, Login, Registro, ...
  pages/admin  paneles de administración
  pages/vendedor  catálogo y pedidos con acciones de reparto
  tests/       *.spec.js (Jasmine)
```

## Reglas de negocio principales
- Solo se venden cilindros de gas (5, 11, 15 y 45 kg), con ofertas por producto.
- Pago simulado: efectivo siempre se aprueba; tarjeta de 16 dígitos, y si termina en `0000` se rechaza (el pedido queda "Pago fallido" y se puede reintentar).
- El stock baja solo cuando el pago es exitoso.
- Cada cliente ve únicamente sus propios pedidos.
- Flujo del pedido: Pendiente → En camino → Entregado (o Cancelado). Lo avanza el vendedor.

## Pruebas unitarias
55 pruebas en `src/tests/` (lógica, componentes React, estado, eventos y mocks con `jasmine.createSpy` / `spyOn`).
