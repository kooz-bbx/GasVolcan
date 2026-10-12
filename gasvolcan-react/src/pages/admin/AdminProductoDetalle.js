import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import Seccion from '../../components/Seccion';
import { obtenerCategoria, obtenerProducto } from '../../data/baseDatos';
import { hayStockBajo, precioFinal } from '../../utils/productos';
import { formatearCLP, resolverImagen } from '../../utils/validaciones';

const AdminProductoDetalle = () => {
  const { codigo } = useParams();
  const p = obtenerProducto(codigo);
  if (!p) return <Seccion><p>Producto no encontrado. <Link to="/admin/productos">Volver</Link>.</p></Seccion>;
  const categoria = obtenerCategoria(p.categoriaId);
  return (
    <Seccion titulo="Detalle del producto" icono="bi-box-seam">
      <Row>
        <Col md={4}><img src={resolverImagen(p.imagen)} alt={p.nombre} className="img-fluid rounded" /></Col>
        <Col md={8}>
          <h3>{p.nombre}</h3>
          <p>{p.descripcion}</p>
          <p><strong>Código:</strong> {p.codigo}</p>
          <p><strong>Categoría:</strong> {categoria ? categoria.nombre : '-'}</p>
          <p><strong>Precio:</strong> ${formatearCLP(p.precio)} · <strong>Descuento:</strong> {p.descuento || 0}% · <strong>Precio final:</strong> ${formatearCLP(precioFinal(p))}</p>
          <p><strong>Stock:</strong> {p.stock} (crítico: {p.stockCritico ?? '-'}) {hayStockBajo(p) && <span className="badge-stock-critico">¡Stock bajo!</span>}</p>
          <Link to={`/admin/productos/${p.codigo}/editar`} className="btn-enviar text-decoration-none me-3">Editar</Link>
          <Link to="/admin/productos">Volver al listado</Link>
        </Col>
      </Row>
    </Seccion>
  );
};

export default AdminProductoDetalle;
