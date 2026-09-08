// =========================================================
// funciones.js - Distribuidora de Gas El Volcan
// Validaciones y logica del sitio, sin backend (todo en localStorage)
// =========================================================

// ----- CLAVES DE LOCALSTORAGE -----
var CLAVE_PEDIDOS = 'gv_pedidos';
var CLAVE_CARRITO = 'gv_carrito';
var CLAVE_USUARIOS = 'gv_usuarios';

// Precios por tipo de cilindro (CLP) del formulario de "Pedido Rapido"
var PRECIOS_CILINDRO = {
    '5kg': 14000,
    '11kg': 20000,
    '15kg': 31000
};

// Dominios de correo permitidos (regla de negocio de la rubricaa)
var DOMINIOS_PERMITIDOS = ['duoc.cl', 'profesor.duoc.cl', 'gmail.com'];


// =========================================================
// UTILIDADES DE TEXTO Y FORMATO
// =========================================================

// Capitaliza cada palabra de un texto: "benjamin alegria" -> "Benjamin Alegria"
function capitalizarTexto(texto) {
    if (!texto) {
        return texto;
    }
    return texto.toLowerCase().replace(/(^|[\s,.-])([a-záéíóúñ])/g, function (coincidencia, separador, letra) {
        return separador + letra.toUpperCase();
    });
}

// Formatea un numero como pesos chilenos: 31000 -> "31.000"
function formatearCLP(monto) {
    return monto.toLocaleString('es-CL');
}


// =========================================================
// VALIDACION DE RUN CHILENO
// Calcula el digito verificador (modulo 11) y lo compara
// =========================================================

function validarRun(runCompleto) {
    var run = runCompleto.replace(/[^0-9kK]/g, ''); // por si acaso llegan puntos/guion

    if (run.length < 7 || run.length > 9) {
        return false;
    }

    var cuerpo = run.slice(0, -1);
    var dv = run.slice(-1).toUpperCase();

    var suma = 0;
    var multiplo = 2;

    for (var i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
        multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }

    var resto = 11 - (suma % 11);
    var dvEsperado;
    if (resto === 11) {
        dvEsperado = '0';
    } else if (resto === 10) {
        dvEsperado = 'K';
    } else {
        dvEsperado = String(resto);
    }

    return dv === dvEsperado;
} // fin function validarRun


// limita el telefono mientras se escribe: el prefijo "+56 9"
// queda fijo, el usuario solo escribe los 8 digitos restantes
function limitarTelefono(campo) {
    var prefijo = '+56 9';
    var valor = campo.value;

    // si el usuario borro o rompio el prefijo, lo recuperamos
    if (valor.indexOf(prefijo) !== 0) {
        var digitos = valor.replace(/\D/g, '');
        // sacamos el "56" y el primer "9" si quedaron sueltos
        digitos = digitos.replace(/^56/, '').replace(/^9/, '');
        campo.value = prefijo + digitos.slice(0, 8);
        return;
    }

    var resto = valor.slice(prefijo.length).replace(/\D/g, '');
    if (resto.length > 8) {
        resto = resto.slice(0, 8);
    }
    campo.value = prefijo + resto;
} // fin function limitarTelefono


// corrige la fecha de nacimiento si el usuario escribe un año
// fuera de rango (el navegador a veces deja pasar años raros)
function corregirFechaNacimiento(campo) {
    if (!campo.value) {
        return;
    }
    var anio = new Date(campo.value).getFullYear();
    if (anio > 2005) {
        campo.value = '2005-12-31';
    } else if (anio < 1900) {
        campo.value = '1900-01-01';
    }
} // fin function corregirFechaNacimiento


// =========================================================
// VALIDACION DE FORMATO POR CAMPO
// Devuelve un mensaje de error, o null si el campo esta OK.
// =========================================================

function obtenerErrorDeFormato(campo) {

    var valor = campo.value.trim();

    // ----- TELEFONO CHILENO -----
    if (campo.id === 'telefono') {
        var soloNumeros = valor.replace(/[\s-]/g, '');
        var patronTelefono = /^(\+?56)?9\d{8}$/;
        if (!patronTelefono.test(soloNumeros)) {
            return 'Teléfono: usa el formato +56 9 XXXX XXXX (9 dígitos, empezando con 9)';
        }
    }

    // ----- CORREO ELECTRONICO (formato + dominio permitido) -----
    if (campo.type === 'email') {
        var patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!patronCorreo.test(valor)) {
            return 'Correo: formato inválido (ej: nombre@ejemplo.com)';
        }
        var dominio = valor.split('@')[1].toLowerCase();
        if (DOMINIOS_PERMITIDOS.indexOf(dominio) === -1) {
            return 'Correo: solo se aceptan dominios ' + DOMINIOS_PERMITIDOS.join(', ');
        }
    }

    // ----- RUN CHILENO -----
    if (campo.id === 'run') {
        if (!validarRun(valor)) {
            return 'RUN: no es válido. Ingresa sin puntos ni guión (ej: 19011022K)';
        }
    }

    // ----- CONTRASEÑA (4 a 10 caracteres) -----
    if (campo.id === 'contrasena') {
        if (valor.length < 4 || valor.length > 10) {
            return 'Contraseña: debe tener entre 4 y 10 caracteres';
        }
    }

    // ----- CONFIRMAR CONTRASEÑA (debe coincidir) -----
    if (campo.id === 'confirmarContrasena') {
        var formularioPadre = campo.closest('form');
        var campoContrasena = formularioPadre ? formularioPadre.querySelector('#contrasena') : null;
        if (campoContrasena && valor !== campoContrasena.value.trim()) {
            return 'Confirmar Contraseña: no coincide con la contraseña ingresada';
        }
    }

    // ----- CODIGO DE PRODUCTO (admin) -----
    if (campo.id === 'codigo') {
        if (valor.length < 3) {
            return 'Código: debe tener al menos 3 caracteres';
        }
    }

    // ----- PRECIO (admin), min 0, puede ser decimal -----
    if (campo.id === 'precio') {
        var precioNum = parseFloat(valor);
        if (isNaN(precioNum) || precioNum < 0) {
            return 'Precio: debe ser un número igual o mayor a 0';
        }
    }

    // ----- STOCK (admin), min 0, solo enteros -----
    if (campo.id === 'stock') {
        var stockNum = Number(valor);
        if (!Number.isInteger(stockNum) || stockNum < 0) {
            return 'Stock: debe ser un número entero igual o mayor a 0';
        }
    }

    // ----- STOCK CRITICO (admin), opcional, min 0, solo enteros -----
    if (campo.id === 'stockCritico' && valor !== '') {
        var stockCriticoNum = Number(valor);
        if (!Number.isInteger(stockCriticoNum) || stockCriticoNum < 0) {
            return 'Stock Crítico: debe ser un número entero igual o mayor a 0';
        }
    }

    // fecha de nacimiento: no mas alla del 2005
    if (campo.id === 'fechaNacimiento') {
        var anioNacimiento = new Date(valor).getFullYear();
        if (isNaN(anioNacimiento) || anioNacimiento > 2005 || anioNacimiento < 1900) {
            return 'Fecha de Nacimiento: debe ser del año 2005 hacia atrás';
        }
    }

    return null; // sin errores de formato
} // fin function obtenerErrorDeFormato


