// =========================================================
// baseDatos.js - ALMACÉN LOCAL DE DATOS (caché) alimentado por el backend.
//
// Los datos reales viven en la base de datos MySQL del backend. Esta capa guarda en
// memoria una copia de lo que el usuario actual puede ver, para que las pantallas
// puedan leerla de forma inmediata:
//
//   - sincronizar(tipoUsuario): descarga del backend las "tablas" que ese rol puede ver
//        (productos y categorías son públicos; órdenes, usuarios y camiones dependen del rol)
//   - listarX / obtenerX: leen la copia local
//   - guardarFila / quitarFila: actualizan la copia local después de crear/editar/eliminar en el backend
//
// Las operaciones de escritura (crear, editar, eliminar) se hacen en los servicios,
// que llaman primero a la API REST y luego actualizan esta copia.
// =========================================================
import {
  camionesApi, categoriasApi, ordenesApi, productosApi, usuariosApi,
} from '../api/gasVolcanApi';

const CLAVE_PRIMARIA = {
  productos: 'codigo',
  categorias: 'id',
  usuarios: 'run',
  ordenes: 'numero',
  camiones: 'patente',
};

let copia = { productos: [], categorias: [], usuarios: [], ordenes: [], camiones: [] };

const leer = (tabla) => copia[tabla];
const leerUno = (tabla, valor) => copia[tabla].find((f) => f[CLAVE_PRIMARIA[tabla]] === valor) || null;

// ---------- escritura en la copia local ----------

export function reemplazarTabla(tabla, filas) {
  copia = { ...copia, [tabla]: filas };
}

// Crea la fila o la reemplaza si ya existe (según su clave primaria)
export function guardarFila(tabla, fila) {
  const pk = CLAVE_PRIMARIA[tabla];
  const existe = copia[tabla].some((f) => f[pk] === fila[pk]);
  copia = {
    ...copia,
    [tabla]: existe ? copia[tabla].map((f) => (f[pk] === fila[pk] ? fila : f)) : [...copia[tabla], fila],
  };
  return fila;
}

export function quitarFila(tabla, valorClave) {
  const pk = CLAVE_PRIMARIA[tabla];
  copia = { ...copia, [tabla]: copia[tabla].filter((f) => f[pk] !== valorClave) };
}

// Al cerrar sesión se borran los datos que dependen del usuario
export function vaciarDatosPrivados() {
  copia = { ...copia, usuarios: [], ordenes: [], camiones: [] };
}

export function vaciarTodo() {
  copia = { productos: [], categorias: [], usuarios: [], ordenes: [], camiones: [] };
}

// ---------- sincronización con el backend ----------

// Qué tablas descarga cada rol (el backend además lo valida con el JWT)
// (se usan funciones flecha para que las pruebas puedan reemplazar las llamadas de la API)
const TABLAS_POR_ROL = {
  Administrador: {
    usuarios: () => usuariosApi.listar(),
    ordenes: () => ordenesApi.todas(),
    camiones: () => camionesApi.listar(),
  },
  Operadora: {
    usuarios: () => usuariosApi.repartidores(),
    ordenes: () => ordenesApi.todas(),
    camiones: () => camionesApi.listar(),
  },
  Repartidor: { ordenes: () => ordenesApi.misEntregas() },
  Cliente: { ordenes: () => ordenesApi.mias() },
};

// Descarga los datos y actualiza la copia local. Devuelve true si algo cambió.
export async function sincronizar(tipoUsuario) {
  const pedidos = {
    productos: () => productosApi.listar(),
    categorias: () => categoriasApi.listar(),
    ...(TABLAS_POR_ROL[tipoUsuario] || {}),
  };
  const tablas = Object.keys(pedidos);
  const antes = JSON.stringify(copia);
  const resultados = await Promise.all(tablas.map((t) => pedidos[t]()));
  tablas.forEach((t, i) => reemplazarTabla(t, resultados[i]));
  if (!tipoUsuario) vaciarDatosPrivados(); // sin sesión no hay usuarios ni camiones (las órdenes de invitado se conservan)
  return antes !== JSON.stringify(copia);
}

// Solo productos (para ver el stock actualizado después de una compra)
export async function recargarProductos() {
  reemplazarTabla('productos', await productosApi.listar());
}

// ---------- lectura ----------
export const listarProductos = () => leer('productos');
export const obtenerProducto = (codigo) => leerUno('productos', codigo);

export const listarCategorias = () => leer('categorias');
export const obtenerCategoria = (id) => leerUno('categorias', id);

export const listarUsuarios = () => leer('usuarios');
export const obtenerUsuario = (run) => leerUno('usuarios', run);

// Las más recientes primero
export const listarOrdenes = () =>
  leer('ordenes').slice().sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
export const obtenerOrden = (numero) => leerUno('ordenes', numero);

export const listarCamiones = () => leer('camiones');
export const obtenerCamion = (patente) => leerUno('camiones', patente);
