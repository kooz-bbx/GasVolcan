import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Seccion from '../../components/Seccion';
import Boleta from '../../components/Boleta';
import { obtenerOrden } from '../../data/baseDatos';

const VendedorPedidoDetalle = () => {
  const { numero } = useParams();
  const orden = obtenerOrden(numero);
  if (!orden) {
    return <Seccion><p>Pedido no encontrado. <Link to="/vendedor/pedidos">Volver al listado</Link>.</p></Seccion>;
  }
  return (
    <Seccion titulo={`Pedido ${orden.numero}`} icono="bi-receipt">
      <Boleta orden={orden} />
      <p className="mt-3"><strong>Repartidor asignado:</strong> {orden.repartidor}</p>
      <Link to="/vendedor/pedidos"><i className="bi bi-arrow-left" /> Volver al listado</Link>
    </Seccion>
  );
};

export default VendedorPedidoDetalle;