// =========================================================
// VALIDACION GENERICA DE FORMULARIOS
// La usan los botones de cada formulario con onclick
// =========================================================

function validarFormulario(formId) {

    var formulario = document.getElementById(formId);
    var campos = formulario.querySelectorAll('input, select, textarea');

    var errores = 0;
    var mensaje = '';

    for (var i = 0; i < campos.length; i++) {
        var campo = campos[i];

        if (campo.type === 'button' || campo.type === 'submit') {
            continue;
        }

        // Los campos opcionales se marcan con data-opcional="true" en el HTML
        var esOpcional = campo.dataset && campo.dataset.opcional === 'true';

        var nombreCampo = campo.placeholder || (campo.previousElementSibling ? campo.previousElementSibling.textContent : 'Campo');

        if (campo.value.trim() === '') {
            if (esOpcional) {
                campo.style.borderColor = '';
                continue;
            }
            errores++;
            mensaje = mensaje + '* ' + nombreCampo + ' es obligatorio\n';
            campo.style.borderColor = 'red';
            continue;
        }

        var errorFormato = obtenerErrorDeFormato(campo);
        if (errorFormato) {
            errores++;
            mensaje = mensaje + '* ' + errorFormato + '\n';
            campo.style.borderColor = 'red';
        } else {
            campo.style.borderColor = '';
        }
    }

    var resultado = document.getElementById('resultado-validacion');

    if (errores > 0) {
        resultado.innerHTML = 'Revisa lo siguiente: <br>' + mensaje.replace(/\n/g, '<br>');
        resultado.className = 'alert-error';
        resultado.style.display = 'block';
        return;
    }

    // ----- Sin errores: accion segun el formlario -----

    if (formId === 'formularioPedido') {
        var numeroPedido = 'GV-' + Math.floor(1000 + Math.random() * 9000);
        var total = guardarPedidoEnLocalStorage(formulario, numeroPedido);
        resultado.innerHTML = '¡Pedido registrado! Tu número de seguimiento es <strong>' + numeroPedido +
            '</strong>. El monto estimado a pagar es de <strong>$' + formatearCLP(total) + '</strong>.';
        resultado.className = 'alert-success';
        resultado.style.display = 'block';

    } else if (formId === 'formularioRegistro') {
        guardarUsuarioEnLocalStorage(formulario);
        resultado.innerHTML = '¡Cuenta creada con éxito! Ya puedes <a href="login.html">iniciar sesión</a>.';
        resultado.className = 'alert-success';
        resultado.style.display = 'block';

    } else if (formId === 'formularioLogin') {
        iniciarSesion(formulario, resultado);

    } else if (formId === 'formularioProducto') {
        guardarProductoAdmin(formulario);
        resultado.innerHTML = '¡Producto guardado! Redirigiendo al listado...';
        resultado.className = 'alert-success';
        resultado.style.display = 'block';
        setTimeout(function () { window.location.href = 'productos.html'; }, 1200);

    } else if (formId === 'formularioUsuarioAdmin') {
        guardarUsuarioAdmin(formulario);
        resultado.innerHTML = '¡Usuario guardado! Redirigiendo al listado...';
        resultado.className = 'alert-success';
        resultado.style.display = 'block';
        setTimeout(function () { window.location.href = 'usuarios.html'; }, 1200);

    } else {
        // Caso generico: contacto.html u otros formularios simples
        resultado.innerHTML = '¡Formulario enviado correctamente! Te responderemos a la brevedad.';
        resultado.className = 'alert-success';
        resultado.style.display = 'block';
    }

} // fin function validarFormulario


function resetearFormulario(formId) {
    var formulario = document.getElementById(formId);
    var campos = formulario.querySelectorAll('input, select, textarea');

    for (var i = 0; i < campos.length; i++) {
        var campo = campos[i];
        if (campo.type !== 'button' && campo.type !== 'submit') {
            campo.value = '';
            campo.style.borderColor = '';
        }
    }

    var resultado = document.getElementById('resultado-validacion');
    if (resultado) {
        resultado.style.display = 'none';
        resultado.innerHTML = '';
    }
} // fin function resetearFormulario


// =========================================================
// PEDIDO RAPIDO (pedido.html) + SEGUIMIENTO (seguimiento.html)
// =========================================================

function guardarPedidoEnLocalStorage(formulario, numeroPedido) {

    var nombre = capitalizarTexto(formulario.querySelector('#nombre').value.trim());
    var direccion = capitalizarTexto(formulario.querySelector('#direccion').value.trim());
    var tipoCilindroSelect = formulario.querySelector('#tipoCilindro');
    var cantidadSelect = formulario.querySelector('#cantidad');

    var cilindro = tipoCilindroSelect.options[tipoCilindroSelect.selectedIndex].text;
    var cantidad = parseInt(cantidadSelect.value, 10);

    var precioUnitario = PRECIOS_CILINDRO[tipoCilindroSelect.value] || 0;
    var total = precioUnitario * cantidad;

    var pedidoNuevo = {
        numero: numeroPedido,
        cliente: nombre,
        direccion: direccion,
        cilindro: cilindro + (cantidad > 1 ? ' x' + cantidad : ''),
        total: total,
        repartidor: 'Sin asignar',
        estado: 'pendiente'
    };

    var pedidosGuardados = localStorage.getItem(CLAVE_PEDIDOS);
    var listaPedidos = pedidosGuardados ? JSON.parse(pedidosGuardados) : [];
    listaPedidos.unshift(pedidoNuevo);
    localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(listaPedidos));

    return total;
} // fin function guardarPedidoEnLocalStorage


