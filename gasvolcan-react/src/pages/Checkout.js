import React, { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Seccion from '../components/Seccion';
import ResumenCompra from '../components/ResumenCompra';
import CheckoutForm from '../components/CheckoutForm';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { obtenerOrden } from '../data/baseDatos';
import { mensajeDeError } from '../api/http';
import { pagarCompra, reintentarPago } from '../services/ordenService';

// Valores del formulario: si hay sesión se rellenan con los datos del usuario
export function valoresIniciales(sesion, orden) {
  if (orden) {
    return {
      nombre: orden.cliente.nombre, apellidos: orden.cliente.apellidos, correo: orden.cliente.correo,
      calle: orden.entrega.calle, departamento: orden.entrega.departamento || '',
      region: orden.entrega.region, comuna: orden.entrega.comuna, indicaciones: orden.entrega.indicaciones || '',
      tipoEntrega: orden.entrega.tipo, metodo: orden.pago.metodo, numeroTarjeta: '',
    };
  }
  return {
    nombre: sesion ? sesion.nombre : '',
    apellidos: sesion ? sesion.apellidos : '',
    correo: sesion ? sesion.correo : '',
    calle: sesion ? sesion.direccion : '',
    departamento: '',
    region: sesion ? sesion.region : '',
    comuna: sesion ? sesion.comuna : '',
    indicaciones: '',
    tipoEntrega: 'domicilio',
    metodo: 'efectivo',
    numeroTarjeta: '',
  };
}

const Checkout = () => {
  const { sesion } = useAuth();
  const { detalle, total, vaciar } = useCart();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const numeroReintento = params.get('reintentar');
  const ordenPrevia = numeroReintento ? obtenerOrden(numeroReintento) : null;
  const [error, setError] = useState('');

  if (detalle.length === 0) {
    return (
      <Seccion titulo="Carrito de compra" icono="bi-credit-card">
        <p>No tienes productos en el carrito. <Link to="/productos">Ver productos</Link>.</p>
      </Seccion>
    );
  }

  // El backend calcula los precios, descuenta el stock y procesa el pago simulado.
  // Responde la orden con estado 'pendiente' (pago aprobado) o 'pago-fallido'.
  const pagar = async (datos) => {
    try {
      const orden = ordenPrevia
        ? await reintentarPago(ordenPrevia.numero, datos)
        : await pagarCompra(datos, detalle);
      setError('');
      if (orden.estado === 'pago-fallido') {
        navigate(`/pago-error/${orden.numero}`, { state: { motivo: orden.motivoPago } });
      } else {
        vaciar();
        navigate(`/compra-exitosa/${orden.numero}`);
      }
    } catch (e) {
      setError(mensajeDeError(e));
    }
  };

  return (
    <Seccion titulo="Carrito de compra" icono="bi-credit-card">
      <p>Completa la siguiente información</p>
      <ResumenCompra items={detalle} />
      {error && <Alert variant="danger" role="alert">{error}</Alert>}
      <CheckoutForm valoresIniciales={valoresIniciales(sesion, ordenPrevia)} total={total} onPagar={pagar} />
    </Seccion>
  );
};

export default Checkout;
