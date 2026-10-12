import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import RutaProtegida from './components/RutaProtegida';
import AdminLayout from './components/AdminLayout';

import Inicio from './pages/Inicio';
import Productos from './pages/Productos';
import DetalleProducto from './pages/DetalleProducto';
import Categorias from './pages/Categorias';
import CategoriaDetalle from './pages/CategoriaDetalle';
import Ofertas from './pages/Ofertas';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import CompraExitosa from './pages/CompraExitosa';
import PagoError from './pages/PagoError';
import Pedido from './pages/Pedido';
import Seguimiento from './pages/Seguimiento';
import Nosotros from './pages/Nosotros';
import Blogs from './pages/Blogs';
import BlogDetalle from './pages/BlogDetalle';
import Contacto from './pages/Contacto';
import Login from './pages/Login';
import Registro from './pages/Registro';
import NoEncontrado from './pages/NoEncontrado';

// Paneles de Administrador y Vendedor: carga diferida (lazy + Suspense)
const AdminHome = lazy(() => import('./pages/admin/AdminHome'));
const AdminOrdenes = lazy(() => import('./pages/admin/AdminOrdenes'));
const AdminOrdenBoleta = lazy(() => import('./pages/admin/AdminOrdenBoleta'));
const AdminProductos = lazy(() => import('./pages/admin/AdminProductos'));
const AdminProductoDetalle = lazy(() => import('./pages/admin/AdminProductoDetalle'));
const AdminProductoForm = lazy(() => import('./pages/admin/AdminProductoForm'));
const AdminCriticos = lazy(() => import('./pages/admin/AdminCriticos'));
const AdminCategorias = lazy(() => import('./pages/admin/AdminCategorias'));
const AdminCategoriaForm = lazy(() => import('./pages/admin/AdminCategoriaForm'));
const AdminUsuarios = lazy(() => import('./pages/admin/AdminUsuarios'));
const AdminUsuarioDetalle = lazy(() => import('./pages/admin/AdminUsuarioDetalle'));
const AdminUsuarioForm = lazy(() => import('./pages/admin/AdminUsuarioForm'));
const AdminUsuarioHistorial = lazy(() => import('./pages/admin/AdminUsuarioHistorial'));
const AdminReportes = lazy(() => import('./pages/admin/AdminReportes'));
const AdminPerfil = lazy(() => import('./pages/admin/AdminPerfil'));
const VendedorHome = lazy(() => import('./pages/vendedor/VendedorHome'));
const VendedorProductos = lazy(() => import('./pages/vendedor/VendedorProductos'));
const VendedorProductoDetalle = lazy(() => import('./pages/vendedor/VendedorProductoDetalle'));
const VendedorPedidos = lazy(() => import('./pages/vendedor/VendedorPedidos'));
const VendedorPedidoDetalle = lazy(() => import('./pages/vendedor/VendedorPedidoDetalle'));

const vendedorOAdmin = (elemento) => (
  <RutaProtegida roles={['Vendedor', 'Administrador']}>{elemento}</RutaProtegida>
);

// Diseño de la tienda: header + contenido + footer
const TiendaLayout = () => (
  <>
    <Navigation />
    <Container className="gv-contenedor">
      <Outlet />
    </Container>
    <Footer />
  </>
);

export function AppRoutes() {
  return (
    <Suspense fallback={<p className="text-center my-5">Cargando...</p>}>
      <Routes>
        <Route element={<TiendaLayout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:codigo" element={<DetalleProducto />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/categorias/:id" element={<CategoriaDetalle />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/compra-exitosa/:numero" element={<CompraExitosa />} />
          <Route path="/pago-error/:numero" element={<PagoError />} />
          <Route path="/pedido" element={<Pedido />} />
          <Route path="/seguimiento" element={<Seguimiento />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogDetalle />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route path="/vendedor" element={vendedorOAdmin(<VendedorHome />)} />
          <Route path="/vendedor/productos" element={vendedorOAdmin(<VendedorProductos />)} />
          <Route path="/vendedor/productos/:codigo" element={vendedorOAdmin(<VendedorProductoDetalle />)} />
          <Route path="/vendedor/pedidos" element={vendedorOAdmin(<VendedorPedidos />)} />
          <Route path="/vendedor/pedidos/:numero" element={vendedorOAdmin(<VendedorPedidoDetalle />)} />

          <Route path="*" element={<NoEncontrado />} />
        </Route>

        {/* Panel de administración: barra lateral propia, solo Administrador */}
        <Route
          path="/admin"
          element={<RutaProtegida roles={['Administrador']}><AdminLayout /></RutaProtegida>}
        >
          <Route index element={<AdminHome />} />
          <Route path="ordenes" element={<AdminOrdenes />} />
          <Route path="ordenes/:numero" element={<AdminOrdenBoleta />} />
          <Route path="productos" element={<AdminProductos />} />
          <Route path="productos/nuevo" element={<AdminProductoForm />} />
          <Route path="productos/:codigo" element={<AdminProductoDetalle />} />
          <Route path="productos/:codigo/editar" element={<AdminProductoForm />} />
          <Route path="criticos" element={<AdminCriticos />} />
          <Route path="categorias" element={<AdminCategorias />} />
          <Route path="categorias/nueva" element={<AdminCategoriaForm />} />
          <Route path="categorias/:id/editar" element={<AdminCategoriaForm />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="usuarios/nuevo" element={<AdminUsuarioForm />} />
          <Route path="usuarios/:run" element={<AdminUsuarioDetalle />} />
          <Route path="usuarios/:run/editar" element={<AdminUsuarioForm />} />
          <Route path="usuarios/:run/historial" element={<AdminUsuarioHistorial />} />
          <Route path="reportes" element={<AdminReportes />} />
          <Route path="perfil" element={<AdminPerfil />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