function mostrarPedidosGuardados() {

    var cuerpoTabla = document.getElementById('tabla-pedidos-body');
    if (!cuerpoTabla) {
        return;
    }

    var pedidosGuardados = localStorage.getItem(CLAVE_PEDIDOS);
    if (!pedidosGuardados) {
        return;
    }

    var listaPedidos = JSON.parse(pedidosGuardados);

    for (var i = listaPedidos.length - 1; i >= 0; i--) {
        var pedido = listaPedidos[i];

        var fila = document.createElement('tr');
        fila.setAttribute('data-estado', pedido.estado);

        fila.innerHTML =
            '<td>' + pedido.numero + '</td>' +
            '<td>' + pedido.cliente + '</td>' +
            '<td>' + pedido.direccion + '</td>' +
            '<td>' + pedido.cilindro + (pedido.total ? ' — $' + formatearCLP(pedido.total) : '') + '</td>' +
            '<td>' + pedido.repartidor + '</td>' +
            '<td><span class="badge-estado ' + pedido.estado + '">Pendiente</span></td>';

        cuerpoTabla.insertBefore(fila, cuerpoTabla.firstChild);
    }
} // fin function mostrarPedidosGuardados


function filtrarPedidos() {
    var filtro = document.getElementById('filtro-estado').value;
    var filas = document.querySelectorAll('#tabla-pedidos-body tr');

    for (var i = 0; i < filas.length; i++) {
        var fila = filas[i];
        var estadoFila = fila.getAttribute('data-estado');
        fila.style.display = (filtro === 'todos' || estadoFila === filtro) ? '' : 'none';
    }
} // fin function filtrarPedidos


// =========================================================
// CATALOGO DE PRODUCTOS (productos.html, index.html, detalle-producto.html)
// =========================================================

function crearTarjetaProducto(producto) {
    var stockBajo = producto.stockCritico && producto.stock <= producto.stockCritico;

    return '' +
        '<div class="col-md-3 col-sm-6">' +
            '<div class="producto-card">' +
                '<a href="detalle-producto.html?codigo=' + producto.codigo + '">' +
                    '<img src="' + producto.imagen + '" alt="' + producto.nombre + '">' +
                '</a>' +
                '<span class="categoria-badge">' + producto.categoria + '</span>' +
                '<h5><a href="detalle-producto.html?codigo=' + producto.codigo + '" style="color:inherit; text-decoration:none;">' + producto.nombre + '</a></h5>' +
                '<div class="precio">$' + formatearCLP(producto.precio) + '</div>' +
                (stockBajo ? '<div class="stock-critico"><i class="bi bi-exclamation-triangle"></i> ¡Stock bajo! (' + producto.stock + ' unid.)</div>' : '') +
                '<button type="button" class="btn-enviar mt-auto" onclick="agregarAlCarrito(\'' + producto.codigo + '\')">' +
                    '<i class="bi bi-cart-plus"></i> Añadir' +
                '</button>' +
            '</div>' +
        '</div>';
} // fin function crearTarjetaProducto


function renderProductos(filtroCategoria) {
    var contenedor = document.getElementById('productos-container');
    if (!contenedor) {
        return;
    }

    var lista = PRODUCTOS;
    if (filtroCategoria && filtroCategoria !== 'todas') {
        lista = PRODUCTOS.filter(function (p) { return p.categoria === filtroCategoria; });
    }

    var html = '';
    for (var i = 0; i < lista.length; i++) {
        html += crearTarjetaProducto(lista[i]);
    }
    contenedor.innerHTML = html || '<p>No hay productos en esta categoría.</p>';
} // fin function renderProductos


function filtrarProductos() {
    var filtro = document.getElementById('filtro-categoria').value;
    renderProductos(filtro);
} // fin function filtrarProductos


function renderDestacados() {
    var contenedor = document.getElementById('destacados-container');
    if (!contenedor) {
        return;
    }

    // Mostramos 4 productos como destacados (uno de cada categora)
    var destacados = [PRODUCTOS[1], PRODUCTOS[4], PRODUCTOS[7], PRODUCTOS[13]];

    var html = '';
    for (var i = 0; i < destacados.length; i++) {
        html += crearTarjetaProducto(destacados[i]);
    }
    contenedor.innerHTML = html;
} // fin function renderDestacados


function renderDetalleProducto() {
    var contenedor = document.getElementById('detalle-container');
    if (!contenedor) {
        return;
    }

    var parametros = new URLSearchParams(window.location.search);
    var codigo = parametros.get('codigo');
    var producto = codigo ? buscarProductoPorCodigo(codigo) : PRODUCTOS[0];

    if (!producto) {
        contenedor.innerHTML = '<p>Producto no encontrado. <a href="productos.html">Volver al catálogo</a>.</p>';
        return;
    }

    contenedor.innerHTML =
        '<div class="col-md-5">' +
            '<img src="' + producto.imagen + '" alt="' + producto.nombre + '" class="img-fluid rounded">' +
        '</div>' +
        '<div class="col-md-7">' +
            '<span class="categoria-badge">' + producto.categoria + '</span>' +
            '<h2>' + producto.nombre + '</h2>' +
            '<p class="precio" style="font-size:1.8rem;">$' + formatearCLP(producto.precio) + '</p>' +
            '<p>' + producto.descripcion + '</p>' +
            '<p><strong>Stock disponible:</strong> ' + producto.stock + ' unidades</p>' +
            '<div class="mb-3">' +
                '<label class="form-label">Cantidad</label>' +
                '<input type="number" class="form-control" id="cantidad-detalle" value="1" min="1" max="' + producto.stock + '" style="max-width:120px;">' +
            '</div>' +
            '<button type="button" class="btn-enviar" onclick="agregarAlCarrito(\'' + producto.codigo + '\', document.getElementById(\'cantidad-detalle\').value)">' +
                '<i class="bi bi-cart-plus"></i> Añadir al carrito' +
            '</button>' +
        '</div>';

    // Relaciondos: otros productos de la misma categoria
    var relacionadosContenedor = document.getElementById('relacionados-container');
    if (relacionadosContenedor) {
        var relacionados = PRODUCTOS.filter(function (p) {
            return p.categoria === producto.categoria && p.codigo !== producto.codigo;
        });
        var html = '';
        for (var i = 0; i < relacionados.length; i++) {
            html += crearTarjetaProducto(relacionados[i]);
        }
        relacionadosContenedor.innerHTML = html || '<p>No hay más productos en esta categoría.</p>';
    }
} // fin function renderDetalleProducto


