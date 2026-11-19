# Manual de usuario — Gas El Volcán

> Cada sección lleva un marcador **[CAPTURA: ...]**: tomar la captura de pantalla con el sistema funcionando y pegarla ahí.

## 0. Requisitos para usar el sistema
1. MySQL encendido y backend ejecutándose (`http://localhost:8080`).
2. Frontend ejecutándose (`npm start`) y abierto en `http://localhost:3000`.
3. Cuentas de prueba:

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@duoc.cl | admin123 |
| Operadora | operadora@duoc.cl | opera123 |
| Repartidor | repenzo@duoc.cl | reparte123 |

Si el backend está apagado aparece *"No se pudieron cargar los datos"* con el botón **Reintentar**.
**[CAPTURA: pantalla de error con backend apagado]**

## 1. Cliente (tienda)
### 1.1 Crear cuenta
Menú **Registro** → completar RUN (sin puntos ni guión), nombre, apellidos, correo (`duoc.cl`, `profesor.duoc.cl` o `gmail.com`), contraseña (4 a 10 caracteres), región, comuna y dirección → **Registrar**. Si el RUN o el correo ya existen, el sistema lo avisa.
**[CAPTURA: formulario de registro]** · **[CAPTURA: mensaje "Cuenta creada con éxito"]**

### 1.2 Iniciar sesión
Menú **Login** → correo y contraseña → **Iniciar Sesión**. Con credenciales incorrectas muestra un mensaje de error. La sesión se mantiene aunque se recargue la página.
**[CAPTURA: login]** · **[CAPTURA: login con error]**

### 1.3 Ver productos y comprar
**Productos / Categorías / Ofertas** → *Agregar al carrito* → **Carrito** (cambiar cantidades o eliminar) → **Pagar** → **Checkout** (con sesión, los datos vienen rellenados) → elegir efectivo o tarjeta → **Pagar ahora**.
- Efectivo: siempre aprobado. Tarjeta: 16 dígitos; si termina en `0000` el banco la rechaza.
- Pago aprobado → boleta con *Imprimir boleta en PDF* y *Enviar boleta por email* (simulado).
- Pago rechazado → pantalla de error con **Volver a realizar el pago**.
**[CAPTURA: catálogo]** · **[CAPTURA: carrito]** · **[CAPTURA: checkout]** · **[CAPTURA: compra exitosa]** · **[CAPTURA: pago con error]**

### 1.4 Pedido rápido y seguimiento
**Pedido** → nombre, teléfono (+56 y 9 dígitos), dirección, tipo de cilindro y cantidad → **Enviar Pedido** (pago en efectivo al recibir). **Seguimiento** muestra solo los pedidos del usuario con su estado (Pendiente, Asignado, En camino, Entregado, Cancelado).
**[CAPTURA: pedido rápido]** · **[CAPTURA: seguimiento]**

## 2. Administrador (`/admin`)
Menú lateral: Dashboard, Órdenes, Productos, Críticos, Categorías, Usuarios, Reportes, Perfil.
- **Productos**: *Nuevo producto*, *Ver*, *Editar*, *Eliminar* (con confirmación). **[CAPTURA: listado]** · **[CAPTURA: formulario de producto]**
- **Críticos**: productos con stock bajo. **[CAPTURA]**
- **Categorías**: crear, editar, eliminar (no se puede eliminar una con productos). **[CAPTURA]**
- **Usuarios**: crear con cualquier rol (Cliente, Administrador, Operadora, Repartidor), editar (contraseña opcional), eliminar, ver historial. **[CAPTURA: listado]** · **[CAPTURA: formulario]**
- **Órdenes**: todas las órdenes, con boleta. **Reportes**: totales y gráficos. **[CAPTURA]**

## 3. Operadora (`/operadora`)
1. **Registrar pedido por llamada**: nombre, teléfono (el +56 ya viene puesto, 9 dígitos), dirección, comuna, producto, cantidad e indicaciones → **Registrar pedido**. **[CAPTURA]**
2. **Pedidos por asignar**: elegir **camión** y **repartidor**, escribir instrucciones y pulsar **Asignar y enviar datos**. Un repartidor sale en un solo camión y un camión lo lleva un solo repartidor (puede llevar varios pedidos). También puede **Cancelar**. **[CAPTURA]**
3. Tablas de **Flota de camiones**, **Repartidores**, **Pedidos en curso** y **Pedidos del día**. **[CAPTURA]**

## 4. Repartidor (`/repartidor`)
**Mis entregas** muestra solo los pedidos asignados a él, con cliente, teléfono, dirección, instrucciones y si debe cobrar en efectivo.
Botones: **Salir a repartir** (pasa a *En camino*) y **Entregado y pagado** (pasa a *Entregado*). El historial queda abajo. **[CAPTURA: entregas]** · **[CAPTURA: historial]**

## 5. Restricciones por rol (demostración)
- Sin sesión o como Cliente, escribir `/admin` en la URL → vuelve al login. **[CAPTURA]**
- Cada rol solo ve sus accesos en el menú superior. **[CAPTURA: menú de cada rol]**
- Cerrar sesión: botón **Salir**.

## 6. Swagger (documentación del backend)
Abrir `http://localhost:8080/swagger-ui.html`, ejecutar `POST /auth/login`, copiar el `accessToken`, pulsar **Authorize** y probar endpoints. **[CAPTURA: Swagger con los endpoints]** · **[CAPTURA: Authorize]** · **[CAPTURA: respuesta 403 con rol incorrecto]**
