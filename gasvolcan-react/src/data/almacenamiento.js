// Acceso seguro a localStorage (si falla o el JSON está dañado, devuelve el valor por defecto)
// El carrito y los tokens de sesión son lo único que se guarda en el navegador;
// el resto de los datos viven en la base de datos del backend.
export const CLAVES = {
  tokens: 'gv_tokens',
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
