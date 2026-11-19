// Pruebas de COMPONENTE: listado admin con estado (useState), MOCK de window.confirm y de la API REST
import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminProductos from '../pages/admin/AdminProductos';
import { obtenerProducto } from '../data/baseDatos';
import { productosApi } from '../api/gasVolcanApi';
import { errorHttp, prepararCache } from '../test-utils';

const renderListado = () => render(<MemoryRouter><AdminProductos /></MemoryRouter>);

describe('Componente AdminProductos', () => {
  beforeEach(() => { localStorage.clear(); prepararCache(); });
  afterEach(() => cleanup());

  it('lista los 4 cilindros de gas', () => {
    renderListado();
    expect(screen.getAllByRole('row').length).toBe(5);
    expect(screen.getByText('CL004')).toBeTruthy();
  });

  it('MOCK: si confirma, llama DELETE al backend y la fila desaparece', async () => {
    const confirmar = spyOn(window, 'confirm').and.returnValue(true);
    const eliminar = spyOn(productosApi, 'eliminar').and.returnValue(Promise.resolve());
    renderListado();
    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[3]); // CL004
    expect(confirmar).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText('CL004')).toBeNull());
    expect(eliminar).toHaveBeenCalledWith('CL004');
    expect(obtenerProducto('CL004')).toBeNull();
  });

  it('MOCK: si cancela el cuadro de confirmación, no se llama al backend', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const eliminar = spyOn(productosApi, 'eliminar');
    renderListado();
    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[3]);
    expect(eliminar).not.toHaveBeenCalled();
    expect(screen.getByText('CL004')).toBeTruthy();
  });

  it('si el backend rechaza (403), muestra el error y el producto se mantiene', async () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(productosApi, 'eliminar').and.returnValue(Promise.reject(errorHttp(403, 'No tienes permiso')));
    renderListado();
    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[3]);
    expect((await screen.findByRole('alert')).textContent).toMatch(/No tienes permiso/);
    expect(screen.getByText('CL004')).toBeTruthy();
  });
});
