import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Seccion from '../components/Seccion';

const EQUIPO = [
  { numero: '2', titulo: 'Camiones', detalle: 'De reparto activo' },
  { numero: '3', titulo: 'Repartidores', detalle: 'Entregando a domicilio' },
  { numero: '1', titulo: 'Operadora', detalle: 'Recibe y asigna pedidos' },
  { numero: '1', titulo: 'Administradora', detalle: 'Controla stock y contabilidad' },
];

const Nosotros = () => (
  <>
    <Seccion titulo="Sobre Nosotros" icono="bi-building">
      <p>
        Distribuidora de Gas El Volcán es una empresa familiar ubicada en <strong>Chillán, Región de
        Ñuble</strong>, fundada en <strong>1998</strong>. Distribuimos cilindros de gas licuado a domicilio,
        a clientes residenciales y comerciales en Chillán y comunas aledañas.
      </p>
      <div className="destacado">🚚 Entre 80 y 120 pedidos entregados cada día</div>
    </Seccion>

    <Seccion titulo="Nuestro Equipo" icono="bi-people">
      <Row>
        {EQUIPO.map((e) => (
          <Col key={e.titulo} md={3} sm={6} className="mb-3">
            <div className="actor-card text-center">
              <h5>{e.numero} {e.titulo}</h5>
              <p className="mb-0">{e.detalle}</p>
            </div>
          </Col>
        ))}
      </Row>
    </Seccion>

    <Seccion titulo="Nuestra Misión" icono="bi-bullseye">
      <p>
        Entregar gas licuado de forma rápida, segura y a precio justo, acompañando a cada cliente con
        información clara sobre el uso correcto de los cilindros de gas.
      </p>
    </Seccion>
  </>
);

export default Nosotros;
