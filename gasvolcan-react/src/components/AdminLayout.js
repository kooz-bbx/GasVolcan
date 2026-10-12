import React from 'react';
import { Nav, Container, Row, Col } from 'react-bootstrap';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ENLACES = [
  ['/admin', 'Dashboard', 'bi-speedometer2', true],
  ['/admin/ordenes', 'Órdenes', 'bi-receipt', false],
  ['/admin/productos', 'Productos', 'bi-box-seam', false],
  ['/admin/criticos', 'Productos críticos', 'bi-exclamation-triangle', false],
  ['/admin/categorias', 'Categorías', 'bi-tags', false],
  ['/admin/usuarios', 'Usuarios', 'bi-people', false],
  ['/admin/reportes', 'Reportes', 'bi-bar-chart', false],
  ['/admin/perfil', 'Perfil', 'bi-person-circle', false],
  ['/', 'Tienda', 'bi-shop', true],
];

// Estructura del panel: barra lateral + contenido (Outlet)
const AdminLayout = () => {
  const { salir } = useAuth();
  return (
    <Container fluid className="gv-admin">
      <Row>
        <Col md={3} lg={2} className="gv-sidebar p-0">
          <Nav className="flex-column" as="nav" aria-label="Menú de administración">
            {ENLACES.map(([ruta, texto, icono, exacto]) => (
              <Nav.Link key={ruta} as={NavLink} to={ruta} end={exacto}>
                <i className={`bi ${icono}`} /> {texto}
              </Nav.Link>
            ))}
            <Nav.Link as="button" className="text-start border-0 bg-transparent" onClick={salir}>
              <i className="bi bi-box-arrow-left" /> Cerrar sesión
            </Nav.Link>
          </Nav>
        </Col>
        <Col md={9} lg={10} className="p-3">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;
