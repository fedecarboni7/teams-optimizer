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

    // Nombre del jugador
    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Jugador " + (playerCount + 1) + ":";
    playerHeader.appendChild(nameLabel);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.name = "names";
    nameInput.required = true;
    nameInput.style.flex = "1"; // Asegurar que el input de nombre se expanda
    playerHeader.appendChild(nameInput);

    playerDiv.appendChild(playerHeader);

    // Botón para mostrar/ocultar detalles
    const toggleButton = document.createElement("button");
    toggleButton.className = "toggle-details";
    toggleButton.type = "button";
    toggleButton.innerHTML = '<i class="fa-solid fa-angle-up toggle-icon"></i>';
    toggleButton.addEventListener("click", function() {
        toggleDetails(this);
    });
    playerHeader.appendChild(toggleButton);

    // Contenedor para habilidades
    const detailsContainer = document.createElement("div");
    detailsContainer.className = "details-container";
    detailsContainer.style.display = "block";
    detailsContainer.style.maxHeight = "353px";
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

        const input = document.createElement("input");
        input.type = "number";
        input.name = skill;
        input.min = "1";
        input.max = "5";
        input.placeholder = "1-5";
        input.required = true;

        skillEntry.appendChild(label);
        skillEntry.appendChild(input);
        skillsContainer.appendChild(skillEntry);
    });

    detailsContainer.appendChild(skillsContainer);
    playerDiv.appendChild(detailsContainer);

    // Botón para eliminar
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";

    const trashIcon = document.createElement("i");
    trashIcon.className = "fa-solid fa-trash";
    
    deleteButton.appendChild(trashIcon);

    deleteButton.addEventListener("click", function() {
        container.removeChild(playerDiv);
        renumerarJugadores();
        updateSelectedCount();
    });
    playerHeader.appendChild(deleteButton);

    container.appendChild(playerDiv);

    updateSelectedCount();
}

function renumerarJugadores() {
    const container = document.getElementById("players-container");
    const jugadores = container.children;
    for (let i = 0; i < jugadores.length; i++) {
      const jugador = jugadores[i];
      const label = jugador.querySelector(".player-header label");
      label.textContent = "Jugador " + (i + 1) + ":";
      // Actualizar el valor del checkbox (opcional, si lo usas para algo)
      const checkbox = jugador.querySelector(".player-header input[type='checkbox']");
      if (checkbox) {
        checkbox.value = i;
      }
    }
}

