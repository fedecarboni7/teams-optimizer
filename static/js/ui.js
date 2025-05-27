// filepath: /workspaces/teams-optimizer/static/js/ui.js

// Ejecutar el código cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    // Botón para seleccionar/deseleccionar a todos los jugadores
    const toggleButton = document.getElementById('toggle-select-button');
    const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]');
    
    toggleButton.addEventListener('click', function () {
        const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]');
        const allSelected = Array.from(checkboxes).every(checkbox => checkbox.checked);
        checkboxes.forEach(checkbox => {
            checkbox.checked = !allSelected;
        });
        updateSelectedCount();
        updateToggleButtonText();
    });

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            updateSelectedCount();
            updateToggleButtonText();
        });
    });

    // Puntuar habilidades de los jugadores con estrellas
    const starRatings = document.querySelectorAll('.star-rating');
    
    starRatings.forEach(rating => {
        const stars = rating.querySelectorAll('.star');
        const input = rating.querySelector('input[type="hidden"]');
        
        updateStars(stars, input.value);
        
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                input.value = value;
                updateStars(stars, value);
            });
        });
    });
    
    function updateStars(stars, value) {
        stars.forEach(star => {
            if (star.getAttribute('data-value') <= value) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    const existingSkillsContainers = document.querySelectorAll('.skills-container');
    existingSkillsContainers.forEach(container => {
        applyHoverEffect(container);
    });

    // Inicializar el estado del botón de scroll al cargar la página
    const scrollButton = document.getElementById('scroll-button');
    if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
        scrollButton.style.display = 'none';
    } else {
        scrollButton.style.display = 'block';
    }

    // Mostrar/Ocultar la lista de jugadores seleccionados al hacer clic en el botón flotante
    const floatingButton = document.getElementById('floating-button');
    const playersList = document.getElementById('selected-players-list');

    floatingButton.addEventListener('click', function (event) {
        event.stopPropagation();
        if (playersList.style.display === 'block') {
            playersList.style.display = 'none';
        } else {
            playersList.style.display = 'block';
        }
    });

    // Cerrar la lista si se hace clic fuera de ella
    document.addEventListener('click', function (event) {
        if (!floatingButton.contains(event.target) && !playersList.contains(event.target)) {
            playersList.style.display = 'none';
        }
    });

    // Mostrar el pop-up si el usuario no lo ha visto
    const popup = document.getElementById("popup");
    const closeButton = document.getElementById("closeButton");
  
    const hasSeenPopup = localStorage.getItem('hasSeenPopup');
  
    if (!hasSeenPopup && popup !== null) {
        setTimeout(function () {
            popup.style.display = "block";
        }, 2000);
    }
    
    if (closeButton !== null) {
        closeButton.addEventListener("click", function () {
            popup.style.display = "none";
            localStorage.setItem('hasSeenPopup', 'true');
        });
    }

});

// Buscador
function filterPlayers() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const players = document.querySelectorAll('.player-entry');

    players.forEach(player => {
        const playerName = player.querySelector('input[name="names"]').value.toLowerCase();
        if (searchInput === '' || playerName.includes(searchInput)) {
            player.style.display = '';
        } else {
            player.style.display = 'none';
        }
    });

    // Preserve the original order when showing all players
    if (searchInput === '') {
        const playersContainer = document.getElementById('players-container');
        const allPlayers = Array.from(players);
        playersContainer.innerHTML = '';
        allPlayers.forEach(player => playersContainer.appendChild(player));
    }
}

