import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import BotonAccion from './BotonAccion';
import { formatearCLP, resolverImagen } from '../utils/validaciones';
import { enOferta, hayStockBajo, precioFinal } from '../utils/productos';
import { obtenerCategoria } from '../data/baseDatos';

// Tarjeta de un producto. Props: producto y onAgregar(producto)
const ProductCard = ({ producto, onAgregar }) => {
  const categoria = obtenerCategoria(producto.categoriaId);
  return (
    <Card className="producto-card h-100">
      <Link to={`/productos/${producto.codigo}`}>
        <Card.Img variant="top" src={resolverImagen(producto.imagen)} alt={producto.nombre} />
      </Link>
      <Card.Body className="d-flex flex-column">
        <div className="mb-2">
          {categoria && <span className="categoria-badge me-1">{categoria.nombre}</span>}
          {enOferta(producto) && <Badge bg="danger">-{producto.descuento}%</Badge>}
        </div>
        <Card.Title as="h5">
          <Link to={`/productos/${producto.codigo}`} className="text-reset text-decoration-none">
            {producto.nombre}
          </Link>
        </Card.Title>
        <Card.Text className="precio">
          {enOferta(producto) && <s className="text-muted fs-6 me-2">${formatearCLP(producto.precio)}</s>}
          ${formatearCLP(precioFinal(producto))}
        </Card.Text>
        {hayStockBajo(producto) && (
          <div className="stock-critico">
            <i className="bi bi-exclamation-triangle" /> ¡Stock bajo! ({producto.stock} unid.)
          </div>
        )}
        <BotonAccion
          etiqueta="Añadir"
          icono="bi-cart-plus"
          className="btn-enviar mt-auto"
          onClick={() => onAgregar(producto)}
        />
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
