import React from 'react';
import { Alert } from 'react-bootstrap';
import { Link, useLocation, useParams } from 'react-router-dom';
import Seccion from '../components/Seccion';
import Boleta from '../components/Boleta';
import { obtenerOrden } from '../data/baseDatos';

const PagoError = () => {
  const { numero } = useParams();
  const { state } = useLocation();
  const orden = obtenerOrden(numero);

  if (!orden) {
    return <Seccion><p>No encontramos esa compra. <Link to="/carrito">Volver al carrito</Link>.</p></Seccion>;
  }
  return (
    <Seccion titulo="No se pudo realizar el pago" icono="bi-x-circle">
      <Alert variant="danger">
        No se pudo realizar el pago de la orden <strong>{orden.numero}</strong>.
        {state && state.motivo ? ` ${state.motivo}` : ''}
      </Alert>
      <Boleta orden={orden} />
      <div className="mt-3">
        <Link to={`/checkout?reintentar=${orden.numero}`} className="btn btn-danger">
          <i className="bi bi-arrow-repeat" /> Volver a realizar el pago
        </Link>
      </div>
    </Seccion>
  );
};

export default PagoError;
