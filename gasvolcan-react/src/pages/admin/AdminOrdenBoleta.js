import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Seccion from '../../components/Seccion';
import Boleta from '../../components/Boleta';
import { obtenerOrden } from '../../data/baseDatos';

const AdminOrdenBoleta = () => {
  const { numero } = useParams();
  const orden = obtenerOrden(numero);
  if (!orden) return <Seccion><p>Orden no encontrada. <Link to="/admin/ordenes">Volver</Link>.</p></Seccion>;
  return (
    <Seccion titulo={`Boleta ${orden.numero}`} icono="bi-receipt">
      <Boleta orden={orden} />
      <Link to="/admin/ordenes"><i className="bi bi-arrow-left" /> Volver a órdenes</Link>
    </Seccion>
  );
};

export default AdminOrdenBoleta;
