import React, { useState } from 'react';
import { Alert, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Seccion from '../../components/Seccion';
import BotonAccion from '../../components/BotonAccion';
import { eliminarCategoria, listarCategorias, listarProductos } from '../../data/baseDatos';

const AdminCategorias = () => {
  const [categorias, setCategorias] = useState(() => listarCategorias());
  const [error, setError] = useState('');

  const eliminar = (c) => {
    if (!window.confirm(`¿Eliminar la categoría ${c.nombre}?`)) return;
    const resultado = eliminarCategoria(c.id);
    setError(resultado.ok ? '' : resultado.motivo);
    setCategorias(listarCategorias());
  };
  const cuantos = (id) => listarProductos().filter((p) => p.categoriaId === id).length;

  return (
    <Seccion titulo="Categorías" icono="bi-tags">
      <Link to="/admin/categorias/nueva" className="btn-enviar text-decoration-none d-inline-block mb-3">
        <i className="bi bi-plus-circle" /> Nueva categoría
      </Link>
      {error && <Alert variant="danger" role="alert">{error}</Alert>}
      <Table responsive hover>
        <thead><tr><th>Nombre</th><th>Descripción</th><th>Productos</th><th>Acciones</th></tr></thead>
        <tbody>
          {categorias.map((c) => (
            <tr key={c.id}>
              <td>{c.nombre}</td><td>{c.descripcion}</td><td>{cuantos(c.id)}</td>
              <td className="d-flex gap-1">
                <Link to={`/admin/categorias/${c.id}/editar`} className="btn btn-sm btn-outline-primary">Editar</Link>
                <BotonAccion etiqueta="Eliminar" variante="outline-danger" className="btn-sm" onClick={() => eliminar(c)} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Seccion>
  );
};

export default AdminCategorias;
