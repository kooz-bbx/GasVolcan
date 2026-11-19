# Documento de integración — Gas El Volcán (Parcial 3, DSY1104)

Integración entre el **frontend** (React) y el **backend** (Spring Boot + MySQL) de la tienda online *Distribuidora de Gas El Volcán*.

- Frontend: `gasvolcan-react` — `http://localhost:3000`
- Backend: `gasvolcan-backend` — `http://localhost:8080` (Swagger: `/swagger-ui.html`)
- Repositorios: _(pegar aquí los links públicos de GitHub del frontend y del backend)_

## 1. Arquitectura

```
 Navegador (React)  ──HTTP/JSON + JWT──►  Spring Boot (REST)  ──JPA──►  MySQL "gasvolcan"
  páginas → servicios → api (Axios)        controller → service → repository
```

| Capa frontend | Archivo | Qué hace |
|---|---|---|
| Cliente HTTP | `src/api/http.js` | Axios con la URL base, agrega el token y renueva si vence |
| Llamadas REST | `src/api/gasVolcanApi.js` | Una función por endpoint (`ordenesApi.comprar`, `productosApi.listar`, ...) |
| Servicios | `src/services/*.js` | Preparan los datos, llaman a la API y actualizan la copia local |
| Copia local | `src/data/baseDatos.js` | Guarda en memoria lo descargado para que las pantallas lo lean al instante |
| Estado global | `src/context/*.js` | `AuthContext` (sesión), `DatosContext` (carga de datos), `CartContext` (carrito) |
| Pantallas | `src/pages`, `src/components` | Muestran datos y disparan acciones |

| Capa backend | Paquete | Qué hace |
|---|---|---|
| Controller | `controller` | Endpoints REST `/api/v1/...`, `@PreAuthorize` por rol, documentación Swagger |
| Service | `service` | Reglas de negocio (precios, stock, pago, reparto) |
| Repository | `repository` | Acceso a la base de datos (Spring Data JPA) |
| Model | `model` | Entidades: Usuario, Categoria, Producto, Camion, Orden, OrdenItem |
| Security | `security`, `config` | JWT, filtro de autenticación, CORS, reglas de acceso |

## 2. Flujo de datos (ejemplo: comprar un cilindro)

1. El cliente agrega productos al **carrito** (se guarda solo en `localStorage`: código y cantidad).
2. En **Checkout** completa sus datos y pulsa *Pagar ahora* → `Checkout.js` llama a `pagarCompra()` (`ordenService.js`).
3. `pagarCompra` envía `POST /api/v1/ordenes` con cliente, entrega, método de pago e **ítems solo con código y cantidad**.
4. El backend (`OrdenService.crearCompra`) busca los productos, **calcula los precios**, valida el stock, procesa el pago simulado, descuenta el stock y guarda la orden en MySQL. Responde la orden con estado `pendiente` o `pago-fallido`.
5. El frontend guarda la orden en la copia local, vuelve a pedir `GET /productos` (stock actualizado) y navega a la pantalla de éxito o de error.

Lectura de datos: al abrir la app y en cada cambio de página, `DatosProvider` llama a `sincronizar(rol)` y descarga solo lo que ese rol puede ver:

| Rol | Se descarga |
|---|---|
| Visitante | productos, categorías |
| Cliente | + sus órdenes (`GET /ordenes/mis`) |
| Administrador | + usuarios, todas las órdenes, camiones |
| Operadora | + repartidores, todas las órdenes, camiones |
| Repartidor | + sus entregas (`GET /ordenes/mis-entregas`) |

## 3. Endpoints consumidos por el frontend

| Pantalla | Endpoint |
|---|---|
| Login / sesión | `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh` |
| Registro | `POST /auth/register` |
| Tienda (catálogo) | `GET /productos`, `GET /categorias` |
| Checkout / reintento de pago | `POST /ordenes`, `PUT /ordenes/{n}/pago` |
| Pedido rápido | `POST /ordenes/rapido` |
| Seguimiento (cliente) | `GET /ordenes/mis` |
| Admin: productos / categorías / usuarios | `POST`, `PUT`, `DELETE` en `/productos`, `/categorias`, `/usuarios` |
| Admin: órdenes y reportes | `GET /ordenes`, `GET /usuarios` |
| Operadora | `POST /ordenes/telefono`, `POST /ordenes/{n}/asignacion`, `PUT /ordenes/{n}/estado` (cancelado), `GET /camiones`, `GET /usuarios/repartidores` |
| Repartidor | `GET /ordenes/mis-entregas`, `PUT /ordenes/{n}/estado` (en-camino, entregado) |

