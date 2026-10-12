import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import Seccion from '../../components/Seccion';
import { obtenerCategoria, obtenerProducto } from '../../data/baseDatos';
import { hayStockBajo, precioFinal } from '../../utils/productos';
import { formatearCLP, resolverImagen } from '../../utils/validaciones';

const VendedorProductoDetalle = () => {
  const { codigo } = useParams();
  const p = obtenerProducto(codigo);
  if (!p) {
    return <Seccion><p>Producto no encontrado. <Link to="/vendedor/productos">Volver al listado</Link>.</p></Seccion>;
  }
  const categoria = obtenerCategoria(p.categoriaId);
  return (
    <Seccion titulo="Detalle del producto" icono="bi-box-seam">
      <Row>
        <Col md={5}><img src={resolverImagen(p.imagen)} alt={p.nombre} className="img-fluid rounded" /></Col>
        <Col md={7}>
          {categoria && <span className="categoria-badge">{categoria.nombre}</span>}
          <h2>{p.nombre}</h2>
          <p className="precio" style={{ fontSize: '1.8rem' }}>${formatearCLP(precioFinal(p))}</p>
          <p>{p.descripcion || 'Sin descripción.'}</p>
          <p><strong>Código:</strong> {p.codigo}</p>
          <p><strong>Stock disponible:</strong> {p.stock} unidades {hayStockBajo(p) && <span className="badge-stock-critico">¡Stock bajo!</span>}</p>
          <Link to="/vendedor/productos"><i className="bi bi-arrow-left" /> Volver al listado</Link>
        </Col>
      </Row>
    </Seccion>
  );
};

export default VendedorProductoDetalle;
