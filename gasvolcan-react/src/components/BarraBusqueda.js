import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

// Formulario controlado: el texto vive en el estado (useState) del componente
const BarraBusqueda = ({ onBuscar, valorInicial = '' }) => {
  const [texto, setTexto] = useState(valorInicial);

  const enviar = (evento) => {
    evento.preventDefault();
    onBuscar(texto.trim());
  };

  return (
    <Form className="d-flex gap-2 gv-buscador" onSubmit={enviar} role="search">
      <Form.Control
        type="search"
        placeholder="Buscar"
        aria-label="Buscar productos"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <Button type="submit" variant="outline-light">Buscar</Button>
    </Form>
  );
};

export default BarraBusqueda;
