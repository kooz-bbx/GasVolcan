// Pruebas de LÓGICA del carrito + MOCK de localStorage con spyOn
import {
  agregarItem, calcularTotal, cambiarCantidad, contarUnidades, obtenerCarrito,
} from '../services/carritoService';

describe('Carrito de compras (servicio)', () => {
  beforeEach(() => localStorage.clear());

  it('agregarItem crea el ítem y suma la cantidad si ya existe', () => {
    let carrito = agregarItem([], 'CL001', 1);
    expect(carrito).toEqual([{ codigo: 'CL001', cantidad: 1 }]);
    carrito = agregarItem(carrito, 'CL001', 2);
    expect(carrito).toEqual([{ codigo: 'CL001', cantidad: 3 }]);
  });

  it('cambiarCantidad elimina el producto cuando la cantidad llega a 0', () => {
    const carrito = [{ codigo: 'CL002', cantidad: 1 }];
    expect(cambiarCantidad(carrito, 'CL002', 1)[0].cantidad).toBe(2);
    expect(cambiarCantidad(carrito, 'CL002', -1)).toEqual([]);
  });

  it('calcularTotal aplica el descuento de las ofertas (CL001 con 10%)', () => {
    const carrito = [{ codigo: 'CL001', cantidad: 2 }, { codigo: 'CL002', cantidad: 1 }];
    expect(calcularTotal(carrito)).toBe(5850 * 2 + 12000);
    expect(contarUnidades(carrito)).toBe(3);
  });

  it('MOCK: obtenerCarrito lee localStorage (simulado) y descarta códigos que no existen', () => {
    const espia = spyOn(Storage.prototype, 'getItem').and.callFake((clave) =>
      clave === 'gv_carrito' ? JSON.stringify([{ codigo: 'CL001', cantidad: 1 }, { codigo: 'REG999', cantidad: 4 }]) : null
    );
    expect(obtenerCarrito()).toEqual([{ codigo: 'CL001', cantidad: 1 }]);
    expect(espia).toHaveBeenCalledWith('gv_carrito');
  });
});
