import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  agregarItem, cambiarCantidad, contarUnidades, detalleCarrito,
  guardarCarrito, obtenerCarrito, quitarItem, totalDetalle,
} from '../services/carritoService';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => obtenerCarrito());

  // Aplica una función pura al carrito y lo persiste
  const actualizar = useCallback((fn) => {
    setItems((actual) => {
      const nuevo = fn(actual);
      guardarCarrito(nuevo);
      return nuevo;
    });
  }, []);

  const valor = useMemo(() => {
    const detalle = detalleCarrito(items);
    return {
      items,
      detalle,
      unidades: contarUnidades(items),
      total: totalDetalle(detalle),
      agregar: (codigo, cantidad) => actualizar((c) => agregarItem(c, codigo, cantidad)),
      cambiar: (codigo, delta) => actualizar((c) => cambiarCantidad(c, codigo, delta)),
      quitar: (codigo) => actualizar((c) => quitarItem(c, codigo)),
      vaciar: () => actualizar(() => []),
    };
  }, [items, actualizar]);

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
