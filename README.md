# Gas El Volcán — Backend (Spring Boot) · Evaluación Parcial 3, DSY1104

API REST para la tienda **Distribuidora de Gas El Volcán**: catálogo, usuarios con roles, compras, pedidos por teléfono y reparto (operadora + repartidores).
Se conecta a **MySQL**, documenta los endpoints con **Swagger** y protege todo con **JWT**.

| Tecnología | Uso |
|---|---|
| Java 17+ (recomendado JDK 21) y Spring Boot 3.3 | Aplicación |
| Spring Data JPA + MySQL | Persistencia (tablas creadas solas con `ddl-auto=update`) |
| Spring Security + JJWT | Autenticación JWT sin sesión (stateless), roles |
| BCrypt | Contraseñas guardadas con hash |
| springdoc-openapi | Swagger UI |
| Bean Validation | Validación de datos de entrada |

## Cómo ejecutarlo

1. Tener **MySQL** encendido en `localhost:3306` (la base `gasvolcan` se crea sola).
2. Si tu MySQL no usa `root` sin clave, define las variables de entorno `DB_USER` y `DB_PASSWORD`
   (o edita `src/main/resources/application.properties`).
3. Ejecutar (con JDK 17 o 21; **no** JDK 25):
   ```bash
   mvn spring-boot:run
   ```
   o abrir la carpeta en IntelliJ / VS Code (Extension Pack for Java) y ejecutar `GasVolcanApplication`.
4. Listo: API en `http://localhost:8080` y **Swagger en http://localhost:8080/swagger-ui.html**.

La primera vez, `DataInitializer` carga categorías, productos, 2 camiones y las cuentas de prueba:

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@duoc.cl | admin123 |
| Operadora | operadora@duoc.cl | opera123 |
| Repartidor | repenzo@duoc.cl · repjaviera@duoc.cl · repnico@duoc.cl | reparte123 |

Opcional: `JWT_SECRET` (mínimo 32 caracteres) cambia la clave con la que se firman los tokens.

## Probar JWT en Swagger
1. `POST /api/v1/auth/login` con `{ "correo": "admin@duoc.cl", "contrasena": "admin123" }` → entrega `accessToken` y `refreshToken`.
2. Botón **Authorize** (arriba a la derecha) → pegar el `accessToken` → *Authorize*.
3. Ya puedes probar los endpoints protegidos. Sin token responde **401**; con un rol que no corresponde, **403**.
4. `POST /api/v1/auth/refresh` con el `refreshToken` entrega tokens nuevos (renovación).

## JWT
- **Access token**: 30 minutos. Lleva el correo (subject), el rol y el tipo (`access`).
- **Refresh token**: 7 días, tipo `refresh` (no sirve para llamar a la API, solo para renovar).
- Firma HS256 con la clave `jwt.secret`. `JwtAuthFilter` valida firma y vencimiento en cada petición y vuelve a cargar al usuario desde la base de datos.

## Endpoints y roles (`/api/v1`)
| Recurso | Endpoint | Quién puede |
|---|---|---|
| Auth | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh` | Público |
| Auth | `GET /auth/me` | Cualquier usuario con sesión |
| Productos | `GET /productos`, `GET /productos/{codigo}` | Público |
| Productos | `POST`, `PUT /{codigo}`, `DELETE /{codigo}` | Administrador |
| Categorías | `GET` | Público |
| Categorías | `POST`, `PUT /{id}`, `DELETE /{id}` (409 si tiene productos) | Administrador |
| Usuarios | `GET`, `GET /{run}`, `POST`, `PUT /{run}`, `DELETE /{run}` | Administrador |
| Usuarios | `GET /usuarios/repartidores` | Administrador, Operadora |
| Camiones | `GET /camiones` | Administrador, Operadora |
| Órdenes | `POST /ordenes` (compra), `POST /ordenes/rapido`, `PUT /ordenes/{n}/pago` (reintento) | Público (con sesión queda a nombre del usuario) |
| Órdenes | `GET /ordenes` | Administrador, Operadora |
| Órdenes | `GET /ordenes/mis` | Cliente |
| Órdenes | `GET /ordenes/mis-entregas` | Repartidor |
| Órdenes | `GET /ordenes/{n}` | Dueño de la orden, repartidor asignado, Operadora, Administrador |
| Órdenes | `POST /ordenes/telefono` (pedido por llamada) | Operadora, Administrador |
| Órdenes | `POST /ordenes/{n}/asignacion` (camión + repartidor) | Operadora, Administrador |
| Órdenes | `PUT /ordenes/{n}/estado` | Repartidor asignado (en-camino, entregado) · Operadora/Administrador (cancelado) |

## Reglas de negocio (se validan en el servidor)
- RUN y correo únicos; correo con dominio `duoc.cl`, `profesor.duoc.cl` o `gmail.com`; el registro público siempre crea un **Cliente**.
- Los **precios los calcula el servidor** (el cliente solo envía código y cantidad); el stock se descuenta al comprar y no puede quedar negativo.
- Pago simulado: efectivo siempre aprobado; tarjeta de 16 dígitos, y si termina en `0000` se rechaza (orden `pago-fallido`, se puede reintentar). El número de tarjeta nunca se guarda.
- Reparto: un repartidor sale en **un solo camión** y un camión lo lleva **un solo repartidor**, pero puede llevar varios pedidos a la vez (si no, 409).
- Flujo: `pendiente → asignado → en-camino → entregado` (cancelado desde pendiente, asignado o en-camino).
- Errores en JSON: `{ "estado": 409, "mensaje": "...", "errores": { campo: mensaje } }`.

## Pruebas automáticas

```bash
mvn test
```

Usan H2 en memoria (no necesitan MySQL): `OrdenServiceTest` y `UsuarioServiceTest` (JUnit 5 + Mockito, reglas de negocio),
`EstadoOrdenTest`, `OrdenPersistenciaTest` (`@DataJpaTest`) y `ApiSeguridadTest` (JWT y roles con MockMvc).
La guía para la presentación está en `docs/GUIA_PRESENTACION.md`.

## Estructura
```
src/main/java/cl/gasvolcan/api/
  config/      SecurityConfig, OpenApiConfig, DataInitializer
  security/    JwtService, JwtAuthFilter, SesionActual, respuestas 401/403
  model/       Usuario, Categoria, Producto, Camion, Orden, OrdenItem, enums
  repository/  interfaces Spring Data JPA
  dto/         objetos de entrada/salida de la API
  service/     lógica de negocio
  controller/  endpoints REST (@PreAuthorize por rol)
  exception/   errores de negocio y manejador global
```
