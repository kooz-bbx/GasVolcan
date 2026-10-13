import React from 'react';
import { Button } from 'react-bootstrap';
import { estadosSiguientes } from '../services/ordenService';

// Texto del botón según el cambio de estado (y el medio de pago)
function etiquetaAccion(estado, orden) {
  if (estado === 'en-camino') return { texto: 'Salir a repartir', icono: 'bi-truck' };
  if (estado === 'entregado') {
    return orden.pago && orden.pago.metodo === 'efectivo'
      ? { texto: 'Entregado y pagado', icono: 'bi-cash-coin' }
      : { texto: 'Marcar entregado', icono: 'bi-check-circle' };
  }
  return { texto: 'Cancelar', icono: 'bi-x-circle' };
}

// Botones para que el repartidor avance el pedido.
// Recibe la orden y una función onCambiar(nuevoEstado).
const AccionesReparto = ({ orden, onCambiar }) => {
  const siguientes = estadosSiguientes(orden.estado);
  if (siguientes.length === 0) return <span className="text-muted small">Sin acciones</span>;
  return (
    <div className="d-flex flex-wrap gap-2">
      {siguientes.map((estado) => {
        const { texto, icono } = etiquetaAccion(estado, orden);
        const esCancelar = estado === 'cancelado';
        return (
          <Button
            key={estado}
            size="sm"
            variant={esCancelar ? 'outline-danger' : undefined}
            className={esCancelar ? '' : 'btn-enviar'}
            data-testid={`accion-${estado}-${orden.numero}`}
            onClick={() => onCambiar(estado)}
          >
            <i className={`bi ${icono}`} /> {texto}
          </Button>
        );
      })}
    </div>
  );
};

export default AccionesReparto;
