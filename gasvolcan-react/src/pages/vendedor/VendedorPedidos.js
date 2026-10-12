import React from 'react';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Seccion from '../../components/Seccion';
import EstadoBadge from '../../components/EstadoBadge';
import { listarOrdenes } from '../../data/baseDatos';
import { formatearCLP } from '../../utils/validaciones';

// El vendedor ve TODAS las órdenes (solo lectura)
const VendedorPedidos = () => {
  const ordenes = listarOrdenes();
  return (
    <Seccion titulo="Pedidos recibidos" icono="bi-truck">
      <Table responsive hover>
        <thead><tr><th>N° Pedido</th><th>Cliente</th><th>Total</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          {ordenes.length === 0 && <tr><td colSpan="5">Todavía no hay pedidos registrados.</td></tr>}
          {ordenes.map((o) => (
            <tr key={o.numero}>
              <td>{o.numero}</td>
              <td>{o.cliente.nombre} {o.cliente.apellidos}</td>
              <td>${formatearCLP(o.total)}</td>
              <td><EstadoBadge estado={o.estado} /></td>
              <td><Link to={`/vendedor/pedidos/${o.numero}`} className="btn-enviar text-decoration-none"><i className="bi bi-eye" /> Ver</Link></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Seccion>
  );
};

export default VendedorPedidos;
