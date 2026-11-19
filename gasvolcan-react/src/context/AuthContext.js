// =========================================================
// AuthContext - SESIÓN DEL USUARIO (JWT)
//
//  - iniciarSesion: POST /auth/login -> el backend devuelve access token + refresh token.
//    Los tokens se guardan en localStorage (clave gv_tokens).
//  - Al recargar la página, si hay tokens guardados se llama a GET /auth/me para
//    recuperar al usuario: así la sesión PERSISTE sin volver a escribir la contraseña.
//  - Si el access token venció, http.js lo renueva solo con el refresh token.
//    Si el refresh token también venció (o es inválido), se cierra la sesión.
//  - salir: borra los tokens y los datos privados que había en memoria.
// =========================================================
import React, {
  createContext, useCallback, useContext, useEffect, useState,
} from 'react';
import { authApi } from '../api/gasVolcanApi';
import {
  EVENTO_SESION_EXPIRADA, borrarTokens, estadoHttp, guardarTokens, leerTokens,
} from '../api/http';
import { sincronizar, vaciarDatosPrivados } from '../data/baseDatos';

const AuthContext = createContext(null);

// sesionInicial: solo para las pruebas (evita llamar al backend)
export function AuthProvider({ children, sesionInicial }) {
  const [sesion, setSesion] = useState(sesionInicial || null);
  // true mientras se recupera la sesión guardada (evita mandar a /login antes de tiempo)
  const [cargando, setCargando] = useState(() => !sesionInicial && Boolean(leerTokens()));

  // Recuperar la sesión al abrir o recargar la página
  useEffect(() => {
    if (sesionInicial || !leerTokens()) return undefined;
    let activo = true;
    authApi.yo()
      .then((usuario) => { if (activo) setSesion(usuario); })
      .catch((error) => {
        // Token inválido o usuario eliminado: se descarta. Si solo fue un problema de red, se conserva.
        if ([401, 403, 404].includes(estadoHttp(error))) borrarTokens();
      })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [sesionInicial]);

  const salir = useCallback(() => {
    borrarTokens();
    vaciarDatosPrivados();
    setSesion(null);
  }, []);

  // Si el backend dice que la sesión ya no es válida (refresh vencido), se cierra
  useEffect(() => {
    window.addEventListener(EVENTO_SESION_EXPIRADA, salir);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, salir);
  }, [salir]);

  // Devuelve el usuario si las credenciales son correctas. Si no, lanza el error del backend (401).
  const iniciarSesion = useCallback(async (correo, contrasena) => {
    const respuesta = await authApi.login(String(correo).trim().toLowerCase(), String(contrasena).trim());
    guardarTokens(respuesta);
    try {
      await sincronizar(respuesta.usuario.tipoUsuario); // deja los datos del rol listos antes de entrar
    } catch (e) { /* DatosProvider vuelve a intentarlo */ }
    setSesion(respuesta.usuario);
    return respuesta.usuario;
  }, []);

  return (
    <AuthContext.Provider value={{ sesion, cargando, iniciarSesion, salir }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
