// =========================================================
// DATOS.JS - Distribuidora de Gas El Volcan
// Arreglos de datos estaticos usados por funciones.js
// (catalogo de cilindros de gas y regiones/comunas). No hay base
// de datos: esto simula la informacion que vendria de un
// backend, tal como pide el enunciado ("crear un arreglo
// de productos... mostrar los productos del arreglo").
// =========================================================
//Simulacion de base de datos local
var PRODUCTOS = [
    {
        codigo: 'CL001',
        categoria: 'Cilindros de Gas',
        nombre: 'Cilindro GLP 5 kg',
        descripcion: 'Cilindro de gas licuado de petroleo 5 kg. Para uso residencial (cocina, calefaccion pequeña).',
        precio: 6500,
        stock: 80,
        stockCritico: 15,
        imagen: 'img/gas5.jpg'
    },
    {
        codigo: 'CL002',
        categoria: 'Cilindros de Gas',
        nombre: 'Cilindro GLP 11 kg',
        descripcion: 'Cilindro estandar domestico. El mas utilizado en hogares chilenos. Compatible con reguladores estandar.',
        precio: 12000,
        stock: 200,
        stockCritico: 30,
        imagen: 'img/gas11.jpg'
    },
    {
        codigo: 'CL003',
        categoria: 'Cilindros de Gas',
        nombre: 'Cilindro GLP 15 kg',
        descripcion: 'Cilindro de mayor capacidad para hogares de alto consumo o locales pequeños.',
        precio: 16000,
        stock: 90,
        stockCritico: 20,
        imagen: 'img/gas15.jpg'
    },
    {
        codigo: 'CL004',
        categoria: 'Cilindros de Gas',
        nombre: 'Cilindro GLP 45 kg',
        descripcion: 'Cilindro industrial. Uso comercial: restaurantes, talleres, calefaccion de locales.',
        precio: 45000,
        stock: 30,
        stockCritico: 5,
        imagen: 'img/gas45.jpg'
    }
];


// Regiones y comunas de ejemplo, usadas en Registro (tienda)
// y en Nuevo/Editar Usuario (administrador). Al elegir una
// region se filtran solo las comunas de esa region
var REGIONES = [
    {
        region: 'Región Metropolitana de Santiago',
        comunas: ['Santiago', 'Puente Alto', 'Maipú', 'Ñuñoa', 'La Florida']
    },
    {
        region: 'Región de Ñuble',
        comunas: ['Chillán', 'Chillán Viejo', 'San Carlos', 'Bulnes', 'Quillón']
    },
    {
        region: 'Región de la Araucanía',
        comunas: ['Temuco', 'Villarrica', 'Angol', 'Pucón']
    }
];


// Cuentas de prueba precargadas (semilla), para poder probar el
// login de Administrador y Vendedor sin tener que crearlas antes
// a mano. Se cargan una sola vez en localStorage si no hay usuarios.
var USUARIOS_SEMILLA = [
    {
        run: '111111111',
        nombre: 'Benjamín',
        apellidos: 'Alegria Rojas',
        correo: 'admin@duoc.cl',
        contrasena: 'admin123',
        region: 'Región de Ñuble',
        comuna: 'Chillán',
        direccion: 'Oficina Central 100, Chillán',
        tipoUsuario: 'Administrador'
    },
    {
        run: '222222222',
        nombre: 'Natalia',
        apellidos: 'Varela López',
        correo: 'vendedor@duoc.cl',
        contrasena: 'vende123',
        region: 'Región de Ñuble',
        comuna: 'Chillán',
        direccion: 'Sucursal Norte 200, Chillán',
        tipoUsuario: 'Vendedor'
    }
];


// =========================================================
// FUNCIONES DE AYUDA PARA EL CATALOGO
// =========================================================

// Busca un producto por su codigo. Devuelve el objeto o null.
function buscarProductoPorCodigo(codigo) {
    for (var i = 0; i < PRODUCTOS.length; i++) {
        if (PRODUCTOS[i].codigo === codigo) {
            return PRODUCTOS[i];
        }
    }
    return null;
}
