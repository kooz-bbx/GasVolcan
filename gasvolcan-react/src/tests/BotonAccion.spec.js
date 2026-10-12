// Pruebas de COMPONENTE: props (etiqueta, onClick) y eventos
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import BotonAccion from '../components/BotonAccion';

describe('Componente BotonAccion', () => {
  afterEach(() => cleanup());

  it('props: muestra la etiqueta recibida', () => {
    render(<BotonAccion etiqueta="Guardar" onClick={() => {}} />);
    expect(screen.getByRole('button', { name: /guardar/i })).toBeTruthy();
  });

  it('evento: al hacer click llama a onClick (mock con spy)', () => {
    const onClick = jasmine.createSpy('onClick');
    render(<BotonAccion etiqueta="Guardar" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('props: deshabilitado no dispara onClick', () => {
    const onClick = jasmine.createSpy('onClick');
    render(<BotonAccion etiqueta="Guardar" onClick={onClick} deshabilitado />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
