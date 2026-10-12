// Pruebas de COMPONENTE: cada cliente ve solo sus órdenes
import React from 'react';
import { screen, cleanup } from '@testing-library/react';
import Seguimiento from '../pages/Seguimiento';
import { renderConApp, iniciarSesionDePrueba } from '../test-utils';
import { crearOrdenRapida } from '../services/ordenService';

describe('Página Seguimiento', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => cleanup());

  it('sin órdenes muestra el aviso de vacío', () => {
    renderConApp(<Seguimiento />);
    expect(screen.getByTestId('seguimiento-vacio')).toBeTruthy();
  });

  it('solo aparecen las órdenes del usuario con sesión', () => {
    iniciarSesionDePrueba({ correo: 'a@gmail.com', nombre: 'A', tipoUsuario: 'Cliente' });
    crearOrdenRapida({ nombre: 'A', direccion: 'x', tipoCilindro: '5kg', cantidad: '1' }, 'GV-1001');
    iniciarSesionDePrueba({ correo: 'b@gmail.com', nombre: 'B', tipoUsuario: 'Cliente' });
    crearOrdenRapida({ nombre: 'B', direccion: 'y', tipoCilindro: '5kg', cantidad: '1' }, 'GV-2002');
    iniciarSesionDePrueba({ correo: 'a@gmail.com', nombre: 'A', tipoUsuario: 'Cliente' });
    renderConApp(<Seguimiento />);
    expect(screen.getByText('GV-1001')).toBeTruthy();
    expect(screen.queryByText('GV-2002')).toBeNull();
  });
});
