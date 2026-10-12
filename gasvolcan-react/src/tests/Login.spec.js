// Pruebas de COMPONENTE con formulario (react-hook-form), estado y navegación
import React from 'react';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';
import { renderConApp } from '../test-utils';
import { obtenerSesion } from '../services/usuarioService';

const Rutas = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/admin" element={<h1>Panel admin</h1>} />
    <Route path="/vendedor" element={<h1>Panel vendedor</h1>} />
  </Routes>
);

function iniciar(correo, contrasena) {
  fireEvent.change(screen.getByLabelText('Correo'), { target: { value: correo } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: contrasena } });
  fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
}

describe('Componente Login', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => cleanup());

  it('muestra errores de validación si el formulario se envía vacío', async () => {
    renderConApp(<Rutas />, { ruta: '/login' });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(await screen.findByText('El correo es obligatorio')).toBeTruthy();
    expect(screen.getByText('La contraseña es obligatoria')).toBeTruthy();
  });

  it('con credenciales incorrectas muestra un mensaje y no crea sesión', async () => {
    renderConApp(<Rutas />, { ruta: '/login' });
    iniciar('admin@duoc.cl', 'incorrecta');
    const alerta = await screen.findByRole('alert');
    expect(alerta.textContent).toMatch(/incorrectos/i);
    expect(obtenerSesion()).toBeNull();
  });

  it('el administrador entra a su panel y queda la sesión guardada', async () => {
    renderConApp(<Rutas />, { ruta: '/login' });
    iniciar('admin@duoc.cl', 'admin123');
    expect(await screen.findByText('Panel admin')).toBeTruthy();
    expect(obtenerSesion().tipoUsuario).toBe('Administrador');
  });
});
