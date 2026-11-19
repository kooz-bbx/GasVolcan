// =========================================================
// http.js - Cliente HTTP (Axios) para hablar con el backend Spring Boot.
//
//  1. Cada petición lleva el token:  Authorization: Bearer <accessToken>
//  2. Si el backend responde 401 (token vencido) se intenta renovar UNA vez con el
//     refresh token y se repite la petición. Si no se puede, la sesión se cierra.
//  3. Los tokens se guardan en localStorage: por eso la sesión sobrevive a recargar la página.
// =========================================================
import axios from 'axios';
import { CLAVES, borrar, guardarJSON, leerJSON } from '../data/almacenamiento';

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

// Evento que avisa a la aplicación que la sesión ya no es válida
export const EVENTO_SESION_EXPIRADA = 'gv:sesion-expirada';

export const leerTokens = () => leerJSON(CLAVES.tokens, null);
export const guardarTokens = ({ accessToken, refreshToken }) =>
  guardarJSON(CLAVES.tokens, { accessToken, refreshToken });
export const borrarTokens = () => borrar(CLAVES.tokens);

export const http = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 1) Agrega el access token a cada petición
http.interceptors.request.use((config) => {
  const tokens = leerTokens();
  if (tokens && tokens.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// 2) Si vence el token, lo renueva y repite la petición
const RUTAS_SIN_RENOVAR = ['/auth/login', '/auth/register', '/auth/refresh'];
let renovacionEnCurso = null; // si varias peticiones fallan a la vez, se renueva una sola vez

http.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const original = error.config;
    const tokens = leerTokens();
    const puedeRenovar =
      error.response && error.response.status === 401 && original && !original.yaReintentada &&
      !RUTAS_SIN_RENOVAR.includes(original.url) && tokens && tokens.refreshToken;

    if (puedeRenovar) {
      original.yaReintentada = true;
      try {
        if (!renovacionEnCurso) {
          renovacionEnCurso = axios
            .post(`${API_URL}/auth/refresh`, { refreshToken: tokens.refreshToken })
            .finally(() => { renovacionEnCurso = null; });
        }
        const { data } = await renovacionEnCurso;
        guardarTokens(data);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return http(original);
      } catch (e) {
        borrarTokens();
        window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
      }
    }
    return Promise.reject(error);
  }
);

// Saca un mensaje legible de un error de Axios (el backend responde { estado, mensaje, errores? })
export function mensajeDeError(error) {
  if (!error || !error.response) {
    return 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.';
  }
  const datos = error.response.data;
  if (datos && datos.errores) return Object.values(datos.errores).join(' · ');
  return (datos && datos.mensaje) || 'Ocurrió un error inesperado.';
}

export const estadoHttp = (error) => (error && error.response ? error.response.status : 0);
