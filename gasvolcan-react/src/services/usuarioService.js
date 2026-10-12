import { capitalizarTexto } from '../utils/validaciones';
import { CLAVES, borrar, guardarJSON, leerJSON } from '../data/almacenamiento';
import {
  actualizarUsuario as actualizarUsuarioDB,
  crearUsuario as crearUsuarioDB,
  eliminarUsuario,
  listarUsuarios,
  obtenerUsuario,
} from '../data/baseDatos';

export { eliminarUsuario, listarUsuarios, obtenerUsuario };

// Crea las cuentas de prueba (admin y vendedor) la primera vez
export function sembrarUsuariosBase() {
  listarUsuarios(); // leer() siembra la tabla si todavía no existe
}

export function existeCorreo(correo, exceptoRun) {
  const c = String(correo).trim().toLowerCase();
  return listarUsuarios().some((u) => u.correo === c && u.run !== exceptoRun);
}

export function existeRun(run) {
  return Boolean(obtenerUsuario(String(run).trim().toUpperCase()));
}

export function buscarUsuarioPorCorreo(correo) {
  const c = String(correo).trim().toLowerCase();
  return listarUsuarios().find((u) => u.correo === c) || null;
}

// Registro desde la tienda (siempre Cliente) o desde el admin (con rol)
export function crearUsuario(datos, tipoForzado) {
  return crearUsuarioDB({
    run: String(datos.run).trim().toUpperCase(),
    nombre: capitalizarTexto(String(datos.nombre).trim()),
    apellidos: capitalizarTexto(String(datos.apellidos).trim()),
    correo: String(datos.correo).trim().toLowerCase(),
    contrasena: datos.contrasena || '',
    region: datos.region || '',
    comuna: datos.comuna || '',
    direccion: capitalizarTexto(String(datos.direccion || '').trim()),
    tipoUsuario: tipoForzado || datos.tipoUsuario || 'Cliente',
  });
}

// Edición: conserva la contraseña si no se escribe una nueva
export function actualizarUsuario(run, datos) {
  const anterior = obtenerUsuario(run);
  if (!anterior) return null;
  return actualizarUsuarioDB(run, {
    nombre: capitalizarTexto(String(datos.nombre).trim()),
    apellidos: capitalizarTexto(String(datos.apellidos).trim()),
    correo: String(datos.correo).trim().toLowerCase(),
    contrasena: datos.contrasena ? datos.contrasena : anterior.contrasena,
    region: datos.region || '',
    comuna: datos.comuna || '',
    direccion: capitalizarTexto(String(datos.direccion || '').trim()),
    tipoUsuario: datos.tipoUsuario || anterior.tipoUsuario || 'Cliente',
  });
}

// ----- Sesión -----
export function autenticar(correo, contrasena) {
  const usuario = buscarUsuarioPorCorreo(correo);
  if (!usuario || usuario.contrasena !== String(contrasena).trim()) return null;
  return usuario;
}

export function obtenerSesion() {
  return leerJSON(CLAVES.sesion, null);
}

export function guardarSesion(usuario) {
  const sesion = {
    correo: usuario.correo,
    nombre: usuario.nombre,
    tipoUsuario: usuario.tipoUsuario || 'Cliente',
  };
  guardarJSON(CLAVES.sesion, sesion);
  return sesion;
}

export function cerrarSesion() {
  borrar(CLAVES.sesion);
}

// A dónde lleva el login según el rol
export function rutaInicioPorRol(tipoUsuario) {
  if (tipoUsuario === 'Administrador') return '/admin';
  if (tipoUsuario === 'Vendedor') return '/vendedor';
  return '/';
}
