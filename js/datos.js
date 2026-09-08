// =========================================================
// DATOS.JS - Distribuidora de Gas El Volcan
// Arreglos de datos estaticos usados por funciones.js
// (catalogo de productos y regiones/comunas). No hay base
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
    },
    {
        codigo: 'RG001',
        categoria: 'Reguladores',
        nombre: 'Regulador domestico estandar',
        descripcion: 'Regulador de 1 etapa para cilindros 5, 11 y 15 kg. Presion de salida 28 mbar.',
        precio: 8990,
        stock: 45,
        stockCritico: 10,
        imagen: 'img/regulador.webp'
    },
    {
        codigo: 'RG002',
        categoria: 'Reguladores',
        nombre: 'Regulador de alta presion',
        descripcion: 'Regulador para cocinas industriales o equipos de mayor consumo. Presion regulable.',
        precio: 18990,
        stock: 12,
        stockCritico: 5,
        imagen: 'img/regulador.altapresion.webp'
    },
    {
        codigo: 'RG003',
        categoria: 'Reguladores',
        nombre: 'Regulador dual (2 salidas)',
        descripcion: 'Permite conectar dos artefactos simultaneamente al mismo cilindro.',
        precio: 14990,
        stock: 18,
        stockCritico: 5,
        imagen: 'img/regulador.dual.webp'
    },
    {
        codigo: 'MG001',
        categoria: 'Mangueras y Conexiones',
        nombre: 'Manguera gas 1.5 m',
        descripcion: 'Manguera flexible homologada. Dimetro interior 9mm. Compatible con reguladores estandar.',
        precio: 3990,
        stock: 80,
        stockCritico: 15,
        imagen: 'img/manguera-gas-1.5m.jpg'
    },
    {
        codigo: 'MG002',
        categoria: 'Mangueras y Conexiones',
        nombre: 'Manguera gas 3 m',
        descripcion: 'Manguera larga para instalaciones donde el artefacto esta alejado del cilindro.',
        precio: 6990,
        stock: 50,
        stockCritico: 10,
        imagen: 'img/mangera3metros.webp'
    },
    {
        codigo: 'MG003',
        categoria: 'Mangueras y Conexiones',
        nombre: 'Abrazadera metalica',
        descripcion: 'Abrazadera de acero para asegurar la conexion manguera-regulador y manguera-artefacto.',
        precio: 990,
        stock: 200,
        stockCritico: 40,
        imagen: 'img/abrazadera.webp'
    },
    {
        codigo: 'MG004',
        categoria: 'Mangueras y Conexiones',
        nombre: 'Kit conexion completo',
        descripcion: 'Todo lo necesario para instalar un cilindro nuevo: regulador + manguera 1.5m + abrazaderas.',
        precio: 12990,
        stock: 25,
        stockCritico: 5,
        imagen: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500'
    },
    {
        codigo: 'AC001',
        categoria: 'Accesorios',
        nombre: 'Carro porta cilindro 11/15 kg',
        descripcion: 'Carro metalico con ruedas para transportar cilindros dentro del hogar con seguridad.',
        precio: 12990,
        stock: 20,
        stockCritico: 5,
        imagen: 'https://images.unsplash.com/photo-1764231502962-a246b3fca4e3?w=500'
    },
    {
        codigo: 'AC002',
        categoria: 'Accesorios',
        nombre: 'Tapa protectora para vavula',
        descripcion: 'Tapa de plástico ABS para proteger la valvula del cilindro durante el transporte.',
        precio: 1490,
        stock: 60,
        stockCritico: 15,
        imagen: 'https://images.unsplash.com/photo-1711114474566-7507ed4d6716?w=500'
    },
    {
        codigo: 'AC003',
        categoria: 'Accesorios',
        nombre: 'Detector de gas a bateria',
        descripcion: 'Sensor electroquímico. Alarma sonora y visual ante fuga de gas GLP o metano.',
        precio: 19990,
        stock: 8,
        stockCritico: 10,
        imagen: 'https://images.unsplash.com/photo-1585367437379-e0b71bb18156?w=500'
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
