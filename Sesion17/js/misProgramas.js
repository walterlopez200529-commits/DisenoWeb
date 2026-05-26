function areaRectangulo(params) {
    base = Number(prompt("Ingrese la base del rectángulo"));
    altura = Number(prompt("Ingrese la altura del rectángulo"));
    area = base * altura;
    perimetro = (base + altura) * 2;
    alert("Área del rectángulo\n" + "Area: " + area + " m2\n" + "Perímetro: " + perimetro + " m");
}

function resta(x,y) {
    rest = x - y;
    document.write("<h2>Resta de " + x + " - " + y + " = " + rest + "</h2>");
}

function suma(a,b) {
    sum = a + b;
    document.getElementById("sumar").innerHTML = "Suma de " + a + " + " + b + " = " + sum;
}

function escribir() {
    valor = document.getElementById("entrada").value;
    document.getElementById("contenido").innerHTML = "> " + valor;
}    