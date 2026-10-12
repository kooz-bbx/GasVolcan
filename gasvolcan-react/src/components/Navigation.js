import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Badge, Button } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import BarraBusqueda from './BarraBusqueda';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { listarCategorias } from '../data/baseDatos';
import { formatearCLP } from '../utils/validaciones';

// Encabezado de la tienda: marca + buscador + sesión, y debajo el menú principal
const Navigation = () => {
  const { sesion, salir } = useAuth();
  const { unidades, total } = useCart();
  const navigate = useNavigate();
  const categorias = listarCategorias();

  const buscar = (texto) => navigate(`/productos?buscar=${encodeURIComponent(texto)}`);
  const cerrarSesion = () => {
    salir();
    navigate('/');
  };

  return (
    <header className="gv-header">
      <Container className="d-flex flex-wrap align-items-center gap-3 py-2">
        <Link to="/" className="gv-marca text-decoration-none">
          <i className="bi bi-fire" /> <span id="logo-empresa">Gas El Volcán</span>
        </Link>
        <div className="flex-grow-1" style={{ minWidth: 200 }}>
          <BarraBusqueda onBuscar={buscar} />
        </div>
        <div className="d-flex gap-2 align-items-center">
          {!sesion && (
            <>
              <Button as={Link} to="/login" variant="outline-light" size="sm">Iniciar Sesión</Button>
              <Button as={Link} to="/registro" variant="warning" size="sm">Crear Cuenta</Button>
            </>
          )}
          {sesion && sesion.tipoUsuario === 'Administrador' && (
            <Button as={Link} to="/admin" variant="outline-light" size="sm">Panel Admin ({sesion.nombre})</Button>
          )}
          {sesion && sesion.tipoUsuario === 'Vendedor' && (
            <Button as={Link} to="/vendedor" variant="outline-light" size="sm">Panel Vendedor ({sesion.nombre})</Button>
          )}
          {sesion && sesion.tipoUsuario === 'Cliente' && (
            <span className="text-white small">Hola, {sesion.nombre}</span>
          )}
          {sesion && (
            <Button variant="light" size="sm" onClick={cerrarSesion}>Salir</Button>
          )}
        </div>
      </Container>

      <Navbar variant="dark" expand="lg" className="gv-menu" collapseOnSelect>
        <Container>
          <Navbar.Toggle aria-controls="menu-principal" />
          <Navbar.Collapse id="menu-principal">
            <Nav className="mx-auto">
              <Nav.Link as={NavLink} to="/" end>Home</Nav.Link>
              <NavDropdown title="Categorías" id="menu-categorias">
                <NavDropdown.Item as={Link} to="/categorias">Todas las categorías</NavDropdown.Item>
                {categorias.map((c) => (
                  <NavDropdown.Item key={c.id} as={Link} to={`/categorias/${c.id}`}>{c.nombre}</NavDropdown.Item>
                ))}
              </NavDropdown>
              <Nav.Link as={NavLink} to="/productos">Productos</Nav.Link>
              <Nav.Link as={NavLink} to="/ofertas">Ofertas</Nav.Link>
              <Nav.Link as={NavLink} to="/nosotros">Nosotros</Nav.Link>
              <Nav.Link as={NavLink} to="/blogs">Blog</Nav.Link>
              <Nav.Link as={NavLink} to="/contacto">Contacto</Nav.Link>
              <Nav.Link as={NavLink} to="/pedido">Pedido Rápido</Nav.Link>
              <Nav.Link as={NavLink} to="/seguimiento">Seguimiento</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link as={NavLink} to="/carrito" className="gv-carrito">
                <i className="bi bi-cart3" /> Carrito ${formatearCLP(total)}{' '}
                <Badge bg="warning" text="dark" data-testid="contador-carrito">{unidades}</Badge>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Navigation;
