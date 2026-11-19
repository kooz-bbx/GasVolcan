import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// roles: lista de roles que pueden entrar. Si no hay sesión o el rol no corresponde, va al login.
// (El backend además rechaza con 401/403 cualquier petición sin el rol correcto: esto solo evita
// mostrar pantallas a las que el usuario no puede entrar.)
const RutaProtegida = ({ roles, children }) => {
  const { sesion, cargando } = useAuth();
  if (cargando) return <p className="text-center my-5">Cargando...</p>; // recuperando la sesión guardada
  if (!sesion || !roles.includes(sesion.tipoUsuario)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default RutaProtegida;
