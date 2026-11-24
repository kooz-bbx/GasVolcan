# Distribuidora de Gas El Volcán — Frontend (React)

**Equipo:** Benjamin Alegria, Nicolas Ortiz, Natalia Varela
Evaluación Parcial 3 · DSY1104 Desarrollo FullStack II

## ¿Dónde está el proyecto en React?

La versión actual está en la carpeta **`gasvolcan-react/`** y se conecta al backend Spring Boot (repo `GasVolcan-backend`).
Los archivos `.html`, `css/`, `js/`, `admin/` y `vendedor/` de esta raíz son la versión anterior (HTML/JS) y se dejaron como respaldo.
La versión de la Evaluación Parcial 2 quedó guardada en el release `parcial2`.

## Cómo ejecutarlo

Requisitos: Node.js 18 o superior y el backend corriendo en `http://localhost:8080` (MySQL encendido).

```bash
cd gasvolcan-react
npm install       # una sola vez
npm start         # abre la tienda en http://localhost:3000
npm test          # pruebas unitarias (Jasmine + Karma) con cobertura
```

El informe de cobertura queda en `gasvolcan-react/coverage/html/index.html`.

## Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@duoc.cl | admin123 |
| Operadora | operadora@duoc.cl | opera123 |
| Repartidor | repenzo@duoc.cl | reparte123 |

Los clientes se crean desde **Crear Cuenta**.

## Tecnologías

React 18 · React Router · React Bootstrap / Bootstrap 5 · react-hook-form · Axios (JWT con renovación automática) · Jasmine + Karma.

## Más información

- Detalle técnico y estructura de carpetas: `gasvolcan-react/README.md`
- Documentación y guía de presentación: carpeta `docs/`
