import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Seccion from '../../components/Seccion';
import BotonAccion from '../../components/BotonAccion';
import { eliminarProducto, listarProductos, obtenerCategoria } from '../../data/baseDatos';
import { hayStockBajo } from '../../utils/productos';
import { formatearCLP } from '../../utils/validaciones';

const AdminProductos = () => {
  const [productos, setProductos] = useState(() => listarProductos());

  const eliminar = (p) => {
    if (!window.confirm(`¿Eliminar el producto ${p.nombre}?`)) return;
    eliminarProducto(p.codigo);
    setProductos(listarProductos()); // la lista se actualiza al instante
  };

  return (
    <Seccion titulo="Productos" icono="bi-box-seam">
      <Link to="/admin/productos/nuevo" className="btn-enviar text-decoration-none d-inline-block mb-3">
        <i className="bi bi-plus-circle" /> Nuevo producto
      </Link>
      <Table responsive hover>
        <thead><tr><th>Código</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Desc.</th><th>Stock</th><th>Acciones</th></tr></thead>
        <tbody>
          {productos.length === 0 && <tr><td colSpan="7">No hay productos.</td></tr>}
          {productos.map((p) => (
            <tr key={p.codigo}>
              <td>{p.codigo}</td><td>{p.nombre}</td>
              <td>{(obtenerCategoria(p.categoriaId) || {}).nombre}</td>
              <td>${formatearCLP(p.precio)}</td>
              <td>{p.descuento ? `${p.descuento}%` : '-'}</td>
              <td>{p.stock} {hayStockBajo(p) && <span className="badge-stock-critico">Bajo</span>}</td>
              <td className="d-flex gap-1 flex-wrap">
                <Link to={`/admin/productos/${p.codigo}`} className="btn btn-sm btn-outline-secondary">Ver</Link>
                <Link to={`/admin/productos/${p.codigo}/editar`} className="btn btn-sm btn-outline-primary">Editar</Link>
                <BotonAccion etiqueta="Eliminar" variante="outline-danger" className="btn-sm" onClick={() => eliminar(p)} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Seccion>
  );
};

export default AdminProductos;
