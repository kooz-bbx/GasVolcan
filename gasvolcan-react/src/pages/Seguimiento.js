import React, { useState } from 'react';
import { Table, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Seccion from '../components/Seccion';
import EstadoBadge from '../components/EstadoBadge';
import { ETIQUETAS_ESTADO } from '../data/datos';
import { obtenerMisOrdenes } from '../services/ordenService';
import { formatearCLP } from '../utils/validaciones';
import { useAuth } from '../context/AuthContext';

const resumenItems = (o) => o.items.map((i) => `${i.cantidad} × ${i.nombre}`).join(', ');

const Seguimiento = () => {
  const { sesion } = useAuth();
  const [filtro, setFiltro] = useState('todos');
  // Solo las órdenes del usuario actual (o de "invitado" sin sesión)
  const ordenes = React.useMemo(() => obtenerMisOrdenes(), [sesion]); // eslint-disable-line react-hooks/exhaustive-deps
  const visibles = ordenes.filter((o) => filtro === 'todos' || o.estado === filtro);

  if (ordenes.length === 0) {
    return (
      <Seccion titulo="Seguimiento de mis Pedidos" icono="bi-truck">
        <Alert variant="info" data-testid="seguimiento-vacio">
          Todavía no has hecho ningún pedido. <Link to="/pedido">Hacer un pedido</Link>
        </Alert>
      </Seccion>
    );
  }
  return (
    <Seccion titulo="Seguimiento de mis Pedidos" icono="bi-truck">
      <Form.Group className="mb-3" style={{ maxWidth: 300 }}>
        <Form.Label htmlFor="filtro-estado">Filtrar por estado</Form.Label>
        <Form.Select id="filtro-estado" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          {Object.keys(ETIQUETAS_ESTADO).map((e) => <option key={e} value={e}>{ETIQUETAS_ESTADO[e]}</option>)}
        </Form.Select>
      </Form.Group>
      <Table responsive hover>
        <thead><tr><th>N° Pedido</th><th>Dirección</th><th>Producto</th><th>Total</th><th>Repartidor</th><th>Estado</th></tr></thead>
        <tbody>
          {visibles.map((o) => (
            <tr key={o.numero}>
              <td>{o.numero}</td>
              <td>{o.entrega.calle}</td>
              <td>{resumenItems(o)}</td>
              <td>${formatearCLP(o.total)}</td>
              <td>{o.repartidor}</td>
              <td><EstadoBadge estado={o.estado} /></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Seccion>
  );
};

export default Seguimiento;
