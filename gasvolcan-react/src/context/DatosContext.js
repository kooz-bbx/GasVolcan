// =========================================================
// DatosProvider - Carga los datos desde el backend y los mantiene al día.
//
//  - Al abrir la app descarga productos y categorías (públicos) y las tablas del rol
//    (órdenes, usuarios, camiones...). Mientras tanto muestra "Cargando...".
//    Si el backend no responde, muestra el error con un botón para reintentar.
//  - Se vuelve a sincronizar al cambiar de usuario y en cada cambio de página, para que
//    cada panel (ej. la operadora) vea los pedidos nuevos.
//  - Si los datos cambiaron, se vuelve a dibujar la pantalla con los datos nuevos.
// =========================================================
import React, {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import { Alert, Button, Container } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { mensajeDeError } from '../api/http';
import { sincronizar } from '../data/baseDatos';
import { useAuth } from './AuthContext';

const DatosContext = createContext(null);

export function DatosProvider({ children }) {
  const { sesion, cargando } = useAuth();
  const { pathname } = useLocation();
  const tipo = sesion ? sesion.tipoUsuario : null;

  const [listo, setListo] = useState(false);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const pedido = useRef(0); // para ignorar respuestas viejas si llegan fuera de orden

  const recargar = useCallback(async () => {
    const numero = ++pedido.current;
    try {
      const cambio = await sincronizar(tipo);
      if (numero !== pedido.current) return;
      setError('');
      setListo(true);
      if (cambio) setVersion((v) => v + 1);
    } catch (e) {
      if (numero !== pedido.current) return;
      // Si ya había datos, se sigue trabajando con la copia; si es la primera carga, se muestra el error
      setError(mensajeDeError(e));
    }
  }, [tipo]);

  useEffect(() => {
    if (cargando) return;
    recargar();
  }, [cargando, recargar, pathname]);

  if (!listo) {
    return (
      <Container className="text-center my-5">
        {error ? (
          <Alert variant="danger" className="d-inline-block text-start">
            <Alert.Heading>No se pudieron cargar los datos</Alert.Heading>
            <p className="mb-2">{error}</p>
            <Button variant="outline-danger" size="sm" onClick={recargar}>Reintentar</Button>
          </Alert>
        ) : (
          <p>Cargando...</p>
        )}
      </Container>
    );
  }

  return (
    <DatosContext.Provider value={{ recargar }}>
      <React.Fragment key={version}>{children}</React.Fragment>
    </DatosContext.Provider>
  );
}

export function useDatos() {
  return useContext(DatosContext) || { recargar: async () => {} };
}
