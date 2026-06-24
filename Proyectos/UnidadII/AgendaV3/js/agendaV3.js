document.addEventListener("DOMContentLoaded", function () {
    const nombreInput = document.getElementById("nombre");
    const telefonoInput = document.getElementById("telefono");
    const emailInput = document.getElementById("email");
    const direccionInput = document.getElementById("direccion");

    const guardarBtn = document.getElementById("guardarBtn");
    const buscarBtn = document.getElementById("buscarBtn");
    const eliminarBtn = document.getElementById("eliminarBtn");
    const eliminarTodosBtn = document.getElementById("eliminarTodosBtn");
    const exportarBtn = document.getElementById("exportarBtn");

    const listaContactos = document.getElementById("listaContactos");

    function guardarDatos() {
        const nombre = nombreInput.value.trim();
        const telefono = telefonoInput.value.trim();
        const email = emailInput.value.trim();
        const direccion = direccionInput.value.trim();

        if (nombre === "" || telefono === "") {
            alert("Por favor, completa al menos Nombre y Teléfono para guardar.");
            return;
        }

        const contacto = { telefono, email, direccion };
        localStorage.setItem(nombre, JSON.stringify(contacto));

        limpiarCampos();
        actualizarTabla();
    }

    function buscarDatos() {
        const nombreABuscar = nombreInput.value.trim();

        if (nombreABuscar === "") {
            alert("Escribe un nombre en el campo para poder buscar sus datos.");
            return;
        }

        const datosGuardados = localStorage.getItem(nombreABuscar);

        if (datosGuardados) {
            const contacto = JSON.parse(datosGuardados);
            telefonoInput.value = contacto.telefono;
            emailInput.value = contacto.email;
            direccionInput.value = contacto.direccion;
        } else {
            alert("No se encontró ningún contacto con ese nombre.");
            limpiarCampos(true);
        }
    }

    function eliminarContacto() {
        const nombreAEliminar = nombreInput.value.trim();

        if (nombreAEliminar === "") {
            alert("Escribe el nombre del contacto que deseas eliminar.");
            return;
        }

        if (localStorage.getItem(nombreAEliminar)) {
            localStorage.removeItem(nombreAEliminar);
            limpiarCampos();
            actualizarTabla();
        } else {
            alert("El nombre especificado no existe en la agenda.");
        }
    }

    function eliminarTodos() {
        if (localStorage.length === 0) {
            alert("La agenda ya está vacía.");
            return;
        }

        if (confirm("¿Estás seguro de que deseas vaciar toda la agenda?")) {
            localStorage.clear();
            limpiarCampos();
            actualizarTabla();
        }
    }

    const contarBtn = document.getElementById("contarBtn");

    // Botón adicional: muestra cuántos contactos hay guardados
    function contarContactos() {
        const cantidad = localStorage.length;

        if (cantidad === 0) {
            alert("La agenda está vacía, no hay contactos guardados.");
        } else if (cantidad === 1) {
            alert("Tienes 1 contacto guardado en la agenda.");
        } else {
            alert("Tienes " + cantidad + " contactos guardados en la agenda.");
        }
    }

    // --- 3. Asignar eventos a los botones ---
    guardarBtn.addEventListener("click", guardarDatos);
    buscarBtn.addEventListener("click", buscarDatos);
    eliminarBtn.addEventListener("click", eliminarContacto);
    eliminarTodosBtn.addEventListener("click", eliminarTodos);
    contarBtn.addEventListener("click", contarContactos);

    function limpiarCampos(soloOpcionales) {
        if (!soloOpcionales) {
            nombreInput.value = "";
        }
        telefonoInput.value = "";
        emailInput.value = "";
        direccionInput.value = "";
    }

    function actualizarTabla() {
        listaContactos.innerHTML = "";

        for (let i = 0; i < localStorage.length; i++) {
            const nombre = localStorage.key(i);
            const contacto = JSON.parse(localStorage.getItem(nombre));

            const fila = document.createElement("tr");
            fila.innerHTML =
                "<td>" + nombre + "</td>" +
                "<td>" + contacto.telefono + "</td>" +
                "<td>" + (contacto.email || "") + "</td>" +
                "<td>" + (contacto.direccion || "") + "</td>";
            listaContactos.appendChild(fila);
        }
    }

    guardarBtn.addEventListener("click", guardarDatos);
    buscarBtn.addEventListener("click", buscarDatos);
    eliminarBtn.addEventListener("click", eliminarContacto);
    eliminarTodosBtn.addEventListener("click", eliminarTodos);
    exportarBtn.addEventListener("click", exportarContactos);

    actualizarTabla();
});