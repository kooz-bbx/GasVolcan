// Acceso seguro a localStorage (si falla o el JSON está dañado, devuelve el valor por defecto)
export const CLAVES = {
  productos: 'gv_db_productos',
  categorias: 'gv_db_categorias',
  ordenes: 'gv_db_ordenes',
  usuarios: 'gv_usuarios',
  sesion: 'gv_sesion',
  carrito: 'gv_carrito',
};

export function leerJSON(clave, porDefecto) {
  try {
    const guardado = window.localStorage.getItem(clave);
    return guardado ? JSON.parse(guardado) : porDefecto;
  } catch (e) {
    return porDefecto;
  }
}

export function guardarJSON(clave, valor) {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
  } catch (e) {
    /* sin espacio o bloqueado: la app sigue funcionando sin persistir */
  }
}

export function borrar(clave) {
  try {
    window.localStorage.removeItem(clave);
  } catch (e) {
    /* nada */
  }
}
