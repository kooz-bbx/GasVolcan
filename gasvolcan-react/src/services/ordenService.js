// Lógica de compras: pago simulado, creación de órdenes y stock.
// Todo se guarda a través de baseDatos.js (CRUD).
import { PRECIOS_CILINDRO } from '../data/datos';
import {
  actualizarOrden, actualizarProducto, crearOrden, listarOrdenes, obtenerOrden as obtenerOrdenPorNumero,
  obtenerProducto,
} from '../data/baseDatos';
import { capitalizarTexto } from '../utils/validaciones';
import { obtenerSesion } from './usuarioService';
import { totalDetalle } from './carritoService';

export function generarNumeroOrden() {
  let numero;
  do {
    numero = 'GV-' + Math.floor(1000 + Math.random() * 9000);
  } while (listarOrdenes().some((o) => o.numero === numero));
  return numero;
}

// Quien compra: el correo de la sesión activa o 'invitado'
export function obtenerPropietarioActual() {
  const sesion = obtenerSesion();
  return sesion ? sesion.correo : 'invitado';
}

// Seguimiento de la tienda: SOLO las órdenes del usuario actual
export function obtenerMisOrdenes() {
  const propietario = obtenerPropietarioActual();
  return listarOrdenes().filter((o) => (o.propietario || 'invitado') === propietario);
}

// Pasarela de pago SIMULADA:
//  - efectivo: siempre queda aprobado (se paga al recibir)
//  - tarjeta: debe tener 16 dígitos; si termina en 0000 el banco la rechaza
export function procesarPago({ metodo, numeroTarjeta = '' }) {
  if (metodo === 'efectivo') return { ok: true, motivo: '' };
  const numero = String(numeroTarjeta).replace(/\s/g, '');
  if (!/^\d{16}$/.test(numero)) return { ok: false, motivo: 'Número de tarjeta inválido.' };
  if (numero.endsWith('0000')) return { ok: false, motivo: 'Tarjeta rechazada por el banco (simulación).' };
  return { ok: true, motivo: '' };
}

// Arma la orden de una compra del checkout
// datos: { cliente:{nombre,apellidos,correo}, entrega:{tipo,calle,departamento,region,comuna,indicaciones}, pago:{metodo} }
export function armarOrdenCheckout(datos, detalle, estado) {
  return {
    numero: generarNumeroOrden(),
    fecha: new Date().toISOString(),
    origen: 'checkout',
    propietario: obtenerPropietarioActual(),
    cliente: datos.cliente,
    entrega: datos.entrega,
    pago: { metodo: datos.pago.metodo },
    items: detalle,
    total: totalDetalle(detalle),
    repartidor: 'Sin asignar',
    estado,
  };
}

export function guardarOrdenCheckout(datos, detalle, estado) {
  return crearOrden(armarOrdenCheckout(datos, detalle, estado));
}

// Reintento de un pago fallido: se actualiza la misma orden
export function reintentarPago(numero, datos, estado) {
  return actualizarOrden(numero, {
    cliente: datos.cliente,
    entrega: datos.entrega,
    pago: { metodo: datos.pago.metodo },
    estado,
  });
}

// Pedido rápido (formulario de la tienda): una orden de un solo ítem
// datos: { nombre, direccion, tipoCilindro ('5kg'...), cantidad }
export function crearOrdenRapida(datos, numero = generarNumeroOrden()) {
  const cantidad = parseInt(datos.cantidad, 10);
  const precio = PRECIOS_CILINDRO[datos.tipoCilindro] || 0;
  const nombre = capitalizarTexto(String(datos.nombre).trim());
  const item = {
    codigo: null,
    nombre: 'Cilindro ' + datos.tipoCilindro.replace('kg', ' kg'),
    imagen: '',
    precio,
    cantidad,
  };
  return crearOrden({
    numero,
    fecha: new Date().toISOString(),
    origen: 'pedido-rapido',
    propietario: obtenerPropietarioActual(),
    cliente: { nombre, apellidos: '', correo: '', telefono: datos.telefono || '' },
    entrega: {
      tipo: 'domicilio',
      calle: capitalizarTexto(String(datos.direccion).trim()),
      departamento: '',
      region: '',
      comuna: '',
      indicaciones: datos.comentario || '',
    },
    pago: { metodo: 'efectivo' },
    items: [item],
    total: precio * cantidad,
    repartidor: 'Sin asignar',
    estado: 'pendiente',
  });
}

// Descuenta del stock lo vendido (nunca baja de 0)
export function descontarStock(detalle) {
  detalle.forEach((item) => {
    const producto = item.codigo ? obtenerProducto(item.codigo) : null;
    if (producto) {
      actualizarProducto(producto.codigo, { stock: Math.max(0, producto.stock - item.cantidad) });
    }
  });
}

// ---------- Reparto (panel del vendedor / repartidor) ----------
// Flujo del pedido: pendiente -> en-camino -> entregado
// (pendiente o en-camino también se pueden cancelar).
// Entregado, cancelado y pago-fallido ya no cambian.
const SIGUIENTES_ESTADOS = {
  pendiente: ['en-camino', 'cancelado'],
  'en-camino': ['entregado', 'cancelado'],
};

// Estados a los que puede pasar un pedido desde su estado actual
export function estadosSiguientes(estadoActual) {
  return SIGUIENTES_ESTADOS[estadoActual] || [];
}

// Cambia el estado de un pedido respetando el flujo.
//  - en-camino: queda asignado al repartidor que lo toma
//  - entregado: se registra la fecha de entrega y el pago queda como recibido
//    (en efectivo el repartidor cobra en ese momento)
// Devuelve la orden actualizada, o null si el cambio no está permitido.
export function cambiarEstadoPedido(numero, nuevoEstado, repartidor = '') {
  const orden = obtenerOrdenPorNumero(numero);
  if (!orden || !estadosSiguientes(orden.estado).includes(nuevoEstado)) return null;
  const cambios = { estado: nuevoEstado };
  if (nuevoEstado === 'en-camino' && repartidor) cambios.repartidor = repartidor;
  if (nuevoEstado === 'entregado') {
    cambios.fechaEntrega = new Date().toISOString();
    cambios.pago = { ...orden.pago, pagado: true };
  }
  return actualizarOrden(numero, cambios);
}
