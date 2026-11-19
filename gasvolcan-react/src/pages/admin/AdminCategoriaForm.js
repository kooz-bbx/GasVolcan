import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Seccion from '../../components/Seccion';
import { mensajeDeError } from '../../api/http';
import { obtenerCategoria } from '../../data/baseDatos';
import { actualizarCategoria, crearCategoria } from '../../services/catalogoService';

const AdminCategoriaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const existente = id ? obtenerCategoria(id) : null;
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: existente ? { nombre: existente.nombre, descripcion: existente.descripcion } : { nombre: '', descripcion: '' },
  });

  if (id && !existente) {
    return <Seccion><p>Categoría no encontrada. <Link to="/admin/categorias">Volver</Link>.</p></Seccion>;
  }

  const onSubmit = async (d) => {
    const categoria = { nombre: d.nombre.trim(), descripcion: d.descripcion.trim() };
    try {
      if (existente) await actualizarCategoria(existente.id, categoria);
      else await crearCategoria(categoria);
      setError('');
      setGuardado(true);
      setTimeout(() => navigate('/admin/categorias'), 800);
    } catch (e) {
      setError(mensajeDeError(e));
    }
  };

  return (
    <Seccion titulo={existente ? 'Editar Categoría' : 'Nueva Categoría'} icono="bi-tags">
      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-3">
          <Form.Label htmlFor="nombre">Nombre</Form.Label>
          <Form.Control id="nombre" maxLength={60} isInvalid={!!errors.nombre}
            {...register('nombre', { required: 'El nombre es obligatorio' })} />
          {errors.nombre && <div className="error-message">{errors.nombre.message}</div>}
        </div>
        <div className="mb-3">
          <Form.Label htmlFor="descripcion">Descripción</Form.Label>
          <Form.Control id="descripcion" as="textarea" rows={3} maxLength={300} {...register('descripcion')} />
        </div>
        {error && <Alert variant="danger" role="alert">{error}</Alert>}
        {guardado && <Alert variant="success" role="status">¡Categoría guardada! Redirigiendo...</Alert>}
        <div className="d-flex gap-3">
          <Button type="submit" className="btn-enviar"><i className="bi bi-save" /> Guardar</Button>
          <Link to="/admin/categorias" className="btn-limpiar text-decoration-none">Cancelar</Link>
        </div>
      </Form>
    </Seccion>
  );
};

export default AdminCategoriaForm;
