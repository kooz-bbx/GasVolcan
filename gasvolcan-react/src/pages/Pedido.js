import React, { useState } from 'react';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Seccion from '../components/Seccion';
import { crearOrdenRapida } from '../services/ordenService';
import { errorTelefono, formatearCLP, limitarTelefono } from '../utils/validaciones';

const VALORES_INICIALES = {
  nombre: '',
  telefono: '+56 9',
  direccion: '',
  tipoCilindro: '',
  cantidad: '',
  comentario: '',
};

const Pedido = () => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: VALORES_INICIALES,
  });
  const [confirmacion, setConfirmacion] = useState(null);

  const onSubmit = (datos) => {
    const pedido = crearOrdenRapida(datos);
    setConfirmacion(pedido);
    reset(VALORES_INICIALES);
  };

  const limpiar = () => {
    reset(VALORES_INICIALES);
    setConfirmacion(null);
  };

  return (
    <>
      <Seccion titulo="Solicita tu Pedido de Gas" icono="bi-cart-check">
        <p>Completa el formulario y coordinaremos la entrega en tu domicilio.</p>
        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label htmlFor="nombre">Nombre Completo</Form.Label>
              <Form.Control id="nombre" placeholder="Ej: Juan Pérez" isInvalid={!!errors.nombre}
                {...register('nombre', { required: 'El nombre es obligatorio' })} />
              {errors.nombre && <div className="error-message">{errors.nombre.message}</div>}
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label htmlFor="telefono">Teléfono de Contacto</Form.Label>
              <Form.Control id="telefono" type="tel" maxLength={14} placeholder="+56 9 1234 5678"
                isInvalid={!!errors.telefono}
                {...register('telefono', {
                  required: 'El teléfono es obligatorio',
                  validate: (v) => errorTelefono(v) || true,
                  onChange: (e) => setValue('telefono', limitarTelefono(e.target.value)),
                })} />
              {errors.telefono && <div className="error-message">{errors.telefono.message}</div>}
            </Col>
          </Row>
          <div className="mb-3">
            <Form.Label htmlFor="direccion">Dirección de Entrega</Form.Label>
            <Form.Control id="direccion" placeholder="Calle, número, comuna" isInvalid={!!errors.direccion}
              {...register('direccion', { required: 'La dirección es obligatoria' })} />
            {errors.direccion && <div className="error-message">{errors.direccion.message}</div>}
          </div>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label htmlFor="tipoCilindro">Tipo de Cilindro</Form.Label>
              <Form.Select id="tipoCilindro" isInvalid={!!errors.tipoCilindro}
                {...register('tipoCilindro', { required: 'Selecciona el tamaño del cilindro' })}>
                <option value="">Selecciona el tamaño</option>
                <option value="5kg">5 kg</option>
                <option value="11kg">11 kg</option>
                <option value="15kg">15 kg</option>
              </Form.Select>
              {errors.tipoCilindro && <div className="error-message">{errors.tipoCilindro.message}</div>}
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label htmlFor="cantidad">Cantidad</Form.Label>
              <Form.Select id="cantidad" isInvalid={!!errors.cantidad}
                {...register('cantidad', { required: 'Selecciona la cantidad' })}>
                <option value="">Selecciona la cantidad</option>
                <option value="1">1 cilindro</option>
                <option value="2">2 cilindros</option>
                <option value="3">3 cilindros</option>
              </Form.Select>
              {errors.cantidad && <div className="error-message">{errors.cantidad.message}</div>}
            </Col>
          </Row>
          <div className="mb-3">
            <Form.Label htmlFor="comentario">Comentario (referencia de la dirección, horario preferido, etc.)</Form.Label>
            <Form.Control id="comentario" as="textarea" rows={3} placeholder="Ej: Casa color azul, portón negro"
              {...register('comentario')} />
          </div>

          {confirmacion && (
            <Alert variant="success" role="status">
              ¡Pedido registrado! Tu número de seguimiento es <strong>{confirmacion.numero}</strong>. El
              monto estimado a pagar es de <strong>${formatearCLP(confirmacion.total)}</strong>.{' '}
              <Link to="/seguimiento">Ver mi seguimiento</Link>
            </Alert>
          )}

          <div className="d-flex gap-3 mt-3">
            <Button type="submit" className="btn-enviar"><i className="bi bi-send" /> Enviar Pedido</Button>
            <Button type="button" className="btn-limpiar" onClick={limpiar}><i className="bi bi-eraser" /> Limpiar</Button>
          </div>
        </Form>
      </Seccion>

      <Seccion titulo="Forma de Pago" icono="bi-cash-coin">
        <p>El pago se realiza <strong>en efectivo</strong> al momento de la entrega, directamente con el repartidor.</p>
      </Seccion>
    </>
  );
};

export default Pedido;
