import React from 'react';
import { Link } from 'react-router-dom';
import Seccion from '../components/Seccion';

const NoEncontrado = () => (
  <Seccion titulo="Página no encontrada" icono="bi-exclamation-triangle">
    <p>La página que buscas no existe. <Link to="/">Volver al inicio</Link>.</p>
  </Seccion>
);

export default NoEncontrado;
