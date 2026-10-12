import React, { useState } from 'react';
import { Row, Col, Form, Alert } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import Seccion from '../components/Seccion';
import ProductList from '../components/ProductList';
import BotonAccion from '../components/BotonAccion';
import { listarProductos, obtenerCategoria, obtenerProducto } from '../data/baseDatos';
import { formatearCLP, resolverImagen } from '../utils/validaciones';
import { enOferta, precioFinal } from '../utils/productos';
import { useCart } from '../context/CartContext';

const DetalleProducto = () => {
  const { codigo } = useParams();
  const { agregar } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [aviso, setAviso] = useState('');

  const producto = obtenerProducto(codigo);
  if (!producto) {
    return (
      <Seccion>
        <p>Producto no encontrado. <Link to="/productos">Volver al catálogo</Link>.</p>
      </Seccion>
    );
  }
  const categoria = obtenerCategoria(producto.categoriaId);
  const relacionados = listarProductos().filter((p) => p.codigo !== producto.codigo);

  const manejarAgregar = () => {
    const n = Math.min(Math.max(parseInt(cantidad, 10) || 1, 1), Math.max(producto.stock, 1));
    agregar(producto.codigo, n);
    setAviso(`${n} × "${producto.nombre}" añadido al carrito.`);
  };

  return (
    <>
      <Seccion>
        <Row>
          <Col md={5}>
            <img src={resolverImagen(producto.imagen)} alt={producto.nombre} className="img-fluid rounded" />
          </Col>
          <Col md={7}>
            {categoria && <span className="categoria-badge">{categoria.nombre}</span>}
            <h2>{producto.nombre}</h2>
            <p className="precio" style={{ fontSize: '1.8rem' }}>
              {enOferta(producto) && <s className="text-muted fs-5 me-2">${formatearCLP(producto.precio)}</s>}
              ${formatearCLP(precioFinal(producto))}
            </p>
            <p>{producto.descripcion}</p>
            <p><strong>Stock disponible:</strong> {producto.stock} unidades</p>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="cantidad-detalle">Cantidad</Form.Label>
              <Form.Control id="cantidad-detalle" type="number" min="1" max={producto.stock} value={cantidad}
                onChange={(e) => setCantidad(e.target.value)} style={{ maxWidth: 120 }} />
            </Form.Group>
            {aviso && <Alert variant="success">{aviso}</Alert>}
            <BotonAccion etiqueta="Añadir al carrito" icono="bi-cart-plus" className="btn-enviar" onClick={manejarAgregar} />
          </Col>
        </Row>
      </Seccion>
      <Seccion titulo="Otros formatos" icono="bi-grid">
        <ProductList productos={relacionados} />
      </Seccion>
    </>
  );
};

export default DetalleProducto;
