import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CLAVES, guardarJSON } from './data/almacenamiento';

// Deja una sesión iniciada en localStorage (antes de renderizar)
export function iniciarSesionDePrueba(sesion) {
  guardarJSON(CLAVES.sesion, sesion);
}

// Renderiza con Router + sesión + carrito, igual que en la app real
export function renderConApp(ui, { ruta = '/' } = {}) {
  return render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter initialEntries={[ruta]}>{ui}</MemoryRouter>
      </CartProvider>
    </AuthProvider>
  );
}
