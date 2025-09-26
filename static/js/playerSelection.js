// PlayerSelection.js - Funcionalidad específica para seleccionar jugadores
document.addEventListener('DOMContentLoaded', () => {
    initializePlayerSelection();
});

function initializePlayerSelection() {
    // Botón para seleccionar/deseleccionar a todos los jugadores
    const toggleButton = document.getElementById('toggle-select-button');
    const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]');
    
    if (toggleButton) {
        toggleButton.addEventListener('click', function () {
            const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]');
            const allSelected = Array.from(checkboxes).every(checkbox => checkbox.checked);
            checkboxes.forEach(checkbox => {
                checkbox.checked = !allSelected;
            });
            updateSelectedCount();
            updateToggleButtonText();
        });
    }

    if (checkboxes && checkboxes.length) {
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                updateSelectedCount();
                updateToggleButtonText();
            });
        });
    }

    // Mostrar/Ocultar la lista de jugadores seleccionados al hacer clic en el botón flotante
    const floatingButton = document.getElementById('floating-button');
    const playersList = document.getElementById('selected-players-list');
    if (floatingButton && playersList) {
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
    }

    // Inicializar contador
    updateSelectedCount();
    updateToggleButtonText();
}

// Actualizar el texto del botón de seleccionar/deseleccionar según el estado actual de los checkboxes
function updateToggleButtonText() {
    const toggleButton = document.getElementById('toggle-select-button');
    if (!toggleButton) return;
    
    const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]');
    const allSelected = Array.from(checkboxes).every(checkbox => checkbox.checked);
    toggleButton.textContent = allSelected ? 'Deseleccionar a todos' : 'Seleccionar a todos';
}

// Actualizar el contador de jugadores seleccionados
function updateSelectedCount() {
    const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]:checked');
    const selectedCountElement = document.getElementById('selected-count');
    if (selectedCountElement) {
        selectedCountElement.textContent = checkboxes.length;
    }
    updateSelectedPlayersList();
}

// Actualizar la lista de jugadores seleccionados
function updateSelectedPlayersList() {
    const checkedBoxes = document.querySelectorAll('input[name="selectedPlayers"]:checked');
    const selectedPlayersUl = document.getElementById('selected-players-ul');
    
    if (!selectedPlayersUl) return;
    
    selectedPlayersUl.innerHTML = '';
    
    checkedBoxes.forEach(checkbox => {
        const playerId = checkbox.value;
        const playerName = checkbox.getAttribute('data-name') || 'Jugador sin nombre';
        
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${playerName}
            ${createDeselectButton(playerId)}
        `;
        selectedPlayersUl.appendChild(listItem);
    });
}

// Crear botón para deseleccionar un jugador de la lista del contador
function createDeselectButton(playerId) {
    return `<button type="button" class="deselect-btn" onclick="deselectPlayer(${playerId})">✖</button>`;
}

// Deseleccionar un jugador de la lista y actualizar el contador
function deselectPlayer(playerId) {
    const checkbox = document.querySelector(`input[name="selectedPlayers"][value="${playerId}"]`);
    if (checkbox) {
        checkbox.checked = false;
        updateSelectedCount();
        updateToggleButtonText();
    }
}

// Buscador de jugadores
function filterPlayers() {
    const searchInput = document.getElementById('player-search');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const playerEntries = document.querySelectorAll('.player-entry');
    
    let visibleCount = 0;
    playerEntries.forEach(entry => {
        const nameInput = entry.querySelector('input[type="text"]');
        const playerName = nameInput ? nameInput.value.toLowerCase() : '';
        
        if (playerName.includes(searchTerm)) {
            entry.style.display = 'flex';
            visibleCount++;
        } else {
            entry.style.display = 'none';
        }
    });
    
    // Mostrar mensaje si no hay resultados
    const noResultsMsg = document.getElementById('no-results-message');
    if (visibleCount === 0 && searchTerm.length > 0) {
        if (!noResultsMsg) {
            const message = document.createElement('div');
            message.id = 'no-results-message';
            message.className = 'no-results';
            message.textContent = 'No se encontraron jugadores';
            searchInput.parentNode.insertAdjacentElement('afterend', message);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}