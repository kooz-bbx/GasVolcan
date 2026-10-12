import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  autenticar,
  cerrarSesion,
  guardarSesion,
  obtenerSesion,
  sembrarUsuariosBase,
} from '../services/usuarioService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Sembrar antes de leer la sesión para que existan admin y vendedor
  const [sesion, setSesion] = useState(() => {
    sembrarUsuariosBase();
    return obtenerSesion();
  });

  useEffect(() => {
    sembrarUsuariosBase();
  }, []);

  // Devuelve la sesión si las credenciales son correctas, o null
  const iniciarSesion = useCallback((correo, contrasena) => {
    const usuario = autenticar(correo, contrasena);
    if (!usuario) return null;
    const nueva = guardarSesion(usuario);
    setSesion(nueva);
    return nueva;
  }, []);

  const salir = useCallback(() => {
    cerrarSesion();
    setSesion(null);
  }, []);

  return (
    <AuthContext.Provider value={{ sesion, iniciarSesion, salir }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
