// UIHelpers.js - Funciones auxiliares de UI que no encajan en otros módulos
document.addEventListener('DOMContentLoaded', () => {
    initializeUIHelpers();
});

function initializeUIHelpers() {
    // Mostrar el pop-up si el usuario no lo ha visto
    const popup = document.getElementById("popup");
    const closeButton = document.getElementById("closeButton");
  
    const hasSeenPopup = localStorage.getItem('hasSeenPopup');
  
    if (!hasSeenPopup && popup !== null) {
        setTimeout(function () {
            popup.style.display = "block";
        }, 2000);
    }

    if (closeButton) {
        closeButton.addEventListener("click", function () {
            popup.style.display = "none";
            localStorage.setItem('hasSeenPopup', 'true');
        });
    }
}

// Validar formulario (sin el fetch)
function validateForm(event) {
    const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]:checked');
    
    if (checkboxes.length < 2) {
        event.preventDefault();
        showNotification('Debes seleccionar al menos 2 jugadores para formar equipos.', 'warning');
        return false;
    }

    // Validar nombres de jugadores
    const nameInputs = document.querySelectorAll('input[name="names"]');
    for (let input of nameInputs) {
        if (!input.value.trim()) {
            event.preventDefault();
            showNotification('Todos los jugadores deben tener un nombre.', 'warning');
            input.focus();
            return false;
        }
    }

    // Mostrar indicador de carga
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Armando equipos...';
    }

    return true;
}

// Función para mostrar/ocultar detalles de jugador
function toggleDetails(element) {
    const playerEntry = element.closest('.player-entry');
    if (!playerEntry) return;
    
    const detailsContainer = playerEntry.querySelector('.details-container');
    const toggleIcon = playerEntry.querySelector('.toggle-icon');
    
    if (!detailsContainer || !toggleIcon) return;
    
    const isExpanded = detailsContainer.style.maxHeight !== '0px' && detailsContainer.style.maxHeight !== '';
    
    if (isExpanded) {
        detailsContainer.style.maxHeight = '0px';
        toggleIcon.style.transform = 'rotate(0deg)';
    } else {
        detailsContainer.style.maxHeight = '383px';
        toggleIcon.style.transform = 'rotate(180deg)';
    }
}

// Compartir equipos
function compartirEquipos(button) {
    const container = button.closest('.team-container');
    if (!container) return;
    
    const teams = container.querySelectorAll('.team');
    let shareText = 'Equipos armados:\n\n';
    
    teams.forEach((team, index) => {
        const title = team.querySelector('h2').textContent;
        const players = team.querySelectorAll('.player-name');
        
        shareText += `${title}:\n`;
        players.forEach(player => {
            shareText += `• ${player.textContent}\n`;
        });
        shareText += '\n';
    });
    
    if (navigator.share) {
        navigator.share({
            title: 'Equipos armados',
            text: shareText
        });
    } else {
        // Fallback: copiar al clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Equipos copiados al portapapeles', 'success');
        });
    }
}

// Toggle de estadísticas
function toggleStats(button) {
    const container = button.closest('.team-container');
    if (!container) return;
    
    const contentContainer = container.querySelector('.content-container');
    if (!contentContainer) return;
    
    const isVisible = contentContainer.style.display !== 'none';
    
    if (isVisible) {
        contentContainer.style.display = 'none';
        button.innerHTML = '<i class="fa-solid fa-chart-bar"></i> Ver estadísticas';
    } else {
        contentContainer.style.display = 'block';
        button.innerHTML = '<i class="fa-solid fa-chart-bar"></i> Ocultar estadísticas';
    }
}

// Toggle de ordenamiento
function toggleSort() {
    const sortButton = document.getElementById('sortButton');
    if (!sortButton) return;
    
    const icon = sortButton.querySelector('i');
    const isAscending = icon.classList.contains('fa-sort-alpha-down');
    
    if (isAscending) {
        icon.className = 'fas fa-sort-alpha-up';
        sortPlayersAlphabetically(false);
    } else {
        icon.className = 'fas fa-sort-alpha-down';
        sortPlayersAlphabetically(true);
    }
}

// Ordenar jugadores alfabéticamente
function sortPlayersAlphabetically(ascending = true) {
    const container = document.getElementById('players-container');
    if (!container) return;
    
    const players = Array.from(container.querySelectorAll('.player-entry'));
    
    players.sort((a, b) => {
        const nameA = a.querySelector('input[name="names"]').value.toLowerCase();
        const nameB = b.querySelector('input[name="names"]').value.toLowerCase();
        
        if (ascending) {
            return nameA.localeCompare(nameB);
        } else {
            return nameB.localeCompare(nameA);
        }
    });
    
    // Reordenar en el DOM
    players.forEach(player => {
        container.appendChild(player);
    });
}

// Actualizar icono de contexto
function updateContextIcon() {
    const contextIcon = document.getElementById('contextIcon');
    const clubSelect = document.getElementById('club-select') || document.getElementById('club-select-navbar');
    
    if (!contextIcon || !clubSelect) return;
    
    if (clubSelect.value === 'my-players') {
        contextIcon.textContent = '👤';
    } else {
        contextIcon.textContent = '🏆';
    }
}

// Mostrar errores
function showError(message) {
    showNotification(message, 'error');
}

// Función para agregar jugador (lógica básica)
function addPlayer() {
    const container = document.getElementById('players-container');
    if (!container) return;
    
    const playerCount = container.querySelectorAll('.player-entry').length + 1;
    
    const playerDiv = document.createElement("div");
    playerDiv.className = "player-entry";

    const playerHeader = document.createElement("div");
    playerHeader.className = "player-header";

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "selectedPlayers";
    checkbox.value = `temp_${Date.now()}`;
    checkbox.addEventListener('change', function () {
        updateSelectedCount();
        updateToggleButtonText();
    });
    playerHeader.appendChild(checkbox);

    // Input de nombre
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.name = "names";
    nameInput.placeholder = `Jugador ${playerCount}`;
    nameInput.required = true;
    nameInput.addEventListener('click', function() {
        toggleDetails(this);
    });
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

    // Crear skills usando la función de sliders
    if (typeof createPlayerSkillSliders === 'function') {
        const currentScale = document.getElementById('scaleToggle')?.checked ? 10 : 5;
        createPlayerSkillSliders(skillsContainer, currentScale);
    }

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
        deletePlayer(deleteButton);
    });
    playerHeader.appendChild(deleteButton);

    container.appendChild(playerDiv);

    updateSelectedCount();
    
    // Configurar listeners del tracker para el nuevo jugador si está disponible
    if (window.playerChangeTracker) {
        window.playerChangeTracker.setupChangeListeners();
    }

    // Ocultar detalles de otros jugadores
    const allPlayers = container.querySelectorAll('.player-entry');
    allPlayers.forEach(player => {
        if (player !== playerDiv) {
            const details = player.querySelector('.details-container');
            const icon = player.querySelector('.toggle-icon');
            if (details && icon) {
                details.style.maxHeight = '0px';
                icon.style.transform = 'rotate(0deg)';
            }
        }
    });
}

// Función para eliminar jugador
function deletePlayer(button) {
    const playerEntry = button.closest('.player-entry');
    if (!playerEntry) return;
    
    if (confirm('¿Estás seguro de que quieres eliminar este jugador?')) {
        playerEntry.remove();
        updateSelectedCount();
        updateToggleButtonText();
        
        // Actualizar el tracker de cambios si está disponible
        if (window.playerChangeTracker) {
            window.playerChangeTracker.trackChange();
        }
    }
}