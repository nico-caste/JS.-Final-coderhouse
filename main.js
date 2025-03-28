// array carrito y productos
let carrito = [];
let productos = [];
// importar productos
const url = "./data/products.json";
fetch(url)
    .then(res => res.json())
    .then(data => {
        productos = data;
        mostrarProductos(productos);
    })
    .catch(error => console.error('Error al cargar productos:', error));
// importar valor dolar
fetch('https://api.exchangerate-api.com/v4/latest/USD')
    .then(response => response.json())
    .then(data => {
        mostrarValorDolar(data);
    })
    .catch(error => {
        console.error('Error al obtener los datos:', error);
        document.body.innerHTML = `<p class="error">No se pudo obtener el valor del dólar. Intenta nuevamente más tarde.</p>`;
    });

// Funcion mostrar valores del dolar
function mostrarValorDolar(valorDolar) {
    const contDolar = document.createElement('div');
    contDolar.className = 'contenedor-dolar';
    // Verificar datos
    if (valorDolar.rates && valorDolar.rates.ARS) {
        const dolarCard = document.createElement('div');
        dolarCard.className = 'dolar-card';
        // Formatear el valor con 2 decimales
        const valorARS = parseFloat(valorDolar.rates.ARS).toFixed(2);
        dolarCard.innerHTML = `
            <h4>Valor del Dólar</h4>
            <p>1 USD = <strong>${valorARS} ARS</strong></p>
            <small>Actualizado: ${new Date(valorDolar.date).toLocaleDateString()}</small>
        `;
        contDolar.appendChild(dolarCard);
    } else {
        // Mostrar mensaje si no hay informacion de cotizacion
        const errorCard = document.createElement('div');
        errorCard.className = 'error-card';
        errorCard.textContent = 'No se encontró la cotización del dólar en pesos argentinos.';
        contDolar.appendChild(errorCard);
    }
    document.body.appendChild(contDolar);
}
// Inicio de sesión
function iniciarSesion() {
    Swal.fire({
        title: 'Iniciar Sesión',
        html:
            '<input id="nombre" class="swal2-input" placeholder="Nombre">' +
            '<input id="apellido" class="swal2-input" placeholder="Apellido">',
        focusConfirm: false,
        preConfirm: () => {
            const nombre = document.getElementById('nombre').value;
            const apellido = document.getElementById('apellido').value;
            if (!nombre || !apellido) {
                Swal.showValidationMessage('Por favor, ingresa tu nombre y apellido');
                return false;
            }
            return { nombre, apellido };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const usuario = result.value;
            sessionStorage.setItem('usuario', JSON.stringify(usuario));
            mostrarBienvenida(usuario);
        };
    });
};
// Mensaje de bienvenida
function mostrarBienvenida(usuario) {
    Swal.fire({
        title: `¡Bienvenido, ${usuario.nombre} ${usuario.apellido}!`,
        text: 'Estas ingresar a la tienda online',
        icon: 'success',
        confirmButtonText: 'Continuar'
    });
};
// renderizar array de productos
function mostrarProductos(productos) {
    productos.forEach(prod => {
        const prodCard = document.createElement('div');
        prodCard.className = 'product-card';
        prodCard.innerHTML = `
            <h2>${prod.tipo}</h2>
            <h5 id="stock-${prod.id}">${prod.marca}<br>${formatearStock(prod.stock)}</h5>
            <p>$${prod.precioPesos} ARS / $${prod.precioDolares} USD</p>
            <button id="btn-${prod.id}" class="add-btn" ${prod.stock === 0 ? 'disabled' : ''}>
                ${prod.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
            </button>
        `;
        document.body.appendChild(prodCard);
    });
    // Event para agregar producto
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', agregarProducto);
    });
}
// formatear stock
function formatearStock(stock) {
    return stock > 0 ? `(cantidad ${stock})` : '(Sin stock)';
}
// agregar producto al carrito
function agregarProducto(e) {
    const id = Number(e.target.id.replace('btn-', ''));
    const producto = productos.find(p => p.id === id);
    if (!producto || producto.stock <= 0) {
        Swal.fire({
            title: 'Sin stock',
            text: 'No hay stock disponible para este producto',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    Swal.fire({
        title: `Agregar ${producto.marca} - ${producto.tipo}`,
        html: `
            <p>Stock disponible: ${producto.stock}</p>
            <input type="number" id="cantidad" class="swal2-input" 
                   min="1" max="${producto.stock}" value="1">
        `,
        focusConfirm: false,
        preConfirm: () => {
            const cantidad = Number(document.getElementById('cantidad').value);
            if (cantidad < 1 || cantidad > producto.stock) {
                Swal.showValidationMessage(`Ingresa una cantidad entre 1 y ${producto.stock}`);
                return false;
            }
            return cantidad;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const cantidad = result.value;
            // verificar si el producto está en carrito
            const prodCarrito = carrito.find(item => item.id === id);
            if (prodCarrito) {
                prodCarrito.cantidad += cantidad;
            } else {
                carrito.push({
                    ...producto,
                    cantidad: cantidad
                });
            }
            // actualizar stock
            producto.stock -= cantidad;
            // actualizar vista
            actualizarVistaProducto(producto);
            Swal.fire({
                title: 'Producto agregado',
                text: `${producto.marca} - ${producto.tipo} x${cantidad}`,
                icon: 'success',
                confirmButtonText: 'Continuar'             
            });
        }
    });
}
// actualizar vista del producto
function actualizarVistaProducto(producto) {
    const stockProd = document.getElementById(`stock-${producto.id}`);
    const estadoBtn = document.getElementById(`btn-${producto.id}`);
    if (stockProd) {
        stockProd.textContent = `${producto.tipo} ${formatearStock(producto.stock)}`;
    }
    if (estadoBtn) {
        estadoBtn.textContent = producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito';
        estadoBtn.disabled = producto.stock === 0;
    }
}
// Funcion ver carrito
function verCarrito() {
    const usuario = JSON.parse(sessionStorage.getItem('usuario'));
    const totalARS = carrito.reduce((sum, prod) => sum + (prod.precioPesos * (prod.cantidad || 1)), 0);
    const totalUSD = carrito.reduce((sum, prod) => sum + (prod.precioDolares * (prod.cantidad || 1)), 0);
    const carritoHTML = carrito.length > 0 
        ? carrito.map(prod => `
            <div class="carrito-item">
                ${prod.tipo} ${prod.marca} (cantidad ${prod.cantidad || 1})<br>
                Subtotal = $${prod.precioPesos * (prod.cantidad || 1)} ARS / $${prod.precioDolares * (prod.cantidad || 1)} USD<br>
                <button onclick="removerDelCarrito(${prod.id})" class="remove-btn">Eliminar</button>
            </div>
        `).join('') + `<br><br><strong>Total: $${totalARS} ARS / $${totalUSD} USD</strong>`
        : 'Tu carrito está vacío';
    Swal.fire({
        title: `Carrito de compras de ${usuario.nombre} ${usuario.apellido}`,
        html: carritoHTML,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Vaciar carrito',
        cancelButtonText: 'Volver'
    }).then((result) => {
        if (result.isConfirmed) {
            vaciarCarrito();
        }
    });
}
// Funcion remover del carrito
function removerDelCarrito(id) {
    const index = carrito.findIndex(item => item.id === id);
    if (index > -1) {
        const producto = productos.find(p => p.id === id);
        producto.stock += carrito[index].cantidad || 1;
        carrito.splice(index, 1);
        actualizarVistaProducto(producto);
        verCarrito();
    }
}
// Funcion vaciar carrito
function vaciarCarrito() {
    carrito.forEach(item => {
        const producto = productos.find(p => p.id === item.id);
        producto.stock += item.cantidad || 1;
        actualizarVistaProducto(producto);
    });
    carrito = [];
    Swal.fire('Carrito vaciado', '', 'success');
}
// boton ver carrito
const carritoBtn = document.createElement('button');
carritoBtn.className = 'carrito-btn';
carritoBtn.textContent = 'Ver carrito';
carritoBtn.addEventListener('click', verCarrito);
document.body.appendChild(carritoBtn);
// mostrar usuario actual + boton cerrar sesion
const usuario = JSON.parse(sessionStorage.getItem('usuario'));
if (usuario) {
    const saludo = document.createElement('div');
    saludo.className = 'saludo';
    saludo.innerHTML = `<p>Hola, ${usuario.nombre} ${usuario.apellido}</p>
                        <button class="sesion-btn">Cerrar sesión</button>
    `;
    const sesionBtn = saludo.querySelector('.sesion-btn');
    sesionBtn.addEventListener('click', () => {
        sessionStorage.removeItem('usuario');
        location.reload();
    });
    document.body.appendChild(saludo);
}
// ingreso
document.addEventListener('DOMContentLoaded', () => {
    iniciarSesion();
});