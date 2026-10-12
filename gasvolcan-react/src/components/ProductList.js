import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ProductCard from './ProductCard';
import { useCart } from '../context/CartContext';

// Lista de tarjetas. Props: productos, onAgregado(producto) y mensajeVacio
const ProductList = ({ productos, onAgregado, mensajeVacio = 'No hay productos disponibles.' }) => {
  const { agregar } = useCart();

  const manejarAgregar = (producto) => {
    agregar(producto.codigo, 1);
    if (onAgregado) onAgregado(producto);
  };

  if (!productos || productos.length === 0) {
    return <p data-testid="lista-vacia">{mensajeVacio}</p>;
  }

  return (
    <Row>
      {productos.map((producto) => (
        <Col key={producto.codigo} lg={3} md={4} sm={6} className="mb-4">
          <ProductCard producto={producto} onAgregar={manejarAgregar} />
        </Col>
      ))}
    </Row>
  );
};

export default ProductList;