La lista completa con ejemplos de entrada/salida está en Swagger (`/swagger-ui.html`).

## 4. Autenticación JWT y roles

**Login**: `POST /auth/login` → el backend verifica el correo y la contraseña (BCrypt) y responde `accessToken` (30 min), `refreshToken` (7 días) y los datos del usuario.

**Cada petición**: el interceptor de `http.js` agrega `Authorization: Bearer <accessToken>`. En el backend, `JwtAuthFilter` valida la firma (HS256) y el vencimiento, carga al usuario y lo deja en el contexto de Spring Security con su rol (`ROLE_ADMINISTRADOR`, `ROLE_OPERADORA`, `ROLE_REPARTIDOR`, `ROLE_CLIENTE`).

**Renovación**: si el backend responde **401** (access token vencido), el interceptor llama `POST /auth/refresh` con el refresh token, guarda los tokens nuevos y **repite la petición original** sin que el usuario lo note. Si varias peticiones fallan a la vez, se renueva una sola vez. Si el refresh token también venció, se borran los tokens y se manda al usuario al login.

**Roles en el backend**: cada endpoint tiene `@PreAuthorize` (ej. `hasRole('ADMINISTRADOR')`). Sin token → **401**; token válido pero rol incorrecto → **403** (ambos con cuerpo JSON). Las reglas por usuario se validan en el servicio (un cliente solo ve sus órdenes; solo el repartidor asignado cambia su pedido).

## 5. Manejo de sesión en el frontend

- Al iniciar sesión, `AuthContext` guarda los tokens en `localStorage` (clave `gv_tokens`) y el usuario en el estado.
- **Persistencia al recargar**: al abrir la página, si hay tokens guardados se llama `GET /auth/me`; mientras responde se muestra *Cargando...* (así no se manda al login por error). Si el token ya no sirve (401/403/404), se borra y se pide iniciar sesión.
- **Cerrar sesión** (`salir`): borra los tokens y los datos privados de la copia local (órdenes, usuarios, camiones).
- El carrito se conserva aparte (`gv_carrito`).

## 6. Restricciones de acceso en el frontend

`RutaProtegida` recibe la lista de roles permitidos y redirige a `/login` si no hay sesión o el rol no corresponde:

| Ruta | Roles |
|---|---|
| `/admin/*` | Administrador |
| `/operadora` | Operadora, Administrador |
| `/repartidor` | Repartidor |
| Tienda, login, registro | Todos |

La barra de navegación muestra solo los accesos del rol actual. **La seguridad real está en el backend**: aunque alguien llegue a una pantalla, el backend rechaza con 401/403 las peticiones que no le corresponden.

## 7. Manejo de errores

El backend responde siempre JSON `{ "estado", "mensaje", "errores" }`. El frontend usa `mensajeDeError()` para mostrarlo en pantalla:

| Código | Ejemplo | Qué ve el usuario |
|---|---|---|
| 400 | Datos inválidos | Mensajes por campo |
| 401 | Credenciales incorrectas / token inválido | "Correo o contraseña incorrectos" / vuelve al login |
| 403 | Rol sin permiso | Mensaje del backend |
| 409 | RUN o correo repetido, stock insuficiente, camión ocupado, categoría con productos | Mensaje del backend |
| sin respuesta | Backend apagado | "No se pudo conectar con el servidor" + botón Reintentar |

## 8. CORS

El backend permite peticiones desde `http://localhost:3000` y `http://localhost:5173` (`SecurityConfig`). Si el frontend corre en otro origen, hay que agregarlo ahí.

## 9. Cómo probar la integración

1. Levantar MySQL y el backend; abrir Swagger y probar `POST /auth/login` + *Authorize*.
2. Levantar el frontend (`npm start`) e iniciar sesión con cada cuenta de prueba (ver README).
3. Comprar como cliente → entrar como operadora y asignar camión y repartidor → entrar como repartidor y marcar *en camino* / *entregado* → ver el estado en *Seguimiento* del cliente.
4. Recargar la página con sesión iniciada (F5): la sesión se mantiene.
5. Intentar entrar a `/admin` como cliente o repartidor: redirige al login.
