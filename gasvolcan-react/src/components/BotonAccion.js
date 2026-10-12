import React from 'react';
import { Button } from 'react-bootstrap';

// Botón reutilizable: recibe la etiqueta y la función onClick por props
const BotonAccion = ({ etiqueta, onClick, variante = 'primary', icono, deshabilitado = false, tipo = 'button', className = '' }) => (
  <Button variant={variante} type={tipo} onClick={onClick} disabled={deshabilitado} className={className}>
    {icono && <i className={`bi ${icono}`} />} {etiqueta}
  </Button>
);

export default BotonAccion;
