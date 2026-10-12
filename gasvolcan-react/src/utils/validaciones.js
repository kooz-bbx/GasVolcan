// =========================================================
// validaciones.js - funciones puras de validación y formato
// (sin DOM ni localStorage, por eso son fáciles de probar).
// Cada validador devuelve un mensaje de error (string) o null
// si el valor es correcto, así sirven directo como `validate`
// de react-hook-form (que trata null/true como válido).
// =========================================================
import { DOMINIOS_PERMITIDOS } from '../data/datos';

// "benjamin alegria" -> "Benjamin Alegria"
export function capitalizarTexto(texto) {
  if (!texto) return texto;
  return texto
    .toLowerCase()
    .replace(/(^|[\s,.-])([a-záéíóúñ])/g, (_, separador, letra) => separador + letra.toUpperCase());
}

// 31000 -> "31.000"
export function formatearCLP(monto) {
  return Number(monto || 0).toLocaleString('es-CL');
}

// ----- RUN chileno (dígito verificador, módulo 11) -----
export function validarRun(runCompleto) {
  const run = String(runCompleto || '').replace(/[^0-9kK]/g, '');
  if (run.length < 7 || run.length > 9) return false;

  const cuerpo = run.slice(0, -1);
  const dv = run.slice(-1).toUpperCase();

  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const resto = 11 - (suma % 11);
  let dvEsperado;
  if (resto === 11) dvEsperado = '0';
  else if (resto === 10) dvEsperado = 'K';
  else dvEsperado = String(resto);

  return dv === dvEsperado;
}

export function errorRun(valor) {
  return validarRun(valor) ? null : 'RUN no válido. Ingrésalo sin puntos ni guión (ej: 190110222)';
}

// ----- Correo: formato + dominio permitido -----
export function errorCorreo(valor) {
  const correo = String(valor || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return 'Correo con formato inválido (ej: nombre@duoc.cl)';
  }
  const dominio = correo.split('@')[1].toLowerCase();
  if (!DOMINIOS_PERMITIDOS.includes(dominio)) {
    return 'Solo se aceptan correos de: ' + DOMINIOS_PERMITIDOS.join(', ');
  }
  return null;
}

// ----- Teléfono chileno: +56 9 XXXX XXXX -----
export function errorTelefono(valor) {
  const soloNumeros = String(valor || '').replace(/[\s-]/g, '');
  if (!/^(\+?56)?9\d{8}$/.test(soloNumeros)) {
    return 'Teléfono: usa el formato +56 9 XXXX XXXX (9 dígitos, empezando con 9)';
  }
  return null;
}

// Deja fijo el prefijo "+56 9" y solo permite 8 dígitos más
export function limitarTelefono(valor) {
  const prefijo = '+56 9';
  const texto = String(valor || '');
  if (texto.indexOf(prefijo) !== 0) {
    let digitos = texto.replace(/\D/g, '');
    digitos = digitos.replace(/^56/, '').replace(/^9/, '');
    return prefijo + digitos.slice(0, 8);
  }
  return prefijo + texto.slice(prefijo.length).replace(/\D/g, '').slice(0, 8);
}

// ----- Contraseña: 4 a 10 caracteres -----
export function errorContrasena(valor) {
  const largo = String(valor || '').length;
  if (largo < 4 || largo > 10) return 'La contraseña debe tener entre 4 y 10 caracteres';
  return null;
}

export function errorConfirmacion(valor, contrasena) {
  return valor === contrasena ? null : 'Las contraseñas no coinciden';
}

// ----- Fecha de nacimiento (opcional): año 1900 a 2005 -----
export function errorFechaNacimiento(valor) {
  if (!valor) return null;
  const anio = new Date(valor).getFullYear();
  if (isNaN(anio) || anio > 2005 || anio < 1900) {
    return 'Fecha de nacimiento: debe ser del año 2005 hacia atrás';
  }
  return null;
}

// ----- Campos del formulario de productos (admin) -----
export function errorCodigoProducto(valor) {
  return String(valor || '').trim().length >= 3 ? null : 'El código debe tener al menos 3 caracteres';
}

export function errorPrecio(valor) {
  const numero = parseFloat(valor);
  return isNaN(numero) || numero < 0 ? 'El precio debe ser un número igual o mayor a 0' : null;
}

export function errorEnteroNoNegativo(valor, nombre = 'El valor') {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 0 ? null : `${nombre} debe ser un entero igual o mayor a 0`;
}

// ----- Tarjeta (pago simulado): 16 dígitos -----
export function errorTarjeta(valor) {
  const numero = String(valor || '').replace(/\s/g, '');
  return /^\d{16}$/.test(numero) ? null : 'El número de tarjeta debe tener 16 dígitos';
}

// ----- Descuento de un producto: entero entre 0 y 90 -----
export function errorDescuento(valor) {
  const n = Number(valor);
  return Number.isInteger(n) && n >= 0 && n <= 90 ? null : 'El descuento debe ser un entero entre 0 y 90';
}

// Resuelve la ruta de una imagen (local de /public o URL externa)
export function resolverImagen(ruta) {
  if (!ruta) return '';
  if (/^(https?:)?\/\//.test(ruta) || ruta.startsWith('data:')) return ruta;
  return (process.env.PUBLIC_URL || '') + '/' + ruta.replace(/^\//, '');
}
