import React from 'react';
import { Table } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import Seccion from '../../components/Seccion';
import EstadoBadge from '../../components/EstadoBadge';
import { listarOrdenes } from '../../data/baseDatos';
import { obtenerUsuario } from '../../services/usuarioService';
import { formatearCLP } from '../../utils/validaciones';

const AdminUsuarioHistorial = () => {
  const { run } = useParams();
  const u = obtenerUsuario(run);
  if (!u) return <Seccion><p>Usuario no encontrado. <Link to="/admin/usuarios">Volver</Link>.</p></Seccion>;
  const ordenes = listarOrdenes().filter((o) => o.propietario === u.correo);
  return (
    <Seccion titulo={`Historial de compras — ${u.nombre} ${u.apellidos}`} icono="bi-clock-history">
      <Table responsive hover>
        <thead><tr><th>N° Orden</th><th>Fecha</th><th>Total</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          {ordenes.length === 0 && <tr><td colSpan="5" data-testid="historial-vacio">Este usuario no tiene compras.</td></tr>}
          {ordenes.map((o) => (
            <tr key={o.numero}>
              <td>{o.numero}</td>
              <td>{new Date(o.fecha).toLocaleDateString('es-CL')}</td>
              <td>${formatearCLP(o.total)}</td>
              <td><EstadoBadge estado={o.estado} /></td>
              <td><Link to={`/admin/ordenes/${o.numero}`}>Mostrar boleta</Link></td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Link to={`/admin/usuarios/${u.run}`}><i className="bi bi-arrow-left" /> Volver al usuario</Link>
    </Seccion>
  );
};

export default AdminUsuarioHistorial;