function deletePlayer(playerId) {
    if (confirm("¿Estás seguro de que querés eliminar este jugador?")) {
        fetch(`/player/${playerId}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    window.location.href = '/';
                }
            });
    }

    updateSelectedCount();
}

function reset() {
    if (confirm("¿Estás seguro de que querés restablecer los datos?")) {
        fetch('/reset')
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    window.location.href = '/';
                }
            });
    }
}

function validateForm(event) {
    let playersContainer = document.getElementById('players-container');
    let playerEntries = playersContainer.getElementsByClassName('player-entry');
    
    // Validar que hay al menos tres jugadores
    if (playerEntries.length < 3) {
        alert('Debes agregar al menos tres jugadores.');
        event.preventDefault();
        return false;
    }
    
    // Validar que todos los campos estén completos
    for (let entry of playerEntries) {
        let inputs = entry.getElementsByTagName('input');
        for (let input of inputs) {
            if (input.type !== 'checkbox' && input.value.trim() === '') {
                alert('Por favor, completa todos los campos.');
                event.preventDefault();
                return false;
            }
        }
    }
    
    // Validar que al menos tres checkbox estén seleccionados
    let selectedPlayers = document.querySelectorAll('input[name="selectedPlayers"]:checked');
    if (selectedPlayers.length < 3) {
        alert('Por favor, selecciona al menos tres jugadores.');
        event.preventDefault();
        return false;
    }

    return true;
}

function toggleDetails(button) {
    const details = button.parentNode.nextElementSibling;
    const icon = button.querySelector('.toggle-icon');

    if (details.style.maxHeight === "0px") {
        details.style.maxHeight = details.scrollHeight + "px";
        details.style.paddingBottom = "5px";
        icon.classList.add('rotate');
    } else {
        details.style.maxHeight = "0px";
        details.style.paddingBottom = "0px";
        icon.classList.remove('rotate');
    }
}

function toggleSelectPlayers() {
    const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]');
    const toggleButton = document.getElementById('toggle-select-button');
    const allSelected = Array.from(checkboxes).every(checkbox => checkbox.checked);
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = !allSelected;
    });

    if (allSelected) {
        toggleButton.textContent = "Seleccionar a todos";
    } else {
        toggleButton.textContent = "Deseleccionar a todos";
    }

    updateSelectedCount();
}

function toggleTable(button) {
    const tableContainer = button.nextElementSibling;
    if (tableContainer.style.maxHeight === "0px" || tableContainer.style.maxHeight === "") {
        tableContainer.style.maxHeight = tableContainer.scrollHeight + "px";
        button.textContent = "Ocultar detalles";
    } else {
        tableContainer.style.maxHeight = "0px";
        button.textContent = "Mostrar detalles";
    }
}

function updateSelectedCount() {
    let selectedCount = document.querySelectorAll('input[name="selectedPlayers"]:checked').length;
    document.getElementById('selected-count').textContent = selectedCount;

    updateSelectedPlayersList();
}

function updateSelectedPlayersList() {
    let selectedPlayers = document.querySelectorAll('input[name="selectedPlayers"]:checked');
    let selectedPlayersUL = document.getElementById('selected-players-ul');

    selectedPlayersUL.innerHTML = ''; // Clear the list

    selectedPlayers.forEach(playerCheckbox => {
        let playerId = playerCheckbox.value;
        let playerName = playerCheckbox.nextElementSibling.nextElementSibling.value;

        let listItem = document.createElement('li');
        let playerText = document.createElement('span');
        playerText.textContent = playerName;

        listItem.appendChild(createDeselectButton(playerId));
        listItem.appendChild(playerText);
        selectedPlayersUL.appendChild(listItem);
    });
}

function createDeselectButton(playerId) {
    let button = document.createElement('button');
    button.textContent = '✖';
    button.onclick = function() {
        deselectPlayer(playerId);
    };
    return button;
}

function deselectPlayer(playerId) {
    let checkbox = document.querySelector(`input[name="selectedPlayers"][value="${playerId}"]`);
    if (checkbox) {
        checkbox.checked = false;
        updateSelectedCount();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    let checkboxes = document.querySelectorAll('input[name="selectedPlayers"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedCount);
    });
});

function scrollToSubmit() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.scrollIntoView({ behavior: 'smooth' });
    }
}

// Evento para mostrar u ocultar el botón dependiendo de la posición de la página
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

// Inicializar el estado del botón al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const scrollButton = document.getElementById('scroll-button');
    if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
        scrollButton.style.display = 'none';
    } else {
        scrollButton.style.display = 'block';
    }
});

function compartirEquipos(button) {
    const indice = button.id.replace('shareButton', ''); // Obtiene el índice del botón
    const contenedor = document.getElementById('resultados-equipos' + indice);
    // Construye el texto a compartir
    let textoCompartir = '';
    const titulos = contenedor.querySelectorAll('h2');
    const listasJugadores = contenedor.querySelectorAll('ul');
    for (let i = 0; i < titulos.length; i++) {
        textoCompartir += titulos[i].innerText + '\n'; // Agrega el título
        
        // Itera sobre los jugadores en la lista
        const jugadores = listasJugadores[i].querySelectorAll('li');
        for (let j = 0; j < jugadores.length; j++) {
            textoCompartir += '- ' + jugadores[j].innerText + '\n'; // Agrega el jugador
        }
        textoCompartir += '\n'; // Agrega una línea en blanco entre equipos
    }
    if (navigator.share) {
        navigator.share({
            title: 'Resultados de los Equipos - Opción ' + (parseInt(indice)),
            text: textoCompartir
        })
        .then(() => console.log('Resultados compartidos exitosamente.'))
        .catch((error) => console.error('Error al compartir:', error));
    } else {
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

function filterPlayers() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const players = document.querySelectorAll('.player-entry');

    players.forEach(player => {
        const playerName = player.querySelector('input[name="names"]').value.toLowerCase();
        if (playerName.includes(searchInput)) {
            player.style.display = '';
        } else {
            player.style.display = 'none';
        }
    });
}
