// Pruebas de LÓGICA: la "base de datos" simulada (src/data/baseDatos.js) y su CRUD
import {
  actualizarProducto, crearCategoria, crearProducto, eliminarCategoria, eliminarProducto,
  listarCategorias, listarProductos, obtenerProducto,
} from '../data/baseDatos';

const NUEVO = {
  codigo: 'CL099', nombre: 'Cilindro de prueba', descripcion: '', categoriaId: 'residencial',
  precio: 1000, descuento: 0, stock: 10, stockCritico: 2, imagen: '',
};

describe('Base de datos simulada (CRUD)', () => {
  beforeEach(() => localStorage.clear());

  it('READ: la primera lectura carga los 4 cilindros semilla y los guarda en localStorage', () => {
    expect(listarProductos().length).toBe(4);
    expect(localStorage.getItem('gv_db_productos')).not.toBeNull();
  });

  it('CREATE: crearProducto agrega la fila y persiste', () => {
    crearProducto(NUEVO);
    expect(listarProductos().length).toBe(5);
    expect(obtenerProducto('CL099').nombre).toBe('Cilindro de prueba');
  });

  it('CREATE: no permite repetir la clave (código) de un producto', () => {
    expect(() => crearProducto({ ...NUEVO, codigo: 'CL001' })).toThrow();
  });

  it('UPDATE: actualizarProducto cambia solo los campos entregados', () => {
    actualizarProducto('CL001', { stock: 5 });
    const p = obtenerProducto('CL001');
    expect(p.stock).toBe(5);
    expect(p.nombre).toBe('Cilindro GLP 5 kg');
  });

  it('DELETE: eliminarProducto lo saca de la tabla', () => {
    expect(eliminarProducto('CL004')).toBeTrue();
    expect(obtenerProducto('CL004')).toBeNull();
    expect(listarProductos().length).toBe(3);
  });

  it('Categorías: se crea con id tipo slug y NO se elimina si tiene productos', () => {
    const c = crearCategoria({ nombre: 'Accesorios Gas', descripcion: 'Reguladores' });
    expect(c.id).toBe('accesorios-gas');
    expect(eliminarCategoria('residencial').ok).toBeFalse(); // tiene CL001..CL003
    expect(eliminarCategoria('accesorios-gas').ok).toBeTrue();   // vacía: sí
    expect(listarCategorias().length).toBe(2);
  });
});
