import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Seccion from '../components/Seccion';
import { useAuth } from '../context/AuthContext';
import { rutaInicioPorRol } from '../services/usuarioService';
import { errorContrasena, errorCorreo } from '../utils/validaciones';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { correo: '', contrasena: '' } });
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const onSubmit = ({ correo, contrasena }) => {
    const sesion = iniciarSesion(correo, contrasena);
    if (!sesion) {
      setError('Correo o contraseña incorrectos.');
      return;
    }
    setError('');
    navigate(rutaInicioPorRol(sesion.tipoUsuario));
  };

  return (
    <Seccion titulo="Iniciar Sesión" icono="bi-box-arrow-in-right" className="gv-login">
      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-3">
          <Form.Label htmlFor="correo">Correo</Form.Label>
          <Form.Control id="correo" type="email" placeholder="nombre@duoc.cl" isInvalid={!!errors.correo}
            {...register('correo', { required: 'El correo es obligatorio', validate: (v) => errorCorreo(v) || true })} />
          {errors.correo && <div className="error-message">{errors.correo.message}</div>}
        </div>
        <div className="mb-3">
          <Form.Label htmlFor="contrasena">Contraseña</Form.Label>
          <Form.Control id="contrasena" type="password" maxLength={10} placeholder="Entre 4 y 10 caracteres"
            isInvalid={!!errors.contrasena}
            {...register('contrasena', { required: 'La contraseña es obligatoria', validate: (v) => errorContrasena(v) || true })} />
          {errors.contrasena && <div className="error-message">{errors.contrasena.message}</div>}
        </div>
        {error && (
          <Alert variant="danger" role="alert">
            {error} Si aún no tienes cuenta, <Link to="/registro">regístrate aquí</Link>.
          </Alert>
        )}
        <Button type="submit" className="btn-enviar w-100"><i className="bi bi-box-arrow-in-right" /> Iniciar Sesión</Button>
      </Form>
      <p className="text-center mt-3">¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></p>
    </Seccion>
  );
};

export default Login;
