// Lógica de compras y reparto. Las reglas de negocio (precios, stock, pago, flujo de estados)
// las valida el BACKEND; aquí se llama a la API REST y se actualiza la copia local de datos.
import { ordenesApi } from '../api/gasVolcanApi';
import { estadoHttp, mensajeDeError } from '../api/http';
import {
  guardarFila, listarCamiones, listarOrdenes, obtenerOrden as obtenerOrdenPorNumero,
  obtenerProducto, recargarProductos,
} from '../data/baseDatos';
import { capitalizarTexto } from '../utils/validaciones';
import { listarRepartidores, obtenerUsuario } from './usuarioService';

// Códigos de los cilindros en el catálogo (el "Pedido Rápido" usa sus precios reales)
export const CODIGOS_CILINDRO = { '5kg': 'CL001', '11kg': 'CL002', '15kg': 'CL003' };

// Seguimiento de la tienda: SOLO las órdenes del usuario actual.
// Con sesión, el backend ya entrega solo las del cliente; sin sesión, las órdenes de invitado de esta visita.
export function obtenerMisOrdenes(sesion) {
  const propietario = sesion ? sesion.correo : 'invitado';
  return listarOrdenes().filter((o) => (o.propietario || 'invitado') === propietario);
}

// Guarda la orden en la copia local y refresca el stock (el backend lo descuenta al comprar)
async function registrarOrden(orden) {
  guardarFila('ordenes', orden);
  try { await recargarProductos(); } catch (e) { /* el stock se actualiza en la próxima carga */ }
  return orden;
}

// Cuerpo de la compra: el backend calcula los precios, por eso solo se envían código y cantidad
// datos: { cliente, entrega, pago:{metodo, numeroTarjeta} }
function cuerpoPago(datos) {
  return {
    cliente: datos.cliente,
    entrega: datos.entrega,
    pago: { metodo: datos.pago.metodo, numeroTarjeta: datos.pago.numeroTarjeta || '' },
  };
}

// Checkout: el backend procesa el pago simulado y devuelve la orden ('pendiente' o 'pago-fallido')
export async function pagarCompra(datos, detalle) {
  const orden = await ordenesApi.comprar({
    ...cuerpoPago(datos),
    items: detalle.map((i) => ({ codigo: i.codigo, cantidad: i.cantidad })),
  });
  return registrarOrden(orden);
}

// Reintento de un pago fallido: el backend actualiza la misma orden
export async function reintentarPago(numero, datos) {
  return registrarOrden(await ordenesApi.reintentarPago(numero, cuerpoPago(datos)));
}

// Pedido rápido (formulario de la tienda): una orden de un solo ítem, pago en efectivo
// datos: { nombre, telefono, direccion, tipoCilindro ('5kg'...), cantidad, comentario }
export async function crearPedidoRapido(datos) {
  const orden = await ordenesApi.pedidoRapido({
    nombre: capitalizarTexto(String(datos.nombre).trim()),
    telefono: datos.telefono || '',
    direccion: capitalizarTexto(String(datos.direccion).trim()),
    comuna: '',
    codigoProducto: CODIGOS_CILINDRO[datos.tipoCilindro],
    cantidad: parseInt(datos.cantidad, 10),
    indicaciones: datos.comentario || '',
  });
  return registrarOrden(orden);
}

// ---------- Reparto (operadora + repartidor) ----------
// Flujo del pedido:
//   pendiente --(la operadora asigna camión y repartidor)--> asignado
//   asignado --(el repartidor sale a repartir)--> en-camino
//   en-camino --(el repartidor entrega)--> entregado
// Pendiente, asignado y en-camino también se pueden cancelar (lo hace la operadora).
// Entregado, cancelado y pago-fallido ya no cambian.
const SIGUIENTES_ESTADOS = {
  pendiente: ['cancelado'],
  asignado: ['en-camino', 'cancelado'],
  'en-camino': ['entregado', 'cancelado'],
};

// Mientras un pedido está en estos estados, su camión y su repartidor quedan ocupados
export const ESTADOS_ACTIVOS = ['asignado', 'en-camino'];

// Estados a los que puede pasar un pedido desde su estado actual
export function estadosSiguientes(estadoActual) {
  return SIGUIENTES_ESTADOS[estadoActual] || [];
}

// Pedidos activos (asignados o en camino) de un camión / de un repartidor
export function pedidosActivosDeCamion(patente, ordenes = listarOrdenes()) {
  return ordenes.filter((o) => o.camion === patente && ESTADOS_ACTIVOS.includes(o.estado));
}

export function pedidosActivosDeRepartidor(run, ordenes = listarOrdenes()) {
  return ordenes.filter((o) => o.repartidorRun === run && ESTADOS_ACTIVOS.includes(o.estado));
}

// Camión en el que va hoy un repartidor (según sus pedidos activos), o null si no ha salido
export function camionDeRepartidor(run, ordenes = listarOrdenes()) {
  const activo = pedidosActivosDeRepartidor(run, ordenes)[0];
  return activo ? activo.camion : null;
}

// Repartidor que va en un camión (según sus pedidos activos), o null si el camión está libre
export function repartidorDeCamion(patente, ordenes = listarOrdenes()) {
  const activo = pedidosActivosDeCamion(patente, ordenes)[0];
  return activo ? activo.repartidorRun : null;
}

