import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Seccion from '../../components/Seccion';
import { obtenerUsuario } from '../../services/usuarioService';

const AdminUsuarioDetalle = () => {
  const { run } = useParams();
  const u = obtenerUsuario(run);
  if (!u) return <Seccion><p>Usuario no encontrado. <Link to="/admin/usuarios">Volver</Link>.</p></Seccion>;
  return (
    <Seccion titulo="Detalle del usuario" icono="bi-person">
      <p><strong>RUN:</strong> {u.run}</p>
      <p><strong>Nombre:</strong> {u.nombre} {u.apellidos}</p>
      <p><strong>Correo:</strong> {u.correo}</p>
      <p><strong>Tipo:</strong> {u.tipoUsuario}</p>
      <p><strong>Dirección:</strong> {u.direccion}, {u.comuna}, {u.region}</p>
      <div className="d-flex gap-3 flex-wrap">
        <Link to={`/admin/usuarios/${u.run}/editar`} className="btn-enviar text-decoration-none">Editar</Link>
        <Link to={`/admin/usuarios/${u.run}/historial`} className="btn-enviar text-decoration-none">Historial de compras</Link>
        <Link to="/admin/usuarios">Volver al listado</Link>
      </div>
    </Seccion>
  );
};

export default AdminUsuarioDetalle;