// =========================================================
// CARRITO DE COMPRAS (localStorage)
// =========================================================

function obtenerCarrito() {
    var guardado = localStorage.getItem(CLAVE_CARRITO);
    return guardado ? JSON.parse(guardado) : [];
}

function guardarCarrito(carrito) {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    actualizarContadorCarrito();
}

function agregarAlCarrito(codigo, cantidad) {
    cantidad = parseInt(cantidad, 10) || 1;

    var carrito = obtenerCarrito();
    var item = null;
    for (var i = 0; i < carrito.length; i++) {
        if (carrito[i].codigo === codigo) {
            item = carrito[i];
            break;
        }
    }

    if (item) {
        item.cantidad += cantidad;
    } else {
        carrito.push({ codigo: codigo, cantidad: cantidad });
    }

    guardarCarrito(carrito);

    // Pequeña confirmacion visual
    var producto = buscarProductoPorCodigo(codigo);
    if (producto) {
        alert('"' + producto.nombre + '" fue añadido al carrito.');
    }
} // fin function agregarAlCarrito


function cambiarCantidadCarrito(codigo, delta) {
    var carrito = obtenerCarrito();
    for (var i = 0; i < carrito.length; i++) {
        if (carrito[i].codigo === codigo) {
            carrito[i].cantidad += delta;
            if (carrito[i].cantidad <= 0) {
                carrito.splice(i, 1);
            }
            break;
        }
    }
    guardarCarrito(carrito);
    renderCarrito();
} // fin function cambiarCantidadCarrito


function eliminarDelCarrito(codigo) {
    var carrito = obtenerCarrito().filter(function (item) { return item.codigo !== codigo; });
    guardarCarrito(carrito);
    renderCarrito();
} // fin function eliminarDelCarrito


function vaciarCarrito() {
    guardarCarrito([]);
    renderCarrito();
    var resultado = document.getElementById('resultado-pago');
    if (resultado) {
        resultado.innerHTML = '';
    }
} // fin function vaciarCarrito


function calcularTotalCarrito() {
    var carrito = obtenerCarrito();
    var total = 0;
    for (var i = 0; i < carrito.length; i++) {
        var producto = buscarProductoPorCodigo(carrito[i].codigo);
        if (producto) {
            total += producto.precio * carrito[i].cantidad;
        }
    }
    return total;
} // fin function calcularTotalCarrito


function renderCarrito() {
    var contenedor = document.getElementById('carrito-items');
    if (!contenedor) {
        return;
    }

    var carrito = obtenerCarrito();

    if (carrito.length === 0) {
        contenedor.innerHTML = '<p>Tu carrito está vacío. <a href="productos.html">Ver productos</a>.</p>';
    } else {
        var html = '';
        for (var i = 0; i < carrito.length; i++) {
            var producto = buscarProductoPorCodigo(carrito[i].codigo);
            if (!producto) {
                continue;
            }
            var subtotal = producto.precio * carrito[i].cantidad;

            html += '' +
                '<div class="carrito-item">' +
                    '<img src="' + producto.imagen + '" alt="' + producto.nombre + '">' +
                    '<div class="carrito-info">' +
                        '<strong>' + producto.nombre + '</strong><br>' +
                        '$' + formatearCLP(producto.precio) + ' c/u' +
                    '</div>' +
                    '<div class="carrito-cantidad">' +
                        '<button type="button" onclick="cambiarCantidadCarrito(\'' + producto.codigo + '\', -1)">-</button>' +
                        '<input type="text" value="' + carrito[i].cantidad + '" readonly>' +
                        '<button type="button" onclick="cambiarCantidadCarrito(\'' + producto.codigo + '\', 1)">+</button>' +
                    '</div>' +
                    '<div style="min-width:90px; text-align:right; font-weight:bold;">$' + formatearCLP(subtotal) + '</div>' +
                    '<button type="button" class="btn-limpiar" onclick="eliminarDelCarrito(\'' + producto.codigo + '\')">' +
                        '<i class="bi bi-trash"></i>' +
                    '</button>' +
                '</div>';
        }
        contenedor.innerHTML = html;
    }

    var totalElemento = document.getElementById('carrito-total');
    if (totalElemento) {
        totalElemento.textContent = '$' + formatearCLP(calcularTotalCarrito());
    }
} // fin function renderCarrito


function pagarCarrito() {
    var carrito = obtenerCarrito();
    var resultado = document.getElementById('resultado-pago');

    if (carrito.length === 0) {
        resultado.innerHTML = 'Tu carrito está vacío, agrega productos antes de pagar.';
        resultado.className = 'alert-error';
        return;
    }

    var total = calcularTotalCarrito();
    var numeroOrden = 'GV-' + Math.floor(1000 + Math.random() * 9000);

    resultado.innerHTML = '¡Compra simulada con éxito! N° de orden <strong>' + numeroOrden +
        '</strong> por un total de <strong>$' + formatearCLP(total) + '</strong>. (No hay pasarela de pago real todavía).';
    resultado.className = 'alert-success';

    vaciarCarrito();
} // fin function pagarCarrito


