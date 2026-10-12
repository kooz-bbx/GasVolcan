import React, { useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import Seccion from '../components/Seccion';
import Boleta from '../components/Boleta';
import BotonAccion from '../components/BotonAccion';
import { obtenerOrden } from '../data/baseDatos';

const CompraExitosa = () => {
  const { numero } = useParams();
  const [aviso, setAviso] = useState('');
  const orden = obtenerOrden(numero);

  if (!orden) {
    return <Seccion><p>No encontramos esa compra. <Link to="/">Volver al inicio</Link>.</p></Seccion>;
  }
  return (
    <Seccion titulo="Compra realizada con éxito" icono="bi-check-circle">
      <Alert variant="success">Se ha realizado la compra. Código orden: <strong>{orden.numero}</strong></Alert>
      <Boleta orden={orden} />
      {aviso && <Alert variant="info" role="status">{aviso}</Alert>}
      <div className="d-flex gap-2 flex-wrap mt-3 no-imprimir">
        <BotonAccion etiqueta="Imprimir boleta en PDF" icono="bi-printer" onClick={() => window.print()} />
        <BotonAccion etiqueta="Enviar boleta por email" icono="bi-envelope" variante="outline-primary"
          onClick={() => setAviso(`Boleta enviada a ${orden.cliente.correo || 'tu correo'} (simulado).`)} />
        <Button as={Link} to="/productos" variant="link">Seguir comprando</Button>
      </div>
    </Seccion>
  );
};

export default CompraExitosa;
