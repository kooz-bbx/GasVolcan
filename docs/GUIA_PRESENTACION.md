# Guía para la presentación individual — Parcial 3 (60 %)

Cada integrante explica **todo**. Esta guía resume qué decir y dónde mostrarlo en el código. Practícalo con el proyecto abierto.

## 1. Backend (qué hace y cómo está armado)
- Spring Boot 3 + Java 17. Capas: **controller → service → repository → MySQL** (`gasvolcan-backend/src/main/java/cl/gasvolcan/api`).
- **Modelos** (`model/`): Usuario, Categoria, Producto, Camion, Orden y OrdenItem son entidades JPA; Hibernate crea las tablas solo (`ddl-auto=update`).
- **Conexión a BD**: `application.properties` (datasource MySQL, usuario/clave por variables de entorno).
- **Lógica de negocio** (`service/`): precios calculados en el servidor, stock, pago simulado, regla "1 repartidor = 1 camión", flujo de estados.
- **DTOs** (`dto/`): lo que entra y sale de la API (nunca se devuelve la contraseña).
- **Validaciones**: Bean Validation (`@NotBlank`, `@Min`...) y errores JSON con `ManejadorErrores`.

## 2. API REST y Swagger
- Endpoints bajo `/api/v1`, CRUD de productos, categorías y usuarios + órdenes y reparto (tabla en el README del backend).
- Swagger en `http://localhost:8080/swagger-ui.html`: mostrar `POST /auth/login`, botón **Authorize**, y probar un endpoint protegido.
- Códigos HTTP: 200/201 ok, 400 datos inválidos, 401 sin sesión, 403 sin permiso, 404 no existe, 409 conflicto de negocio.

## 3. Integración frontend ↔ backend (flujo de datos)
- `src/api/http.js` (Axios, URL base, interceptores) y `src/api/gasVolcanApi.js` (una función por endpoint).
- Flujo de ejemplo: Checkout → `pagarCompra` → `POST /ordenes` → el backend valida y guarda → el frontend guarda la respuesta y muestra la boleta.
- `DatosContext` descarga al abrir la app y al cambiar de página; `baseDatos.js` es la copia local en memoria.
- Detalle completo en el *Documento de integración*.

## 4. JWT y roles
- Login → `accessToken` (30 min) + `refreshToken` (7 días), firmados HS256 (`JwtService`).
- `JwtAuthFilter` valida el token en cada petición; `SecurityConfig` define rutas públicas y protegidas; `@PreAuthorize` restringe por rol.
- **Generación segura**: clave secreta de 32+ caracteres por variable de entorno, contraseñas con BCrypt, tokens con vencimiento.
- **Verificación**: firma + vencimiento + tipo de token. **Renovación**: `POST /auth/refresh`; el frontend lo hace solo al recibir 401.
- Roles: Cliente, Administrador, Operadora, Repartidor.

## 5. Sesión en el frontend
- `AuthContext`: `iniciarSesion`, `salir`, y recuperación de la sesión al recargar con `GET /auth/me` (tokens en `localStorage`).
- Demostración: iniciar sesión → F5 → sigue dentro. Cerrar sesión → se borran los tokens.

## 6. Restricciones por rol en el frontend
- `RutaProtegida` (`App.js` lo usa en `/admin`, `/operadora`, `/repartidor`); `Navigation` muestra solo los accesos del rol.
- Demostración: como cliente escribir `/admin` en la URL → redirige a login. Como operadora no se ve el panel admin.
- Idea clave: **el frontend solo oculta; el backend es quien realmente protege** (401/403).

## Posibles preguntas
- *¿Por qué no se envía el precio desde el frontend?* Porque el cliente podría manipularlo; el servidor lo calcula desde la base de datos.
- *¿Qué pasa si vence el access token?* El interceptor usa el refresh token, obtiene uno nuevo y repite la petición.
- *¿Dónde se guardan las contraseñas?* Con hash BCrypt en MySQL; nunca en texto plano ni en las respuestas.
- *¿Qué es CORS y por qué está configurado?* El navegador bloquea llamadas entre orígenes distintos (3000 → 8080) salvo que el backend las permita.
- *¿Por qué `localStorage` para los tokens?* Es simple y persiste al recargar; la alternativa más segura son cookies HttpOnly (mejora posible).

## 7. Pruebas automáticas del backend (`src/test`)
- **Cómo correrlas**: `mvn test` (o en IntelliJ: clic derecho a `src/test/java` → *Run Tests*). Usan **H2 en memoria**, no necesitan XAMPP.
- `OrdenServiceTest` (Mockito): precio con descuento calculado en el servidor, descuento de stock, tarjeta rechazada (`…0000`), sin stock, asignación camión/repartidor (1 repartidor = 1 camión), flujo de estados y permisos por rol.
- `UsuarioServiceTest` (Mockito): registro siempre Cliente, RUN/correo únicos, dominios permitidos, contraseña con BCrypt.
- `EstadoOrdenTest`: flujo pendiente → asignado → en-camino → entregado.
- `OrdenPersistenciaTest` (`@DataJpaTest` + H2): guardar órdenes con ítems y consultas por cliente/repartidor/estado.
- `ApiSeguridadTest` (`@SpringBootTest` + MockMvc): sin token 401, rol incorrecto 403, login, refresh token, el refresh no sirve como access.
- Idea clave: probamos **la lógica de negocio y la seguridad**, que es lo más importante del backend.
