// Pruebas de COMPONENTE con formulario + SESIÓN con JWT (login, persistencia, restricción por rol)
import React from 'react';
import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';
import RutaProtegida from '../components/RutaProtegida';
import { renderConApp, simularBackend, errorHttp, ADMIN, OPERADORA, ENZO } from '../test-utils';
import { authApi } from '../api/gasVolcanApi';
import { guardarTokens, leerTokens } from '../api/http';

const Rutas = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/admin" element={<h1>Panel admin</h1>} />
    <Route path="/operadora" element={<h1>Panel operadora</h1>} />
    <Route path="/repartidor" element={<h1>Panel repartidor</h1>} />
  </Routes>
);

const respuestaLogin = (usuario) => ({
  accessToken: 'access-' + usuario.tipoUsuario, refreshToken: 'refresh-' + usuario.tipoUsuario,
  tipo: 'Bearer', usuario,
});

function iniciar(correo, contrasena) {
  fireEvent.change(screen.getByLabelText('Correo'), { target: { value: correo } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: contrasena } });
  fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
}

describe('Componente Login', () => {
  beforeEach(() => { localStorage.clear(); simularBackend(); });
  afterEach(() => cleanup());

  it('muestra errores de validación si el formulario se envía vacío', async () => {
    renderConApp(<Rutas />, { ruta: '/login' });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(await screen.findByText('El correo es obligatorio')).toBeTruthy();
    expect(screen.getByText('La contraseña es obligatoria')).toBeTruthy();
  });

  it('con credenciales incorrectas (401) muestra un mensaje y no guarda tokens', async () => {
    spyOn(authApi, 'login').and.returnValue(Promise.reject(errorHttp(401, 'Credenciales inválidas')));
    renderConApp(<Rutas />, { ruta: '/login' });
    iniciar('admin@duoc.cl', 'incorrecta');
    const alerta = await screen.findByRole('alert');
    expect(alerta.textContent).toMatch(/incorrectos/i);
    expect(leerTokens()).toBeNull();
  });

  it('el administrador entra a su panel y los tokens JWT quedan guardados', async () => {
    const login = spyOn(authApi, 'login').and.returnValue(Promise.resolve(respuestaLogin(ADMIN)));
    renderConApp(<Rutas />, { ruta: '/login' });
    iniciar('Admin@duoc.cl', 'admin123');
    expect(await screen.findByText('Panel admin')).toBeTruthy();
    expect(login).toHaveBeenCalledWith('admin@duoc.cl', 'admin123'); // el correo se envía en minúsculas
    expect(leerTokens()).toEqual({ accessToken: 'access-Administrador', refreshToken: 'refresh-Administrador' });
  });

  it('la operadora y el repartidor entran cada uno a su panel', async () => {
    spyOn(authApi, 'login').and.returnValues(
      Promise.resolve(respuestaLogin(OPERADORA)), Promise.resolve(respuestaLogin(ENZO)),
    );
    renderConApp(<Rutas />, { ruta: '/login' });
    iniciar('operadora@duoc.cl', 'opera123');
    expect(await screen.findByText('Panel operadora')).toBeTruthy();
    cleanup();

    localStorage.clear();
    renderConApp(<Rutas />, { ruta: '/login' });
    iniciar('repenzo@duoc.cl', 'reparte123');
    expect(await screen.findByText('Panel repartidor')).toBeTruthy();
  });
});

describe('Sesión persistente y restricción por rol', () => {
  beforeEach(() => { localStorage.clear(); simularBackend(); });
  afterEach(() => cleanup());

  const Protegidas = () => (
    <Routes>
      <Route path="/login" element={<h1>Pantalla de login</h1>} />
      <Route path="/admin" element={<RutaProtegida roles={['Administrador']}><h1>Panel admin</h1></RutaProtegida>} />
    </Routes>
  );

  it('sin sesión, una ruta protegida redirige al login', () => {
    renderConApp(<Protegidas />, { ruta: '/admin' });
    expect(screen.getByText('Pantalla de login')).toBeTruthy();
  });

  it('con otro rol (Repartidor) tampoco entra al panel de administrador', () => {
    renderConApp(<Protegidas />, { ruta: '/admin', sesion: ENZO });
    expect(screen.getByText('Pantalla de login')).toBeTruthy();
  });

  it('el administrador sí entra', () => {
    renderConApp(<Protegidas />, { ruta: '/admin', sesion: ADMIN });
    expect(screen.getByText('Panel admin')).toBeTruthy();
  });

  it('al recargar la página, los tokens guardados recuperan la sesión con GET /auth/me', async () => {
    guardarTokens({ accessToken: 'a', refreshToken: 'r' });
    authApi.yo.and.returnValue(Promise.resolve(ADMIN)); // simularBackend dejó el espía de "yo"
    renderConApp(<Protegidas />, { ruta: '/admin' }); // sin "sesion": se recupera desde los tokens
    expect(screen.queryByText('Pantalla de login')).toBeNull(); // mientras carga no manda al login
    await waitFor(() => expect(screen.getByText('Panel admin')).toBeTruthy());
    expect(authApi.yo).toHaveBeenCalled();
  });

  it('si el token ya no sirve (401), se borra y se pide iniciar sesión de nuevo', async () => {
    guardarTokens({ accessToken: 'vencido', refreshToken: 'vencido' });
    authApi.yo.and.returnValue(Promise.reject(errorHttp(401, 'Token inválido')));
    renderConApp(<Protegidas />, { ruta: '/admin' });
    await waitFor(() => expect(screen.getByText('Pantalla de login')).toBeTruthy());
    expect(leerTokens()).toBeNull();
  });
});
