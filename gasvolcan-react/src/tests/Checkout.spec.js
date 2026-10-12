// Pruebas de FLUJO: checkout con prefill, pago correcto y pago con error
import React from 'react';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import Checkout from '../pages/Checkout';
import CompraExitosa from '../pages/CompraExitosa';
import PagoError from '../pages/PagoError';
import { renderConApp, iniciarSesionDePrueba } from '../test-utils';
import { guardarCarrito } from '../services/carritoService';
import { listarOrdenes, obtenerProducto } from '../data/baseDatos';

const Rutas = () => (
  <Routes>
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/compra-exitosa/:numero" element={<CompraExitosa />} />
    <Route path="/pago-error/:numero" element={<PagoError />} />
  </Routes>
);

const ADMIN = { correo: 'admin@duoc.cl', nombre: 'Benjamín', tipoUsuario: 'Administrador' };

describe('Checkout', () => {
  beforeEach(() => {
    localStorage.clear();
    guardarCarrito([{ codigo: 'CL001', cantidad: 2 }]);
  });
  afterEach(() => cleanup());

  it('renderizado condicional: con el carrito vacío no muestra el formulario', () => {
    guardarCarrito([]);
    renderConApp(<Rutas />, { ruta: '/checkout' });
    expect(screen.getByText(/no tienes productos/i)).toBeTruthy();
    expect(screen.queryByLabelText('Nombre*')).toBeNull();
  });

  it('prefill: con sesión iniciada el formulario viene con los datos del usuario', () => {
    iniciarSesionDePrueba(ADMIN);
    renderConApp(<Rutas />, { ruta: '/checkout' });
    expect(screen.getByLabelText('Nombre*').value).toBe('Benjamín');
    expect(screen.getByLabelText('Correo*').value).toBe('admin@duoc.cl');
    expect(screen.getByLabelText('Calle*').value).toBe('Oficina Central 100, Chillán');
  });

  it('sin sesión el formulario parte vacío y valida los campos obligatorios', async () => {
    renderConApp(<Rutas />, { ruta: '/checkout' });
    expect(screen.getByLabelText('Nombre*').value).toBe('');
    fireEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));
    expect(await screen.findByText('El nombre es obligatorio')).toBeTruthy();
    expect(listarOrdenes().length).toBe(0);
  });

  it('pago correcto (efectivo): crea la orden, descuenta stock, vacía el carrito y muestra la boleta', async () => {
    iniciarSesionDePrueba(ADMIN);
    renderConApp(<Rutas />, { ruta: '/checkout' });
    fireEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));
    expect(await screen.findByText(/se ha realizado la compra/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /imprimir boleta en pdf/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /enviar boleta por email/i })).toBeTruthy();
    expect(listarOrdenes()[0].estado).toBe('pendiente');
    expect(obtenerProducto('CL001').stock).toBe(78);
    expect(JSON.parse(localStorage.getItem('gv_carrito'))).toEqual([]);
  });

  it('pago con error (tarjeta 0000): guarda orden "pago-fallido", conserva el carrito y ofrece reintentar', async () => {
    iniciarSesionDePrueba(ADMIN);
    renderConApp(<Rutas />, { ruta: '/checkout' });
    fireEvent.change(screen.getByLabelText('Método de pago'), { target: { value: 'tarjeta' } });
    fireEvent.change(await screen.findByLabelText(/número de tarjeta/i), { target: { value: '4111111111110000' } });
    fireEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));
    expect(await screen.findByText(/no se pudo realizar el pago/i, { selector: 'div' })).toBeTruthy();
    expect(screen.getByText(/volver a realizar el pago/i)).toBeTruthy();
    expect(listarOrdenes()[0].estado).toBe('pago-fallido');
    expect(obtenerProducto('CL001').stock).toBe(80); // no se descuenta
    expect(JSON.parse(localStorage.getItem('gv_carrito')).length).toBe(1);
  });
});
