import React, { useState } from 'react';
import { Carousel, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Seccion from '../components/Seccion';
import ProductList from '../components/ProductList';
import CategoriaCard from '../components/CategoriaCard';
import { listarCategorias, listarProductos } from '../data/baseDatos';
import { resolverImagen } from '../utils/validaciones';

const Inicio = () => {
  const [aviso, setAviso] = useState('');
  const productos = listarProductos();
  const categorias = listarCategorias();
  const imagenDe = (id) => (productos.find((p) => p.categoriaId === id) || {}).imagen;

  return (
    <>
      <Carousel className="gv-carrusel mb-4" data-testid="carrusel">
        {productos.slice(0, 3).map((p) => (
          <Carousel.Item key={p.codigo}>
            <img className="d-block w-100" src={resolverImagen(p.imagen)} alt={p.nombre} />
            <Carousel.Caption>
              <h3>{p.nombre}</h3>
              <p>Entrega a domicilio en Chillán y alrededores.</p>
              <Link to={`/productos/${p.codigo}`} className="btn btn-warning">Ver producto</Link>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>

      <Seccion titulo="Categorías" icono="bi-grid">
        <Row>
          {categorias.map((c) => (
            <Col key={c.id} md={6} className="mb-3">
              <CategoriaCard categoria={c} imagen={imagenDe(c.id)} />
            </Col>
          ))}
        </Row>
      </Seccion>

      <Seccion titulo="Cilindros Destacados" icono="bi-star">
        {aviso && <Alert variant="success" dismissible onClose={() => setAviso('')}>{aviso}</Alert>}
        <ProductList
          productos={productos.slice(0, 4)}
          onAgregado={(p) => setAviso(`"${p.nombre}" fue añadido al carrito.`)}
        />
        <div className="text-center">
          <Link to="/productos" className="btn-enviar text-decoration-none d-inline-block">
            <i className="bi bi-grid" /> Ver catálogo completo
          </Link>
        </div>
      </Seccion>
    </>
  );
};

export default Inicio;
