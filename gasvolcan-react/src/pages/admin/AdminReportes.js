import React from 'react';
import { Table, Row, Col } from 'react-bootstrap';
import Seccion from '../../components/Seccion';
import { ETIQUETAS_ESTADO } from '../../data/datos';
import { listarOrdenes, listarProductos } from '../../data/baseDatos';
import { calcularReportes } from '../../utils/reportes';
import { formatearCLP } from '../../utils/validaciones';

const AdminReportes = () => {
  const r = calcularReportes(listarOrdenes(), listarProductos());
  return (
    <Seccion titulo="Reportes" icono="bi-bar-chart">
      <p>Órdenes totales: <strong data-testid="rep-ordenes">{r.totalOrdenes}</strong> · Ventas: <strong data-testid="rep-ventas">${formatearCLP(r.totalVentas)}</strong> <small className="text-muted">(no incluye pagos fallidos ni cancelados)</small></p>
      <Row>
        <Col md={6}>
          <h5>Órdenes por estado</h5>
          <Table size="sm">
            <tbody>
              {Object.keys(ETIQUETAS_ESTADO).map((e) => (
                <tr key={e}><td>{ETIQUETAS_ESTADO[e]}</td><td>{r.porEstado[e] || 0}</td></tr>
              ))}
            </tbody>
          </Table>
        </Col>
        <Col md={6}>
          <h5>Unidades vendidas por producto</h5>
          <Table size="sm">
            <tbody>
              {Object.keys(r.unidadesPorProducto).length === 0 && <tr><td>Sin ventas todavía.</td></tr>}
              {Object.entries(r.unidadesPorProducto).map(([nombre, u]) => <tr key={nombre}><td>{nombre}</td><td>{u}</td></tr>)}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Seccion>
  );
};

export default AdminReportes;