// Validar formulario (sin el fetch)
function validateForm(event) {
    event.preventDefault();
    let playersContainer = document.getElementById('players-container');
    let playerEntries = playersContainer.getElementsByClassName('player-entry');
    
    if (playerEntries.length < 3) {
        alert('Debes crear al menos tres jugadores.');
        return false;
    }
    
    // for (let entry of playerEntries) {
    //     let inputs = entry.getElementsByTagName('input');
    //     let nameInput = entry.querySelector('input[name="names"]');
    //     for (let input of inputs) {
    //         if (input.type !== 'checkbox' && input.value.trim() === '') {
    //             alert('Por favor, completá todos los campos. Para el jugador: ' + nameInput.value + ',' + ' el campo: ' + input.name + '.');
    //             return false;
    //         }
    //     }
    // }
    
    let selectedPlayers = document.querySelectorAll('input[name="selectedPlayers"]:checked');
    if (selectedPlayers.length < 3) {
        alert('Por favor, selecciona al menos tres jugadores.');
        return false;
    }
    
    if (selectedPlayers.length > 22) {
        alert('El máximo de jugadores seleccionados es 22.');
        return false;
    }
    
    let names = new Set();
    for (let entry of playerEntries) {
        let nameInput = entry.querySelector('input[name="names"]');
        if (nameInput) {
            let playerName = nameInput.value.trim();
            if (names.has(playerName)) {
                alert('Los nombres de los jugadores deben ser distintos. Nombre repetido: ' + playerName);
                return false;
            }
            names.add(playerName);
        }
    }
    
    // Verificar cambios sin guardar usando el nuevo sistema de seguimiento
    if (window.playerChangeTracker && validateUnsavedChanges()) {
        return false; // El usuario canceló, no continuar
    }

    let formData = new FormData(event.target);
    submitForm(formData); // Llama a la función de api.js
    return false;
}

// Agregar jugador
function addPlayer() {
    const container = document.getElementById("players-container");
    const playerCount = container.children.length;
    const playerDiv = document.createElement("div");

    playerDiv.className = "player-entry";

    // Player Header
    const playerHeader = document.createElement("div");
    playerHeader.className = "player-header";

    // Checkbox para seleccionar jugador
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "selectedPlayers";
    checkbox.value = playerCount;
    checkbox.checked = true;
    playerHeader.appendChild(checkbox);

    // Añadir el manejador de eventos para los checkboxes nuevos
    checkbox.addEventListener('change', function () {
        updateSelectedCount();
        updateToggleButtonText();
    });

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.name = "names";
    nameInput.required = true;
    nameInput.placeholder = "Nombre";
    nameInput.style.flex = "1"; // Asegurar que el input de nombre se expanda
    playerHeader.appendChild(nameInput);

    playerDiv.appendChild(playerHeader);

    // Botón para mostrar/ocultar detalles
    const toggleButton = document.createElement("button");
    toggleButton.className = "toggle-details";
    toggleButton.type = "button";
    toggleButton.innerHTML = '<i class="fa-solid fa-angle-down toggle-icon"></i>';
    toggleButton.addEventListener("click", function() {
        toggleDetails(this);
    });
    playerHeader.appendChild(toggleButton);

    // Contenedor para habilidades
    const detailsContainer = document.createElement("div");
    detailsContainer.className = "details-container";
    detailsContainer.style.display = "block";
    detailsContainer.style.maxHeight = "383px";
    detailsContainer.style.paddingBottom = "5px";

    // Skills Container
    const skillsContainer = document.createElement("div");
    skillsContainer.className = "skills-container";

    // Crear skills
    const skills = ['velocidad', 'resistencia', 'control', 'pases', 'tiro', 'defensa', 'habilidad_arquero', 'fuerza_cuerpo', 'vision'];

    skills.forEach(skill => {
        const skillEntry = document.createElement("div");
        skillEntry.className = "skill-entry";

        const label = document.createElement("label");
        label.textContent = skill.charAt(0).toUpperCase() + skill.slice(1).replace('_', ' ') + ":";
        label.textContent = label.textContent.replace('Habilidad arquero', 'Hab. Arquero');

        const starRating = document.createElement("div");
        starRating.className = "star-rating";
        starRating.setAttribute("data-skill", skill);

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement("span");
            star.className = "star";
            star.textContent = "★";
            star.setAttribute("data-value", i);
            starRating.appendChild(star);
        }

        const hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.name = skill;
        hiddenInput.required = true;

        starRating.appendChild(hiddenInput);

        skillEntry.appendChild(label);
        skillEntry.appendChild(starRating);
        skillsContainer.appendChild(skillEntry);
    });

    detailsContainer.appendChild(skillsContainer);
    playerDiv.appendChild(detailsContainer);

    // Agregar funcionalidad a las estrellas
    skillsContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('star')) {
            const starRating = event.target.closest('.star-rating');
            const stars = starRating.querySelectorAll('.star');
            const hiddenInput = starRating.querySelector('input[type="hidden"]');
            const value = event.target.getAttribute('data-value');

            hiddenInput.value = value;

            stars.forEach(star => {
                if (star.getAttribute('data-value') <= value) {
                    star.classList.add('active');
                } else {
                    star.classList.remove('active');
                }
            });
        }
    });

    // Botón para eliminar
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";

    const trashIcon = document.createElement("i");
    trashIcon.className = "fa-solid fa-trash";
    
    deleteButton.appendChild(trashIcon);

    deleteButton.addEventListener("click", function() {
        deletePlayer(deleteButton);
    });
    playerHeader.appendChild(deleteButton);

    container.appendChild(playerDiv);

    applyHoverEffect(skillsContainer);
    updateSelectedCount();
    
    // Configurar listeners del tracker para el nuevo jugador si está disponible
    if (window.playerChangeTracker) {
        window.playerChangeTracker.setupChangeListeners();
    }

    // Hide the details of the other players and rotate the toggle button
    const toggleButtons = document.querySelectorAll('.toggle-details');
    toggleButtons.forEach(button => {
        const details = button.parentNode.nextElementSibling;
        const icon = button.querySelector('.toggle-icon');
        if (details.style.maxHeight != "0px") {
            details.style.maxHeight = "0px";
            details.style.paddingBottom = "0px";
            icon.classList.remove('rotate');
        }
        toggleDetails(toggleButton)
        const icon_ = toggleButton.querySelector('.toggle-icon');
        icon_.classList.remove('rotate');
    });
}

