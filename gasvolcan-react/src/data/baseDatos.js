// =========================================================
// baseDatos.js - FUENTE DE DATOS SIMULADA (similar a una base de datos)
//
// Cuatro "tablas": productos, categorias, usuarios y ordenes.
// Cada una se siembra con datos iniciales la primera vez y se guarda
// en localStorage (persistencia). Las operaciones CRUD de abajo son
// las ÚNICAS que leen y modifican esos datos; los componentes de React
// las llaman y actualizan su estado para refrescar la interfaz.
//
//   Crear      -> crear(tabla, fila)
//   Leer       -> leer(tabla) / leerUno(tabla, valorClave)
//   Actualizar -> actualizar(tabla, valorClave, cambios)
//   Eliminar   -> eliminar(tabla, valorClave)
// =========================================================
import { CLAVES, guardarJSON, leerJSON } from './almacenamiento';
import {
  CATEGORIAS_SEMILLA, PRODUCTOS_SEMILLA, USUARIOS_SEMILLA,
} from './datos';

const TABLAS = {
  productos: { clave: CLAVES.productos, pk: 'codigo', semilla: PRODUCTOS_SEMILLA },
  categorias: { clave: CLAVES.categorias, pk: 'id', semilla: CATEGORIAS_SEMILLA },
  usuarios: { clave: CLAVES.usuarios, pk: 'run', semilla: USUARIOS_SEMILLA },
  ordenes: { clave: CLAVES.ordenes, pk: 'numero', semilla: [] },
};

function definicion(tabla) {
  const def = TABLAS[tabla];
  if (!def) throw new Error('Tabla desconocida: ' + tabla);
  return def;
}

// ---------- CRUD genérico ----------

// LEER: todas las filas (si la tabla no existe todavía, se siembra)
export function leer(tabla) {
  const { clave, semilla } = definicion(tabla);
  const guardado = leerJSON(clave, null);
  if (guardado) return guardado;
  const copia = JSON.parse(JSON.stringify(semilla));
  guardarJSON(clave, copia);
  return copia;
}

// LEER: una fila por su clave (o null)
export function leerUno(tabla, valorClave) {
  const { pk } = definicion(tabla);
  return leer(tabla).find((fila) => fila[pk] === valorClave) || null;
}

// CREAR: agrega una fila; falla si la clave ya existe
export function crear(tabla, fila) {
  const { clave, pk } = definicion(tabla);
  const filas = leer(tabla);
  if (filas.some((f) => f[pk] === fila[pk])) {
    throw new Error(`Ya existe un registro con ${pk} = ${fila[pk]} en ${tabla}`);
  }
  guardarJSON(clave, [...filas, fila]);
  return fila;
}

// ACTUALIZAR: mezcla los cambios en la fila; devuelve la fila nueva o null
export function actualizar(tabla, valorClave, cambios) {
  const { clave, pk } = definicion(tabla);
  const filas = leer(tabla);
  const indice = filas.findIndex((f) => f[pk] === valorClave);
  if (indice < 0) return null;
  const nueva = { ...filas[indice], ...cambios, [pk]: filas[indice][pk] };
  const copia = filas.slice();
  copia[indice] = nueva;
  guardarJSON(clave, copia);
  return nueva;
}

// ELIMINAR: borra la fila; devuelve true si existía
export function eliminar(tabla, valorClave) {
  const { clave, pk } = definicion(tabla);
  const filas = leer(tabla);
  const resto = filas.filter((f) => f[pk] !== valorClave);
  if (resto.length === filas.length) return false;
  guardarJSON(clave, resto);
  return true;
}

// ---------- Productos ----------
export const listarProductos = () => leer('productos');
export const obtenerProducto = (codigo) => leerUno('productos', codigo);
export const crearProducto = (producto) => crear('productos', producto);
export const actualizarProducto = (codigo, cambios) => actualizar('productos', codigo, cambios);
export const eliminarProducto = (codigo) => eliminar('productos', codigo);

// ---------- Categorías ----------
export const listarCategorias = () => leer('categorias');
export const obtenerCategoria = (id) => leerUno('categorias', id);

function generarIdCategoria(nombre) {
  const base = String(nombre)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'categoria';
  let id = base;
  let n = 2;
  while (obtenerCategoria(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}

export function crearCategoria({ nombre, descripcion }) {
  return crear('categorias', {
    id: generarIdCategoria(nombre),
    nombre: String(nombre).trim(),
    descripcion: String(descripcion || '').trim(),
  });
}
export const actualizarCategoria = (id, cambios) => actualizar('categorias', id, cambios);

// Regla: no se puede eliminar una categoría que todavía tiene productos
export function eliminarCategoria(id) {
  if (listarProductos().some((p) => p.categoriaId === id)) {
    return { ok: false, motivo: 'La categoría tiene productos asociados.' };
  }
  return { ok: eliminar('categorias', id), motivo: '' };
}

// ---------- Usuarios ----------
export const listarUsuarios = () => leer('usuarios');
export const obtenerUsuario = (run) => leerUno('usuarios', run);
export const crearUsuario = (usuario) => crear('usuarios', usuario);
export const actualizarUsuario = (run, cambios) => actualizar('usuarios', run, cambios);
export const eliminarUsuario = (run) => eliminar('usuarios', run);

// ---------- Órdenes (compras y pedidos rápidos) ----------
// Las más recientes primero
export const listarOrdenes = () =>
  leer('ordenes').slice().sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
export const obtenerOrden = (numero) => leerUno('ordenes', numero);
export const crearOrden = (orden) => crear('ordenes', orden);
export const actualizarOrden = (numero, cambios) => actualizar('ordenes', numero, cambios);
export const eliminarOrden = (numero) => eliminar('ordenes', numero);
