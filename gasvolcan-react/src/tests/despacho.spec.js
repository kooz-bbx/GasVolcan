// Pruebas de LÓGICA y COMPONENTE: la operadora asigna camión + repartidor y el repartidor ve su entrega
import React from 'react';
import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import {
  camionesDisponibles, crearPedidoTelefonico, repartidoresDisponibles,
} from '../services/ordenService';
import { rutaInicioPorRol } from '../services/usuarioService';
import { listarOrdenes, obtenerOrden } from '../data/baseDatos';
import { ordenesApi, productosApi } from '../api/gasVolcanApi';
import OperadoraDespacho from '../pages/operadora/OperadoraDespacho';
import RepartidorEntregas from '../pages/repartidor/RepartidorEntregas';
import {
  CAMIONES_PRUEBA, ENZO, JAVIERA, OPERADORA, ordenDePrueba, prepararCache, renderConApp,
  REPARTIDORES_PRUEBA,
} from '../test-utils';
import { PRODUCTOS_SEMILLA } from '../data/datos';

const asignada = (numero, extra = {}) => ordenDePrueba(numero, {
  estado: 'asignado', camion: 'KLRT-11', repartidorRun: ENZO.run, repartidor: 'Enzo Ramírez Soto',
  instrucciones: 'Portón verde', ...extra,
});

const preparar = (ordenes = []) =>
  prepararCache({ usuarios: REPARTIDORES_PRUEBA, camiones: CAMIONES_PRUEBA, ordenes });

