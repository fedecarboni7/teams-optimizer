function updateStars(stars, value) {
        stars.forEach(star => {
            if (star.getAttribute('data-value') <= value) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

// Aplicar efecto hover a las estrellas
function applyHoverEffect(container) {
    container.addEventListener('mouseover', function(event) {
        if (event.target.classList.contains('star')) {
            const starRating = event.target.closest('.star-rating');
            const stars = starRating.querySelectorAll('.star');
            const hoverValue = parseInt(event.target.getAttribute('data-value'));

            stars.forEach(star => {
                const starValue = parseInt(star.getAttribute('data-value'));
                if (starValue <= hoverValue) {
                    star.classList.add('hover');
                    star.classList.remove('active');
                } else {
                    star.classList.remove('hover');
                    star.classList.remove('active');
                }
            });
        }
    });

    container.addEventListener('mouseout', function(event) {
        if (event.target.classList.contains('star')) {
            const starRating = event.target.closest('.star-rating');
            const stars = starRating.querySelectorAll('.star');
            const selectedValue = parseInt(starRating.querySelector('input[type="hidden"]').value);

            stars.forEach(star => {
                star.classList.remove('hover');
                if (parseInt(star.getAttribute('data-value')) <= selectedValue) {
                    star.classList.add('active');
                } else {
                    star.classList.remove('active');
                }
            });
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