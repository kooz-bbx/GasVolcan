# Guía para la presentación individual — Distribuidora de Gas El Volcán

Duración: 15 minutos + 5 de preguntas. Cada uno debe poder explicar los 4 puntos **con el código abierto**.
Antes de empezar: `cd gasvolcan-react`, `npm install` y dejar `npm start` corriendo (http://localhost:3000). Tener VS Code abierto en el proyecto.

## Tiempos sugeridos
| Min | Qué | 
|---|---|
| 0–2 | Qué es el proyecto y cómo está armado |
| 2–7 | Componentes, props, estado y Bootstrap (mostrando la app) |
| 7–12 | Pruebas unitarias: correr `npm test` y abrir pruebas |
| 12–15 | Proceso de testeo, cobertura y cierre |

## 1. Diseño del proyecto con React (framework JavaScript)
- **Qué decir:** migramos la tienda de HTML/JS a **React**. Separamos la *lógica* (`src/services`, `src/utils`, `src/data`) de la *interfaz* (`src/components`, `src/pages`). El estado compartido (sesión y carrito) va en **Context** (`src/context`).
- **Mostrar:**
  - Árbol de carpetas (README).
  - `src/App.js`: rutas con React Router, `RutaProtegida` por rol y carga diferida (`lazy` + `Suspense`) de los paneles admin/vendedor.
  - `src/index.js`: punto de entrada.
- **Frase clave:** "la lógica de negocio quedó en servicios y utilidades, y los componentes solo la usan; por eso se puede probar sin abrir el navegador".

## 2. Componentes React, props, estados y diseño responsivo con Bootstrap
- **Props:** `ProductCard` recibe `producto` y `onAgregar`; `BotonAccion` recibe `etiqueta`, `onClick`, `variante`, `deshabilitado`; `AccionesReparto` recibe `orden` y `onCambiar`.
- **Estado (`useState`):** `Login` (mensaje de error), `Seguimiento`, `VendedorPedidos` (lista de órdenes y mensaje), `CartContext` (items del carrito).
- **Estado compartido:** `CartContext` y `AuthContext`: al añadir un producto sube el contador del carrito en el header sin recargar.
- **Formularios:** `react-hook-form` en Login, Registro, Checkout y formularios del admin (validación de RUN, correo, teléfono, contraseña).
- **Renderizado condicional:** `ProductCard` muestra el descuento solo si hay oferta y el aviso de "stock bajo" solo si corresponde; `Checkout` sin carrito no muestra el formulario.
- **Bootstrap responsivo** (mostrarlo achicando la ventana o con F12 → modo celular):
  - `ProductList.js`: `<Col lg={3} md={4} sm={6}>` → 4, 3, 2 y 1 columnas según el ancho.
  - `Navigation.js`: `<Navbar expand="lg">` → menú hamburguesa en pantallas chicas.
  - `Table responsive` en las tablas (ej. Seguimiento), `Card`, `Badge`, `Alert`, `Form`.
- **Flujo para demostrar:** añadir un cilindro → carrito → checkout (pagar con tarjeta terminada en 0000 para ver el error y "reintentar") → compra exitosa con boleta → Seguimiento. Luego entrar como vendedor y avanzar el pedido (Salir a repartir → Entregado y pagado).

## 3. Demostrar pruebas unitarias con Jasmine y Karma
- **Mostrar:** `npm test` y señalar `TOTAL: 55 SUCCESS` (o el número que salga en pantalla) y el resumen de cobertura. Abrir `coverage/html/index.html` en el navegador.
- **Abrir 10 pruebas** (archivo → qué prueba):
  1. `validaciones.spec.js` → RUN con dígito verificador correcto/incorrecto.
  2. `validaciones.spec.js` → correo solo con dominios permitidos.
  3. `carritoService.spec.js` → el descuento de la oferta (CL001 con 10%).
  4. `ordenService.spec.js` → pago con tarjeta que termina en 0000 se rechaza.
  5. `ordenService.spec.js` → el stock nunca queda bajo 0.
  6. `reparto.spec.js` → no permite saltarse pasos del flujo del pedido.
  7. `baseDatos.spec.js` → CRUD: no permite repetir el código de un producto.
  8. `ProductCard.spec.js` → mock: al presionar "Añadir" llama a `onAgregar` con el producto.
  9. `ShoppingCart.spec.js` → estado: "+" suma, "-" resta y en 0 la fila desaparece.
  10. `Checkout.spec.js` → pago con error: guarda la orden "pago-fallido" y conserva el carrito.
- **Frase clave:** "cada prueba sigue Preparar → Actuar → Verificar (Arrange-Act-Assert) y empieza con `localStorage.clear()` para ser independiente".

## 4. Proceso de testeo unitario
- **Configuración del entorno:** `karma.conf.js` (Jasmine, Chrome headless, webpack + Babel para entender JSX, cobertura con istanbul). `src/test-utils.js` tiene ayudas para renderizar con Router y contextos.
- **Escritura de pruebas:** `describe` / `it` / `beforeEach` / `afterEach`; `cleanup()` después de cada prueba de componente.
- **Mocks:**
  - `jasmine.createSpy('onClick')` reemplaza la función que recibe el componente y verifica cómo se llamó (`BotonAccion.spec.js`, `ProductCard.spec.js`).
  - `spyOn(window, 'confirm')` simula el cuadro de confirmación al eliminar un producto (`AdminProductos.spec.js`).
  - `spyOn(Storage.prototype, 'getItem')` simula que localStorage trae datos (`carritoService.spec.js`).
- **Análisis de resultados:** abrir el reporte de cobertura y explicar qué falta (ver el Documento de cobertura de testing): el reporte solo mide los archivos que alguna prueba carga, y las páginas sin prueba (ej. varias del panel admin) quedan fuera; se verificaron manualmente.

## Preguntas típicas del docente (prepara tu respuesta)
- **¿Diferencia entre props y estado?** Las props vienen del padre y no se modifican; el estado es propio del componente y se cambia con `setX`.
- **¿Para qué sirve `key` en las listas?** Para que React identifique cada elemento al redibujar (ej. `key={producto.codigo}`).
- **¿Qué es un componente controlado?** Uno cuyo valor del input vive en el estado de React (ej. `BarraBusqueda`).
- **¿Para qué el Context?** Para compartir sesión y carrito entre páginas sin pasar props por todos lados.
- **¿Qué es un mock/espía?** Un doble de prueba que registra cómo se llamó a una función (`createSpy`).
- **¿Qué mide la cobertura?** Qué porcentaje del código se ejecutó al correr las pruebas; no garantiza que esté bien probado.
- **¿Dónde se guardan los datos?** En `localStorage` (simula una base de datos con CRUD en `src/data/baseDatos.js`); no hay backend en esta etapa.
- **¿Por qué `lazy` y `Suspense`?** Para cargar los paneles admin/vendedor solo cuando se entra a ellos.
