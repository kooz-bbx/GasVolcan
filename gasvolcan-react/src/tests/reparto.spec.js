// Pruebas de LÓGICA y COMPONENTE: flujo de reparto del vendedor
// Pendiente -> En camino -> Entregado (y Cancelado)
import React from 'react';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import { cambiarEstadoPedido, crearOrdenRapida, estadosSiguientes } from '../services/ordenService';
import { obtenerOrden } from '../data/baseDatos';
import VendedorPedidos from '../pages/vendedor/VendedorPedidos';
import { renderConApp, iniciarSesionDePrueba } from '../test-utils';

const nuevoPedido = (numero) =>
  crearOrdenRapida({ nombre: 'Ana', direccion: 'Calle 1', tipoCilindro: '11kg', cantidad: '1' }, numero);

describe('Flujo de reparto', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => cleanup());

  it('estadosSiguientes respeta el flujo y los estados finales no cambian', () => {
    expect(estadosSiguientes('pendiente')).toEqual(['en-camino', 'cancelado']);
    expect(estadosSiguientes('en-camino')).toEqual(['entregado', 'cancelado']);
    expect(estadosSiguientes('entregado')).toEqual([]);
    expect(estadosSiguientes('pago-fallido')).toEqual([]);
  });

  it('salir a repartir asigna al repartidor y entregar registra el pago', () => {
    nuevoPedido('GV-5001');
    const enCamino = cambiarEstadoPedido('GV-5001', 'en-camino', 'Natalia');
    expect(enCamino.estado).toBe('en-camino');
    expect(enCamino.repartidor).toBe('Natalia');

    const entregado = cambiarEstadoPedido('GV-5001', 'entregado');
    expect(entregado.estado).toBe('entregado');
    expect(entregado.pago.pagado).toBeTrue();
    expect(entregado.fechaEntrega).toBeTruthy();
  });

  it('no permite saltarse pasos ni cambiar un pedido ya entregado', () => {
    nuevoPedido('GV-5002');
    expect(cambiarEstadoPedido('GV-5002', 'entregado')).toBeNull();
    expect(obtenerOrden('GV-5002').estado).toBe('pendiente');

    cambiarEstadoPedido('GV-5002', 'en-camino', 'Natalia');
    cambiarEstadoPedido('GV-5002', 'entregado');
    expect(cambiarEstadoPedido('GV-5002', 'cancelado')).toBeNull();
    expect(cambiarEstadoPedido('GV-9999', 'en-camino')).toBeNull();
  });

  it('el vendedor avanza el pedido con los botones y la tabla se actualiza', () => {
    nuevoPedido('GV-5003');
    iniciarSesionDePrueba({ correo: 'vendedor@gasvolcan.cl', nombre: 'Natalia', tipoUsuario: 'Vendedor' });
    renderConApp(<VendedorPedidos />);

    fireEvent.click(screen.getByTestId('accion-en-camino-GV-5003'));
    expect(screen.getByText('En camino')).toBeTruthy();

    fireEvent.click(screen.getByTestId('accion-entregado-GV-5003'));
    expect(screen.getByText('Entregado')).toBeTruthy();
    expect(screen.getByText('Sin acciones')).toBeTruthy();
    expect(obtenerOrden('GV-5003').pago.pagado).toBeTrue();
  });
});