function actualizarContadorCarrito() {
    var contador = document.getElementById('contador-carrito');
    if (!contador) {
        return;
    }
    var carrito = obtenerCarrito();
    var totalUnidades = 0;
    for (var i = 0; i < carrito.length; i++) {
        totalUnidades += carrito[i].cantidad;
    }
    contador.textContent = totalUnidades;
} // fin function actualizarContadorCarrito


// =========================================================
// REGION / COMUNA EN CASCADA (registro.html, admin/usuario-form.html)
// =========================================================

function llenarRegiones() {
    var selectRegion = document.getElementById('region');
    if (!selectRegion) {
        return;
    }

    for (var i = 0; i < REGIONES.length; i++) {
        var opcion = document.createElement('option');
        opcion.value = REGIONES[i].region;
        opcion.textContent = REGIONES[i].region;
        selectRegion.appendChild(opcion);
    }
} // fin function llenarRegiones


function actualizarComunas() {
    var selectRegion = document.getElementById('region');
    var selectComuna = document.getElementById('comuna');
    if (!selectRegion || !selectComuna) {
        return;
    }

    var regionSeleccionada = null;
    for (var i = 0; i < REGIONES.length; i++) {
        if (REGIONES[i].region === selectRegion.value) {
            regionSeleccionada = REGIONES[i];
            break;
        }
    }

    selectComuna.innerHTML = '<option value="">Seleccione la comuna</option>';

    if (regionSeleccionada) {
        for (var j = 0; j < regionSeleccionada.comunas.length; j++) {
            var opcion = document.createElement('option');
            opcion.value = regionSeleccionada.comunas[j];
            opcion.textContent = regionSeleccionada.comunas[j];
            selectComuna.appendChild(opcion);
        }
    }
} // fin function actualizarComunas


// =========================================================
// USUARIOS (registro.html tienda + admin/usuario-form.html)
// =========================================================

function guardarUsuarioEnLocalStorage(formulario, tipoUsuarioForzado) {

    var run = formulario.querySelector('#run').value.trim();
    var nombre = capitalizarTexto(formulario.querySelector('#nombre').value.trim());
    var apellidos = capitalizarTexto(formulario.querySelector('#apellidos').value.trim());
    var correo = formulario.querySelector('#correo').value.trim().toLowerCase();
    var campoContrasena = formulario.querySelector('#contrasena');
    var campoDireccion = formulario.querySelector('#direccion');
    var direccion = campoDireccion ? capitalizarTexto(campoDireccion.value.trim()) : '';
    var campoRegion = formulario.querySelector('#region');
    var campoComuna = formulario.querySelector('#comuna');
    var campoTipoUsuario = formulario.querySelector('#tipoUsuario');

    var usuarioNuevo = {
        run: run,
        nombre: nombre,
        apellidos: apellidos,
        correo: correo,
        contrasena: campoContrasena ? campoContrasena.value : '',
        region: campoRegion ? campoRegion.value : '',
        comuna: campoComuna ? campoComuna.value : '',
        direccion: direccion,
        tipoUsuario: tipoUsuarioForzado || (campoTipoUsuario ? campoTipoUsuario.value : 'Cliente')
    };

    var usuariosGuardados = localStorage.getItem(CLAVE_USUARIOS);
    var listaUsuarios = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
    listaUsuarios.unshift(usuarioNuevo);
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(listaUsuarios));

    return usuarioNuevo;
} // fin function guardarUsuarioEnLocalStorage


// =========================================================
// SESION / LOGIN REAL
// Guarda quien inicio sesion (correo y rol) en localStorage
// =========================================================

var CLAVE_SESION = 'gv_sesion';

// Crea usuarios de prueba (admin y vendedor) la primera vez
function sembrarUsuariosBase() {
    var usuariosGuardados = localStorage.getItem(CLAVE_USUARIOS);
    if (usuariosGuardados) {
        return; // ya hay usuarios, no tocamos nada
    }
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(USUARIOS_SEMILLA));
} // fin function sembrarUsuariosBase


function iniciarSesion(formulario, resultado) {
    var correoIngresado = formulario.querySelector('#correo').value.trim().toLowerCase();
    var contrasenaIngresada = formulario.querySelector('#contrasena').value.trim();

    var usuariosGuardados = localStorage.getItem(CLAVE_USUARIOS);
    var usuarios = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];

    var usuarioEncontrado = null;
    for (var i = 0; i < usuarios.length; i++) {
        if (usuarios[i].correo === correoIngresado) {
            usuarioEncontrado = usuarios[i];
            break;
        }
    }

    if (!usuarioEncontrado || usuarioEncontrado.contrasena !== contrasenaIngresada) {
        resultado.innerHTML = 'Correo o contraseña incorrectos. Si aún no tienes cuenta, <a href="registro.html">regístrate aquí</a>.';
        resultado.className = 'alert-error';
        resultado.style.display = 'block';
        return;
    }

    // Guardamos la sesion activa (simulada, sin token real)
    var sesion = {
        correo: usuarioEncontrado.correo,
        nombre: usuarioEncontrado.nombre,
        tipoUsuario: usuarioEncontrado.tipoUsuario || 'Cliente'
    };
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));

    resultado.innerHTML = '¡Bienvenido/a, ' + usuarioEncontrado.nombre + '! Redirigiendo...';
    resultado.className = 'alert-success';
    resultado.style.display = 'block';

    var destino = 'index.html';
    if (sesion.tipoUsuario === 'Administrador') {
        destino = 'admin/index.html';
    } else if (sesion.tipoUsuario === 'Vendedor') {
        destino = 'vendedor/index.html';
    }

    setTimeout(function () { window.location.href = destino; }, 900);
} // fin function iniciarSesion


function obtenerSesion() {
    var guardada = localStorage.getItem(CLAVE_SESION);
    return guardada ? JSON.parse(guardada) : null;
} // fin function obtenerSesion


function cerrarSesion(rutaTienda) {
    localStorage.removeItem(CLAVE_SESION);
    window.location.href = rutaTienda || 'index.html';
} // fin function cerrarSesion


