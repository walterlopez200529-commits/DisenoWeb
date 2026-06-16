document.addEventListener("DOMContentLoaded", function () {

    // --- 1. Referencias a elementos HTML ---
    const productoSelect = document.getElementById("producto");
    const precioInput    = document.getElementById("precio");
    const cantidadInput  = document.getElementById("cantidad");
    const agregarBtn     = document.getElementById("agregarBtn");
    const eliminarBtn    = document.getElementById("eliminarBtn");
    const limpiarBtn     = document.getElementById("limpiarBtn");
    const listaCarrito   = document.getElementById("listaCarrito");
    const totalCompra    = document.getElementById("totalCompra");

    // --- 2. Al seleccionar producto, se autocompleta el precio ---
    productoSelect.addEventListener("change", function () {
        const opcion = productoSelect.options[productoSelect.selectedIndex];
        precioInput.value = opcion.dataset.precio || "";
    });

    // --- 3. Funciones ---

    // Obtener carrito desde localStorage (guardado como JSON)
    function obtenerCarrito() {
        const datos = localStorage.getItem("carrito");
        return datos ? JSON.parse(datos) : [];
    }

    // Guardar carrito en localStorage
    function guardarCarrito(carrito) {
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }

    // Agregar producto al carrito
    function agregarProducto() {
        const producto = productoSelect.value.trim();
        const precio   = parseFloat(precioInput.value);
        const cantidad = parseInt(cantidadInput.value);

        if (producto === "" || isNaN(precio) || isNaN(cantidad) || cantidad < 1) {
            alert("Por favor, selecciona un producto e ingresa una cantidad válida.");
            return;
        }

        const carrito = obtenerCarrito();

        // Si ya existe el producto, sumar cantidad
        const index = carrito.findIndex(item => item.producto === producto);
        if (index !== -1) {
            carrito[index].cantidad += cantidad;
        } else {
            carrito.push({ producto, precio, cantidad });
        }

        guardarCarrito(carrito);
        actualizarTabla();

        // Limpiar campos
        productoSelect.value = "";
        precioInput.value    = "";
        cantidadInput.value  = 1;
    }

    // Eliminar un producto por nombre
    function eliminarProducto() {
        const producto = productoSelect.value.trim();

        if (producto === "") {
            alert("Selecciona el producto que deseas eliminar.");
            return;
        }

        let carrito = obtenerCarrito();
        const index = carrito.findIndex(item => item.producto === producto);

        if (index !== -1) {
            carrito.splice(index, 1);
            guardarCarrito(carrito);
            actualizarTabla();
            productoSelect.value = "";
            precioInput.value    = "";
            cantidadInput.value  = 1;
        } else {
            alert("El producto seleccionado no está en el carrito.");
        }
    }

    // Vaciar todo el carrito
    function vaciarCarrito() {
        if (obtenerCarrito().length === 0) {
            alert("El carrito ya está vacío.");
            return;
        }
        if (confirm("¿Estás seguro de que deseas vaciar todo el carrito?")) {
            localStorage.removeItem("carrito");
            actualizarTabla();
        }
    }

    // Actualizar la tabla en pantalla y calcular total
    function actualizarTabla() {
        const carrito = obtenerCarrito();
        listaCarrito.innerHTML = "";
        let total = 0;

        carrito.forEach(item => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${item.producto}</td>
                <td>S/ ${item.precio.toFixed(2)}</td>
                <td>${item.cantidad}</td>
                <td>S/ ${subtotal.toFixed(2)}</td>
            `;
            listaCarrito.appendChild(fila);
        });

        totalCompra.textContent = total.toFixed(2);
    }

    // --- 4. Asignar eventos a botones ---
    agregarBtn.addEventListener("click", agregarProducto);
    eliminarBtn.addEventListener("click", eliminarProducto);
    limpiarBtn.addEventListener("click", vaciarCarrito);

    // Cargar tabla al abrir la página (datos persistentes)
    actualizarTabla();
});