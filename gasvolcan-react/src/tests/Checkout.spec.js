// Pruebas de FLUJO: checkout con prefill, pago correcto y pago con error (backend simulado con espías)
import React from 'react';
import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import Checkout from '../pages/Checkout';
import CompraExitosa from '../pages/CompraExitosa';
import PagoError from '../pages/PagoError';
import {
  renderConApp, prepararCache, ordenDePrueba, errorHttp, ADMIN,
} from '../test-utils';
import { guardarCarrito } from '../services/carritoService';
import { listarOrdenes } from '../data/baseDatos';
import { ordenesApi, productosApi } from '../api/gasVolcanApi';
import { PRODUCTOS_SEMILLA } from '../data/datos';

const Rutas = () => (
  <Routes>
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/compra-exitosa/:numero" element={<CompraExitosa />} />
    <Route path="/pago-error/:numero" element={<PagoError />} />
  </Routes>
);

// Lo que respondería el backend al comprar 2 cilindros de 5 kg
const ordenComprada = (extra = {}) => ordenDePrueba('GV-7001', {
  origen: 'checkout',
  propietario: 'admin@duoc.cl',
  cliente: { nombre: 'Benjamín', apellidos: 'Rojas', correo: 'admin@duoc.cl', telefono: '' },
  items: [{ codigo: 'CL001', nombre: 'Cilindro GLP 5 kg', imagen: '', precio: 5850, cantidad: 2 }],
  total: 11700,
  ...extra,
});

describe('Checkout', () => {
  beforeEach(() => {
    localStorage.clear();
    prepararCache();
    guardarCarrito([{ codigo: 'CL001', cantidad: 2 }]);
    // al comprar, el backend descuenta stock: la tienda vuelve a pedir los productos
    spyOn(productosApi, 'listar').and.returnValue(
      Promise.resolve(PRODUCTOS_SEMILLA.map((p) => (p.codigo === 'CL001' ? { ...p, stock: p.stock - 2 } : p))),
    );
  });
  afterEach(() => cleanup());

  it('renderizado condicional: con el carrito vacío no muestra el formulario', () => {
    guardarCarrito([]);
    renderConApp(<Rutas />, { ruta: '/checkout' });
    expect(screen.getByText(/no tienes productos/i)).toBeTruthy();
    expect(screen.queryByLabelText('Nombre*')).toBeNull();
  });

  it('prefill: con sesión iniciada el formulario viene con los datos del usuario', () => {
    renderConApp(<Rutas />, { ruta: '/checkout', sesion: ADMIN });
    expect(screen.getByLabelText('Nombre*').value).toBe('Benjamín');
    expect(screen.getByLabelText('Correo*').value).toBe('admin@duoc.cl');
    expect(screen.getByLabelText('Calle*').value).toBe('Calle 1');
  });

  it('sin sesión el formulario parte vacío y valida los campos obligatorios', async () => {
    const comprar = spyOn(ordenesApi, 'comprar');
    renderConApp(<Rutas />, { ruta: '/checkout' });
    expect(screen.getByLabelText('Nombre*').value).toBe('');
    fireEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));
    expect(await screen.findByText('El nombre es obligatorio')).toBeTruthy();
    expect(comprar).not.toHaveBeenCalled();
  });

  it('pago correcto: envía solo código y cantidad (el precio lo calcula el backend), vacía el carrito y muestra la boleta', async () => {
    const comprar = spyOn(ordenesApi, 'comprar').and.returnValue(Promise.resolve(ordenComprada()));
    renderConApp(<Rutas />, { ruta: '/checkout', sesion: ADMIN });
    fireEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));
    expect(await screen.findByText(/se ha realizado la compra/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /imprimir boleta en pdf/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /enviar boleta por email/i })).toBeTruthy();
    expect(comprar.calls.mostRecent().args[0].items).toEqual([{ codigo: 'CL001', cantidad: 2 }]);
    expect(listarOrdenes()[0].estado).toBe('pendiente');
    expect(JSON.parse(localStorage.getItem('gv_carrito'))).toEqual([]);
  });

  it('pago con error: el backend devuelve "pago-fallido", se conserva el carrito y se ofrece reintentar', async () => {
    const comprar = spyOn(ordenesApi, 'comprar').and.returnValue(Promise.resolve(
      ordenComprada({ estado: 'pago-fallido', motivoPago: 'Tarjeta rechazada por el banco (simulación).' }),
    ));
    renderConApp(<Rutas />, { ruta: '/checkout', sesion: ADMIN });
    fireEvent.change(screen.getByLabelText('Método de pago'), { target: { value: 'tarjeta' } });
    fireEvent.change(await screen.findByLabelText(/número de tarjeta/i), { target: { value: '4111111111110000' } });
    fireEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));
    expect(await screen.findByText(/no se pudo realizar el pago/i, { selector: 'div' })).toBeTruthy();
    expect(screen.getByText(/rechazada por el banco/i)).toBeTruthy();
    expect(screen.getByText(/volver a realizar el pago/i)).toBeTruthy();
    expect(comprar.calls.mostRecent().args[0].pago.numeroTarjeta).toBe('4111111111110000');
    expect(listarOrdenes()[0].estado).toBe('pago-fallido');
    expect(JSON.parse(localStorage.getItem('gv_carrito')).length).toBe(1);
  });

  it('si el backend responde un error (ej: sin stock, 409) lo muestra y no vacía el carrito', async () => {
    spyOn(ordenesApi, 'comprar').and.returnValue(Promise.reject(errorHttp(409, 'Stock insuficiente de Cilindro GLP 5 kg')));
    renderConApp(<Rutas />, { ruta: '/checkout', sesion: ADMIN });
    fireEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/Stock insuficiente/));
    expect(JSON.parse(localStorage.getItem('gv_carrito')).length).toBe(1);
  });
});
