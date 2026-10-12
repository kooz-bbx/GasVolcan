# Distribuidora de Gas El Volcán — Frontend React (Evaluación Parcial 2, DSY1104)

Migración del sitio HTML/JS a **React** (local, sin backend). Tienda de cilindros de gas + panel de administración.

## Cómo ejecutarlo

```bash
npm install
npm start        # abre http://localhost:3000
npm test         # Jasmine + Karma (ChromeHeadless) con cobertura
```

`npm test` necesita Google Chrome instalado. Si usas Brave/Edge/Chromium:
`set CHROME_BIN=C:\ruta\al\navegador.exe` (Windows) y vuelve a correr. El informe HTML de cobertura queda en `coverage/html/index.html`.

## Cuentas de prueba
| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@duoc.cl | admin123 |
| Vendedor | vendedor@duoc.cl | vende123 |

Los clientes se crean desde **Crear Cuenta**.

## Estructura (Anexo 1)
```
src/
  data/        almacenamiento.js  -> helpers de localStorage
               datos.js           -> datos semilla (categorías, productos, usuarios)
               baseDatos.js       -> "base de datos" simulada con CRUD (crear/leer/actualizar/eliminar)
  services/    carritoService, usuarioService, ordenService (lógica: pago simulado, stock, órdenes)
  utils/       validaciones, productos (ofertas/filtros), reportes
  context/     AuthContext, CartContext (estado compartido; la UI se actualiza en tiempo real)
  components/  BotonAccion, BarraBusqueda, Navigation, ProductCard, ProductList, CategoriaCard,
               ShoppingCart, CheckoutForm, ResumenCompra, Boleta, AdminLayout, ...
  pages/       tienda: Inicio, Productos, DetalleProducto, Categorias, CategoriaDetalle, Ofertas,
               Carrito, Checkout, CompraExitosa, PagoError, Pedido, Seguimiento, Login, Registro, ...
  pages/admin  Dashboard, Órdenes/Boleta, Productos (nuevo/ver/editar), Críticos, Categorías,
               Usuarios (nuevo/ver/editar/historial), Reportes, Perfil
  pages/vendedor  panel de solo lectura
  tests/       *.spec.js (Jasmine)
```

## Flujo de compra
Carrito → **Checkout** (se rellena solo si hay sesión) → pago simulado:
- Efectivo: siempre aprobado → **Pago correcto** (boleta, *Imprimir boleta en PDF*, *Enviar boleta por email* simulado).
- Tarjeta: 16 dígitos; si termina en `0000` se rechaza → **Pago con error** → *Volver a realizar el pago* (reutiliza la misma orden).

## Pruebas (Jasmine + Karma)
51 pruebas en `src/tests`: renderizado (listas, renderizado condicional), props, estado (formularios, carrito), eventos
(click, submit), mocks (`jasmine.createSpy`, `createSpyObj`, `spyOn(window,'confirm')`, `spyOn(Storage.prototype,'getItem')`),
lógica (validaciones, CRUD, pago, stock, reportes) y flujo de checkout completo.