function toggleDetails(element) {
    const detailsContainer = element.parentNode.nextElementSibling;
    const icon = element.querySelector('.toggle-icon');

    if (detailsContainer.style.maxHeight === "0px") {
        detailsContainer.style.maxHeight = detailsContainer.scrollHeight + "px";
        detailsContainer.style.paddingBottom = "5px";
    } else {
        detailsContainer.style.maxHeight = "0px";
        detailsContainer.style.paddingBottom = "0px";
    }

    rotateIcon(detailsContainer, icon);
}

// Actualizar el texto del botón de seleccionar/deseleccionar según el estado actual de los checkboxes
function updateToggleButtonText() {
    const toggleButton = document.getElementById('toggle-select-button');
    const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]');
    const allSelected = Array.from(checkboxes).every(checkbox => checkbox.checked);
    toggleButton.textContent = allSelected ? "Deseleccionar a todos" : "Seleccionar a todos";
}

// Actualizar el contador de jugadores seleccionados
function updateSelectedCount() {
    let selectedCount = document.querySelectorAll('input[name="selectedPlayers"]:checked').length;
    document.getElementById('selected-count').textContent = selectedCount;

    // Controlar la visibilidad del botón "Borrar seleccionados"
    const deleteSelectedBtn = document.getElementById('resetBtn');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.style.display = selectedCount > 0 ? 'block' : 'none';
    }

    updateSelectedPlayersList();
}

// Actualizar la lista de jugadores seleccionados
function updateSelectedPlayersList() {
    let selectedPlayers = document.querySelectorAll('input[name="selectedPlayers"]:checked');
    let selectedPlayersUL = document.getElementById('selected-players-ul');

    selectedPlayersUL.innerHTML = ''; // Clear the list

    selectedPlayers.forEach(playerCheckbox => {
        let playerId = playerCheckbox.value;
        let playerName = playerCheckbox.nextElementSibling.value;

        let listItem = document.createElement('li');
        let playerText = document.createElement('span');
        playerText.textContent = playerName;

        listItem.appendChild(createDeselectButton(playerId));
        listItem.appendChild(playerText);
        selectedPlayersUL.appendChild(listItem);
    });
}

// Crear botón para deseleccionar un jugador de la lista del contador
function createDeselectButton(playerId) {
    let button = document.createElement('button');
    button.textContent = '✖';
    button.onclick = function(event) {
        event.stopPropagation();
        deselectPlayer(playerId);
    };
    return button;
}

