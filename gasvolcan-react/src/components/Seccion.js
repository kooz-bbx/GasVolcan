import React from 'react';

// Bloque con título e ícono (equivale a <section> del sitio HTML)
const Seccion = ({ titulo, icono, children, className = '' }) => (
  <section className={`gv-seccion ${className}`}>
    {titulo && (
      <h2>
        {icono && <i className={`bi ${icono}`} />} {titulo}
      </h2>
    )}
    {children}
  </section>
);

export default Seccion;
