// Pruebas de COMPONENTE: estado de un formulario controlado y envío
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import BarraBusqueda from '../components/BarraBusqueda';

describe('Componente BarraBusqueda', () => {
  afterEach(() => cleanup());

  it('estado: al escribir, el valor del input cambia', () => {
    render(<BarraBusqueda onBuscar={() => {}} />);
    const input = screen.getByLabelText('Buscar productos');
    fireEvent.change(input, { target: { value: 'cilindro 11' } });
    expect(input.value).toBe('cilindro 11');
  });

  it('evento: al enviar llama a onBuscar con el texto escrito', () => {
    const onBuscar = jasmine.createSpy('onBuscar');
    render(<BarraBusqueda onBuscar={onBuscar} />);
    fireEvent.change(screen.getByLabelText('Buscar productos'), { target: { value: ' 45 kg ' } });
    fireEvent.click(screen.getByRole('button', { name: /buscar/i }));
    expect(onBuscar).toHaveBeenCalledWith('45 kg');
  });
});