// Cambia el link de Ingresar segun la sesion activa
function actualizarNavSesion() {
    var link = document.getElementById('nav-login');
    if (!link) {
        return;
    }

    var sesion = obtenerSesion();
    if (!sesion) {
        return; // se deja el link de "Ingresar" tal cual esta en el HTML
    }

    if (sesion.tipoUsuario === 'Administrador') {
        link.href = 'admin/index.html';
        link.innerHTML = '<i class="bi bi-speedometer2"></i> Panel Admin (' + sesion.nombre + ')';
    } else if (sesion.tipoUsuario === 'Vendedor') {
        link.href = 'vendedor/index.html';
        link.innerHTML = '<i class="bi bi-speedometer2"></i> Panel Vendedor (' + sesion.nombre + ')';
    } else {
        link.href = '#';
        link.innerHTML = '<i class="bi bi-person-check"></i> Hola, ' + sesion.nombre;
        link.onclick = function (evento) {
            evento.preventDefault();
            cerrarSesion('index.html');
        };
    }
} // fin function actualizarNavSesion


// Si no hay sesion de administrador, redirige al login
function protegerAdmin() {
    var sesion = obtenerSesion();
    if (!sesion || sesion.tipoUsuario !== 'Administrador') {
        window.location.href = '../login.html';
    }
} // fin function protegerAdmin


// Deja entrar a Vendedor y tambien a Administrador
function protegerVendedor() {
    var sesion = obtenerSesion();
    if (!sesion || (sesion.tipoUsuario !== 'Vendedor' && sesion.tipoUsuario !== 'Administrador')) {
        window.location.href = '../login.html';
    }
} // fin function protegerVendedor


// =========================================================
// PANEL ADMINISTRADOR - PRODUCTOS
// El catalogo del admnistrador vive en su propia llave de
// localStorage (se "siembra" con PRODUCTOS la primera vez),
// para poder crear/editar/eliminar sin tocar el arreglo base
// que usa la tienda publica.
// =========================================================

var CLAVE_PRODUCTOS_ADMIN = 'gv_productos_admin';

function obtenerProductosAdmin() {
    var guardado = localStorage.getItem(CLAVE_PRODUCTOS_ADMIN);
    if (guardado) {
        return JSON.parse(guardado);
    }
    // Primera vez: sembramos con el catalogo base de datos.js
    var copiaInicial = JSON.parse(JSON.stringify(PRODUCTOS));
    localStorage.setItem(CLAVE_PRODUCTOS_ADMIN, JSON.stringify(copiaInicial));
    return copiaInicial;
}

function guardarProductosAdmin(lista) {
    localStorage.setItem(CLAVE_PRODUCTOS_ADMIN, JSON.stringify(lista));
}

function renderProductosAdmin() {
    var cuerpoTabla = document.getElementById('tabla-productos-admin-body');
    if (!cuerpoTabla) {
        return;
    }

    var productos = obtenerProductosAdmin();
    var html = '';

    for (var i = 0; i < productos.length; i++) {
        var p = productos[i];
        var stockBajo = p.stockCritico && p.stock <= p.stockCritico;

        html += '<tr>' +
            '<td>' + p.codigo + '</td>' +
            '<td>' + p.nombre + '</td>' +
            '<td>' + p.categoria + '</td>' +
            '<td>$' + formatearCLP(p.precio) + '</td>' +
            '<td>' + p.stock + (stockBajo ? ' <span class="badge-stock-critico">Bajo</span>' : '') + '</td>' +
            '<td>' +
                '<a href="producto-form.html?codigo=' + p.codigo + '" class="btn-enviar" style="padding:5px 12px; text-decoration:none; display:inline-block;"><i class="bi bi-pencil"></i></a> ' +
                '<button type="button" class="btn-limpiar" style="padding:5px 12px;" onclick="eliminarProductoAdmin(\'' + p.codigo + '\')"><i class="bi bi-trash"></i></button>' +
            '</td>' +
        '</tr>';
    }

    cuerpoTabla.innerHTML = html || '<tr><td colspan="6">No hay productos registrados.</td></tr>';
} // fin function renderProductosAdmin


function eliminarProductoAdmin(codigo) {
    if (!confirm('¿Eliminar el producto ' + codigo + '?')) {
        return;
    }
    var productos = obtenerProductosAdmin().filter(function (p) { return p.codigo !== codigo; });
    guardarProductosAdmin(productos);
    renderProductosAdmin();
} // fin function eliminarProductoAdmin


// Si la URL trae ?codigo=XXX, precarga el formulario para edtar
function cargarProductoParaEditar() {
    var formulario = document.getElementById('formularioProducto');
    if (!formulario) {
        return;
    }

    var parametros = new URLSearchParams(window.location.search);
    var codigo = parametros.get('codigo');
    if (!codigo) {
        return; // Es un producto nuevo, no hay nada que precargar
    }

    var productos = obtenerProductosAdmin();
    var producto = null;
    for (var i = 0; i < productos.length; i++) {
        if (productos[i].codigo === codigo) {
            producto = productos[i];
            break;
        }
    }
    if (!producto) {
        return;
    }

    document.getElementById('titulo-formulario-producto').textContent = 'Editar Producto';
    formulario.querySelector('#codigo').value = producto.codigo;
    formulario.querySelector('#codigo').readOnly = true; // no se cambia el codigo al editar
    formulario.querySelector('#nombre').value = producto.nombre;
    formulario.querySelector('#descripcion').value = producto.descripcion || '';
    formulario.querySelector('#precio').value = producto.precio;
    formulario.querySelector('#stock').value = producto.stock;
    formulario.querySelector('#stockCritico').value = producto.stockCritico || '';
    formulario.querySelector('#categoria').value = producto.categoria;
    formulario.querySelector('#imagen').value = producto.imagen || '';
} // fin function cargarProductoParaEditar


