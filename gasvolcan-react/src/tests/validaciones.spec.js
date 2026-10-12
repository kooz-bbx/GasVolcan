// Pruebas de LÓGICA: funciones puras de validación (sin DOM)
import {
  capitalizarTexto, errorConfirmacion, errorContrasena, errorCorreo,
  errorTelefono, limitarTelefono, validarRun,
} from '../utils/validaciones';

describe('Validaciones del formulario', () => {
  it('RUN: acepta uno con dígito verificador correcto y rechaza uno incorrecto', () => {
    expect(validarRun('190110222')).toBeTrue();
    expect(validarRun('6000000K')).toBeTrue(); // dígito verificador K
    expect(validarRun('190110221')).toBeFalse();
    expect(validarRun('123')).toBeFalse();
  });

  it('Correo: solo acepta los dominios duoc.cl, profesor.duoc.cl y gmail.com', () => {
    expect(errorCorreo('alumno@duoc.cl')).toBeNull();
    expect(errorCorreo('persona@gmail.com')).toBeNull();
    expect(errorCorreo('alguien@hotmail.com')).toMatch(/Solo se aceptan/);
    expect(errorCorreo('sin-arroba')).toMatch(/formato inválido/);
  });

  it('Teléfono: formato +56 9 y el prefijo queda fijo al escribir', () => {
    expect(errorTelefono('+56 9 1234 5678')).toBeNull();
    expect(errorTelefono('+56 2 1234 5678')).not.toBeNull();
    expect(limitarTelefono('+56 9123456789999')).toBe('+56 912345678'); // máximo 8 dígitos
    expect(limitarTelefono('')).toBe('+56 9');
  });

  it('Contraseña: 4 a 10 caracteres y confirmación igual', () => {
    expect(errorContrasena('abc')).not.toBeNull();
    expect(errorContrasena('abcd')).toBeNull();
    expect(errorContrasena('abcdefghijk')).not.toBeNull();
    expect(errorConfirmacion('clave1', 'clave1')).toBeNull();
    expect(errorConfirmacion('clave1', 'otra12')).toMatch(/no coinciden/);
  });

  it('Formato de texto: capitaliza cada palabra', () => {
    expect(capitalizarTexto('benjamin alegria')).toBe('Benjamin Alegria');
  });
});
