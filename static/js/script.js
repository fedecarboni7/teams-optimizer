function addPlayer() {
    const container = document.getElementById("players-container");
    const playerCount = container.children.length;
    const playerDiv = document.createElement("div");

    playerDiv.className = "player-entry";

    // Checkbox para seleccionar jugador
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "selectedPlayers";
    checkbox.value = playerCount;
    checkbox.checked = true;
    playerDiv.appendChild(checkbox);

    // Nombre del jugador
    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Nombre del jugador " + (playerCount + 1) + ":";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.name = "names";
    nameInput.required = true;
    playerDiv.appendChild(nameLabel);
    playerDiv.appendChild(nameInput);
    
    // Botón para mostrar detalles
    const toggleButton = document.createElement("button");
    toggleButton.className = "toggle-details";
    toggleButton.type = "button";
    toggleButton.textContent = "Ocultar detalles";
    toggleButton.addEventListener("click", function() {
        toggleDetails(this);
    });
    playerDiv.appendChild(toggleButton);

    // Contenedor para habilidades
    const detailsContainer = document.createElement("div");
    detailsContainer.className = "details-container";
    detailsContainer.style.display = "block";

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
    deleteButton.type = "button";
    deleteButton.textContent = "Eliminar";
    deleteButton.addEventListener("click", function() {
        container.removeChild(playerDiv);
    });
    playerDiv.appendChild(deleteButton);

    container.appendChild(playerDiv);

    updateSelectedCount();
}

function deletePlayer(playerId) {
    if (confirm("¿Estás seguro de que quieres eliminar este jugador?")) {
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
    if (confirm("¿Estás seguro de que quieres restablecer los datos?")) {
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
    var details = button.parentNode.querySelector('.details-container');
    if (details.style.maxHeight === "0px" || details.style.maxHeight === '') {
        details.style.maxHeight = details.scrollHeight + "px";
        button.textContent = 'Ocultar detalles';
    } else {
        details.style.maxHeight = "0px";
        button.textContent = 'Mostrar detalles';
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
        toggleButton.textContent = "Seleccionar todos los jugadores";
    } else {
        toggleButton.textContent = "Deseleccionar todos los jugadores";
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

function scrollToBottom() {
    const scrollButton = document.getElementById('scroll-button');
    if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
}

// Evento para mostrar u ocultar el botón dependiendo de la posición de la página
window.addEventListener('scroll', function() {
    const scrollButton = document.getElementById('scroll-button');
    // Añadimos una pequeña tolerancia para asegurar la detección del fondo de la página
    if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 2) {
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
