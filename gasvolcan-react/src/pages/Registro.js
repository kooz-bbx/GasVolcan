import React, { useState } from 'react';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Seccion from '../components/Seccion';
import CampoSelectRegion from '../components/CampoSelectRegion';
import { crearUsuario, existeCorreo, existeRun } from '../services/usuarioService';
import {
  errorConfirmacion, errorContrasena, errorCorreo, errorFechaNacimiento, errorRun,
} from '../utils/validaciones';

const INICIAL = {
  run: '', nombre: '', apellidos: '', correo: '', contrasena: '', confirmarContrasena: '',
  fechaNacimiento: '', region: '', comuna: '', direccion: '',
};

const Registro = () => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues: INICIAL });
  const [creado, setCreado] = useState(false);

  const onSubmit = (datos) => {
    crearUsuario(datos, 'Cliente');
    setCreado(true);
    reset(INICIAL);
  };

  const campo = (id, etiqueta, opciones = {}) => (
    <div className="mb-3">
      <Form.Label htmlFor={id}>{etiqueta}</Form.Label>
      <Form.Control id={id} isInvalid={!!errors[id]} {...opciones.props} {...register(id, opciones.reglas)} />
      {errors[id] && <div className="error-message">{errors[id].message}</div>}
    </div>
  );

  return (
    <Seccion titulo="Registro de Usuario" icono="bi-person-plus">
      <p>Regístrate para hacer seguimiento a tus pedidos y guardar tus direcciones.</p>
      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Row>
          <Col md={6}>
            {campo('run', 'RUN (sin puntos ni guión)', {
              props: { maxLength: 9, placeholder: 'Ej: 190110222' },
              reglas: {
                required: 'El RUN es obligatorio',
                validate: (v) => errorRun(v) || (existeRun(v) ? 'Ya existe una cuenta con ese RUN' : true),
              },
            })}
          </Col>
          <Col md={6}>
            {campo('nombre', 'Nombre', { props: { placeholder: 'Ej: María', maxLength: 50 }, reglas: { required: 'El nombre es obligatorio' } })}
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            {campo('apellidos', 'Apellidos', { props: { placeholder: 'Ej: González Soto', maxLength: 100 }, reglas: { required: 'Los apellidos son obligatorios' } })}
          </Col>
          <Col md={6}>
            {campo('correo', 'Correo', {
              props: { type: 'email', placeholder: 'nombre@duoc.cl' },
              reglas: {
                required: 'El correo es obligatorio',
                validate: (v) => errorCorreo(v) || (existeCorreo(v) ? 'Ya existe una cuenta con ese correo' : true),
              },
            })}
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            {campo('contrasena', 'Contraseña', {
              props: { type: 'password', maxLength: 10, placeholder: 'Entre 4 y 10 caracteres' },
              reglas: { required: 'La contraseña es obligatoria', validate: (v) => errorContrasena(v) || true },
            })}
          </Col>
          <Col md={6}>
            {campo('confirmarContrasena', 'Confirmar Contraseña', {
              props: { type: 'password', maxLength: 10, placeholder: 'Repite tu contraseña' },
              reglas: {
                required: 'Debes confirmar la contraseña',
                validate: (v) => errorConfirmacion(v, watch('contrasena')) || true,
              },
            })}
          </Col>
        </Row>
        {campo('fechaNacimiento', 'Fecha de Nacimiento (opcional)', {
          props: { type: 'date', min: '1900-01-01', max: '2005-12-31' },
          reglas: { validate: (v) => errorFechaNacimiento(v) || true },
        })}
        <CampoSelectRegion register={register} watch={watch} errors={errors} />
        {campo('direccion', 'Dirección', { props: { maxLength: 300, placeholder: 'Calle, número, referencia' }, reglas: { required: 'La dirección es obligatoria' } })}

        {creado && (
          <Alert variant="success" role="status">
            ¡Cuenta creada con éxito! Ya puedes <Link to="/login">iniciar sesión</Link>.
          </Alert>
        )}
        <div className="d-flex gap-3 mt-3">
          <Button type="submit" className="btn-enviar"><i className="bi bi-check-circle" /> Registrar</Button>
          <Button type="button" className="btn-limpiar" onClick={() => { reset(INICIAL); setCreado(false); }}>
            <i className="bi bi-eraser" /> Limpiar
          </Button>
        </div>
      </Form>
    </Seccion>
  );
};

export default Registro;