// Un camión sin pedidos activos está libre
export function camionesDisponibles() {
  const ordenes = listarOrdenes();
  return listarCamiones().filter((c) => !repartidorDeCamion(c.patente, ordenes));
}

// Un repartidor sin pedidos activos está libre
export function repartidoresDisponibles() {
  const ordenes = listarOrdenes();
  return listarRepartidores().filter((r) => !camionDeRepartidor(r.run, ordenes));
}

// LA OPERADORA asigna un camión y un repartidor a un pedido pendiente y le deja instrucciones.
// El repartidor verá los datos de la entrega en su panel.
// Las validaciones de la regla "1 repartidor = 1 camión" las hace el backend (responde 409);
// aquí se revisan antes solo para dar un mensaje inmediato.
// datos: { camion (patente), repartidorRun, instrucciones }
// Devuelve { ok, motivo, orden }
export async function asignarPedido(numero, datos) {
  const orden = obtenerOrdenPorNumero(numero);
  if (!orden) return { ok: false, motivo: 'El pedido no existe.', orden: null };
  if (orden.estado !== 'pendiente') {
    return { ok: false, motivo: 'Solo se pueden asignar pedidos pendientes.', orden: null };
  }
  if (!datos.camion) return { ok: false, motivo: 'Selecciona un camión.', orden: null };
  const repartidor = datos.repartidorRun ? obtenerUsuario(datos.repartidorRun) : null;
  if (!repartidor || repartidor.tipoUsuario !== 'Repartidor') {
    return { ok: false, motivo: 'Selecciona un repartidor.', orden: null };
  }
  try {
    const actualizada = await ordenesApi.asignar(numero, {
      camion: datos.camion,
      repartidorRun: datos.repartidorRun,
      instrucciones: String(datos.instrucciones || '').trim(),
    });
    guardarFila('ordenes', actualizada);
    return { ok: true, motivo: '', orden: actualizada };
  } catch (error) {
    return { ok: false, motivo: mensajeDeError(error), orden: null };
  }
}

// Cambia el estado de un pedido respetando el flujo (el backend valida el flujo y el rol:
// el repartidor asignado sale a repartir y entrega; la operadora cancela).
// Devuelve { ok, motivo, orden }
export async function cambiarEstadoPedido(numero, nuevoEstado) {
  const orden = obtenerOrdenPorNumero(numero);
  if (!orden || !estadosSiguientes(orden.estado).includes(nuevoEstado)) {
    return { ok: false, motivo: 'Ese cambio de estado no está permitido.', orden: null };
  }
  try {
    const actualizada = await ordenesApi.cambiarEstado(numero, nuevoEstado);
    guardarFila('ordenes', actualizada);
    return { ok: true, motivo: '', orden: actualizada };
  } catch (error) {
    return { ok: false, motivo: mensajeDeError(error), orden: null, estadoHttp: estadoHttp(error) };
  }
}

// LA OPERADORA registra un pedido que llegó por llamada telefónica.
// datos: { nombre, telefono, direccion, comuna, codigoProducto, cantidad, indicaciones }
// Devuelve { ok, motivo, orden }. El pedido queda pendiente, pago en efectivo al recibir.
export async function crearPedidoTelefonico(datos) {
  const nombre = String(datos.nombre || '').trim();
  const direccion = String(datos.direccion || '').trim();
  const cantidad = parseInt(datos.cantidad, 10);
  const producto = datos.codigoProducto ? obtenerProducto(datos.codigoProducto) : null;
  if (!nombre) return { ok: false, motivo: 'Ingresa el nombre del cliente.', orden: null };
  // Teléfono chileno: +56 y 9 dígitos (se acepta con o sin el +56 adelante)
  const digitos = String(datos.telefono || '').replace(/[\s+]/g, '').replace(/^56(?=\d{9}$)/, '');
  if (!/^\d{9}$/.test(digitos)) {
    return { ok: false, motivo: 'El teléfono debe tener 9 dígitos (ej: 912345678).', orden: null };
  }
  if (!direccion) return { ok: false, motivo: 'Ingresa la dirección de entrega.', orden: null };
  if (!producto) return { ok: false, motivo: 'Selecciona un producto.', orden: null };
  if (!(cantidad > 0)) return { ok: false, motivo: 'La cantidad debe ser mayor a 0.', orden: null };
  if (cantidad > producto.stock) {
    return { ok: false, motivo: `Stock insuficiente (quedan ${producto.stock}).`, orden: null };
  }
  try {
    const orden = await ordenesApi.pedidoTelefonico({
      nombre: capitalizarTexto(nombre),
      telefono: '+56' + digitos,
      direccion: capitalizarTexto(direccion),
      comuna: capitalizarTexto(String(datos.comuna || '').trim()),
      codigoProducto: producto.codigo,
      cantidad,
      indicaciones: String(datos.indicaciones || '').trim(),
    });
    await registrarOrden(orden);
    return { ok: true, motivo: '', orden };
  } catch (error) {
    return { ok: false, motivo: mensajeDeError(error), orden: null };
  }
}
