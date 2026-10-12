import React, { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import CampoSelectRegion from './CampoSelectRegion';
import { METODOS_PAGO, OPCIONES_ENTREGA } from '../data/datos';
import { errorCorreo, errorTarjeta, formatearCLP } from '../utils/validaciones';

// Formulario del paso de pago: datos del cliente, dirección, entrega y pago.
// Props: valoresIniciales, total y onPagar(datos). No guarda nada: avisa al padre.
const CheckoutForm = ({ valoresIniciales, total, onPagar }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: valoresIniciales });
  const [enviando, setEnviando] = useState(false);
  const metodo = watch('metodo');

  const enviar = (datos) => {
    setEnviando(true);
    onPagar({
      cliente: { nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(), correo: datos.correo.trim().toLowerCase() },
      entrega: {
        tipo: datos.tipoEntrega,
        calle: datos.calle.trim(),
        departamento: (datos.departamento || '').trim(),
        region: datos.region,
        comuna: datos.comuna,
        indicaciones: (datos.indicaciones || '').trim(),
      },
      pago: { metodo: datos.metodo, numeroTarjeta: datos.numeroTarjeta },
    });
  };

  const err = (id) => errors[id] && <div className="error-message">{errors[id].message}</div>;

  return (
    <Form onSubmit={handleSubmit(enviar)} noValidate>
      <h5>Información del cliente</h5>
      <Row>
        <Col md={6} className="mb-3">
          <Form.Label htmlFor="nombre">Nombre*</Form.Label>
          <Form.Control id="nombre" isInvalid={!!errors.nombre} {...register('nombre', { required: 'El nombre es obligatorio' })} />
          {err('nombre')}
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label htmlFor="apellidos">Apellidos*</Form.Label>
          <Form.Control id="apellidos" isInvalid={!!errors.apellidos} {...register('apellidos', { required: 'Los apellidos son obligatorios' })} />
          {err('apellidos')}
        </Col>
      </Row>
      <div className="mb-3">
        <Form.Label htmlFor="correo">Correo*</Form.Label>
        <Form.Control id="correo" type="email" isInvalid={!!errors.correo}
          {...register('correo', { required: 'El correo es obligatorio', validate: (v) => errorCorreo(v) || true })} />
        {err('correo')}
      </div>

      <h5 className="mt-3">Dirección de entrega de los productos</h5>
      <Row>
        <Col md={8} className="mb-3">
          <Form.Label htmlFor="calle">Calle*</Form.Label>
          <Form.Control id="calle" isInvalid={!!errors.calle} {...register('calle', { required: 'La calle es obligatoria' })} />
          {err('calle')}
        </Col>
        <Col md={4} className="mb-3">
          <Form.Label htmlFor="departamento">Departamento (opcional)</Form.Label>
          <Form.Control id="departamento" placeholder="Ej: 603" {...register('departamento')} />
        </Col>
      </Row>
      <CampoSelectRegion register={register} watch={watch} errors={errors} />
      <div className="mb-3">
        <Form.Label htmlFor="indicaciones">Indicaciones para la entrega (opcional)</Form.Label>
        <Form.Control id="indicaciones" as="textarea" rows={2} placeholder="Ej: Entre calles, color del edificio, no tiene timbre." {...register('indicaciones')} />
      </div>

      <h5 className="mt-3">Opciones de entrega y pago</h5>
      <Row>
        <Col md={6} className="mb-3">
          <Form.Label htmlFor="tipoEntrega">Entrega</Form.Label>
          <Form.Select id="tipoEntrega" {...register('tipoEntrega')}>
            {OPCIONES_ENTREGA.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
          </Form.Select>
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label htmlFor="metodo">Método de pago</Form.Label>
          <Form.Select id="metodo" {...register('metodo')}>
            {METODOS_PAGO.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
          </Form.Select>
        </Col>
      </Row>
      {metodo === 'tarjeta' && (
        <div className="mb-3">
          <Form.Label htmlFor="numeroTarjeta">Número de tarjeta (16 dígitos)</Form.Label>
          <Form.Control id="numeroTarjeta" maxLength={16} placeholder="Ej: 4111111111111111" isInvalid={!!errors.numeroTarjeta}
            {...register('numeroTarjeta', { validate: (v) => watch('metodo') !== 'tarjeta' || errorTarjeta(v) || true })} />
          {err('numeroTarjeta')}
          <small className="text-muted">Pago simulado: una tarjeta que termina en 0000 será rechazada.</small>
        </div>
      )}

      <div className="text-end mt-3">
        <Button type="submit" className="btn-enviar" disabled={enviando}>
          Pagar ahora ${formatearCLP(total)}
        </Button>
      </div>
    </Form>
  );
};

export default CheckoutForm;
