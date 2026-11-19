// Usuarios: registro, mantenedor del administrador y utilidades de rol.
// Los datos viven en el backend (MySQL); aquí se llama a la API REST y se actualiza la copia local.
// El login y la sesión están en context/AuthContext.js.
import { capitalizarTexto } from '../utils/validaciones';
import { authApi, usuariosApi } from '../api/gasVolcanApi';
import {
  guardarFila, listarUsuarios, obtenerUsuario, quitarFila,
} from '../data/baseDatos';

export { listarUsuarios, obtenerUsuario };

// Usuarios con rol Repartidor (la operadora elige entre ellos al asignar un pedido)
export function listarRepartidores() {
  return listarUsuarios().filter((u) => u.tipoUsuario === 'Repartidor');
}

// Cuerpo que espera el backend (UsuarioRequest), con los textos normalizados
function armarUsuario(datos, tipoForzado) {
  return {
    run: String(datos.run || '').trim().toUpperCase(),
    nombre: capitalizarTexto(String(datos.nombre).trim()),
    apellidos: capitalizarTexto(String(datos.apellidos).trim()),
    correo: String(datos.correo).trim().toLowerCase(),
    contrasena: datos.contrasena || '',
    region: datos.region || '',
    comuna: datos.comuna || '',
    direccion: capitalizarTexto(String(datos.direccion || '').trim()),
    tipoUsuario: tipoForzado || datos.tipoUsuario || 'Cliente',
  };
}

// Registro desde la tienda: el backend siempre crea un Cliente.
// Si el RUN o el correo ya existen responde 409 (el error se muestra en la pantalla).
export function registrarCliente(datos) {
  return authApi.registrar(armarUsuario(datos, 'Cliente'));
}

// ----- Mantenedor del administrador -----
export async function crearUsuario(datos) {
  const creado = await usuariosApi.crear(armarUsuario(datos));
  return guardarFila('usuarios', creado);
}

// Si la contraseña va vacía, el backend conserva la anterior
export async function actualizarUsuario(run, datos) {
  const actualizado = await usuariosApi.actualizar(run, armarUsuario({ ...datos, run }));
  return guardarFila('usuarios', actualizado);
}

export async function eliminarUsuario(run) {
  await usuariosApi.eliminar(run);
  quitarFila('usuarios', run);
}

// A dónde lleva el login según el rol
export function rutaInicioPorRol(tipoUsuario) {
  if (tipoUsuario === 'Administrador') return '/admin';
  if (tipoUsuario === 'Operadora') return '/operadora';
  if (tipoUsuario === 'Repartidor') return '/repartidor';
  return '/';
}
