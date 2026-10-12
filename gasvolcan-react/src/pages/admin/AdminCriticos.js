import React from 'react';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Seccion from '../../components/Seccion';
import { listarProductos } from '../../data/baseDatos';
import { hayStockBajo } from '../../utils/productos';

const AdminCriticos = () => {
  const criticos = listarProductos().filter(hayStockBajo);
  return (
    <Seccion titulo="Listado de productos críticos" icono="bi-exclamation-triangle">
      <Table responsive hover>
        <thead><tr><th>Código</th><th>Nombre</th><th>Stock</th><th>Stock crítico</th><th></th></tr></thead>
        <tbody>
          {criticos.length === 0 && <tr><td colSpan="5" data-testid="sin-criticos">No hay productos con stock crítico.</td></tr>}
          {criticos.map((p) => (
            <tr key={p.codigo}>
              <td>{p.codigo}</td><td>{p.nombre}</td><td>{p.stock}</td><td>{p.stockCritico}</td>
              <td><Link to={`/admin/productos/${p.codigo}/editar`} className="btn btn-sm btn-outline-primary">Reponer</Link></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Seccion>
  );
};

export default AdminCriticos;
