// Pruebas de COMPONENTE: props, renderizado condicional y eventos (mocks de Jasmine)
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { PRODUCTOS_SEMILLA } from '../data/datos';

const renderTarjeta = (producto, onAgregar = () => {}) =>
  render(<MemoryRouter><ProductCard producto={producto} onAgregar={onAgregar} /></MemoryRouter>);

describe('Componente ProductCard', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => cleanup());

  it('props: muestra nombre, categoría y precio recibidos', () => {
    renderTarjeta(PRODUCTOS_SEMILLA[1]); // CL002 sin oferta
    expect(screen.getByText('Cilindro GLP 11 kg')).toBeTruthy();
    expect(screen.getByText('Uso Residencial')).toBeTruthy();
    expect(screen.getByText(/12[.,]?000/)).toBeTruthy();
    expect(screen.queryByText(/^-\d+%$/)).toBeNull();
  });

  it('renderizado condicional: un producto en oferta muestra su descuento', () => {
    renderTarjeta(PRODUCTOS_SEMILLA[0]); // CL001 10%
    expect(screen.getByText('-10%')).toBeTruthy();
    expect(screen.getByText(/5[.,]?850/)).toBeTruthy();
  });

  it('MOCK: al presionar "Añadir" llama a onAgregar con el producto', () => {
    const manejador = jasmine.createSpyObj('manejador', ['agregar']);
    renderTarjeta(PRODUCTOS_SEMILLA[0], manejador.agregar);
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));
    expect(manejador.agregar).toHaveBeenCalledTimes(1);
    expect(manejador.agregar).toHaveBeenCalledWith(PRODUCTOS_SEMILLA[0]);
  });

  it('renderizado condicional: aviso de stock bajo solo si stock <= stock crítico', () => {
    renderTarjeta({ ...PRODUCTOS_SEMILLA[0], stock: 3, stockCritico: 5 });
    expect(screen.queryByText(/stock bajo/i)).not.toBeNull();
    cleanup();
    renderTarjeta(PRODUCTOS_SEMILLA[0]);
    expect(screen.queryByText(/stock bajo/i)).toBeNull();
  });
});
