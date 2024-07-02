function addPlayer() {
    const container = document.getElementById("players-container");
    const playerCount = container.children.length;
    const playerDiv = document.createElement("div");

    playerDiv.className = "player-entry";

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
            if (input.value.trim() === '') {
                alert('Por favor, completa todos los campos.');
                event.preventDefault();
                return false;
            }
        }
    }
    
    return true;
}

function toggleDetails(button) {
    var details = button.parentNode.querySelector('.details-container');
    if (details.style.display === 'none' || details.style.display === '') {
        details.style.display = 'block';
        button.textContent = 'Ocultar detalles';
    } else {
        details.style.display = 'none';
        button.textContent = 'Mostrar detalles';
    }
}