// Aplicar funcionalidad a los sliders
function applySliderEffect(container) {
    container.addEventListener('input', function(event) {
        if (event.target.classList.contains('skill-slider')) {
            const sliderRating = event.target.closest('.slider-rating');
            const hiddenInput = sliderRating.querySelector('input[type="hidden"]');
            const valueDisplay = sliderRating.querySelector('.slider-value');
            const value = event.target.value;

            hiddenInput.value = value;
            if (valueDisplay) {
                valueDisplay.textContent = value;
            }
        }
    });
}

// Mostrar u ocultar detalles de un jugador
function rotateIcon(detailsContainer, icon) {
    //wait for the animation to finish before removing the class
    detailsContainer.addEventListener('transitionend', function() {
        if (detailsContainer.style.maxHeight === "0px") {
            if (icon) {
                icon.classList.remove('rotate');
            } else {
                icon = detailsContainer.previousElementSibling.querySelector('.toggle-icon');
                icon.classList.remove('rotate');
            }
        } else {
            if (icon) {
                icon.classList.add('rotate');
            } else {
                icon = detailsContainer.previousElementSibling.querySelector('.toggle-icon');
                icon.classList.add('rotate');
            }
        }
    });
}

// Asignar un número a cada jugador agregado
function renumerarJugadores() {
    const container = document.getElementById("players-container");
    const jugadores = container.children;
    for (let i = 0; i < jugadores.length; i++) {
      const jugador = jugadores[i];
      const nameInput = jugador.querySelector(".player-header input[name='names']");
      if (nameInput && !nameInput.readOnly) {
        // Solo actualizar el placeholder si el input no es de solo lectura (jugador no guardado)
        nameInput.placeholder = "Nombre";
      }
      // Actualizar el valor del checkbox (opcional, si lo usas para algo)
      const checkbox = jugador.querySelector(".player-header input[type='checkbox']");
      if (checkbox) {
        checkbox.value = i;
      }
    }
}

// Renumerar jugadores después de un swap
function renumerarJugadoresEquipo(teamList) {
    // Obtener todos los elementos de jugador en el equipo
    const jugadores = teamList.querySelectorAll('.player-item');
    
    // Actualizar el número de cada jugador según su posición en la lista
    jugadores.forEach((jugador, index) => {
        const numeroSpan = jugador.querySelector('.player-number');
        if (numeroSpan) {
            numeroSpan.textContent = (index + 1) + '.';
        }
    });
}