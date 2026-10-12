import React from 'react';
import { Link } from 'react-router-dom';
import Seccion from '../../components/Seccion';
import { useAuth } from '../../context/AuthContext';
import { buscarUsuarioPorCorreo } from '../../services/usuarioService';

const AdminPerfil = () => {
  const { sesion } = useAuth();
  const u = (sesion && buscarUsuarioPorCorreo(sesion.correo)) || sesion;
  return (
    <Seccion titulo="Perfil" icono="bi-person-circle">
      <p><strong>Nombre:</strong> {u.nombre} {u.apellidos}</p>
      <p><strong>Correo:</strong> {u.correo}</p>
      <p><strong>Tipo de usuario:</strong> {u.tipoUsuario}</p>
      {u.direccion ? <p><strong>Dirección:</strong> {u.direccion}, {u.comuna}, {u.region}</p> : null}
      {u.run && <Link to={`/admin/usuarios/${u.run}/editar`} className="btn-enviar text-decoration-none">Editar mis datos</Link>}
    </Seccion>
  );
};

export default AdminPerfil;
