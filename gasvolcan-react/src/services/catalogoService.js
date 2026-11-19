// Mantenedores de productos y categorías (rol Administrador).
// Llama a la API REST y actualiza la copia local para que las pantallas se refresquen.
import { categoriasApi, productosApi } from '../api/gasVolcanApi';
import {
  guardarFila, listarProductos, quitarFila,
} from '../data/baseDatos';
import { estadoHttp } from '../api/http';

// ----- Productos -----
export async function crearProducto(producto) {
  return guardarFila('productos', await productosApi.crear(producto));
}

export async function actualizarProducto(codigo, producto) {
  return guardarFila('productos', await productosApi.actualizar(codigo, producto));
}

export async function eliminarProducto(codigo) {
  await productosApi.eliminar(codigo);
  quitarFila('productos', codigo);
}

// ----- Categorías -----
export async function crearCategoria(categoria) {
  return guardarFila('categorias', await categoriasApi.crear(categoria));
}

export async function actualizarCategoria(id, categoria) {
  return guardarFila('categorias', await categoriasApi.actualizar(id, categoria));
}

export const productosDeCategoria = (id) => listarProductos().filter((p) => p.categoriaId === id);

// Una categoría con productos no se puede eliminar (el backend responde 409).
// Devuelve { ok, motivo }
export async function eliminarCategoria(id) {
  try {
    await categoriasApi.eliminar(id);
    quitarFila('categorias', id);
    return { ok: true, motivo: '' };
  } catch (error) {
    if (estadoHttp(error) === 409) {
      return { ok: false, motivo: 'No se puede eliminar: la categoría tiene productos asociados.' };
    }
    throw error;
  }
}
