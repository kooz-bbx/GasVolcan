import React, { useState } from 'react';
import { Alert, Table } from 'react-bootstrap';
import Seccion from '../../components/Seccion';
import FichaEntrega from '../../components/FichaEntrega';
import AccionesReparto from '../../components/AccionesReparto';
import EstadoBadge from '../../components/EstadoBadge';
import { listarOrdenes } from '../../data/baseDatos';
import { cambiarEstadoPedido, ESTADOS_ACTIVOS } from '../../services/ordenService';
import { useAuth } from '../../context/AuthContext';
import { ETIQUETAS_ESTADO } from '../../data/datos';
import { formatearCLP } from '../../utils/validaciones';

// Panel del REPARTIDOR: solo ve los pedidos que la operadora le asignó
// (con los datos de la entrega) y avanza su estado: salir a repartir -> entregado.
const RepartidorEntregas = () => {
  const { sesion } = useAuth();
  const [ordenes, setOrdenes] = useState(listarOrdenes);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const mias = sesion ? ordenes.filter((o) => o.repartidorRun === sesion.run) : [];
  const porEntregar = mias.filter((o) => ESTADOS_ACTIVOS.includes(o.estado));
  const historial = mias.filter((o) => !ESTADOS_ACTIVOS.includes(o.estado));

  const cambiar = async (numero, nuevoEstado) => {
    const r = await cambiarEstadoPedido(numero, nuevoEstado);
    if (r.ok) {
      setOrdenes(listarOrdenes());
      setError('');
      setMensaje(`Pedido ${numero} marcado como "${ETIQUETAS_ESTADO[nuevoEstado]}".`);
    } else {
      setMensaje('');
      setError(r.motivo);
    }
  };

  return (
    <Seccion titulo="Mis entregas" icono="bi-truck">
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {mensaje && <Alert variant="success" onClose={() => setMensaje('')} dismissible>{mensaje}</Alert>}

      <h5>Por entregar ({porEntregar.length})</h5>
      {porEntregar.length === 0 && (
        <Alert variant="info" data-testid="sin-entregas">No tienes entregas asignadas por ahora.</Alert>
      )}
      {porEntregar.map((o) => (
        <div key={o.numero}>
          <FichaEntrega orden={o} />
          <div className="mb-4">
            <AccionesReparto
              orden={o}
              estados={['en-camino', 'entregado']}
              onCambiar={(estado) => cambiar(o.numero, estado)}
            />
          </div>
        </div>
      ))}

      <h5 className="mt-4">Historial</h5>
      <Table responsive size="sm" hover>
        <thead><tr><th>N° Pedido</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Entregado el</th></tr></thead>
        <tbody>
          {historial.length === 0 && <tr><td colSpan="5">Todavía no tienes entregas finalizadas.</td></tr>}
          {historial.map((o) => (
            <tr key={o.numero}>
              <td>{o.numero}</td>
              <td>{o.cliente.nombre} {o.cliente.apellidos}</td>
              <td>${formatearCLP(o.total)}</td>
              <td><EstadoBadge estado={o.estado} /></td>
              <td>{o.fechaEntrega ? new Date(o.fechaEntrega).toLocaleString('es-CL') : '-'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Seccion>
  );
};

export default RepartidorEntregas;
