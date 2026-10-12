import React, { useState } from 'react';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import Seccion from '../components/Seccion';
import { errorCorreo, errorTelefono, limitarTelefono } from '../utils/validaciones';

const INICIAL = { nombre: '', email: '', telefono: '+56 9', asunto: '', mensaje: '' };

const Contacto = () => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({ defaultValues: INICIAL });
  const [enviado, setEnviado] = useState(false);

  const onSubmit = () => {
    setEnviado(true);
    reset(INICIAL);
  };

  return (
    <Seccion titulo="Formulario de Contacto" icono="bi-chat-dots">
      <p>¿Tienes una consulta o reclamo? Completa el formulario y te responderemos a la brevedad.</p>
      <Row>
        <Col md={8}>
          <Form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-3">
              <Form.Label htmlFor="nombre">Nombre Completo</Form.Label>
              <Form.Control id="nombre" maxLength={100} placeholder="Ej: María González" isInvalid={!!errors.nombre}
                {...register('nombre', { required: 'El nombre es obligatorio' })} />
              {errors.nombre && <div className="error-message">{errors.nombre.message}</div>}
            </div>
            <div className="mb-3">
              <Form.Label htmlFor="email">Correo Electrónico</Form.Label>
              <Form.Control id="email" type="email" maxLength={100} placeholder="nombre@duoc.cl" isInvalid={!!errors.email}
                {...register('email', { required: 'El correo es obligatorio', validate: (v) => errorCorreo(v) || true })} />
              {errors.email && <div className="error-message">{errors.email.message}</div>}
            </div>
            <div className="mb-3">
              <Form.Label htmlFor="telefono">Teléfono (opcional)</Form.Label>
              <Form.Control id="telefono" type="tel" maxLength={14} isInvalid={!!errors.telefono}
                {...register('telefono', {
                  validate: (v) => (v === '+56 9' ? true : errorTelefono(v) || true),
                  onChange: (e) => setValue('telefono', limitarTelefono(e.target.value)),
                })} />
              {errors.telefono && <div className="error-message">{errors.telefono.message}</div>}
            </div>
            <div className="mb-3">
              <Form.Label htmlFor="asunto">Asunto (opcional)</Form.Label>
              <Form.Select id="asunto" {...register('asunto')}>
                <option value="">Selecciona un motivo</option>
                <option value="consulta">Consulta general</option>
                <option value="pedido">Sobre mi pedido</option>
                <option value="reclamo">Reclamo</option>
                <option value="otro">Otro</option>
              </Form.Select>
            </div>
            <div className="mb-3">
              <Form.Label htmlFor="mensaje">Mensaje</Form.Label>
              <Form.Control id="mensaje" as="textarea" rows={4} maxLength={500} placeholder="Escribe tu mensaje aquí..."
                isInvalid={!!errors.mensaje}
                {...register('mensaje', { required: 'El mensaje es obligatorio' })} />
              {errors.mensaje && <div className="error-message">{errors.mensaje.message}</div>}
            </div>
            {enviado && (
              <Alert variant="success" role="status">¡Formulario enviado correctamente! Te responderemos a la brevedad.</Alert>
            )}
            <div className="d-flex gap-3 mt-3">
              <Button type="submit" className="btn-enviar"><i className="bi bi-send" /> Enviar</Button>
              <Button type="button" className="btn-limpiar" onClick={() => { reset(INICIAL); setEnviado(false); }}>
                <i className="bi bi-eraser" /> Limpiar
              </Button>
            </div>
          </Form>
        </Col>
        <Col md={4}>
          <div className="contact-info"><h5><i className="bi bi-geo-alt" /> Dirección</h5><p>Chillán, Región de Ñuble, Chile</p></div>
          <div className="contact-info"><h5><i className="bi bi-telephone" /> Teléfono</h5><p>+56 42 123 4567</p></div>
          <div className="contact-info"><h5><i className="bi bi-clock" /> Horario</h5><p>Lun-Sáb: 8:30 - 19:00</p></div>
          <div className="contact-info"><h5><i className="bi bi-envelope" /> Email</h5><p>contacto@gaselvolcan.cl</p></div>
        </Col>
      </Row>
    </Seccion>
  );
};

export default Contacto;
