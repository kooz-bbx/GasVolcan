// Pruebas de COMPONENTE: listado admin con estado (useState) y MOCK de window.confirm
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminProductos from '../pages/admin/AdminProductos';
import { obtenerProducto } from '../data/baseDatos';

const renderListado = () => render(<MemoryRouter><AdminProductos /></MemoryRouter>);

describe('Componente AdminProductos', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => cleanup());

  it('lista los 4 cilindros de gas de la base de datos', () => {
    renderListado();
    expect(screen.getAllByRole('row').length).toBe(5);
    expect(screen.getByText('CL004')).toBeTruthy();
  });

  it('MOCK: si confirma, la fila desaparece al instante y se borra de la base de datos', () => {
    const confirmar = spyOn(window, 'confirm').and.returnValue(true);
    renderListado();
    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[3]); // CL004
    expect(confirmar).toHaveBeenCalled();
    expect(screen.queryByText('CL004')).toBeNull();
    expect(obtenerProducto('CL004')).toBeNull();
  });

  it('MOCK: si cancela el cuadro de confirmación, el producto se mantiene', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    renderListado();
    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[3]);
    expect(screen.getByText('CL004')).toBeTruthy();
  });
});
