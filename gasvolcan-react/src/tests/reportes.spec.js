// Pruebas de LÓGICA: filtros, ofertas y reportes del administrador
import { enOferta, filtrarProductos, precioFinal } from '../utils/productos';
import { calcularReportes } from '../utils/reportes';
import { PRODUCTOS_SEMILLA } from '../data/datos';

describe('Productos y reportes', () => {
  it('precioFinal aplica el descuento y enOferta detecta los productos con descuento', () => {
    const cl1 = PRODUCTOS_SEMILLA.find((p) => p.codigo === 'CL001');
    expect(enOferta(cl1)).toBeTrue();
    expect(precioFinal(cl1)).toBe(5850);
    expect(enOferta(PRODUCTOS_SEMILLA.find((p) => p.codigo === 'CL002'))).toBeFalse();
  });

  it('filtrarProductos busca por texto y por categoría', () => {
    expect(filtrarProductos(PRODUCTOS_SEMILLA, { texto: '45 kg' }).length).toBe(1);
    expect(filtrarProductos(PRODUCTOS_SEMILLA, { categoriaId: 'residencial' }).length).toBe(3);
    expect(filtrarProductos(PRODUCTOS_SEMILLA, { texto: 'zzz' }).length).toBe(0);
  });

  it('calcularReportes no suma ventas de pagos fallidos y detecta productos críticos', () => {
    const ordenes = [
      { estado: 'pendiente', total: 10000, items: [{ nombre: 'A', cantidad: 2 }] },
      { estado: 'pago-fallido', total: 99999, items: [{ nombre: 'A', cantidad: 9 }] },
    ];
    const r = calcularReportes(ordenes, [{ codigo: 'X', stock: 1, stockCritico: 5 }]);
    expect(r.totalOrdenes).toBe(2);
    expect(r.totalVentas).toBe(10000);
    expect(r.unidadesPorProducto.A).toBe(2);
    expect(r.productosCriticos.length).toBe(1);
  });
});
