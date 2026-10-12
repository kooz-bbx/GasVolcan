import React from 'react';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import BotonAccion from './BotonAccion';
import { formatearCLP, resolverImagen } from '../utils/validaciones';
import { useCart } from '../context/CartContext';

// Tabla del carrito: imagen, nombre, precio, cantidad (+/-), subtotal y eliminar
const ShoppingCart = () => {
  const { detalle, cambiar, quitar } = useCart();

  if (detalle.length === 0) {
    return <p>Tu carrito está vacío. <Link to="/productos">Ver productos</Link>.</p>;
  }

  return (
    <Table responsive hover className="align-middle">
      <thead>
        <tr><th>Imagen</th><th>Nombre</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th>Acciones</th></tr>
      </thead>
      <tbody>
        {detalle.map((item) => (
          <tr key={item.codigo}>
            <td><img src={resolverImagen(item.imagen)} alt={item.nombre} width="60" height="60" /></td>
            <td>{item.nombre}</td>
            <td>${formatearCLP(item.precio)}</td>
            <td>
              <div className="d-flex align-items-center gap-2">
                <BotonAccion etiqueta="-" variante="outline-secondary" onClick={() => cambiar(item.codigo, -1)} />
                <span data-testid={`cantidad-${item.codigo}`}>{item.cantidad}</span>
                <BotonAccion etiqueta="+" variante="outline-secondary" onClick={() => cambiar(item.codigo, 1)} />
              </div>
            </td>
            <td>${formatearCLP(item.precio * item.cantidad)}</td>
            <td>
              <BotonAccion etiqueta="Eliminar" variante="danger" onClick={() => quitar(item.codigo)} />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ShoppingCart;