// Deseleccionar un jugador de la lista y actualizar el contador
function deselectPlayer(playerId) {
    let checkbox = document.querySelector(`input[name="selectedPlayers"][value="${playerId}"]`);
    if (checkbox) {
        checkbox.checked = false;
        updateSelectedCount();
        updateToggleButtonText();
    }
}

// Botón de scroll
function scrollToSubmit() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.scrollIntoView({ behavior: 'smooth' });
    }
}

// Evento para mostrar u ocultar el botón de scroll dependiendo de la posición de la página
window.addEventListener('scroll', function() {
    const scrollButton = document.getElementById('scroll-button');
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnPosition = submitBtn.getBoundingClientRect().top + window.scrollY;
    const windowBottom = window.scrollY + window.innerHeight;

    if (windowBottom >= submitBtnPosition) {
        scrollButton.style.display = 'none';
    } else {
        scrollButton.style.display = 'block';
    }
});

// Compartir resultados de los equipos
function compartirEquipos(button) {
    const indice = button.id.replace('shareButton', ''); // Obtiene el índice del botón
    const contenedor = document.getElementById('resultados-equipos' + indice);
    // Construye el texto a compartir
    let textoCompartir = '';
    const titulos = contenedor.querySelectorAll('h2');
    const listasJugadores = contenedor.querySelectorAll('ul');
    for (let i = 0; i < titulos.length; i++) {
        textoCompartir += '*' + titulos[i].innerText + '*\n'; // Agrega el título
        
        // Itera sobre los jugadores en la lista
        const jugadores = listasJugadores[i].querySelectorAll('li');
        for (let j = 0; j < jugadores.length; j++) {
            // Obtener solo el nombre del jugador desde el span player-name
            const playerNameElement = jugadores[j].querySelector('.player-name');
            const playerName = playerNameElement ? playerNameElement.textContent : jugadores[j].innerText;
            textoCompartir += (j + 1) + '. ' + playerName + '\n'; // Agrega el jugador con número
        }
        textoCompartir += '\n'; // Agrega una línea en blanco entre equipos
    }
    textoCompartir += 'Generado con: https://armarequipos.lat'; // Agrega el enlace al sitio web
    const shareData = {
        title: 'Resultados de los Equipos - Opción ' + (parseInt(indice)),
        text: textoCompartir
    };
    try {
        navigator.share(shareData)
    } catch (err) {
        console.log(`Error: ${err}`);
        // Opción alternativa para navegadores que no soportan Web Share API
        alert('Tu navegador no soporta la función de compartir. Por favor, copia el texto manualmente.');
        navigator.clipboard.writeText(textoCompartir)
          .then(() => {
            alert('Texto copiado al portapapeles');
          })
          .catch(err => {
            console.error('Error al copiar al portapapeles: ', err);
          });
    }
}

// Mostrar u ocultar detalles de los equipos
function toggleStats(button) {
    const contentContainer = button.parentNode.nextElementSibling;
    const textSpan = button.querySelector('span');

    if (contentContainer.style.display === "none" || contentContainer.style.display === "") {
        contentContainer.style.display = "flex";
        textSpan.textContent = "Ocultar detalles";
        createRadarChart(contentContainer);
        createBarChart(contentContainer);
        createSwiper();
    } else {
        contentContainer.style.display = "none";
        textSpan.textContent = "Mostrar detalles";
    }
}

// Variable global para mantener el estado del ordenamiento
let sortDirection = 'asc';

function toggleSort() {
    const button = document.getElementById('sortButton');
    const icon = button.querySelector('i');
    const playersContainer = document.getElementById('players-container');
    const players = Array.from(playersContainer.children);

    // Cambiar la dirección del ordenamiento
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';

    // Cambiar el ícono
    icon.className = sortDirection === 'asc' 
        ? 'fas fa-sort-alpha-down'
        : 'fas fa-sort-alpha-up';

    // Ordenar los jugadores
    players.sort((a, b) => {
        const nameA = a.querySelector('input[name="names"]').value.toLowerCase();
        const nameB = b.querySelector('input[name="names"]').value.toLowerCase();
        return sortDirection === 'asc'
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
    });

    // Vaciar y volver a llenar el contenedor con los elementos ordenados
    playersContainer.innerHTML = '';
    players.forEach(player => playersContainer.appendChild(player));
}
