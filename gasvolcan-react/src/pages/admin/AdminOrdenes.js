import React from 'react';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Seccion from '../../components/Seccion';
import EstadoBadge from '../../components/EstadoBadge';
import { listarOrdenes } from '../../data/baseDatos';
import { formatearCLP } from '../../utils/validaciones';

const AdminOrdenes = () => {
  const ordenes = listarOrdenes();
  return (
    <Seccion titulo="Órdenes / Boletas" icono="bi-receipt">
      <Table responsive hover>
        <thead><tr><th>N° Orden</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          {ordenes.length === 0 && <tr><td colSpan="6">Todavía no hay órdenes.</td></tr>}
          {ordenes.map((o) => (
            <tr key={o.numero}>
              <td>{o.numero}</td>
              <td>{new Date(o.fecha).toLocaleDateString('es-CL')}</td>
              <td>{o.cliente.nombre} {o.cliente.apellidos}</td>
              <td>${formatearCLP(o.total)}</td>
              <td><EstadoBadge estado={o.estado} /></td>
              <td><Link to={`/admin/ordenes/${o.numero}`} className="btn-enviar text-decoration-none">Mostrar boleta</Link></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Seccion>
  );
};

export default AdminOrdenes;
