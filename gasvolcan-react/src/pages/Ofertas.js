import React, { useState } from 'react';
import { Alert } from 'react-bootstrap';
import Seccion from '../components/Seccion';
import ProductList from '../components/ProductList';
import { listarProductos } from '../data/baseDatos';
import { enOferta } from '../utils/productos';

const Ofertas = () => {
  const [aviso, setAviso] = useState('');
  return (
    <Seccion titulo="Ofertas" icono="bi-percent">
      {aviso && <Alert variant="success" dismissible onClose={() => setAviso('')}>{aviso}</Alert>}
      <ProductList
        productos={listarProductos().filter(enOferta)}
        mensajeVacio="Por ahora no hay productos en oferta."
        onAgregado={(p) => setAviso(`"${p.nombre}" fue añadido al carrito.`)}
      />
    </Seccion>
  );
};

export default Ofertas;
