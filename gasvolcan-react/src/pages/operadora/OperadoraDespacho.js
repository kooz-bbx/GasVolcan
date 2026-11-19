import React, { useState } from 'react';
import { Alert, Button, Card, Col, Form, InputGroup, Row, Table } from 'react-bootstrap';
import Seccion from '../../components/Seccion';
import EstadoBadge from '../../components/EstadoBadge';
import AccionesReparto from '../../components/AccionesReparto';
import { listarCamiones, listarOrdenes, listarProductos } from '../../data/baseDatos';
import { listarRepartidores } from '../../services/usuarioService';
import {
  asignarPedido, cambiarEstadoPedido, camionDeRepartidor, crearPedidoTelefonico,
  pedidosActivosDeCamion, repartidorDeCamion,
} from '../../services/ordenService';
import { ETIQUETAS_ESTADO } from '../../data/datos';
import { formatearCLP } from '../../utils/validaciones';

// Panel de la OPERADORA (orquestadora del reparto):
// elige qué camión y qué repartidor llevan cada pedido pendiente y les deja las instrucciones.
const OperadoraDespacho = () => {
  const [ordenes, setOrdenes] = useState(listarOrdenes);
  const [elecciones, setElecciones] = useState({}); // { [numeroPedido]: { camion, repartidor, instrucciones } }
  const [mensaje, setMensaje] = useState(null); // { tipo: 'success' | 'danger', texto }
  const formVacio = { nombre: '', telefono: '', direccion: '', comuna: '', codigoProducto: '', cantidad: '1', indicaciones: '' };
  const [llamada, setLlamada] = useState(formVacio);
  const [mensajeLlamada, setMensajeLlamada] = useState(null);

  const camiones = listarCamiones();
  const productos = listarProductos();
  const repartidores = listarRepartidores();
  const pendientes = ordenes.filter((o) => o.estado === 'pendiente');
  const enCurso = ordenes.filter((o) => ['asignado', 'en-camino'].includes(o.estado));

  const eleccion = (numero) => elecciones[numero] || { camion: '', repartidor: '', instrucciones: '' };
  const cambiarEleccion = (numero, campo, valor) => {
    const nueva = { ...eleccion(numero), [campo]: valor };
    // si el repartidor ya va en un camión, se elige ese camión automáticamente
    if (campo === 'repartidor') {
      const suCamion = camionDeRepartidor(valor, ordenes);
      if (suCamion) nueva.camion = suCamion;
    }
    setElecciones({ ...elecciones, [numero]: nueva });
  };

  const registrarLlamada = async (ev) => {
    ev.preventDefault();
    const r = await crearPedidoTelefonico(llamada);
    if (r.ok) {
      setOrdenes(listarOrdenes());
      setLlamada(formVacio);
      setMensajeLlamada({ tipo: 'success', texto: `Pedido ${r.orden.numero} registrado. Ya aparece en "Pedidos por asignar".` });
    } else {
      setMensajeLlamada({ tipo: 'danger', texto: r.motivo });
    }
  };
  const cambiarLlamada = (campo) => (ev) => setLlamada({ ...llamada, [campo]: ev.target.value });
  const hoy = new Date().toDateString();
  const pedidosDelDia = ordenes.filter((o) => new Date(o.fecha).toDateString() === hoy);

  const asignar = async (numero) => {
    const e = eleccion(numero);
    // la operadora que asigna queda registrada en el pedido por el backend (según su JWT)
    const resultado = await asignarPedido(numero, {
      camion: e.camion,
      repartidorRun: e.repartidor,
      instrucciones: e.instrucciones,
    });
    if (resultado.ok) {
      setOrdenes(listarOrdenes());
      setMensaje({
        tipo: 'success',
        texto: `Pedido ${numero} asignado a ${resultado.orden.repartidor} en el camión ${resultado.orden.camion}.`,
      });
    } else {
      setMensaje({ tipo: 'danger', texto: resultado.motivo });
    }
  };

  const cancelar = async (numero, nuevoEstado) => {
    const r = await cambiarEstadoPedido(numero, nuevoEstado);
    if (r.ok) {
      setOrdenes(listarOrdenes());
      setMensaje({ tipo: 'success', texto: `Pedido ${numero} marcado como "${ETIQUETAS_ESTADO[nuevoEstado]}".` });
    } else {
      setMensaje({ tipo: 'danger', texto: r.motivo });
    }
  };

  return (
    <Seccion titulo="Despacho de pedidos" icono="bi-headset">
      {mensaje && (
        <Alert variant={mensaje.tipo} onClose={() => setMensaje(null)} dismissible data-testid="mensaje-despacho">
          {mensaje.texto}
        </Alert>
      )}

      <h5 className="mt-2">Registrar pedido por llamada</h5>
      <Form onSubmit={registrarLlamada} className="mb-4" data-testid="form-llamada">
        {mensajeLlamada && (
          <Alert variant={mensajeLlamada.tipo} onClose={() => setMensajeLlamada(null)} dismissible data-testid="mensaje-llamada">
            {mensajeLlamada.texto}
          </Alert>
        )}
        <Row className="g-2">
          <Col md={4}>
            <Form.Label htmlFor="ll-nombre">Nombre del cliente</Form.Label>
            <Form.Control id="ll-nombre" value={llamada.nombre} onChange={cambiarLlamada('nombre')} />
          </Col>
          <Col md={4}>
            <Form.Label htmlFor="ll-telefono">Teléfono</Form.Label>
            <InputGroup>
              <InputGroup.Text>+56</InputGroup.Text>
              <Form.Control
                id="ll-telefono"
                inputMode="numeric"
                maxLength={9}
                placeholder="912345678"
                value={llamada.telefono}
                onChange={(ev) => setLlamada({ ...llamada, telefono: ev.target.value.replace(/\D/g, '').slice(0, 9) })}
              />
            </InputGroup>
          </Col>
          <Col md={4}>
            <Form.Label htmlFor="ll-comuna">Comuna</Form.Label>
            <Form.Control id="ll-comuna" value={llamada.comuna} onChange={cambiarLlamada('comuna')} />
          </Col>
          <Col md={6}>
            <Form.Label htmlFor="ll-direccion">Dirección de entrega</Form.Label>
            <Form.Control id="ll-direccion" value={llamada.direccion} onChange={cambiarLlamada('direccion')} />
          </Col>
          <Col md={4}>
            <Form.Label htmlFor="ll-producto">Producto</Form.Label>
            <Form.Select id="ll-producto" value={llamada.codigoProducto} onChange={cambiarLlamada('codigoProducto')}>
              <option value="">Selecciona un producto</option>
              {productos.map((p) => (
                <option key={p.codigo} value={p.codigo}>{p.nombre} · ${formatearCLP(p.precio)}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label htmlFor="ll-cantidad">Cantidad</Form.Label>
            <Form.Control id="ll-cantidad" type="number" min="1" value={llamada.cantidad} onChange={cambiarLlamada('cantidad')} />
          </Col>
          <Col md={12}>
            <Form.Label htmlFor="ll-indicaciones">Indicaciones del cliente (opcional)</Form.Label>
            <Form.Control id="ll-indicaciones" value={llamada.indicaciones} onChange={cambiarLlamada('indicaciones')} />
          </Col>
        </Row>
        <Button type="submit" className="btn-enviar mt-3" data-testid="registrar-llamada">
          <i className="bi bi-telephone" /> Registrar pedido
        </Button>
      </Form>

      <h5 className="mt-2">Pedidos por asignar ({pendientes.length})</h5>
      {pendientes.length === 0 && <Alert variant="info">No hay pedidos pendientes por asignar.</Alert>}
      {pendientes.map((o) => {
        const e = eleccion(o.numero);
        return (
          <Card className="mb-3" key={o.numero} data-testid={`pendiente-${o.numero}`}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Pedido {o.numero}</strong>
              <span>Total ${formatearCLP(o.total)}</span>
            </Card.Header>
            <Card.Body>
              <p className="mb-2">
                <strong>Cliente:</strong> {o.cliente.nombre} {o.cliente.apellidos} ·{' '}
                <strong>Dirección:</strong> {o.entrega.calle}{o.entrega.comuna ? `, ${o.entrega.comuna}` : ''}
              </p>
              <Row className="g-2">
                <Col md={3}>
                  <Form.Label htmlFor={`camion-${o.numero}`}>Camión</Form.Label>
                  <Form.Select
                    id={`camion-${o.numero}`}
                    data-testid={`select-camion-${o.numero}`}
                    value={e.camion}
                    onChange={(ev) => cambiarEleccion(o.numero, 'camion', ev.target.value)}
                  >
                    <option value="">Selecciona un camión</option>
                    {camiones.map((c) => {
                      const run = repartidorDeCamion(c.patente, ordenes);
                      const otro = Boolean(run) && run !== e.repartidor;
                      return (
                        <option key={c.patente} value={c.patente} disabled={otro}>
                          {c.patente} · {c.modelo}{run ? ' (en ruta)' : ''}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Label htmlFor={`repartidor-${o.numero}`}>Repartidor</Form.Label>
                  <Form.Select
                    id={`repartidor-${o.numero}`}
                    data-testid={`select-repartidor-${o.numero}`}
                    value={e.repartidor}
                    onChange={(ev) => cambiarEleccion(o.numero, 'repartidor', ev.target.value)}
                  >
                    <option value="">Selecciona un repartidor</option>
                    {repartidores.map((r) => {
                      const patente = camionDeRepartidor(r.run, ordenes);
                      return (
                        <option key={r.run} value={r.run}>
                          {r.nombre} {r.apellidos}{patente ? ` (en ruta, camión ${patente})` : ''}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label htmlFor={`instrucciones-${o.numero}`}>Instrucciones para el repartidor (opcional)</Form.Label>
                  <Form.Control
                    id={`instrucciones-${o.numero}`}
                    value={e.instrucciones}
                    placeholder="Ej: llamar al llegar, portón verde"
                    onChange={(ev) => cambiarEleccion(o.numero, 'instrucciones', ev.target.value)}
                  />
                </Col>
              </Row>
              <div className="d-flex flex-wrap gap-2 mt-3">
                <Button className="btn-enviar" data-testid={`asignar-${o.numero}`} onClick={() => asignar(o.numero)}>
                  <i className="bi bi-send" /> Asignar y enviar datos
                </Button>
                <AccionesReparto orden={o} estados={['cancelado']} onCambiar={(estado) => cancelar(o.numero, estado)} />
              </div>
            </Card.Body>
          </Card>
        );
      })}

      <h5 className="mt-4">Flota de camiones</h5>
      <Table responsive size="sm" hover>
        <thead><tr><th>Patente</th><th>Modelo</th><th>Estado</th><th>Pedido</th><th>Repartidor</th></tr></thead>
        <tbody>
          {camiones.map((c) => {
            const activos = pedidosActivosDeCamion(c.patente, ordenes);
            return (
              <tr key={c.patente}>
                <td>{c.patente}</td>
                <td>{c.modelo}</td>
                <td>{activos.length ? 'En ruta' : 'Libre'}</td>
                <td>{activos.length ? activos.map((a) => a.numero).join(', ') : '-'}</td>
                <td>{activos.length ? activos[0].repartidor : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <h5 className="mt-4">Repartidores</h5>
      <Table responsive size="sm" hover data-testid="tabla-repartidores">
        <thead><tr><th>Repartidor</th><th>Estado</th><th>Camión</th><th>Pedidos en curso</th></tr></thead>
        <tbody>
          {repartidores.map((r) => {
            const patente = camionDeRepartidor(r.run, ordenes);
            const suyos = ordenes.filter((o) => o.repartidorRun === r.run && ['asignado', 'en-camino'].includes(o.estado));
            return (
              <tr key={r.run}>
                <td>{r.nombre} {r.apellidos}</td>
                <td>{patente ? 'En ruta' : 'Libre'}</td>
                <td>{patente || '-'}</td>
                <td>{suyos.length ? suyos.map((o) => o.numero).join(', ') : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <h5 className="mt-4">Pedidos asignados y en curso ({enCurso.length})</h5>
      <Table responsive hover>
        <thead><tr><th>N° Pedido</th><th>Cliente</th><th>Camión</th><th>Repartidor</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {enCurso.length === 0 && <tr><td colSpan="6">No hay pedidos en curso.</td></tr>}
          {enCurso.map((o) => (
            <tr key={o.numero}>
              <td>{o.numero}</td>
              <td>{o.cliente.nombre} {o.cliente.apellidos}</td>
              <td>{o.camion || '-'}</td>
              <td>{o.repartidor}</td>
              <td><EstadoBadge estado={o.estado} /></td>
              <td><AccionesReparto orden={o} estados={['cancelado']} onCambiar={(estado) => cancelar(o.numero, estado)} /></td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h5 className="mt-4">Pedidos del día ({pedidosDelDia.length})</h5>
      <Table responsive hover size="sm">
        <thead><tr><th>N° Pedido</th><th>Cliente</th><th>Dirección</th><th>Total</th><th>Camión</th><th>Repartidor</th><th>Estado</th></tr></thead>
        <tbody>
          {pedidosDelDia.length === 0 && <tr><td colSpan="7">Aún no hay pedidos hoy.</td></tr>}
          {pedidosDelDia.map((o) => (
            <tr key={o.numero}>
              <td>{o.numero}</td>
              <td>{o.cliente.nombre} {o.cliente.apellidos}</td>
              <td>{o.entrega.calle}</td>
              <td>${formatearCLP(o.total)}</td>
              <td>{o.camion || '-'}</td>
              <td>{o.repartidorRun ? o.repartidor : '-'}</td>
              <td><EstadoBadge estado={o.estado} /></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Seccion>
  );
};

export default OperadoraDespacho;
