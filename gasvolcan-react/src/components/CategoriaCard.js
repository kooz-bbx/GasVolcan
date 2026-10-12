import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { resolverImagen } from '../utils/validaciones';

// Tarjeta de categoría. Props: categoria y imagen (de uno de sus productos)
const CategoriaCard = ({ categoria, imagen }) => (
  <Card className="h-100 text-center categoria-card">
    <Link to={`/categorias/${categoria.id}`} className="text-reset text-decoration-none">
      {imagen && <Card.Img variant="top" src={resolverImagen(imagen)} alt={categoria.nombre} />}
      <Card.Body>
        <Card.Title as="h5">{categoria.nombre}</Card.Title>
        <Card.Text className="small text-muted">{categoria.descripcion}</Card.Text>
      </Card.Body>
    </Link>
  </Card>
);

export default CategoriaCard;
