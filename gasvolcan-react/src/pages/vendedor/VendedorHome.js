import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Seccion from '../../components/Seccion';
import { useAuth } from '../../context/AuthContext';

const VendedorHome = () => {
  const { sesion } = useAuth();
  return (
    <Seccion titulo={`Panel de Vendedor — ${sesion.nombre}`} icono="bi-speedometer2">
      <p>Aquí puedes consultar el catálogo y gestionar el reparto de los pedidos: salir a repartir, confirmar la entrega y el pago en efectivo.</p>
      <Row>
        <Col md={6} className="mb-3">
          <Card className="h-100 text-center"><Card.Body>
            <i className="bi bi-box-seam fs-1" /><Card.Title as="h5">Productos</Card.Title>
            <Link to="/vendedor/productos" className="btn-enviar text-decoration-none d-inline-block">Ver productos</Link>
          </Card.Body></Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card className="h-100 text-center"><Card.Body>
            <i className="bi bi-truck fs-1" /><Card.Title as="h5">Pedidos</Card.Title>
            <Link to="/vendedor/pedidos" className="btn-enviar text-decoration-none d-inline-block">Ver pedidos</Link>
          </Card.Body></Card>
        </Col>
      </Row>
    </Seccion>
  );
};

export default VendedorHome;
