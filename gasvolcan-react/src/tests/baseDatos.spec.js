// Pruebas de LÓGICA: la copia local de datos (src/data/baseDatos.js) y su sincronización con el backend
import {
  guardarFila, listarCategorias, listarOrdenes, listarProductos, listarUsuarios, obtenerProducto,
  quitarFila, sincronizar, vaciarDatosPrivados,
} from '../data/baseDatos';
import { categoriasApi, ordenesApi, productosApi, usuariosApi, camionesApi } from '../api/gasVolcanApi';
import {
  ADMIN, CAMIONES_PRUEBA, ordenDePrueba, prepararCache, REPARTIDORES_PRUEBA,
} from '../test-utils';
import { CATEGORIAS_SEMILLA, PRODUCTOS_SEMILLA } from '../data/datos';

const NUEVO = {
  codigo: 'CL099', nombre: 'Cilindro de prueba', descripcion: '', categoriaId: 'residencial',
  precio: 1000, descuento: 0, stock: 10, stockCritico: 2, imagen: '',
};

describe('Copia local de datos (caché del backend)', () => {
  beforeEach(() => prepararCache());

  it('guardarFila agrega una fila nueva y reemplaza la existente (misma clave)', () => {
    guardarFila('productos', NUEVO);
    expect(listarProductos().length).toBe(5);
    guardarFila('productos', { ...NUEVO, stock: 3 });
    expect(listarProductos().length).toBe(5);
    expect(obtenerProducto('CL099').stock).toBe(3);
  });

  it('quitarFila elimina la fila por su clave', () => {
    quitarFila('productos', 'CL004');
    expect(obtenerProducto('CL004')).toBeNull();
    expect(listarProductos().length).toBe(3);
  });

  it('listarOrdenes entrega primero las más recientes', () => {
    guardarFila('ordenes', ordenDePrueba('GV-1', { fecha: '2026-11-01T10:00:00' }));
    guardarFila('ordenes', ordenDePrueba('GV-2', { fecha: '2026-11-05T10:00:00' }));
    expect(listarOrdenes().map((o) => o.numero)).toEqual(['GV-2', 'GV-1']);
  });

  it('sincronizar (visitante): descarga solo productos y categorías y avisa si algo cambió', async () => {
    prepararCache({ productos: [], categorias: [] });
    spyOn(productosApi, 'listar').and.returnValue(Promise.resolve(PRODUCTOS_SEMILLA));
    spyOn(categoriasApi, 'listar').and.returnValue(Promise.resolve(CATEGORIAS_SEMILLA));
    const ordenes = spyOn(ordenesApi, 'todas');
    expect(await sincronizar(null)).toBeTrue();
    expect(listarProductos().length).toBe(4);
    expect(listarCategorias().length).toBe(2);
    expect(ordenes).not.toHaveBeenCalled();
    expect(await sincronizar(null)).toBeFalse(); // sin cambios: la pantalla no se vuelve a dibujar
  });

  it('sincronizar (Administrador): además descarga usuarios, órdenes y camiones', async () => {
    spyOn(productosApi, 'listar').and.returnValue(Promise.resolve(PRODUCTOS_SEMILLA));
    spyOn(categoriasApi, 'listar').and.returnValue(Promise.resolve(CATEGORIAS_SEMILLA));
    const usuarios = spyOn(usuariosApi, 'listar').and.returnValue(Promise.resolve([ADMIN, ...REPARTIDORES_PRUEBA]));
    spyOn(ordenesApi, 'todas').and.returnValue(Promise.resolve([ordenDePrueba('GV-1')]));
    spyOn(camionesApi, 'listar').and.returnValue(Promise.resolve(CAMIONES_PRUEBA));
    await sincronizar('Administrador');
    expect(usuarios).toHaveBeenCalled();
    expect(listarUsuarios().length).toBe(4);
    expect(listarOrdenes().length).toBe(1);
  });

  it('sincronizar (Repartidor): solo pide sus entregas, no todas las órdenes', async () => {
    spyOn(productosApi, 'listar').and.returnValue(Promise.resolve(PRODUCTOS_SEMILLA));
    spyOn(categoriasApi, 'listar').and.returnValue(Promise.resolve(CATEGORIAS_SEMILLA));
    const todas = spyOn(ordenesApi, 'todas');
    const mias = spyOn(ordenesApi, 'misEntregas').and.returnValue(Promise.resolve([]));
    await sincronizar('Repartidor');
    expect(mias).toHaveBeenCalled();
    expect(todas).not.toHaveBeenCalled();
  });

  it('sincronizar propaga el error si el backend no responde', async () => {
    spyOn(productosApi, 'listar').and.returnValue(Promise.reject(new Error('sin conexión')));
    spyOn(categoriasApi, 'listar').and.returnValue(Promise.resolve([]));
    let error = null;
    try { await sincronizar(null); } catch (e) { error = e; }
    expect(error).not.toBeNull();
  });

  it('vaciarDatosPrivados borra usuarios, órdenes y camiones pero conserva el catálogo', () => {
    guardarFila('ordenes', ordenDePrueba('GV-1'));
    guardarFila('usuarios', ADMIN);
    vaciarDatosPrivados();
    expect(listarOrdenes().length).toBe(0);
    expect(listarUsuarios().length).toBe(0);
    expect(listarProductos().length).toBe(4);
  });
});
