document.addEventListener('DOMContentLoaded', function () {

    const formSuscripcion = document.querySelector('.bg-info-subtle form');

    if (formSuscripcion) {
        formSuscripcion.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = formSuscripcion.querySelector('input[type="email"]').value;
            const acepta = document.getElementById('aceptaPolitica').checked;

            if (!email) {
                alert('Por favor ingresa tu correo electrónico.');
                return;
            }

            if (!acepta) {
                alert('Debes aceptar la política de protección de datos personales.');
                return;
            }

            alert('¡Gracias por suscribirte, ' + email + '!');
            formSuscripcion.reset();
        });
    }

    const botonesComprar = document.querySelectorAll('.product-card button');
    botonesComprar.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const nombreProducto = btn.closest('.card-body').querySelector('.card-title').textContent;
            console.log('Producto agregado: ' + nombreProducto);
        });
    });

});