// Pruebas de LÓGICA: pago simulado, órdenes y stock
import {
  crearOrdenRapida, descontarStock, obtenerMisOrdenes, procesarPago,
} from '../services/ordenService';
import { obtenerProducto } from '../data/baseDatos';
import { guardarSesion } from '../services/usuarioService';

describe('Servicio de órdenes', () => {
  beforeEach(() => localStorage.clear());

  it('procesarPago: efectivo siempre se aprueba', () => {
    expect(procesarPago({ metodo: 'efectivo' }).ok).toBeTrue();
  });

  it('procesarPago: tarjeta válida se aprueba, terminada en 0000 se rechaza y corta no sirve', () => {
    expect(procesarPago({ metodo: 'tarjeta', numeroTarjeta: '4111111111111111' }).ok).toBeTrue();
    const rechazada = procesarPago({ metodo: 'tarjeta', numeroTarjeta: '4111111111110000' });
    expect(rechazada.ok).toBeFalse();
    expect(rechazada.motivo).toMatch(/rechazada/i);
    expect(procesarPago({ metodo: 'tarjeta', numeroTarjeta: '123' }).ok).toBeFalse();
  });

  it('descontarStock resta lo vendido y nunca deja el stock bajo 0', () => {
    descontarStock([{ codigo: 'CL001', cantidad: 2 }]);
    expect(obtenerProducto('CL001').stock).toBe(78);
    descontarStock([{ codigo: 'CL004', cantidad: 999 }]);
    expect(obtenerProducto('CL004').stock).toBe(0);
  });

  it('crearOrdenRapida calcula el total con el precio del cilindro', () => {
    const o = crearOrdenRapida({ nombre: 'juan perez', direccion: 'calle 1', tipoCilindro: '11kg', cantidad: '2' });
    expect(o.total).toBe(40000);
    expect(o.cliente.nombre).toBe('Juan Perez');
    expect(o.estado).toBe('pendiente');
  });

  it('obtenerMisOrdenes devuelve solo las órdenes del usuario con sesión', () => {
    crearOrdenRapida({ nombre: 'Ana', direccion: 'x', tipoCilindro: '5kg', cantidad: '1' }, 'GV-1111'); // invitado
    guardarSesion({ correo: 'cliente@gmail.com', nombre: 'Cli', tipoUsuario: 'Cliente' });
    crearOrdenRapida({ nombre: 'Cli', direccion: 'y', tipoCilindro: '5kg', cantidad: '1' }, 'GV-2222');
    const mias = obtenerMisOrdenes();
    expect(mias.length).toBe(1);
    expect(mias[0].numero).toBe('GV-2222');
  });
});
