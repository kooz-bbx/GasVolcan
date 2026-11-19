// Pruebas de COMPONENTE: cada cliente ve solo sus órdenes
import React from 'react';
import { screen, cleanup } from '@testing-library/react';
import Seguimiento from '../pages/Seguimiento';
import { renderConApp, prepararCache, ordenDePrueba } from '../test-utils';

const CLIENTE_A = { run: '1', correo: 'a@gmail.com', nombre: 'A', tipoUsuario: 'Cliente' };

describe('Página Seguimiento', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => cleanup());

  it('sin órdenes muestra el aviso de vacío', () => {
    prepararCache();
    renderConApp(<Seguimiento />);
    expect(screen.getByTestId('seguimiento-vacio')).toBeTruthy();
  });

  it('con sesión solo aparecen las órdenes de ese usuario', () => {
    prepararCache({
      ordenes: [
        ordenDePrueba('GV-1001', { propietario: 'a@gmail.com' }),
        ordenDePrueba('GV-2002', { propietario: 'b@gmail.com' }),
        ordenDePrueba('GV-3003', { propietario: 'invitado' }),
      ],
    });
    renderConApp(<Seguimiento />, { sesion: CLIENTE_A });
    expect(screen.getByText('GV-1001')).toBeTruthy();
    expect(screen.queryByText('GV-2002')).toBeNull();
    expect(screen.queryByText('GV-3003')).toBeNull();
  });

  it('sin sesión solo aparecen las órdenes hechas como invitado', () => {
    prepararCache({
      ordenes: [ordenDePrueba('GV-1001', { propietario: 'a@gmail.com' }), ordenDePrueba('GV-3003')],
    });
    renderConApp(<Seguimiento />);
    expect(screen.getByText('GV-3003')).toBeTruthy();
    expect(screen.queryByText('GV-1001')).toBeNull();
  });
});
