import React from 'react';
import { ETIQUETAS_ESTADO } from '../data/datos';

const EstadoBadge = ({ estado }) => (
  <span className={`badge-estado ${estado}`}>{ETIQUETAS_ESTADO[estado] || 'Pendiente'}</span>
);

export default EstadoBadge;