describe('Despacho: operadora y repartidor', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => cleanup());

  it('hay 2 camiones y 3 repartidores disponibles al partir', () => {
    preparar();
    expect(camionesDisponibles().length).toBe(2);
    expect(repartidoresDisponibles().length).toBe(3);
  });

  it('un pedido asignado deja ocupado su camión y su repartidor; al entregarlo quedan libres', () => {
    preparar([asignada('GV-6004')]);
    expect(repartidoresDisponibles().length).toBe(2);
    expect(camionesDisponibles().length).toBe(1);
    preparar([asignada('GV-6004', { estado: 'entregado' })]);
    expect(repartidoresDisponibles().length).toBe(3);
    expect(camionesDisponibles().length).toBe(2);
  });

  it('cada rol entra a su panel al iniciar sesión', () => {
    expect(rutaInicioPorRol('Operadora')).toBe('/operadora');
    expect(rutaInicioPorRol('Repartidor')).toBe('/repartidor');
    expect(rutaInicioPorRol('Administrador')).toBe('/admin');
    expect(rutaInicioPorRol('Cliente')).toBe('/');
  });

  it('operadora: elige camión y repartidor en el panel y el pedido deja de estar por asignar', async () => {
    preparar([ordenDePrueba('GV-6005')]);
    const asignar = spyOn(ordenesApi, 'asignar').and.returnValue(Promise.resolve(asignada('GV-6005', {
      camion: 'PHZX-45', repartidorRun: JAVIERA.run, repartidor: 'Javiera Muñoz Vera',
    })));
    renderConApp(<OperadoraDespacho />, { sesion: OPERADORA });
    expect(screen.getByTestId('pendiente-GV-6005')).toBeTruthy();

    // sin elegir nada, avisa (y no llama al backend)
    fireEvent.click(screen.getByTestId('asignar-GV-6005'));
    expect((await screen.findByTestId('mensaje-despacho')).textContent).toMatch(/Selecciona un camión/);
    expect(asignar).not.toHaveBeenCalled();

    fireEvent.change(screen.getByTestId('select-camion-GV-6005'), { target: { value: 'PHZX-45' } });
    fireEvent.change(screen.getByTestId('select-repartidor-GV-6005'), { target: { value: JAVIERA.run } });
    fireEvent.click(screen.getByTestId('asignar-GV-6005'));

    await waitFor(() => expect(screen.getByTestId('mensaje-despacho').textContent)
      .toMatch(/asignado a Javiera Muñoz Vera en el camión PHZX-45/));
    expect(asignar.calls.mostRecent().args[1].camion).toBe('PHZX-45');
    expect(screen.queryByTestId('pendiente-GV-6005')).toBeNull();
    expect(obtenerOrden('GV-6005').estado).toBe('asignado');
  });

  it('operadora: si el backend rechaza la asignación muestra el motivo', async () => {
    preparar([ordenDePrueba('GV-6009')]);
    spyOn(ordenesApi, 'asignar').and.returnValue(Promise.reject({
      response: { status: 409, data: { mensaje: 'El camión KLRT-11 ya va en ruta con otro repartidor.' } },
    }));
    renderConApp(<OperadoraDespacho />, { sesion: OPERADORA });
    fireEvent.change(screen.getByTestId('select-camion-GV-6009'), { target: { value: 'KLRT-11' } });
    fireEvent.change(screen.getByTestId('select-repartidor-GV-6009'), { target: { value: ENZO.run } });
    fireEvent.click(screen.getByTestId('asignar-GV-6009'));
    await waitFor(() => expect(screen.getByTestId('mensaje-despacho').textContent).toMatch(/ya va en ruta/));
    expect(screen.getByTestId('pendiente-GV-6009')).toBeTruthy(); // sigue pendiente
  });

  it('repartidor: solo ve sus entregas con los datos de la entrega y las avanza', async () => {
    preparar([
      asignada('GV-6006'),
      asignada('GV-6007', { camion: 'PHZX-45', repartidorRun: JAVIERA.run, repartidor: 'Javiera Muñoz Vera' }),
    ]);
    const estado = spyOn(ordenesApi, 'cambiarEstado').and.callFake((numero, nuevo) =>
      Promise.resolve(asignada(numero, { estado: nuevo })));
    renderConApp(<RepartidorEntregas />, { sesion: ENZO });

    expect(screen.getByTestId('ficha-GV-6006')).toBeTruthy();
    expect(screen.queryByTestId('ficha-GV-6007')).toBeNull(); // es de otro repartidor
    expect(screen.getByText(/Portón verde/)).toBeTruthy();
    expect(screen.getByTestId('cobro-GV-6006').textContent).toMatch(/Cobrar en efectivo/);

    fireEvent.click(screen.getByTestId('accion-en-camino-GV-6006'));
    await waitFor(() => expect(obtenerOrden('GV-6006').estado).toBe('en-camino'));
    fireEvent.click(await screen.findByTestId('accion-entregado-GV-6006'));
    await waitFor(() => expect(obtenerOrden('GV-6006').estado).toBe('entregado'));
    expect(await screen.findByTestId('sin-entregas')).toBeTruthy();
    expect(estado.calls.count()).toBe(2);
  });

  it('operadora: registra un pedido por llamada, valida los datos y envía el teléfono con +56', async () => {
    preparar();
    const stockAntes = PRODUCTOS_SEMILLA.find((p) => p.codigo === 'CL002').stock;
    spyOn(productosApi, 'listar').and.returnValue(Promise.resolve(PRODUCTOS_SEMILLA));
    const llamada = spyOn(ordenesApi, 'pedidoTelefonico').and.returnValue(Promise.resolve(ordenDePrueba('GV-6010', {
      origen: 'telefono', propietario: 'telefono',
      cliente: { nombre: 'Rosa Díaz', apellidos: '', correo: '', telefono: '+56987654321' },
      total: 40000,
    })));

    // datos inválidos: no se llama al backend
    expect((await crearPedidoTelefonico({ nombre: 'Rosa', telefono: '123', direccion: 'Av 1', codigoProducto: 'CL002', cantidad: '1' })).ok).toBeFalse();
    expect((await crearPedidoTelefonico({ nombre: 'Rosa', telefono: '98179788988888', direccion: 'Av 1', codigoProducto: 'CL002', cantidad: '1' })).ok).toBeFalse();
    expect((await crearPedidoTelefonico({ nombre: 'Rosa', telefono: '987654321', direccion: 'Av 1', codigoProducto: 'CL002', cantidad: String(stockAntes + 1) })).ok).toBeFalse();
    expect(llamada).not.toHaveBeenCalled();

    const r = await crearPedidoTelefonico({
      nombre: 'rosa díaz', telefono: '987654321', direccion: 'Av Central 123', comuna: 'Maipú',
      codigoProducto: 'CL002', cantidad: '2', indicaciones: 'Casa azul',
    });
    expect(r.ok).toBeTrue();
    const enviado = llamada.calls.mostRecent().args[0];
    expect(enviado.telefono).toBe('+56987654321');
    expect(enviado.nombre).toBe('Rosa Díaz');
    expect(enviado.cantidad).toBe(2);
    expect(r.orden.estado).toBe('pendiente');
    expect(r.orden.origen).toBe('telefono');
    expect(listarOrdenes().length).toBe(1);
  });

  it('operadora: el formulario de llamada crea el pedido y aparece por asignar', async () => {
    preparar();
    spyOn(productosApi, 'listar').and.returnValue(Promise.resolve(PRODUCTOS_SEMILLA));
    spyOn(ordenesApi, 'pedidoTelefonico').and.returnValue(Promise.resolve(ordenDePrueba('GV-6011', { origen: 'telefono' })));
    renderConApp(<OperadoraDespacho />, { sesion: OPERADORA });
    fireEvent.change(screen.getByLabelText('Nombre del cliente'), { target: { value: 'Rosa Díaz' } });
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '987654321' } });
    fireEvent.change(screen.getByLabelText('Dirección de entrega'), { target: { value: 'Av Central 123' } });
    fireEvent.change(screen.getByLabelText('Producto'), { target: { value: 'CL001' } });
    fireEvent.click(screen.getByTestId('registrar-llamada'));
    expect((await screen.findByTestId('mensaje-llamada')).textContent).toMatch(/registrado/);
    expect(await screen.findByText(/Pedidos por asignar \(1\)/)).toBeTruthy();
  });

  it('la lista de repartidores de la operadora sale de la copia descargada del backend', () => {
    preparar();
    renderConApp(<OperadoraDespacho />, { sesion: OPERADORA });
    const tabla = screen.getByTestId('tabla-repartidores');
    expect(tabla.textContent).toMatch(/Enzo Ramírez Soto/);
    expect(tabla.textContent).toMatch(/Javiera Muñoz Vera/);
    expect(tabla.textContent).toMatch(/Nicolás Ortiz Díaz/);
  });
});
