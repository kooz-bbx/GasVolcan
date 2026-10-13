import React, { useState } from 'react';
import { Alert, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Seccion from '../../components/Seccion';
import EstadoBadge from '../../components/EstadoBadge';
import AccionesReparto from '../../components/AccionesReparto';
import { listarOrdenes } from '../../data/baseDatos';
import { cambiarEstadoPedido } from '../../services/ordenService';
import { useAuth } from '../../context/AuthContext';
import { ETIQUETAS_ESTADO } from '../../data/datos';
import { formatearCLP } from '../../utils/validaciones';

// El vendedor / repartidor ve TODAS las órdenes y puede avanzar su estado:
// Pendiente -> En camino -> Entregado (o Cancelado)
const VendedorPedidos = () => {
  const { sesion } = useAuth();
  const [ordenes, setOrdenes] = useState(listarOrdenes);
  const [mensaje, setMensaje] = useState('');

  const cambiar = (numero, nuevoEstado) => {
    const actualizada = cambiarEstadoPedido(numero, nuevoEstado, sesion ? sesion.nombre : '');
    if (actualizada) {
      setOrdenes(listarOrdenes());
      setMensaje(`Pedido ${numero} marcado como "${ETIQUETAS_ESTADO[nuevoEstado]}".`);
    }
  };

  return (
    <Seccion titulo="Pedidos recibidos" icono="bi-truck">
      {mensaje && <Alert variant="success" onClose={() => setMensaje('')} dismissible>{mensaje}</Alert>}
      <Table responsive hover>
        <thead><tr><th>N° Pedido</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Acciones</th><th></th></tr></thead>
        <tbody>
          {ordenes.length === 0 && <tr><td colSpan="6">Todavía no hay pedidos registrados.</td></tr>}
          {ordenes.map((o) => (
            <tr key={o.numero}>
              <td>{o.numero}</td>
              <td>{o.cliente.nombre} {o.cliente.apellidos}</td>
              <td>${formatearCLP(o.total)}</td>
              <td><EstadoBadge estado={o.estado} /></td>
              <td><AccionesReparto orden={o} onCambiar={(estado) => cambiar(o.numero, estado)} /></td>
              <td><Link to={`/vendedor/pedidos/${o.numero}`} className="btn-enviar text-decoration-none"><i className="bi bi-eye" /> Ver</Link></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Seccion>
  );
};

export default VendedorPedidos;
