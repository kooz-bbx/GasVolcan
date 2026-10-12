import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ResumenCompra from './ResumenCompra';
import EstadoBadge from './EstadoBadge';
import { OPCIONES_ENTREGA, METODOS_PAGO } from '../data/datos';

const etiqueta = (lista, valor) => (lista.find((o) => o.valor === valor) || {}).etiqueta || valor;

// Boleta de una orden (solo lectura). Prop: orden
const Boleta = ({ orden }) => {
  const c = orden.cliente;
  const e = orden.entrega;
  return (
    <div className="boleta">
      <p className="text-end text-muted mb-1">Orden {orden.numero} · {new Date(orden.fecha).toLocaleString('es-CL')}</p>
      <Row className="mb-2">
        <Col md={4}><strong>Nombre:</strong> {c.nombre} {c.apellidos}</Col>
        <Col md={4}><strong>Correo:</strong> {c.correo || '-'}</Col>
        <Col md={4}><strong>Estado:</strong> <EstadoBadge estado={orden.estado} /></Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <strong>Dirección:</strong> {e.calle}
          {e.departamento ? `, Depto ${e.departamento}` : ''}
          {e.comuna ? `, ${e.comuna}` : ''}
          {e.region ? `, ${e.region}` : ''}
        </Col>
        <Col md={3}><strong>Entrega:</strong> {etiqueta(OPCIONES_ENTREGA, e.tipo)}</Col>
        <Col md={3}><strong>Pago:</strong> {etiqueta(METODOS_PAGO, orden.pago.metodo)}</Col>
      </Row>
      {e.indicaciones ? <p><strong>Indicaciones:</strong> {e.indicaciones}</p> : null}
      <ResumenCompra items={orden.items} />
    </div>
  );
};

export default Boleta;
