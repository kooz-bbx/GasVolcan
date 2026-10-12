import React, { useState } from 'react';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Seccion from '../../components/Seccion';
import CampoSelectRegion from '../../components/CampoSelectRegion';
import { ROLES } from '../../data/datos';
import { actualizarUsuario, crearUsuario, existeCorreo, existeRun, obtenerUsuario } from '../../services/usuarioService';
import { errorContrasena, errorCorreo, errorRun } from '../../utils/validaciones';

const AdminUsuarioForm = () => {
  const { run } = useParams(); // si viene, estamos editando
  const navigate = useNavigate();
  const existente = run ? obtenerUsuario(run) : null;
  const editando = Boolean(existente);
  const [guardado, setGuardado] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: existente
      ? { ...existente, contrasena: '' }
      : { run: '', nombre: '', apellidos: '', correo: '', contrasena: '', tipoUsuario: 'Cliente', region: '', comuna: '', direccion: '' },
  });

  if (run && !existente) {
    return <Seccion><p>Usuario no encontrado. <Link to="/admin/usuarios">Volver al listado</Link>.</p></Seccion>;
  }

  const onSubmit = (datos) => {
    if (editando) actualizarUsuario(existente.run, datos);
    else crearUsuario(datos);
    setGuardado(true);
    setTimeout(() => navigate('/admin/usuarios'), 900);
  };

  const err = (id) => errors[id] && <div className="error-message">{errors[id].message}</div>;

  return (
    <Seccion titulo={editando ? 'Editar Usuario' : 'Nuevo Usuario'} icono="bi-person-plus">
      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Row>
          <Col md={6} className="mb-3">
            <Form.Label htmlFor="run">RUN (sin puntos ni guión)</Form.Label>
            <Form.Control id="run" maxLength={9} readOnly={editando} isInvalid={!!errors.run}
              {...register('run', {
                required: 'El RUN es obligatorio',
                // al editar el RUN no se puede cambiar, así que no se vuelve a validar
                validate: (v) => (editando ? true : errorRun(v) || (existeRun(v) ? 'Ya existe un usuario con ese RUN' : true)),
              })} />
            {err('run')}
          </Col>
          <Col md={6} className="mb-3">
            <Form.Label htmlFor="nombre">Nombre</Form.Label>
            <Form.Control id="nombre" maxLength={50} isInvalid={!!errors.nombre}
              {...register('nombre', { required: 'El nombre es obligatorio' })} />
            {err('nombre')}
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mb-3">
            <Form.Label htmlFor="apellidos">Apellidos</Form.Label>
            <Form.Control id="apellidos" maxLength={100} isInvalid={!!errors.apellidos}
              {...register('apellidos', { required: 'Los apellidos son obligatorios' })} />
            {err('apellidos')}
          </Col>
          <Col md={6} className="mb-3">
            <Form.Label htmlFor="correo">Correo</Form.Label>
            <Form.Control id="correo" type="email" isInvalid={!!errors.correo}
              {...register('correo', {
                required: 'El correo es obligatorio',
                validate: (v) => errorCorreo(v) || (existeCorreo(v, existente && existente.run) ? 'Ya existe un usuario con ese correo' : true),
              })} />
            {err('correo')}
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mb-3">
            <Form.Label htmlFor="contrasena">{editando ? 'Nueva contraseña (opcional)' : 'Contraseña'}</Form.Label>
            <Form.Control id="contrasena" type="password" maxLength={10} isInvalid={!!errors.contrasena}
              {...register('contrasena', {
                validate: (v) => (editando && v === '' ? true : errorContrasena(v) || true),
              })} />
            {err('contrasena')}
          </Col>
          <Col md={6} className="mb-3">
            <Form.Label htmlFor="tipoUsuario">Tipo de usuario</Form.Label>
            <Form.Select id="tipoUsuario" {...register('tipoUsuario')}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </Form.Select>
          </Col>
        </Row>
        <CampoSelectRegion register={register} watch={watch} errors={errors} />
        <div className="mb-3">
          <Form.Label htmlFor="direccion">Dirección</Form.Label>
          <Form.Control id="direccion" maxLength={300} isInvalid={!!errors.direccion}
            {...register('direccion', { required: 'La dirección es obligatoria' })} />
          {err('direccion')}
        </div>
        {guardado && <Alert variant="success" role="status">¡Usuario guardado! Redirigiendo al listado...</Alert>}
        <div className="d-flex gap-3 mt-3">
          <Button type="submit" className="btn-enviar"><i className="bi bi-save" /> Guardar</Button>
          <Link to="/admin/usuarios" className="btn-limpiar text-decoration-none">Cancelar</Link>
        </div>
      </Form>
    </Seccion>
  );
};

export default AdminUsuarioForm;
