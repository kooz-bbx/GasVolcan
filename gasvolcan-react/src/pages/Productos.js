import React, { useState } from 'react';
import { Alert, Form, Row, Col } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import Seccion from '../components/Seccion';
import ProductList from '../components/ProductList';
import { listarCategorias, listarProductos } from '../data/baseDatos';
import { filtrarProductos } from '../utils/productos';

// Catálogo con filtros: texto (?buscar=) y categoría
const Productos = () => {
  const [params, setParams] = useSearchParams();
  const [aviso, setAviso] = useState('');
  const texto = params.get('buscar') || '';
  const categoriaId = params.get('categoria') || '';

  const cambiar = (clave, valor) => {
    const nuevo = new URLSearchParams(params);
    if (valor) nuevo.set(clave, valor); else nuevo.delete(clave);
    setParams(nuevo);
  };

  const visibles = filtrarProductos(listarProductos(), { texto, categoriaId });

  return (
    <Seccion titulo="Catálogo de Cilindros de Gas" icono="bi-box-seam">
      <Row className="mb-3">
        <Col md={6}>
          <Form.Label htmlFor="filtro-texto">Buscar</Form.Label>
          <Form.Control id="filtro-texto" value={texto} placeholder="Nombre, descripción o código"
            onChange={(e) => cambiar('buscar', e.target.value)} />
        </Col>
        <Col md={6}>
          <Form.Label htmlFor="filtro-categoria">Categoría</Form.Label>
          <Form.Select id="filtro-categoria" value={categoriaId} onChange={(e) => cambiar('categoria', e.target.value)}>
            <option value="">Todas</option>
            {listarCategorias().map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </Form.Select>
        </Col>
      </Row>
      {aviso && <Alert variant="success" dismissible onClose={() => setAviso('')}>{aviso}</Alert>}
      <ProductList
        productos={visibles}
        mensajeVacio="No se encontraron productos con ese filtro."
        onAgregado={(p) => setAviso(`"${p.nombre}" fue añadido al carrito.`)}
      />
    </Seccion>
  );
};

export default Productos;
