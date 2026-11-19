// Pruebas de LÓGICA: servicio de órdenes (llamadas a la API REST simuladas con espías)
import {
  CODIGOS_CILINDRO, crearPedidoRapido, obtenerMisOrdenes, pagarCompra, reintentarPago,
} from '../services/ordenService';
import { listarOrdenes, listarProductos } from '../data/baseDatos';
import { ordenesApi, productosApi } from '../api/gasVolcanApi';
import { ordenDePrueba, prepararCache } from '../test-utils';
import { PRODUCTOS_SEMILLA } from '../data/datos';

describe('Servicio de órdenes', () => {
  beforeEach(() => {
    localStorage.clear();
    prepararCache();
    spyOn(productosApi, 'listar').and.returnValue(Promise.resolve(PRODUCTOS_SEMILLA));
  });

  it('pagarCompra envía cliente, entrega, pago y los ítems solo con código y cantidad', async () => {
    const comprar = spyOn(ordenesApi, 'comprar').and.returnValue(Promise.resolve(ordenDePrueba('GV-1')));
    const datos = {
      cliente: { nombre: 'Ana' }, entrega: { tipo: 'domicilio', calle: 'x' },
      pago: { metodo: 'tarjeta', numeroTarjeta: '4111111111111111' },
    };
    const detalle = [{ codigo: 'CL001', nombre: 'x', imagen: '', precio: 5850, cantidad: 2 }];
    await pagarCompra(datos, detalle);
    const enviado = comprar.calls.mostRecent().args[0];
    expect(enviado.items).toEqual([{ codigo: 'CL001', cantidad: 2 }]);
    expect(enviado.pago).toEqual({ metodo: 'tarjeta', numeroTarjeta: '4111111111111111' });
    expect(enviado.cliente.nombre).toBe('Ana');
  });

  it('pagarCompra guarda la orden que devuelve el backend y refresca el stock', async () => {
    spyOn(ordenesApi, 'comprar').and.returnValue(Promise.resolve(ordenDePrueba('GV-2')));
    await pagarCompra({ cliente: {}, entrega: {}, pago: { metodo: 'efectivo' } }, []);
    expect(listarOrdenes().map((o) => o.numero)).toEqual(['GV-2']);
    expect(productosApi.listar).toHaveBeenCalled();
    expect(listarProductos().length).toBe(4);
  });

  it('reintentarPago actualiza la misma orden por su número', async () => {
    const reintento = spyOn(ordenesApi, 'reintentarPago')
      .and.returnValue(Promise.resolve(ordenDePrueba('GV-3', { estado: 'pendiente' })));
    await reintentarPago('GV-3', { cliente: {}, entrega: {}, pago: { metodo: 'efectivo' } });
    expect(reintento.calls.mostRecent().args[0]).toBe('GV-3');
    expect(listarOrdenes()[0].estado).toBe('pendiente');
  });

  it('crearPedidoRapido usa el código del cilindro del catálogo (el precio lo pone el backend)', async () => {
    const rapido = spyOn(ordenesApi, 'pedidoRapido').and.returnValue(Promise.resolve(ordenDePrueba('GV-4')));
    await crearPedidoRapido({
      nombre: 'juan perez', telefono: '+56912345678', direccion: 'calle 1', tipoCilindro: '11kg', cantidad: '2',
    });
    const enviado = rapido.calls.mostRecent().args[0];
    expect(CODIGOS_CILINDRO['11kg']).toBe('CL002');
    expect(enviado.codigoProducto).toBe('CL002');
    expect(enviado.cantidad).toBe(2);
    expect(enviado.nombre).toBe('Juan Perez');
    expect(enviado.precio).toBeUndefined();
  });

  it('obtenerMisOrdenes filtra por el propietario (correo de la sesión o "invitado")', () => {
    prepararCache({
      ordenes: [ordenDePrueba('GV-1111'), ordenDePrueba('GV-2222', { propietario: 'cliente@gmail.com' })],
    });
    expect(obtenerMisOrdenes(null).map((o) => o.numero)).toEqual(['GV-1111']);
    expect(obtenerMisOrdenes({ correo: 'cliente@gmail.com' }).map((o) => o.numero)).toEqual(['GV-2222']);
  });
});
