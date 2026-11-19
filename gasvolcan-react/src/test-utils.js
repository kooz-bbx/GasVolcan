import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CATEGORIAS_SEMILLA, PRODUCTOS_SEMILLA } from './data/datos';
import { reemplazarTabla, vaciarTodo } from './data/baseDatos';
import {
  authApi, camionesApi, categoriasApi, ordenesApi, productosApi, usuariosApi,
} from './api/gasVolcanApi';

// ---------- Datos de ejemplo para las pruebas (el backend real los carga con DataInitializer) ----------
export const CAMIONES_PRUEBA = [
  { patente: 'KLRT-11', modelo: 'Camión 3/4 Hyundai HD65', capacidad: 60 },
  { patente: 'PHZX-45', modelo: 'Camión Mitsubishi Canter', capacidad: 80 },
];

const usuario = (run, nombre, apellidos, correo, tipoUsuario) => ({
  run, nombre, apellidos, correo, tipoUsuario, region: 'Ñuble', comuna: 'Chillán', direccion: 'Calle 1',
});
export const ADMIN = usuario('111111111', 'Benjamín', 'Rojas', 'admin@duoc.cl', 'Administrador');
export const OPERADORA = usuario('333333333', 'Camila', 'Soto', 'operadora@duoc.cl', 'Operadora');
export const ENZO = usuario('444444444', 'Enzo', 'Ramírez Soto', 'repenzo@duoc.cl', 'Repartidor');
export const JAVIERA = usuario('555555555', 'Javiera', 'Muñoz Vera', 'repjaviera@duoc.cl', 'Repartidor');
export const NICOLAS = usuario('666666666', 'Nicolás', 'Ortiz Díaz', 'repnico@duoc.cl', 'Repartidor');
export const REPARTIDORES_PRUEBA = [ENZO, JAVIERA, NICOLAS];

// Una orden de ejemplo (así la devuelve el backend)
export function ordenDePrueba(numero, extra = {}) {
  return {
    numero,
    fecha: new Date().toISOString(),
    origen: 'pedido-rapido',
    propietario: 'invitado',
    cliente: { nombre: 'Ana', apellidos: '', correo: '', telefono: '+56912345678' },
    entrega: { tipo: 'domicilio', calle: 'Calle 1', departamento: '', region: '', comuna: '', indicaciones: '' },
    pago: { metodo: 'efectivo', pagado: false },
    items: [{ codigo: 'CL002', nombre: 'Cilindro GLP 11 kg', imagen: '', precio: 20000, cantidad: 1 }],
    total: 20000,
    estado: 'pendiente',
    repartidor: 'Sin asignar',
    repartidorRun: null,
    camion: null,
    ...extra,
  };
}

// Deja la copia local de datos (la "caché") lista para una prueba
export function prepararCache(tablas = {}) {
  vaciarTodo();
  reemplazarTabla('productos', tablas.productos || PRODUCTOS_SEMILLA);
  reemplazarTabla('categorias', tablas.categorias || CATEGORIAS_SEMILLA);
  reemplazarTabla('usuarios', tablas.usuarios || []);
  reemplazarTabla('ordenes', tablas.ordenes || []);
  reemplazarTabla('camiones', tablas.camiones || []);
}

// Evita llamadas HTTP reales: todas las listas del backend responden vacías
export function simularBackend() {
  [productosApi, categoriasApi, usuariosApi, camionesApi].forEach((api) => {
    ['listar', 'repartidores'].forEach((m) => { if (api[m]) spyOn(api, m).and.returnValue(Promise.resolve([])); });
  });
  ['todas', 'mias', 'misEntregas'].forEach((m) => spyOn(ordenesApi, m).and.returnValue(Promise.resolve([])));
  spyOn(authApi, 'yo').and.returnValue(Promise.reject(new Error('sin sesión')));
}

// Error como el que lanza Axios cuando el backend responde con un código HTTP
export const errorHttp = (status, mensaje) => ({ response: { status, data: { estado: status, mensaje } } });

// Renderiza con Router + sesión + carrito, igual que en la app real.
// sesion: el usuario "logueado" (así lo devuelve /auth/me); sin ella, visitante.
export function renderConApp(ui, { ruta = '/', sesion } = {}) {
  return render(
    <AuthProvider sesionInicial={sesion}>
      <CartProvider>
        <MemoryRouter initialEntries={[ruta]}>{ui}</MemoryRouter>
      </CartProvider>
    </AuthProvider>
  );
}