function guardarProductoAdmin(formulario) {
    var codigo = formulario.querySelector('#codigo').value.trim();
    var productos = obtenerProductosAdmin();

    var productoData = {
        codigo: codigo,
        nombre: formulario.querySelector('#nombre').value.trim(),
        descripcion: formulario.querySelector('#descripcion').value.trim(),
        precio: parseFloat(formulario.querySelector('#precio').value),
        stock: parseInt(formulario.querySelector('#stock').value, 10),
        stockCritico: formulario.querySelector('#stockCritico').value ? parseInt(formulario.querySelector('#stockCritico').value, 10) : null,
        categoria: formulario.querySelector('#categoria').value,
        imagen: formulario.querySelector('#imagen').value.trim() || 'https://images.unsplash.com/photo-1585105219449-caa471fb9c04?w=500'
    };

    var indiceExistente = -1;
    for (var i = 0; i < productos.length; i++) {
        if (productos[i].codigo === codigo) {
            indiceExistente = i;
            break;
        }
    }

    if (indiceExistente >= 0) {
        productos[indiceExistente] = productoData;
    } else {
        productos.push(productoData);
    }

    guardarProductosAdmin(productos);
} // fin function guardarProductoAdmin


// =========================================================
// PANEL ADMINISTRADOR - USUARIOS
// =========================================================

function renderUsuariosAdmin() {
    var cuerpoTabla = document.getElementById('tabla-usuarios-admin-body');
    if (!cuerpoTabla) {
        return;
    }

    var usuariosGuardados = localStorage.getItem(CLAVE_USUARIOS);
    var usuarios = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];

    var html = '';
    for (var i = 0; i < usuarios.length; i++) {
        var u = usuarios[i];
        var claseRol = (u.tipoUsuario || 'cliente').toLowerCase();

        html += '<tr>' +
            '<td>' + u.run + '</td>' +
            '<td>' + u.nombre + ' ' + u.apellidos + '</td>' +
            '<td>' + u.correo + '</td>' +
            '<td>' + (u.comuna || '-') + '</td>' +
            '<td><span class="badge-rol ' + claseRol + '">' + (u.tipoUsuario || 'Cliente') + '</span></td>' +
            '<td>' +
                '<a href="usuario-form.html?run=' + u.run + '" class="btn-enviar" style="padding:5px 12px; text-decoration:none; display:inline-block;"><i class="bi bi-pencil"></i></a> ' +
                '<button type="button" class="btn-limpiar" style="padding:5px 12px;" onclick="eliminarUsuarioAdmin(\'' + u.run + '\')"><i class="bi bi-trash"></i></button>' +
            '</td>' +
        '</tr>';
    }

    cuerpoTabla.innerHTML = html || '<tr><td colspan="6">No hay usuarios registrados todavía (regístrate en la tienda o crea uno aquí).</td></tr>';
} // fin function renderUsuariosAdmin


function eliminarUsuarioAdmin(run) {
    if (!confirm('¿Eliminar el usuario con RUN ' + run + '?')) {
        return;
    }
    var usuariosGuardados = localStorage.getItem(CLAVE_USUARIOS);
    var usuarios = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
    usuarios = usuarios.filter(function (u) { return u.run !== run; });
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
    renderUsuariosAdmin();
} // fin function eliminarUsuarioAdmin


function cargarUsuarioParaEditar() {
    var formulario = document.getElementById('formularioUsuarioAdmin');
    if (!formulario) {
        return;
    }

    var parametros = new URLSearchParams(window.location.search);
    var run = parametros.get('run');
    if (!run) {
        return;
    }

    var usuariosGuardados = localStorage.getItem(CLAVE_USUARIOS);
    var usuarios = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
    var usuario = null;
    for (var i = 0; i < usuarios.length; i++) {
        if (usuarios[i].run === run) {
            usuario = usuarios[i];
            break;
        }
    }
    if (!usuario) {
        return;
    }

    document.getElementById('titulo-formulario-usuario').textContent = 'Editar Usuario';
    formulario.querySelector('#run').value = usuario.run;
    formulario.querySelector('#run').readOnly = true;
    formulario.querySelector('#nombre').value = usuario.nombre;
    formulario.querySelector('#apellidos').value = usuario.apellidos;
    formulario.querySelector('#correo').value = usuario.correo;
    formulario.querySelector('#direccion').value = usuario.direccion || '';
    formulario.querySelector('#tipoUsuario').value = usuario.tipoUsuario || 'Cliente';

    if (usuario.region) {
        formulario.querySelector('#region').value = usuario.region;
        actualizarComunas();
        if (usuario.comuna) {
            formulario.querySelector('#comuna').value = usuario.comuna;
        }
    }
} // fin function cargarUsuarioParaEditar


function guardarUsuarioAdmin(formulario) {
    var run = formulario.querySelector('#run').value.trim();

    var usuarioData = {
        run: run,
        nombre: capitalizarTexto(formulario.querySelector('#nombre').value.trim()),
        apellidos: capitalizarTexto(formulario.querySelector('#apellidos').value.trim()),
        correo: formulario.querySelector('#correo').value.trim().toLowerCase(),
        region: formulario.querySelector('#region').value,
        comuna: formulario.querySelector('#comuna').value,
        direccion: capitalizarTexto(formulario.querySelector('#direccion').value.trim()),
        tipoUsuario: formulario.querySelector('#tipoUsuario').value
    };

    var usuariosGuardados = localStorage.getItem(CLAVE_USUARIOS);
    var usuarios = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];

    var indiceExistente = -1;
    for (var i = 0; i < usuarios.length; i++) {
        if (usuarios[i].run === run) {
            indiceExistente = i;
            break;
        }
    }

    if (indiceExistente >= 0) {
        usuarios[indiceExistente] = usuarioData;
    } else {
        usuarios.unshift(usuarioData);
    }

    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
} // fin function guardarUsuarioAdmin


// =========================================================
// VISTA VENDEDOR (solo lectura)
// El vendedor solo ve productos y pedidos, no puede editar nada
// =========================================================

function renderProductosVendedor() {
    var cuerpoTabla = document.getElementById('tabla-productos-vendedor-body');
    if (!cuerpoTabla) {
        return;
    }

    var productos = obtenerProductosAdmin(); // mismo catalogo que usa el admin
    var html = '';

    for (var i = 0; i < productos.length; i++) {
        var p = productos[i];
        var stockBajo = p.stockCritico && p.stock <= p.stockCritico;

        html += '<tr>' +
            '<td>' + p.codigo + '</td>' +
            '<td>' + p.nombre + '</td>' +
            '<td>' + p.categoria + '</td>' +
            '<td>$' + formatearCLP(p.precio) + '</td>' +
            '<td>' + p.stock + (stockBajo ? ' <span class="badge-stock-critico">Bajo</span>' : '') + '</td>' +
            '<td><a href="producto-detalle.html?codigo=' + p.codigo + '" class="btn-enviar" style="padding:5px 12px; text-decoration:none; display:inline-block;"><i class="bi bi-eye"></i> Ver</a></td>' +
        '</tr>';
    }

    cuerpoTabla.innerHTML = html || '<tr><td colspan="6">No hay productos registrados.</td></tr>';
} // fin function renderProductosVendedor


