// Cálculo de reportes del administrador (funciones puras)
import { hayStockBajo } from './productos';

const NO_CUENTAN = ['pago-fallido', 'cancelado']; // no suman a las ventas

export function calcularReportes(ordenes, productos) {
  const ventas = ordenes.filter((o) => !NO_CUENTAN.includes(o.estado));

  const porEstado = {};
  ordenes.forEach((o) => {
    porEstado[o.estado] = (porEstado[o.estado] || 0) + 1;
  });

  const unidadesPorProducto = {};
  ventas.forEach((o) => {
    o.items.forEach((item) => {
      const clave = item.nombre;
      unidadesPorProducto[clave] = (unidadesPorProducto[clave] || 0) + item.cantidad;
    });
  });

  return {
    totalOrdenes: ordenes.length,
    totalVentas: ventas.reduce((suma, o) => suma + o.total, 0),
    porEstado,
    unidadesPorProducto,
    productosCriticos: productos.filter(hayStockBajo),
  };
}
