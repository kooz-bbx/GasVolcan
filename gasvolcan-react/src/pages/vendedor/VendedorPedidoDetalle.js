import React, { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import Seccion from '../../components/Seccion';
import Boleta from '../../components/Boleta';
import EstadoBadge from '../../components/EstadoBadge';
import AccionesReparto from '../../components/AccionesReparto';
import { obtenerOrden } from '../../data/baseDatos';
import { cambiarEstadoPedido } from '../../services/ordenService';
import { useAuth } from '../../context/AuthContext';
import { ETIQUETAS_ESTADO } from '../../data/datos';

const VendedorPedidoDetalle = () => {
  const { numero } = useParams();
  const { sesion } = useAuth();
  const [orden, setOrden] = useState(() => obtenerOrden(numero));
  const [mensaje, setMensaje] = useState('');

  if (!orden) {
    return <Seccion><p>Pedido no encontrado. <Link to="/vendedor/pedidos">Volver al listado</Link>.</p></Seccion>;
  }

  const cambiar = (nuevoEstado) => {
    const actualizada = cambiarEstadoPedido(orden.numero, nuevoEstado, sesion ? sesion.nombre : '');
    if (actualizada) {
      setOrden(actualizada);
      setMensaje(`Pedido marcado como "${ETIQUETAS_ESTADO[nuevoEstado]}".`);
    }
  };

  return (
    <Seccion titulo={`Pedido ${orden.numero}`} icono="bi-receipt">
      {mensaje && <Alert variant="success" onClose={() => setMensaje('')} dismissible>{mensaje}</Alert>}
      <Boleta orden={orden} />
      <div className="mt-3">
        <p><strong>Estado:</strong> <EstadoBadge estado={orden.estado} /></p>
        <p><strong>Repartidor asignado:</strong> {orden.repartidor}</p>
        {orden.fechaEntrega && (
          <p><strong>Entregado el:</strong> {new Date(orden.fechaEntrega).toLocaleString('es-CL')}</p>
        )}
        <AccionesReparto orden={orden} onCambiar={cambiar} />
      </div>
      <p className="mt-3"><Link to="/vendedor/pedidos"><i className="bi bi-arrow-left" /> Volver al listado</Link></p>
    </Seccion>
  );
};

export default VendedorPedidoDetalle;