function renderProductoDetalleVendedor() {
    var contenedor = document.getElementById('detalle-vendedor-container');
    if (!contenedor) {
        return;
    }

    var parametros = new URLSearchParams(window.location.search);
    var codigo = parametros.get('codigo');
    var productos = obtenerProductosAdmin();
    var producto = null;
    for (var i = 0; i < productos.length; i++) {
        if (productos[i].codigo === codigo) {
            producto = productos[i];
            break;
        }
    }

    if (!producto) {
        contenedor.innerHTML = '<p>Producto no encontrado. <a href="productos.html">Volver al listado</a>.</p>';
        return;
    }

    var stockBajo = producto.stockCritico && producto.stock <= producto.stockCritico;

    contenedor.innerHTML =
        '<div class="col-md-5">' +
            '<img src="' + producto.imagen + '" alt="' + producto.nombre + '" class="img-fluid rounded">' +
        '</div>' +
        '<div class="col-md-7">' +
            '<span class="categoria-badge">' + producto.categoria + '</span>' +
            '<h2>' + producto.nombre + '</h2>' +
            '<p class="precio" style="font-size:1.8rem;">$' + formatearCLP(producto.precio) + '</p>' +
            '<p>' + (producto.descripcion || 'Sin descripción.') + '</p>' +
            '<p><strong>Código:</strong> ' + producto.codigo + '</p>' +
            '<p><strong>Stock disponible:</strong> ' + producto.stock + ' unidades ' +
                (stockBajo ? '<span class="badge-stock-critico">¡Stock bajo!</span>' : '') +
            '</p>' +
        '</div>';
} // fin function renderProductoDetalleVendedor


function buscarPedidoPorNumero(numero) {
    var pedidosGuardados = localStorage.getItem(CLAVE_PEDIDOS);
    var listaPedidos = pedidosGuardados ? JSON.parse(pedidosGuardados) : [];
    for (var i = 0; i < listaPedidos.length; i++) {
        if (listaPedidos[i].numero === numero) {
            return listaPedidos[i];
        }
    }
    return null;
} // fin function buscarPedidoPorNumero


function renderPedidosVendedor() {
    var cuerpoTabla = document.getElementById('tabla-pedidos-vendedor-body');
    if (!cuerpoTabla) {
        return;
    }

    var pedidosGuardados = localStorage.getItem(CLAVE_PEDIDOS);
    var listaPedidos = pedidosGuardados ? JSON.parse(pedidosGuardados) : [];

    var html = '';
    for (var i = 0; i < listaPedidos.length; i++) {
        var pedido = listaPedidos[i];
        html += '<tr>' +
            '<td>' + pedido.numero + '</td>' +
            '<td>' + pedido.cliente + '</td>' +
            '<td>' + pedido.direccion + '</td>' +
            '<td>' + pedido.cilindro + '</td>' +
            '<td><span class="badge-estado ' + pedido.estado + '">Pendiente</span></td>' +
            '<td><a href="pedido-detalle.html?numero=' + pedido.numero + '" class="btn-enviar" style="padding:5px 12px; text-decoration:none; display:inline-block;"><i class="bi bi-eye"></i> Ver</a></td>' +
        '</tr>';
    }

    cuerpoTabla.innerHTML = html || '<tr><td colspan="6">Todavía no hay pedidos registrados.</td></tr>';
} // fin function renderPedidosVendedor


function renderPedidoDetalleVendedor() {
    var contenedor = document.getElementById('pedido-detalle-vendedor-container');
    if (!contenedor) {
        return;
    }

    var parametros = new URLSearchParams(window.location.search);
    var numero = parametros.get('numero');
    var pedido = numero ? buscarPedidoPorNumero(numero) : null;

    if (!pedido) {
        contenedor.innerHTML = '<p>Pedido no encontrado. <a href="pedidos.html">Volver al listado</a>.</p>';
        return;
    }

    contenedor.innerHTML =
        '<p><strong>N° Pedido:</strong> ' + pedido.numero + '</p>' +
        '<p><strong>Cliente:</strong> ' + pedido.cliente + '</p>' +
        '<p><strong>Dirección de entrega:</strong> ' + pedido.direccion + '</p>' +
        '<p><strong>Producto:</strong> ' + pedido.cilindro + '</p>' +
        (pedido.total ? '<p><strong>Total:</strong> $' + formatearCLP(pedido.total) + '</p>' : '') +
        '<p><strong>Repartidor asignado:</strong> ' + pedido.repartidor + '</p>' +
        '<p><strong>Estado:</strong> <span class="badge-estado ' + pedido.estado + '">Pendiente</span></p>';
} // fin function renderPedidoDetalleVendedor


// =========================================================
// INICIALIZACION AL CARGAR LA PAGINA
// Cada funcion revisa si su contenedor existe antes de hacer
// algo, asi este mismo archivo sirve para todas las paginas.
// =========================================================

document.addEventListener('DOMContentLoaded', function () {
    sembrarUsuariosBase();
    actualizarNavSesion();

    if (document.body.hasAttribute('data-proteger-admin')) {
        protegerAdmin();
    }
    if (document.body.hasAttribute('data-proteger-vendedor')) {
        protegerVendedor();
    }

    mostrarPedidosGuardados();
    actualizarContadorCarrito();
    renderProductos();
    renderDestacados();
    renderDetalleProducto();
    renderCarrito();
    llenarRegiones();
    renderProductosAdmin();
    cargarProductoParaEditar();
    renderUsuariosAdmin();
    cargarUsuarioParaEditar();
    renderProductosVendedor();
    renderProductoDetalleVendedor();
    renderPedidosVendedor();
    renderPedidoDetalleVendedor();
});
