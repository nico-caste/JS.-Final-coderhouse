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
// Mostrar bienvenida
function mostrarBienvenida(usuario) {
    Swal.fire({
        title: `¡Bienvenido, ${usuario.nombre} ${usuario.apellido}!`,
        text: 'Ahora puedes ingresar a la tienda online',
        icon: 'success',
        confirmButtonText: 'Comenzar'
    });
};
// Array de productos
const productos = [
    { id: 1, marca: 'Samsung', tipo: 'Smartphone', precioPesos: 150000, precioDolares: 13500 },
    { id: 2, marca: 'Apple', tipo: 'Laptop', precioPesos: 300000, precioDolares: 27000 },
    { id: 3, marca: 'Sony', tipo: 'Auriculares', precioPesos: 50000, precioDolares: 4500 },
    { id: 4, marca: 'LG', tipo: 'SmartTV', precioPesos: 200000, precioDolares: 18000 },
    { id: 5, marca: 'Samsung', tipo: 'SmartTV', precioPesos: 250000, precioDolares: 22500 },
    { id: 6, marca: 'Apple', tipo: 'Smartphone', precioPesos: 130000, precioDolares: 11000 },
    { id: 7, marca: 'Sony', tipo: 'Laptop', precioPesos: 250000, precioDolares: 22500 },
    { id: 8, marca: 'LG', tipo: 'Auriculares', precioPesos: 40000, precioDolares: 37000 }
];
// Array carrito
let carrito = [];
// Agregar producto al carrito
function agregarProducto(id) {
    const producto = productos.find((producto) => producto.id === id);
    carrito.push(producto);
    Swal.fire({
        title: 'Producto agregado al carrito',
        text: `Has agregado un ${producto.tipo} ${producto.marca}`,
        icon: 'success',
        confirmButtonText: 'Continuar'
    });
};
// Mostrar carrito
function mostrarCarrito() {
    let totalPesos = 0;
    let totalDolares = 0;
    carrito.forEach((producto) => {
        totalPesos += producto.precioPesos;
        totalDolares += producto.precioDolares;
    });
    Swal.fire({
        title: 'Carrito de compras',
        html: `
            <p>Productos: ${carrito.length}</p>
            <p>Total en pesos: $${totalPesos}</p>
            <p>Total en dólares: $${totalDolares}</p>
        `,
        confirmButtonText: 'Pagar'
    });
};
document.addEventListener('DOMContentLoaded', () => {
    iniciarSesion();
        // Renderizar productos
        const productosElement = document.getElementById('productos');
        productos.forEach((producto) => {
            const productoElement = document.createElement('div');
            productoElement.innerHTML = `
            <h2>${producto.marca}</h2>
            <h5>${producto.tipo}</h5>
            <p>$${producto.precioPesos} ARS / $${producto.precioDolares} USD</p>
            `;
            document.body.appendChild(productoElement);
            const addButton = document.createElement('button');
            addButton.textContent = 'Agregar al carrito';
            productoElement.appendChild(addButton);
            addButton.addEventListener('click', () => agregarProducto(producto));
        });
});