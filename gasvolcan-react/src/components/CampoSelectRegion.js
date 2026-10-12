import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { REGIONES } from '../data/datos';

// Selects de región y comuna en cascada, para usar con react-hook-form
// (register, watch y errors vienen del useForm del formulario padre)
const CampoSelectRegion = ({ register, watch, errors }) => {
  const regionElegida = watch('region');
  const region = REGIONES.find((r) => r.region === regionElegida);

  return (
    <Row>
      <Col md={6} className="mb-3">
        <Form.Label htmlFor="region">Región</Form.Label>
        <Form.Select id="region" isInvalid={!!errors.region} {...register('region', { required: 'Selecciona una región' })}>
          <option value="">Seleccione la región</option>
          {REGIONES.map((r) => (
            <option key={r.region} value={r.region}>{r.region}</option>
          ))}
        </Form.Select>
        {errors.region && <div className="error-message">{errors.region.message}</div>}
      </Col>
      <Col md={6} className="mb-3">
        <Form.Label htmlFor="comuna">Comuna</Form.Label>
        <Form.Select id="comuna" isInvalid={!!errors.comuna} {...register('comuna', { required: 'Selecciona una comuna' })}>
          <option value="">{region ? 'Seleccione la comuna' : 'Seleccione primero una región'}</option>
          {region && region.comunas.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Form.Select>
        {errors.comuna && <div className="error-message">{errors.comuna.message}</div>}
      </Col>
    </Row>
  );
};

export default CampoSelectRegion;
