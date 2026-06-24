document.addEventListener("DOMContentLoaded", function () {

    // --- 1. Obtener referencias a los elementos HTML ---
    const tableroDiv = document.getElementById("tablero");
    const puntajeSpan = document.getElementById("puntaje");
    const vidasSpan = document.getElementById("vidas");
    const mensajeDiv = document.getElementById("mensaje");
    const btnIniciar = document.getElementById("btnIniciar");

    const TAM_CELDA = 26;
    const DURACION_ASUSTADO = 7000; // 7 segundos en modo "asustado"

    // 0 = camino, 1 = pared, 2 = punto, 3 = fruta especial (power pellet)
    // La fila 6, columna 7 quedó como 0: es la puerta de salida de la casa de fantasmas
    const mapaInicial = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,1,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,1,1,1,1,2,1,1,2,1],
        [1,3,1,0,2,2,2,2,2,2,2,1,0,3,1],
        [1,2,1,1,2,1,1,0,1,1,2,1,1,2,1],
        [1,2,2,2,2,1,0,0,0,1,2,2,2,2,1],
        [1,1,1,2,1,1,1,0,1,1,1,2,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,2,1,1,1,1,1,1,1,2,1,1,1],
        [1,2,2,2,2,1,0,0,0,1,2,2,2,2,1],
        [1,2,1,1,2,1,1,0,1,1,2,1,1,2,1],
        [1,3,1,2,2,2,2,2,2,2,2,2,1,3,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    // Posición de la casa donde "respawnean" los fantasmas comidos
    const CASA = { fila: 5, col: 7 };

    let mapa = [];
    let puntaje = 0;
    let vidas = 3;
    let totalPuntos = 0;
    let juegoActivo = false;
    let intervaloFantasmas = null;
    let timeoutAsustado = null;

    let pacman = { fila: 1, col: 1, direccion: "derecha" };

    // Cada fantasma guarda: posición, color, último movimiento (para no retroceder) y estado
    let fantasmas = [
        { fila: 5, col: 6, color: "rojo",  el: null, ultimaDir: null, asustado: false },
        { fila: 5, col: 7, color: "rosa",  el: null, ultimaDir: null, asustado: false },
        { fila: 5, col: 8, color: "cyan",  el: null, ultimaDir: null, asustado: false }
    ];

    let elementoPacman = null;

    // --- 2. Definir funciones ---

    function construirTablero() {
        tableroDiv.innerHTML = "";
        mapa = mapaInicial.map(fila => fila.slice());
        totalPuntos = 0;

        for (let f = 0; f < mapa.length; f++) {
            for (let c = 0; c < mapa[f].length; c++) {
                const celda = document.createElement("div");
                celda.classList.add("celda");
                celda.dataset.fila = f;
                celda.dataset.col = c;

                if (mapa[f][c] === 1) {
                    celda.classList.add("pared");
                } else if (mapa[f][c] === 2) {
                    celda.classList.add("punto");
                    totalPuntos++;
                } else if (mapa[f][c] === 3) {
                    celda.classList.add("fruta");
                    totalPuntos++;
                }

                tableroDiv.appendChild(celda);
            }
        }

        elementoPacman = document.createElement("div");
        elementoPacman.classList.add("pacman", "derecha");
        tableroDiv.appendChild(elementoPacman);

        fantasmas.forEach(f => {
            const elFantasma = document.createElement("div");
            elFantasma.classList.add("fantasma", f.color);
            tableroDiv.appendChild(elFantasma);
            f.el = elFantasma;
        });

        // Pantalla de "LISTO" que se sobrepone al tablero al iniciar la ronda
        const pantallaListo = document.createElement("div");
        pantallaListo.classList.add("pantalla-listo");
        pantallaListo.id = "pantallaListo";
        pantallaListo.textContent = "¡LISTO!";
        tableroDiv.appendChild(pantallaListo);

        posicionarElemento(elementoPacman, pacman.fila, pacman.col);
        fantasmas.forEach(f => posicionarElemento(f.el, f.fila, f.col));
    }

    function posicionarElemento(elemento, fila, col) {
        elemento.style.left = (col * TAM_CELDA + 2) + "px";
        elemento.style.top = (fila * TAM_CELDA + 2) + "px";
    }

    function esTransitable(fila, col) {
        if (fila < 0 || fila >= mapa.length || col < 0 || col >= mapa[0].length) {
            return false;
        }
        return mapa[fila][col] !== 1;
    }

    function moverPacman(direccion) {
        if (!juegoActivo) return;

        let nuevaFila = pacman.fila;
        let nuevaCol = pacman.col;

        if (direccion === "arriba") nuevaFila--;
        if (direccion === "abajo") nuevaFila++;
        if (direccion === "izquierda") nuevaCol--;
        if (direccion === "derecha") nuevaCol++;

        if (esTransitable(nuevaFila, nuevaCol)) {
            pacman.fila = nuevaFila;
            pacman.col = nuevaCol;
            pacman.direccion = direccion;

            elementoPacman.classList.remove("arriba", "abajo", "izquierda", "derecha");
            elementoPacman.classList.add(direccion);
            posicionarElemento(elementoPacman, pacman.fila, pacman.col);

            comerPunto();
            verificarColisionFantasmas();
        }
    }

    function comerPunto() {
        const valor = mapa[pacman.fila][pacman.col];

        if (valor === 2) {
            puntaje += 10;
            mapa[pacman.fila][pacman.col] = 0;
            actualizarCelda(pacman.fila, pacman.col);
            totalPuntos--;
        } else if (valor === 3) {
            puntaje += 50;
            mapa[pacman.fila][pacman.col] = 0;
            actualizarCelda(pacman.fila, pacman.col);
            totalPuntos--;
            activarModoAsustado();
        }

        puntajeSpan.textContent = puntaje;

        if (totalPuntos <= 0) {
            terminarJuego(true);
        }
    }

    function actualizarCelda(fila, col) {
        const celda = tableroDiv.querySelector(
            '.celda[data-fila="' + fila + '"][data-col="' + col + '"]'
        );
        if (celda) {
            celda.classList.remove("punto", "fruta");
        }
    }

    // Pone a todos los fantasmas en modo "asustado" (azules y comestibles) por unos segundos
    function activarModoAsustado() {
        fantasmas.forEach(f => {
            f.asustado = true;
            f.el.classList.add("asustado");
        });

        clearTimeout(timeoutAsustado);
        timeoutAsustado = setTimeout(desactivarModoAsustado, DURACION_ASUSTADO);
    }

    function desactivarModoAsustado() {
        fantasmas.forEach(f => {
            f.asustado = false;
            f.el.classList.remove("asustado");
        });
    }

    // Calcula la distancia Manhattan entre dos celdas (usada por la IA de los fantasmas)
    function distancia(fila1, col1, fila2, col2) {
        return Math.abs(fila1 - fila2) + Math.abs(col1 - col2);
    }

    // Mueve a los fantasmas: persiguen a Pacman (o huyen si están asustados),
    // evitando retroceder sobre su propio camino salvo que sea la única opción
    function moverFantasmas() {
        fantasmas.forEach(fantasma => {
            const direcciones = [
                { nombre: "arriba",     df: -1, dc: 0 },
                { nombre: "abajo",      df: 1,  dc: 0 },
                { nombre: "izquierda",  df: 0,  dc: -1 },
                { nombre: "derecha",    df: 0,  dc: 1 }
            ];

            const opuesta = {
                arriba: "abajo", abajo: "arriba",
                izquierda: "derecha", derecha: "izquierda"
            };

            let opciones = direcciones.filter(d =>
                esTransitable(fantasma.fila + d.df, fantasma.col + d.dc)
            );

            if (opciones.length > 1 && fantasma.ultimaDir) {
                const sinRetroceso = opciones.filter(d => d.nombre !== opuesta[fantasma.ultimaDir]);
                if (sinRetroceso.length > 0) {
                    opciones = sinRetroceso;
                }
            }

            if (opciones.length === 0) return;

            let movimientoElegido;

            // 20% de las veces se mueve al azar para no ser 100% predecible
            if (Math.random() < 0.2) {
                movimientoElegido = opciones[Math.floor(Math.random() * opciones.length)];
            } else {
                // Evalúa cada opción según la distancia resultante a Pacman
                let mejorPuntaje = fantasma.asustado ? -Infinity : Infinity;

                opciones.forEach(d => {
                    const filaDestino = fantasma.fila + d.df;
                    const colDestino = fantasma.col + d.dc;
                    const dist = distancia(filaDestino, colDestino, pacman.fila, pacman.col);

                    if (fantasma.asustado) {
                        // Asustado: busca alejarse lo más posible de Pacman
                        if (dist > mejorPuntaje) {
                            mejorPuntaje = dist;
                            movimientoElegido = d;
                        }
                    } else {
                        // Normal: busca acercarse lo más posible a Pacman
                        if (dist < mejorPuntaje) {
                            mejorPuntaje = dist;
                            movimientoElegido = d;
                        }
                    }
                });
            }

            fantasma.fila += movimientoElegido.df;
            fantasma.col += movimientoElegido.dc;
            fantasma.ultimaDir = movimientoElegido.nombre;

            posicionarElemento(fantasma.el, fantasma.fila, fantasma.col);
        });

        verificarColisionFantasmas();
    }

    // Revisa colisiones de Pacman con los fantasmas: lo atrapan o Pacman se los come
    function verificarColisionFantasmas() {
        fantasmas.forEach(fantasma => {
            const mismaCelda = fantasma.fila === pacman.fila && fantasma.col === pacman.col;

            if (!mismaCelda) return;

            if (fantasma.asustado) {
                // Pacman se come al fantasma: vuelve a la casa y suma puntos
                puntaje += 200;
                puntajeSpan.textContent = puntaje;
                fantasma.asustado = false;
                fantasma.el.classList.remove("asustado");
                fantasma.fila = CASA.fila;
                fantasma.col = CASA.col;
                posicionarElemento(fantasma.el, fantasma.fila, fantasma.col);
            } else {
                vidas--;
                actualizarVidas();

                if (vidas <= 0) {
                    terminarJuego(false);
                } else {
                    reiniciarPosiciones();
                }
            }
        });
    }

    function actualizarVidas() {
        vidasSpan.textContent = "❤️".repeat(vidas);
    }

    function reiniciarPosiciones() {
        pacman.fila = 1;
        pacman.col = 1;
        pacman.direccion = "derecha";
        posicionarElemento(elementoPacman, pacman.fila, pacman.col);

        fantasmas[0].fila = 5; fantasmas[0].col = 6;
        fantasmas[1].fila = 5; fantasmas[1].col = 7;
        fantasmas[2].fila = 5; fantasmas[2].col = 8;

        fantasmas.forEach(f => {
            f.ultimaDir = null;
            f.asustado = false;
            f.el.classList.remove("asustado");
            posicionarElemento(f.el, f.fila, f.col);
        });

        clearTimeout(timeoutAsustado);
        mostrarPantallaListo();
    }

    function terminarJuego(gano) {
        juegoActivo = false;
        clearInterval(intervaloFantasmas);
        clearTimeout(timeoutAsustado);

        mensajeDiv.classList.remove("oculto", "victoria", "derrota");

        if (gano) {
            mensajeDiv.textContent = "¡Ganaste! Puntaje final: " + puntaje;
            mensajeDiv.classList.add("victoria");
        } else {
            mensajeDiv.textContent = "Game Over. Puntaje final: " + puntaje;
            mensajeDiv.classList.add("derrota");
        }

        btnIniciar.textContent = "Jugar de nuevo";
    }

    function mostrarPantallaListo() {
        juegoActivo = false;
        clearInterval(intervaloFantasmas);

        const pantallaListo = document.getElementById("pantallaListo");
        if (pantallaListo) pantallaListo.classList.remove("oculto");

        setTimeout(function () {
            if (pantallaListo) pantallaListo.classList.add("oculto");
            juegoActivo = true;
            intervaloFantasmas = setInterval(moverFantasmas, 400);
        }, 1500);
    }

    function iniciarJuego() {
        puntaje = 0;
        vidas = 3;
        pacman = { fila: 1, col: 1, direccion: "derecha" };
        fantasmas = [
            { fila: 5, col: 6, color: "rojo", el: null, ultimaDir: null, asustado: false },
            { fila: 5, col: 7, color: "rosa", el: null, ultimaDir: null, asustado: false },
            { fila: 5, col: 8, color: "cyan", el: null, ultimaDir: null, asustado: false }
        ];

        puntajeSpan.textContent = puntaje;
        actualizarVidas();
        mensajeDiv.classList.add("oculto");
        btnIniciar.textContent = "Reiniciar";

        construirTablero();
        mostrarPantallaListo();
    }

    // --- 3. Asignar eventos ---

    document.addEventListener("keydown", function (evento) {
        if (evento.key === "ArrowUp") moverPacman("arriba");
        if (evento.key === "ArrowDown") moverPacman("abajo");
        if (evento.key === "ArrowLeft") moverPacman("izquierda");
        if (evento.key === "ArrowRight") moverPacman("derecha");
    });

    btnIniciar.addEventListener("click", iniciarJuego);

    construirTablero();
});