import React, { useState } from 'react';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Seccion from '../../components/Seccion';
import { actualizarProducto, crearProducto, listarCategorias, obtenerProducto } from '../../data/baseDatos';
import {
  errorCodigoProducto, errorDescuento, errorEnteroNoNegativo, errorPrecio,
} from '../../utils/validaciones';

const VACIO = {
  codigo: '', nombre: '', descripcion: '', categoriaId: '', precio: '', descuento: 0,
  stock: '', stockCritico: '', imagen: '',
};

const AdminProductoForm = () => {
  const { codigo } = useParams(); // si viene, se está editando
  const navigate = useNavigate();
  const existente = codigo ? obtenerProducto(codigo) : null;
  const editando = Boolean(existente);
  const [guardado, setGuardado] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: existente ? { ...VACIO, ...existente, stockCritico: existente.stockCritico ?? '' } : VACIO,
  });

  if (codigo && !existente) {
    return <Seccion><p>Producto no encontrado. <Link to="/admin/productos">Volver al listado</Link>.</p></Seccion>;
  }

  const onSubmit = (d) => {
    const producto = {
      codigo: d.codigo.trim().toUpperCase(),
      nombre: d.nombre.trim(),
      descripcion: d.descripcion.trim(),
      categoriaId: d.categoriaId,
      precio: Number(d.precio),
      descuento: Number(d.descuento) || 0,
      stock: Number(d.stock),
      stockCritico: d.stockCritico === '' ? null : Number(d.stockCritico),
      imagen: d.imagen.trim(),
    };
    if (editando) actualizarProducto(existente.codigo, producto);
    else crearProducto(producto);
    setGuardado(true);
    setTimeout(() => navigate('/admin/productos'), 800);
  };

  const err = (id) => errors[id] && <div className="error-message">{errors[id].message}</div>;

  return (
    <Seccion titulo={editando ? 'Editar Producto' : 'Nuevo Producto'} icono="bi-box-seam">
      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Row>
          <Col md={6} className="mb-3">
            <Form.Label htmlFor="codigo">Código</Form.Label>
            <Form.Control id="codigo" readOnly={editando} isInvalid={!!errors.codigo}
              {...register('codigo', {
                required: 'El código es obligatorio',
                validate: (v) => errorCodigoProducto(v) || (!editando && obtenerProducto(v.trim().toUpperCase()) ? 'Ya existe un producto con ese código' : true),
              })} />
            {err('codigo')}
          </Col>
          <Col md={6} className="mb-3">
            <Form.Label htmlFor="nombre">Nombre</Form.Label>
            <Form.Control id="nombre" maxLength={100} isInvalid={!!errors.nombre}
              {...register('nombre', { required: 'El nombre es obligatorio' })} />
            {err('nombre')}
          </Col>
        </Row>
        <div className="mb-3">
          <Form.Label htmlFor="descripcion">Descripción</Form.Label>
          <Form.Control id="descripcion" as="textarea" rows={3} maxLength={500} {...register('descripcion')} />
        </div>
        <Row>
          <Col md={4} className="mb-3">
            <Form.Label htmlFor="categoriaId">Categoría</Form.Label>
            <Form.Select id="categoriaId" isInvalid={!!errors.categoriaId}
              {...register('categoriaId', { required: 'Selecciona una categoría' })}>
              <option value="">Seleccione</option>
              {listarCategorias().map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </Form.Select>
            {err('categoriaId')}
          </Col>
          <Col md={4} className="mb-3">
            <Form.Label htmlFor="precio">Precio</Form.Label>
            <Form.Control id="precio" type="number" isInvalid={!!errors.precio}
              {...register('precio', { required: 'El precio es obligatorio', validate: (v) => errorPrecio(v) || true })} />
            {err('precio')}
          </Col>
          <Col md={4} className="mb-3">
            <Form.Label htmlFor="descuento">Descuento % (0 = sin oferta)</Form.Label>
            <Form.Control id="descuento" type="number" isInvalid={!!errors.descuento}
              {...register('descuento', { validate: (v) => errorDescuento(v) || true })} />
            {err('descuento')}
          </Col>
        </Row>
        <Row>
          <Col md={4} className="mb-3">
            <Form.Label htmlFor="stock">Stock</Form.Label>
            <Form.Control id="stock" type="number" isInvalid={!!errors.stock}
              {...register('stock', { required: 'El stock es obligatorio', validate: (v) => errorEnteroNoNegativo(v, 'El stock') || true })} />
            {err('stock')}
          </Col>
          <Col md={4} className="mb-3">
            <Form.Label htmlFor="stockCritico">Stock crítico (opcional)</Form.Label>
            <Form.Control id="stockCritico" type="number" isInvalid={!!errors.stockCritico}
              {...register('stockCritico', { validate: (v) => (v === '' ? true : errorEnteroNoNegativo(v, 'El stock crítico') || true) })} />
            {err('stockCritico')}
          </Col>
          <Col md={4} className="mb-3">
            <Form.Label htmlFor="imagen">Imagen (ruta o URL)</Form.Label>
            <Form.Control id="imagen" placeholder="img/gas11.jpg" {...register('imagen')} />
          </Col>
        </Row>
        {guardado && <Alert variant="success" role="status">¡Producto guardado! Redirigiendo al listado...</Alert>}
        <div className="d-flex gap-3 mt-3">
          <Button type="submit" className="btn-enviar"><i className="bi bi-save" /> Guardar</Button>
          <Link to="/admin/productos" className="btn-limpiar text-decoration-none">Cancelar</Link>
        </div>
      </Form>
    </Seccion>
  );
};

export default AdminProductoForm;
