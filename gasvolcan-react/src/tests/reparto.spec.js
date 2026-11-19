// Pruebas de LÓGICA: flujo del pedido con operadora y repartidor
// Pendiente -> (operadora asigna) Asignado -> En camino -> Entregado (y Cancelado)
import {
  asignarPedido, cambiarEstadoPedido, estadosSiguientes,
} from '../services/ordenService';
import { obtenerOrden } from '../data/baseDatos';
import { ordenesApi } from '../api/gasVolcanApi';
import {
  CAMIONES_PRUEBA, ENZO, errorHttp, ordenDePrueba, prepararCache, REPARTIDORES_PRUEBA,
} from '../test-utils';

const asignada = (numero, extra = {}) => ordenDePrueba(numero, {
  estado: 'asignado', camion: 'KLRT-11', repartidorRun: ENZO.run, repartidor: 'Enzo Ramírez Soto',
  asignadoPor: 'Camila Soto', instrucciones: 'Llamar al llegar', ...extra,
});

describe('Flujo de reparto', () => {
  beforeEach(() => {
    localStorage.clear();
    prepararCache({ usuarios: REPARTIDORES_PRUEBA, camiones: CAMIONES_PRUEBA, ordenes: [ordenDePrueba('GV-5001')] });
  });

  it('estadosSiguientes respeta el flujo y los estados finales no cambian', () => {
    expect(estadosSiguientes('pendiente')).toEqual(['cancelado']);
    expect(estadosSiguientes('asignado')).toEqual(['en-camino', 'cancelado']);
    expect(estadosSiguientes('en-camino')).toEqual(['entregado', 'cancelado']);
    expect(estadosSiguientes('entregado')).toEqual([]);
    expect(estadosSiguientes('pago-fallido')).toEqual([]);
  });

  it('la operadora asigna camión y repartidor: se llama al backend y la orden queda asignada', async () => {
    const asignar = spyOn(ordenesApi, 'asignar').and.returnValue(Promise.resolve(asignada('GV-5001')));
    const r = await asignarPedido('GV-5001', { camion: 'KLRT-11', repartidorRun: ENZO.run, instrucciones: ' Llamar al llegar ' });
    expect(r.ok).toBeTrue();
    expect(asignar).toHaveBeenCalledWith('GV-5001', {
      camion: 'KLRT-11', repartidorRun: ENZO.run, instrucciones: 'Llamar al llegar',
    });
    expect(r.orden.estado).toBe('asignado');
    expect(obtenerOrden('GV-5001').repartidor).toBe('Enzo Ramírez Soto');
  });

  it('exige camión y un repartidor válido antes de llamar al backend', async () => {
    const asignar = spyOn(ordenesApi, 'asignar');
    expect((await asignarPedido('GV-5001', { camion: '', repartidorRun: ENZO.run })).ok).toBeFalse();
    expect((await asignarPedido('GV-5001', { camion: 'KLRT-11', repartidorRun: '' })).ok).toBeFalse();
    expect((await asignarPedido('GV-5001', { camion: 'KLRT-11', repartidorRun: '333333333' })).ok).toBeFalse();
    expect((await asignarPedido('GV-9999', { camion: 'KLRT-11', repartidorRun: ENZO.run })).ok).toBeFalse();
    expect(asignar).not.toHaveBeenCalled();
  });

  it('si el backend rechaza la asignación (409: camión ocupado), devuelve el motivo y no cambia la orden', async () => {
    spyOn(ordenesApi, 'asignar').and.returnValue(Promise.reject(errorHttp(409, 'El camión KLRT-11 ya va en ruta con otro repartidor.')));
    const r = await asignarPedido('GV-5001', { camion: 'KLRT-11', repartidorRun: ENZO.run });
    expect(r.ok).toBeFalse();
    expect(r.motivo).toMatch(/ya va en ruta/);
    expect(obtenerOrden('GV-5001').estado).toBe('pendiente');
  });

  it('el repartidor sale a repartir y entrega: cada cambio de estado pasa por el backend', async () => {
    prepararCache({ ordenes: [asignada('GV-5002')] });
    const estado = spyOn(ordenesApi, 'cambiarEstado').and.returnValues(
      Promise.resolve(asignada('GV-5002', { estado: 'en-camino' })),
      Promise.resolve(asignada('GV-5002', { estado: 'entregado', pago: { metodo: 'efectivo', pagado: true }, fechaEntrega: '2026-11-17T12:00:00' })),
    );
    expect((await cambiarEstadoPedido('GV-5002', 'en-camino')).orden.estado).toBe('en-camino');
    const entregado = await cambiarEstadoPedido('GV-5002', 'entregado');
    expect(entregado.orden.pago.pagado).toBeTrue();
    expect(entregado.orden.fechaEntrega).toBeTruthy();
    expect(estado.calls.allArgs()).toEqual([['GV-5002', 'en-camino'], ['GV-5002', 'entregado']]);
  });

  it('no permite saltarse pasos ni cambiar un pedido inexistente (ni llega al backend)', async () => {
    const estado = spyOn(ordenesApi, 'cambiarEstado');
    // un pedido pendiente no puede salir a repartir sin que la operadora lo asigne
    expect((await cambiarEstadoPedido('GV-5001', 'en-camino')).ok).toBeFalse();
    expect(obtenerOrden('GV-5001').estado).toBe('pendiente');
    expect((await cambiarEstadoPedido('GV-9999', 'en-camino')).ok).toBeFalse();
    expect(estado).not.toHaveBeenCalled();
  });

  it('si el backend responde 403 (rol sin permiso), se informa el motivo', async () => {
    prepararCache({ ordenes: [asignada('GV-5003')] });
    spyOn(ordenesApi, 'cambiarEstado').and.returnValue(Promise.reject(errorHttp(403, 'Solo el repartidor asignado puede cambiar este pedido')));
    const r = await cambiarEstadoPedido('GV-5003', 'en-camino');
    expect(r.ok).toBeFalse();
    expect(r.motivo).toMatch(/repartidor asignado/);
    expect(obtenerOrden('GV-5003').estado).toBe('asignado');
  });
});
