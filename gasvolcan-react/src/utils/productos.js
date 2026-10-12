// Funciones puras sobre productos (precio con oferta, stock crítico y filtros)

export function enOferta(producto) {
  return (Number(producto.descuento) || 0) > 0;
}

// Precio unitario con el descuento aplicado (CLP, sin decimales)
export function precioFinal(producto) {
  const descuento = Number(producto.descuento) || 0;
  return Math.round((producto.precio * (100 - descuento)) / 100);
}

export function hayStockBajo(producto) {
  return Boolean(producto.stockCritico) && producto.stock <= producto.stockCritico;
}

// Filtro de búsqueda: por texto (nombre, descripción o código) y/o por categoría
export function filtrarProductos(lista, { texto = '', categoriaId = '' } = {}) {
  const buscado = String(texto).trim().toLowerCase();
  return lista.filter((p) => {
    const coincideCategoria = !categoriaId || p.categoriaId === categoriaId;
    const coincideTexto =
      !buscado ||
      p.nombre.toLowerCase().includes(buscado) ||
      String(p.descripcion || '').toLowerCase().includes(buscado) ||
      p.codigo.toLowerCase().includes(buscado);
    return coincideCategoria && coincideTexto;
  });
}
