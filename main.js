// array carrito y
let carrito = [];
let productos = [];
// Importar productos
const url = "./data/products.json";
fetch(url)
.then(res => res.json())
.then(data => {
    productos = data;
    mostrarProductos(productos);
})
.catch(error => console.error('Error al cargar productos:', error));
// Inicio de sesion
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
// Renderizar array de productos
function mostrarProductos(productos) {
    productos.forEach(prod => {
        const prodCard = document.createElement('div');
        prodCard.innerHTML = `
            <h2>${prod.marca}</h2>
            <h5 id="stock-${prod.id}">${prod.tipo} ${formatearStock(prod.stock)}</h5>
            <p>$${prod.precioPesos} ARS / $${prod.precioDolares} USD</p>
            <button id="btn-${prod.id}" class="add-btn" ${prod.stock === 0 ? 'disabled' : ''}>
                ${prod.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
            </button>
        `;
        document.body.appendChild(prodCard);
    });
    const addBtns = document.querySelectorAll('.add-btn');
    document.querySelectorAll('.add-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', agregarProducto);
    });
    addBtns.forEach(btn => {
        btn.addEventListener('click', agregarProducto);
    });
}
// Formatear stock
function formatearStock(stock) {
    return stock > 0 ? `(cantidad ${stock})` : '(Sin stock)';
}
// Agregar producto al carrito
function agregarProducto(e) {
    const id = Number(e.target.id.replace('btn-', ''));
    const producto = productos.find(p => p.id === id);
    if (producto && producto.stock > 0) {
        // verificar si el producto esta en el carrito
        const prodCarrito = carrito.find(item => item.id === id);
        if (prodCarrito) {
            prodCarrito.cantidad = (prodCarrito.cantidad || 1) + 1;
        } else {
            producto.cantidad = 1;
            carrito.push({...producto});
        }
        // Actualizar stock
        producto.stock--;
        // Actualizar vista
        actualizarVistaProducto(producto);
        Swal.fire({
            title: 'Producto agregado',
            text: `${producto.marca} - ${producto.tipo}`,
            icon: 'success',
            confirmButtonText: 'Continuar'
        });
    } else {
        Swal.fire({
            title: 'Sin stock',
            text: 'No hay stock disponible para este producto',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
    }
}
// Actualizar vista del producto
function actualizarVistaProducto(producto) {
    const stockProd = document.getElementById(`stock-${producto.id}`);
    const estadoBtn = document.getElementById(`btn-${producto.id}`);
    if (stockProd) {
        stockProd.textContent = `${producto.tipo} ${formatearStock(producto.stock)}`;
    }
    
    if (estadoBtn) {
        if (producto.stock === 0) {
            estadoBtn.textContent = 'Sin stock';
            estadoBtn.disabled = true;
        } else {
            estadoBtn.textContent = 'Agregar al carrito';
            estadoBtn.disabled = false;
        }
    }
}
// Funcion ver carrito
function verCarrito() {
    const usuario = JSON.parse(sessionStorage.getItem('usuario'));
    const total = carrito.reduce((sum, prod) => sum + (prod.precioPesos * (prod.cantidad || 1)), 0);
    const carritoHTML = carrito.length > 0 
        ? carrito.map(prod => 
            `${prod.marca} - ${prod.tipo} x${prod.cantidad || 1}
             ($${prod.precioPesos * (prod.cantidad || 1)} ARS)<br>
             <button onclick="removerDelCarrito('${prod.id}')" class="remove-btn">Eliminar</button>`
        ).join('') + `<br><br>Total: $${total} ARS`
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
// Funcion remover item de carrito
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
carritoBtn.textContent = 'Ver carrito';
carritoBtn.addEventListener('click', verCarrito);
document.body.appendChild(carritoBtn);

// ingreso
document.addEventListener('DOMContentLoaded', () => {
    iniciarSesion();
});