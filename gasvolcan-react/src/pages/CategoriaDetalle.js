import React, { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import Seccion from '../components/Seccion';
import ProductList from '../components/ProductList';
import { listarProductos, obtenerCategoria } from '../data/baseDatos';
import { filtrarProductos } from '../utils/productos';

const CategoriaDetalle = () => {
  const { id } = useParams();
  const [aviso, setAviso] = useState('');
  const categoria = obtenerCategoria(id);

  if (!categoria) {
    return <Seccion><p>Categoría no encontrada. <Link to="/categorias">Ver categorías</Link>.</p></Seccion>;
  }
  return (
    <Seccion titulo={categoria.nombre} icono="bi-tag">
      <p>{categoria.descripcion}</p>
      {aviso && <Alert variant="success" dismissible onClose={() => setAviso('')}>{aviso}</Alert>}
      <ProductList
        productos={filtrarProductos(listarProductos(), { categoriaId: id })}
        mensajeVacio="Esta categoría todavía no tiene productos."
        onAgregado={(p) => setAviso(`"${p.nombre}" fue añadido al carrito.`)}
      />
    </Seccion>
  );
};

export default CategoriaDetalle;
