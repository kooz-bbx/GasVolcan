import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Seccion from '../components/Seccion';
import ResumenCompra from '../components/ResumenCompra';
import CheckoutForm from '../components/CheckoutForm';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { obtenerOrden } from '../data/baseDatos';
import { buscarUsuarioPorCorreo } from '../services/usuarioService';
import {
  descontarStock, guardarOrdenCheckout, procesarPago, reintentarPago,
} from '../services/ordenService';

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

  if (detalle.length === 0) {
    return (
      <Seccion titulo="Carrito de compra" icono="bi-credit-card">
        <p>No tienes productos en el carrito. <Link to="/productos">Ver productos</Link>.</p>
      </Seccion>
    );
  }

  const pagar = (datos) => {
    const resultado = procesarPago(datos.pago);
    const estado = resultado.ok ? 'pendiente' : 'pago-fallido';
    const orden = ordenPrevia
      ? reintentarPago(ordenPrevia.numero, datos, estado)
      : guardarOrdenCheckout(datos, detalle, estado);
    if (resultado.ok) {
      descontarStock(detalle);
      vaciar();
      navigate(`/compra-exitosa/${orden.numero}`);
    } else {
      navigate(`/pago-error/${orden.numero}`, { state: { motivo: resultado.motivo } });
    }
  };

  return (
    <Seccion titulo="Carrito de compra" icono="bi-credit-card">
      <p>Completa la siguiente información</p>
      <ResumenCompra items={detalle} />
      <CheckoutForm valoresIniciales={valoresIniciales(sesion ? buscarUsuarioPorCorreo(sesion.correo) : null, ordenPrevia)} total={total} onPagar={pagar} />
    </Seccion>
  );
};

export default Checkout;
