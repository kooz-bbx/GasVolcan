// Pruebas de COMPONENTE: una lista renderiza todos sus ítems; estado vacío; contador del header
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ProductList from '../components/ProductList';
import Navigation from '../components/Navigation';
import { renderConApp } from '../test-utils';
import { PRODUCTOS_SEMILLA } from '../data/datos';

describe('Componente ProductList', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => cleanup());

  it('renderizado: muestra una tarjeta por cada producto recibido', () => {
    renderConApp(<ProductList productos={PRODUCTOS_SEMILLA} />);
    expect(screen.getAllByRole('button', { name: /añadir/i }).length).toBe(4);
    expect(screen.getByText('Cilindro GLP 45 kg')).toBeTruthy();
  });

  it('renderizado condicional: con lista vacía muestra el mensaje', () => {
    renderConApp(<ProductList productos={[]} mensajeVacio="Nada por aquí" />);
    expect(screen.getByTestId('lista-vacia').textContent).toBe('Nada por aquí');
    expect(screen.queryAllByRole('button', { name: /añadir/i }).length).toBe(0);
  });

  it('evento + estado: al añadir, el contador del carrito del header sube', () => {
    renderConApp(<><Navigation /><ProductList productos={PRODUCTOS_SEMILLA} /></>);
    expect(screen.getByTestId('contador-carrito').textContent).toBe('0');
    fireEvent.click(screen.getAllByRole('button', { name: /añadir/i })[1]);
    fireEvent.click(screen.getAllByRole('button', { name: /añadir/i })[1]);
    expect(screen.getByTestId('contador-carrito').textContent).toBe('2');
    expect(JSON.parse(localStorage.getItem('gv_carrito'))).toEqual([{ codigo: 'CL002', cantidad: 2 }]);
  });
});
