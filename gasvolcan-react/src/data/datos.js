// =========================================================
// datos.js - Distribuidora de Gas El Volcán
// Datos iniciales (semillas) y constantes de la aplicación.
// Las semillas se copian a localStorage la primera vez (ver
// baseDatos.js); desde ahí se leen y modifican con el CRUD.
// =========================================================

export const CATEGORIAS_SEMILLA = [
  {
    id: 'residencial',
    nombre: 'Uso Residencial',
    descripcion: 'Cilindros para cocina y calefacción del hogar.',
  },
  {
    id: 'comercial',
    nombre: 'Uso Comercial e Industrial',
    descripcion: 'Cilindros de gran capacidad para restaurantes, talleres y locales.',
  },
];

export const PRODUCTOS_SEMILLA = [
  {
    codigo: 'CL001',
    categoriaId: 'residencial',
    nombre: 'Cilindro GLP 5 kg',
    descripcion:
      'Cilindro de gas licuado de petróleo 5 kg. Para uso residencial (cocina, calefacción pequeña).',
    precio: 6500,
    descuento: 10,
    stock: 80,
    stockCritico: 15,
    imagen: 'img/gas5.jpg',
  },
  {
    codigo: 'CL002',
    categoriaId: 'residencial',
    nombre: 'Cilindro GLP 11 kg',
    descripcion:
      'Cilindro estándar doméstico. El más utilizado en hogares chilenos. Compatible con reguladores estándar.',
    precio: 12000,
    descuento: 0,
    stock: 200,
    stockCritico: 30,
    imagen: 'img/gas11.jpg',
  },
  {
    codigo: 'CL003',
    categoriaId: 'residencial',
    nombre: 'Cilindro GLP 15 kg',
    descripcion:
      'Cilindro de mayor capacidad para hogares de alto consumo o locales pequeños.',
    precio: 16000,
    descuento: 15,
    stock: 90,
    stockCritico: 20,
    imagen: 'img/gas15.jpg',
  },
  {
    codigo: 'CL004',
    categoriaId: 'comercial',
    nombre: 'Cilindro GLP 45 kg',
    descripcion:
      'Cilindro industrial. Uso comercial: restaurantes, talleres, calefacción de locales.',
    precio: 45000,
    descuento: 0,
    stock: 30,
    stockCritico: 5,
    imagen: 'img/gas45.jpg',
  },
];

// Cuentas de prueba precargadas (administrador y vendedor)
export const USUARIOS_SEMILLA = [
  {
    run: '111111111',
    nombre: 'Benjamín',
    apellidos: 'Alegria Rojas',
    correo: 'admin@duoc.cl',
    contrasena: 'admin123',
    region: 'Región de Ñuble',
    comuna: 'Chillán',
    direccion: 'Oficina Central 100, Chillán',
    tipoUsuario: 'Administrador',
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
    tipoUsuario: 'Vendedor',
  },
];

// Precios por tipo de cilindro (CLP) del formulario de "Pedido Rápido"
export const PRECIOS_CILINDRO = { '5kg': 14000, '11kg': 20000, '15kg': 31000 };

// Dominios de correo permitidos (regla de negocio de la rúbrica)
export const DOMINIOS_PERMITIDOS = ['duoc.cl', 'profesor.duoc.cl', 'gmail.com'];

export const REGIONES = [
  {
    region: 'Región Metropolitana de Santiago',
    comunas: ['Santiago', 'Puente Alto', 'Maipú', 'Ñuñoa', 'La Florida'],
  },
  {
    region: 'Región de Ñuble',
    comunas: ['Chillán', 'Chillán Viejo', 'San Carlos', 'Bulnes', 'Quillón'],
  },
  {
    region: 'Región de la Araucanía',
    comunas: ['Temuco', 'Villarrica', 'Angol', 'Pucón'],
  },
];

export const ROLES = ['Cliente', 'Vendedor', 'Administrador'];

export const ETIQUETAS_ESTADO = {
  pendiente: 'Pendiente',
  'en-camino': 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  'pago-fallido': 'Pago fallido',
};

export const OPCIONES_ENTREGA = [
  { valor: 'domicilio', etiqueta: 'Despacho a domicilio' },
  { valor: 'retiro', etiqueta: 'Retiro en sucursal (Chillán)' },
];

export const METODOS_PAGO = [
  { valor: 'efectivo', etiqueta: 'Efectivo al momento de la entrega' },
  { valor: 'tarjeta', etiqueta: 'Tarjeta (pago simulado)' },
];

export const BLOGS = [
  {
    id: 1,
    titulo: '¿Cómo detectar una fuga de gas a tiempo?',
    resumen:
      'El olor característico del gas licuado en realidad es un aditivo (mercaptano) que se agrega a propósito, ya que el GLP puro es inodoro. Aprende a identificarlo antes de que sea un problema.',
    intro:
      'El gas licuado de petróleo (GLP) es, en su estado natural, inodoro. Por seguridad, los fabricantes le agregan un compuesto llamado mercaptano, que le da ese olor característico a "huevo podrido", precisamente para que cualquier persona pueda detectar una fuga de inmediato.',
    secciones: [
      {
        titulo: 'Señales de una posible fuga',
        items: [
          'Olor a gas persistente, incluso con la llave cerrada.',
          'Sonido de silbido cerca del cilindro, manguera o regulador.',
          'Llama de la cocina de color amarillo o anaranjado en vez de azul.',
          'Plantas cercanas al cilindro que se marchitan sin razón aparente.',
        ],
      },
      {
        titulo: 'Qué hacer si sospechas una fuga',
        items: [
          'Cierra inmediatamente la llave de paso del cilindro.',
          'Ventila el espacio abriendo puertas y ventanas.',
          'No enciendas interruptores eléctricos ni fósforos.',
          'Sal del lugar y llama a un técnico certificado.',
        ],
      },
    ],
    cierre: 'Si tienes dudas sobre el estado de tu cilindro, contáctanos y te orientamos.',
  },
  {
    id: 2,
    titulo: '¿Por qué el cilindro se "escarcha" cuando hace frío?',
    resumen:
      'Es normal ver escarcha en el cilindro en días fríos o con alto consumo: es un efecto físico de la evaporación del gas, no una fuga. Te contamos cuándo sí debe preocuparte.',
    intro:
      'Es común ver escarcha o hielo formándose en el cuerpo de un cilindro de gas, especialmente en días fríos o cuando el consumo es alto (por ejemplo, con calefactores grandes). Esto no es una fuga: es un fenómeno físico normal.',
    secciones: [
      {
        titulo: '¿Por qué pasa esto?',
        texto:
          'Al salir del cilindro, el gas líquido se evapora para convertirse en gas utilizable. Ese cambio de estado absorbe calor del metal del cilindro, enfriándolo. Si el ambiente tiene humedad, esa humedad se congela en la superficie fría, formando escarcha.',
      },
      {
        titulo: '¿Cuándo sí debe preocuparme?',
        items: [
          'Si además de escarcha hay olor a gas fuerte y persistente.',
          'Si el cilindro tiene abolladuras, óxido excesivo o corrosión visible.',
          'Si la válvula gotea o no cierra completamente.',
        ],
      },
    ],
    cierre:
      'En esos casos, corta el suministro y contáctanos por nuestro formulario de contacto para coordinar un cambio o revisión.',
  },
];
