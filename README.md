# Distribuidora de Gas El Volcán

Proyecto de **Desarrollo FullStack II (DSY1104)** — Evaluación Parcial 2.
Tienda de cilindros de gas con panel de administración y panel de vendedor/reparto.

**Equipo:** Benjamin Alegria, Nicolas Ortiz, Natalia Varela

## ¿Dónde está el proyecto en React?

La versión de la Evaluación Parcial 2 está en la carpeta **`gasvolcan-react/`**.
Los archivos `.html`, `css/`, `js/`, `admin/` y `vendedor/` de esta raíz son la versión anterior (HTML/JS) y se dejaron como respaldo.

## Cómo ejecutarlo

Requisitos: Node.js 18 o superior.

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
| Vendedor | vendedor@duoc.cl | vende123 |

Los clientes se crean desde **Crear Cuenta**.

## Tecnologías

React 18 · React Router · React Bootstrap / Bootstrap 5 · react-hook-form · Jasmine + Karma · localStorage (sin backend).

## Más información

- Detalle técnico y estructura de carpetas: `gasvolcan-react/README.md`
- Guía para la presentación: `docs/GUIA_PRESENTACION.md`
