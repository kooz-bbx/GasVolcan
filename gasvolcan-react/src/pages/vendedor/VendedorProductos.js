import React from 'react';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Seccion from '../../components/Seccion';
import { listarProductos, obtenerCategoria } from '../../data/baseDatos';
import { hayStockBajo } from '../../utils/productos';
import { formatearCLP } from '../../utils/validaciones';

const VendedorProductos = () => (
  <Seccion titulo="Productos (solo lectura)" icono="bi-box-seam">
    <Table responsive hover>
      <thead><tr><th>Código</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th></th></tr></thead>
      <tbody>
        {listarProductos().map((p) => (
          <tr key={p.codigo}>
            <td>{p.codigo}</td><td>{p.nombre}</td>
            <td>{(obtenerCategoria(p.categoriaId) || {}).nombre}</td>
            <td>${formatearCLP(p.precio)}</td>
            <td>{p.stock} {hayStockBajo(p) && <span className="badge-stock-critico">Bajo</span>}</td>
            <td><Link to={`/vendedor/productos/${p.codigo}`} className="btn-enviar text-decoration-none"><i className="bi bi-eye" /> Ver</Link></td>
          </tr>
        ))}
      </tbody>
    </Table>
  </Seccion>
);

export default VendedorProductos;
