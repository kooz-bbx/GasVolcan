import { listarProductos } from '../data/baseDatos';
import { CLAVES, guardarJSON, leerJSON } from '../data/almacenamiento';
import { precioFinal } from '../utils/productos';

// El carrito guardado es [{ codigo, cantidad }]
export function obtenerCarrito() {
  const codigos = listarProductos().map((p) => p.codigo);
  return leerJSON(CLAVES.carrito, []).filter((item) => codigos.includes(item.codigo));
}

export function guardarCarrito(carrito) {
  guardarJSON(CLAVES.carrito, carrito);
}

// Funciones puras: reciben el carrito y devuelven uno nuevo
export function agregarItem(carrito, codigo, cantidad = 1) {
  const n = parseInt(cantidad, 10) || 1;
  if (carrito.some((i) => i.codigo === codigo)) {
    return carrito.map((i) => (i.codigo === codigo ? { ...i, cantidad: i.cantidad + n } : i));
  }
  return [...carrito, { codigo, cantidad: n }];
}

export function cambiarCantidad(carrito, codigo, delta) {
  return carrito
    .map((i) => (i.codigo === codigo ? { ...i, cantidad: i.cantidad + delta } : i))
    .filter((i) => i.cantidad > 0);
}

export function quitarItem(carrito, codigo) {
  return carrito.filter((i) => i.codigo !== codigo);
}

// Une el carrito con los datos actuales del catálogo (precio con oferta incluido)
// Devuelve [{ codigo, nombre, imagen, precio (unitario final), cantidad }]
export function detalleCarrito(carrito, productos = listarProductos()) {
  return carrito
    .map((item) => {
      const producto = productos.find((p) => p.codigo === item.codigo);
      if (!producto) return null;
      return {
        codigo: producto.codigo,
        nombre: producto.nombre,
        imagen: producto.imagen,
        precio: precioFinal(producto),
        cantidad: item.cantidad,
      };
    })
    .filter(Boolean);
}

export function totalDetalle(detalle) {
  return detalle.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
}

export function calcularTotal(carrito, productos) {
  return totalDetalle(detalleCarrito(carrito, productos));
}

export function contarUnidades(carrito) {
  return carrito.reduce((total, item) => total + item.cantidad, 0);
}
