import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// roles: lista de roles que pueden entrar. Si no hay sesión o el rol no corresponde, va al login
const RutaProtegida = ({ roles, children }) => {
  const { sesion } = useAuth();
  if (!sesion || !roles.includes(sesion.tipoUsuario)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default RutaProtegida;
