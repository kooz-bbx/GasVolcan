import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Seccion from '../components/Seccion';
import CategoriaCard from '../components/CategoriaCard';
import { listarCategorias, listarProductos } from '../data/baseDatos';

const Categorias = () => {
  const productos = listarProductos();
  return (
    <Seccion titulo="Categorías" icono="bi-grid">
      <Row>
        {listarCategorias().map((c) => (
          <Col key={c.id} md={6} className="mb-3">
            <CategoriaCard categoria={c} imagen={(productos.find((p) => p.categoriaId === c.id) || {}).imagen} />
          </Col>
        ))}
      </Row>
    </Seccion>
  );
};

export default Categorias;
