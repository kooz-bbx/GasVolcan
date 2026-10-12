import React from 'react';
import { Link } from 'react-router-dom';
import Seccion from '../components/Seccion';
import ShoppingCart from '../components/ShoppingCart';
import BotonAccion from '../components/BotonAccion';
import { formatearCLP } from '../utils/validaciones';
import { useCart } from '../context/CartContext';

const Carrito = () => {
  const { items, total, vaciar } = useCart();
  return (
    <Seccion titulo="Carrito de Compras" icono="bi-cart3">
      <ShoppingCart />
      <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
        <h4>Total: <span data-testid="carrito-total">${formatearCLP(total)}</span></h4>
        <div className="d-flex gap-2">
          <BotonAccion etiqueta="Vaciar" icono="bi-trash" variante="outline-secondary" onClick={vaciar} deshabilitado={items.length === 0} />
          {items.length > 0 ? (
            <Link to="/checkout" className="btn btn-success"><i className="bi bi-credit-card" /> Ir a pagar</Link>
          ) : (
            <span className="btn btn-success disabled"><i className="bi bi-credit-card" /> Ir a pagar</span>
          )}
        </div>
      </div>
    </Seccion>
  );
};

export default Carrito;
