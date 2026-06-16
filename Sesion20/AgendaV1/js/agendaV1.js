document.addEventListener("DOMContentLoaded", function() {
    const nombreInput = document.getElementById("nombre");
    const telefonoInput = document.getElementById("telefono");
    const guardarButton = document.getElementById("guardarBtn");
    const recuperarButton = document.getElementById("recuperarBtn");
    const listaUL = document.getElementById("lista");

    function guardarDatos() {
        localStorage.nombre = nombreInput.value;
        localStorage.telefono = telefonoInput.value;
    }

    function recuperarDatos() {
        if (localStorage.nombre != undefined && localStorage.telefono !== undefined) {
            listaUL.innerHTML += "<li>" + localStorage.nombre + " - " + localStorage.telefono + "</li>";
        } else {
            listaUL.innerHTML = "<li>No hay datos que guardar</li>";
        }
    }

    guardarButton.addEventListener("click", guardarDatos);
    recuperarButton.addEventListener("click", recuperarDatos);
})