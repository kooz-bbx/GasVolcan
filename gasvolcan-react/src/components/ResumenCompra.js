import React from 'react';
import { Table } from 'react-bootstrap';
import { formatearCLP, resolverImagen } from '../utils/validaciones';

// Tabla de solo lectura con los productos de una compra.
// Props: items [{ nombre, imagen, precio (unitario), cantidad }]
const ResumenCompra = ({ items }) => {
  const total = items.reduce((suma, i) => suma + i.precio * i.cantidad, 0);
  return (
    <>
      <Table responsive size="sm" className="resumen-compra">
        <thead>
          <tr><th>Imagen</th><th>Nombre</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th></tr>
        </thead>
        <tbody>
          {items.map((i, indice) => (
            <tr key={`${i.codigo || i.nombre}-${indice}`}>
              <td>{i.imagen ? <img src={resolverImagen(i.imagen)} alt={i.nombre} width="40" height="40" /> : null}</td>
              <td>{i.nombre}</td>
              <td>${formatearCLP(i.precio)}</td>
              <td>{i.cantidad}</td>
              <td>${formatearCLP(i.precio * i.cantidad)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="resumen-total text-center fw-bold fs-5" data-testid="resumen-total">
        Total: ${formatearCLP(total)}
      </div>
    </>
  );
};

export default ResumenCompra;
