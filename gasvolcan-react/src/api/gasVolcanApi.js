// =========================================================
// gasVolcanApi.js - Todas las llamadas REST al backend, agrupadas por recurso.
// Endpoints versionados: /api/v1/...  (ver Swagger: http://localhost:8080/swagger-ui.html)
// Cada función devuelve una Promise con los datos de la respuesta (response.data).
// =========================================================
import { http } from './http';

const datos = (respuesta) => respuesta.data;

export const authApi = {
  login: (correo, contrasena) => http.post('/auth/login', { correo, contrasena }).then(datos),
  registrar: (usuario) => http.post('/auth/register', usuario).then(datos),
  yo: () => http.get('/auth/me').then(datos),
};

export const productosApi = {
  listar: () => http.get('/productos').then(datos),
  crear: (producto) => http.post('/productos', producto).then(datos),
  actualizar: (codigo, producto) => http.put(`/productos/${codigo}`, producto).then(datos),
  eliminar: (codigo) => http.delete(`/productos/${codigo}`),
};

export const categoriasApi = {
  listar: () => http.get('/categorias').then(datos),
  crear: (categoria) => http.post('/categorias', categoria).then(datos),
  actualizar: (id, categoria) => http.put(`/categorias/${id}`, categoria).then(datos),
  eliminar: (id) => http.delete(`/categorias/${id}`),
};

export const usuariosApi = {
  listar: () => http.get('/usuarios').then(datos),
  repartidores: () => http.get('/usuarios/repartidores').then(datos),
  crear: (usuario) => http.post('/usuarios', usuario).then(datos),
  actualizar: (run, usuario) => http.put(`/usuarios/${run}`, usuario).then(datos),
  eliminar: (run) => http.delete(`/usuarios/${run}`),
};

export const camionesApi = {
  listar: () => http.get('/camiones').then(datos),
};

export const ordenesApi = {
  todas: () => http.get('/ordenes').then(datos),
  mias: () => http.get('/ordenes/mis').then(datos),
  misEntregas: () => http.get('/ordenes/mis-entregas').then(datos),
  comprar: (compra) => http.post('/ordenes', compra).then(datos),
  reintentarPago: (numero, pago) => http.put(`/ordenes/${numero}/pago`, pago).then(datos),
  pedidoRapido: (pedido) => http.post('/ordenes/rapido', pedido).then(datos),
  pedidoTelefonico: (pedido) => http.post('/ordenes/telefono', pedido).then(datos),
  asignar: (numero, asignacion) => http.post(`/ordenes/${numero}/asignacion`, asignacion).then(datos),
  cambiarEstado: (numero, estado) => http.put(`/ordenes/${numero}/estado`, { estado }).then(datos),
};
