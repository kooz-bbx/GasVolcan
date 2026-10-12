// Pruebas de COMPONENTE: estado del carrito (+ / - / eliminar) conectado al contexto
import React from 'react';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import ShoppingCart from '../components/ShoppingCart';
import { renderConApp } from '../test-utils';
import { guardarCarrito } from '../services/carritoService';

describe('Componente ShoppingCart', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => cleanup());

  it('renderizado condicional: carrito vacío muestra el aviso', () => {
    renderConApp(<ShoppingCart />);
    expect(screen.getByText(/carrito está vacío/i)).toBeTruthy();
  });

  it('estado: + suma, - resta y al llegar a 0 la fila desaparece', () => {
    guardarCarrito([{ codigo: 'CL002', cantidad: 1 }]);
    renderConApp(<ShoppingCart />);
    expect(screen.getByTestId('cantidad-CL002').textContent).toBe('1');
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    expect(screen.getByTestId('cantidad-CL002').textContent).toBe('2');
    fireEvent.click(screen.getByRole('button', { name: '-' }));
    fireEvent.click(screen.getByRole('button', { name: '-' }));
    expect(screen.queryByTestId('cantidad-CL002')).toBeNull();
  });

  it('evento: Eliminar quita el producto y actualiza localStorage', () => {
    guardarCarrito([{ codigo: 'CL003', cantidad: 1 }]);
    renderConApp(<ShoppingCart />);
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }));
    expect(screen.queryByText('Cilindro GLP 15 kg')).toBeNull();
    expect(JSON.parse(localStorage.getItem('gv_carrito'))).toEqual([]);
  });
});
