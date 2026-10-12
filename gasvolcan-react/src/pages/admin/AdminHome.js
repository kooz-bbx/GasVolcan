import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Seccion from '../../components/Seccion';
import { listarOrdenes, listarProductos, listarUsuarios } from '../../data/baseDatos';
import { calcularReportes } from '../../utils/reportes';
import { formatearCLP } from '../../utils/validaciones';

const Tarjeta = ({ icono, titulo, valor, ruta, id }) => (
  <Col md={6} xl={3} className="mb-3">
    <Card className="stat-card h-100 text-center">
      <Card.Body>
        <i className={`bi ${icono} fs-1`} />
        <Card.Title as="h6" className="mt-2">{titulo}</Card.Title>
        <div className="fs-3 fw-bold" data-testid={id}>{valor}</div>
        <Link to={ruta}>Ver detalle</Link>
      </Card.Body>
    </Card>
  </Col>
);

const AdminHome = () => {
  const productos = listarProductos();
  const r = calcularReportes(listarOrdenes(), productos);
  return (
    <Seccion titulo="Dashboard" icono="bi-speedometer2">
      <Row>
        <Tarjeta id="dash-ordenes" icono="bi-receipt" titulo="Órdenes" valor={r.totalOrdenes} ruta="/admin/ordenes" />
        <Tarjeta id="dash-ventas" icono="bi-cash-coin" titulo="Ventas" valor={`$${formatearCLP(r.totalVentas)}`} ruta="/admin/reportes" />
        <Tarjeta id="dash-productos" icono="bi-box-seam" titulo="Productos" valor={productos.length} ruta="/admin/productos" />
        <Tarjeta id="dash-criticos" icono="bi-exclamation-triangle" titulo="Productos críticos" valor={r.productosCriticos.length} ruta="/admin/criticos" />
        <Tarjeta id="dash-usuarios" icono="bi-people" titulo="Usuarios" valor={listarUsuarios().length} ruta="/admin/usuarios" />
      </Row>
    </Seccion>
  );
};

export default AdminHome;
