import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import EstadoBadge from './EstadoBadge';
import ResumenCompra from './ResumenCompra';
import { formatearCLP } from '../utils/validaciones';

// Datos de la entrega que la operadora le deja al repartidor. Prop: orden
const FichaEntrega = ({ orden }) => {
  const c = orden.cliente;
  const e = orden.entrega;
  const aCobrar = orden.pago && orden.pago.metodo === 'efectivo' && !orden.pago.pagado;
  return (
    <Card className="mb-3" data-testid={`ficha-${orden.numero}`}>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <strong>Pedido {orden.numero}</strong>
        <EstadoBadge estado={orden.estado} />
      </Card.Header>
      <Card.Body>
        <Row className="mb-2">
          <Col md={4}><strong>Cliente:</strong> {c.nombre} {c.apellidos}</Col>
          <Col md={4}><strong>Teléfono:</strong> {c.telefono || 'No informado'}</Col>
          <Col md={4}><strong>Camión:</strong> {orden.camion || '-'}</Col>
        </Row>
        <p className="mb-2">
          <i className="bi bi-geo-alt" /> <strong>Dirección:</strong> {e.calle}
          {e.departamento ? `, Depto ${e.departamento}` : ''}
          {e.comuna ? `, ${e.comuna}` : ''}
          {e.region ? `, ${e.region}` : ''}
        </p>
        {e.indicaciones ? <p className="mb-2"><strong>Indicaciones del cliente:</strong> {e.indicaciones}</p> : null}
        {orden.instrucciones ? (
          <p className="mb-2"><strong>Instrucciones de la operadora{orden.asignadoPor ? ` (${orden.asignadoPor})` : ''}:</strong> {orden.instrucciones}</p>
        ) : null}
        <ResumenCompra items={orden.items} />
        <p className="mb-0 fw-bold" data-testid={`cobro-${orden.numero}`}>
          {aCobrar
            ? `Cobrar en efectivo al entregar: $${formatearCLP(orden.total)}`
            : 'Pago ya realizado: no se cobra nada.'}
        </p>
      </Card.Body>
    </Card>
  );
};

export default FichaEntrega;
