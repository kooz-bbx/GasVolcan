import React, { useState } from 'react';
import { Alert, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Seccion from '../../components/Seccion';
import BotonAccion from '../../components/BotonAccion';
import { mensajeDeError } from '../../api/http';
import { eliminarUsuario, listarUsuarios } from '../../services/usuarioService';

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState(() => listarUsuarios());
  const [error, setError] = useState('');

  const eliminar = async (u) => {
    if (!window.confirm(`¿Eliminar al usuario ${u.nombre} ${u.apellidos}?`)) return;
    try {
      await eliminarUsuario(u.run);
      setError('');
    } catch (e) {
      setError(mensajeDeError(e)); // ej: no puedes eliminar tu propia cuenta
    }
    setUsuarios(listarUsuarios());
  };

  return (
    <Seccion titulo="Usuarios" icono="bi-people">
      <Link to="/admin/usuarios/nuevo" className="btn-enviar text-decoration-none d-inline-block mb-3">
        <i className="bi bi-person-plus" /> Nuevo usuario
      </Link>
      {error && <Alert variant="danger" role="alert">{error}</Alert>}
      <Table responsive hover>
        <thead><tr><th>RUN</th><th>Nombre</th><th>Correo</th><th>Tipo</th><th>Acciones</th></tr></thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.run}>
              <td>{u.run}</td><td>{u.nombre} {u.apellidos}</td><td>{u.correo}</td><td>{u.tipoUsuario}</td>
              <td className="d-flex gap-1 flex-wrap">
                <Link to={`/admin/usuarios/${u.run}`} className="btn btn-sm btn-outline-secondary">Ver</Link>
                <Link to={`/admin/usuarios/${u.run}/editar`} className="btn btn-sm btn-outline-primary">Editar</Link>
                <BotonAccion etiqueta="Eliminar" variante="outline-danger" className="btn-sm" onClick={() => eliminar(u)} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Seccion>
  );
};

export default AdminUsuarios;
