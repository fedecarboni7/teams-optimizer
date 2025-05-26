// Variables globales para datos de jugadores y equipos 
window.playerDataDict = {};
window.teams = {};

function submitForm(formData) {
    const submitBtn = document.getElementById('submitBtn');
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    submitBtn.appendChild(spinner);
    submitBtn.disabled = true;

    window.playerDataDict = {};
    window.teams = {};

    // Enviar la solicitud usando fetch
    fetch('/submit', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        document.querySelector('#teams-container').innerHTML = data.html;
        window.playerDataDict = data.player_data_dict;
        window.teams = data.teams;

        // Hacer que los inputs se vuelvan readonly
        document.querySelectorAll('input[name="names"]').forEach(input => {
            input.readOnly = true;
        });

        // Hacer que los delete-button se les agregue el id="deleteBtn{{ player.id }}" leyendo los id en playerDataDict que tiene esta forma: {name: {id: id, ...}}
        document.querySelectorAll('.delete-button').forEach(button => {
            const playerName = button.parentNode.querySelector('input[name="names"]').value;
            const playerId = window.playerDataDict[playerName];
            if (playerId) {
                button.id = `${playerId.id}`;
            }
        });

        // Hacer scroll hasta el div de los resultados
        const resultsContainer = document.querySelector('#teams-container');
        if (resultsContainer) {
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    })
    .catch(error => {
        alert('Hubo un error al enviar los datos.');
        console.error('Error:', error);
    })
    .finally(() => {
        // Habilitar el botón nuevamente y remover el spinner
        submitBtn.disabled = false;
        submitBtn.removeChild(spinner);
    });
}

// Save players function
function savePlayers() {
    // Get the form data
    const playersContainer = document.getElementById('players-container');
    const playerEntries = playersContainer.getElementsByClassName('player-entry');
    
    // Check if there are players to save
    if (playerEntries.length === 0) {
        alert('No hay jugadores para guardar.');
        return;
    }
    
    // Create an array to hold all player data
    const playersData = [];
    
    // Get any club ID if present
    const clubIdInput = document.querySelector('input[name="clubId"]');
    const clubId = clubIdInput ? clubIdInput.value : null;
    
    // Collect data for each player
    for (let entry of playerEntries) {
        const nameInput = entry.querySelector('input[name="names"]');
        if (!nameInput || nameInput.value.trim() === '') {
            continue; // Skip empty player entries
        }
        
        // Get all skill inputs for this player
        const skills = entry.querySelectorAll('input[type="hidden"]');
        
        // Create player object
        const player = {
            name: nameInput.value.trim()
        };
        
        // Add all skills
        for (let skill of skills) {
            const skillName = skill.name;
            const skillValue = parseInt(skill.value);
            if (!isNaN(skillValue)) {
                player[skillName] = skillValue;
            }
        }
        
        // Ensure all required skills are present
        const requiredSkills = ['velocidad', 'resistencia', 'control', 'pases', 'tiro', 'defensa', 'habilidad_arquero', 'fuerza_cuerpo', 'vision'];
        const missingSkills = requiredSkills.filter(skill => !(skill in player));
        
        if (missingSkills.length > 0) {
            alert(`Falta completar las siguientes habilidades para ${player.name}: ${missingSkills.join(', ')}`);
            return;
        }
        
        // Add valid player to the array
        playersData.push(player);
    }
    
    // If no valid players found
    if (playersData.length === 0) {
        alert('No hay jugadores válidos para guardar.');
        return;
    }
    
    // Create the save button spinner
    const saveBtn = document.getElementById('savePlayersBtn');
    saveBtn.disabled = true;
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    saveBtn.appendChild(spinner);
    
    // Create URL for the API endpoint
    let url = '/players';
    let fetchParams = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(playersData)
    };
    
    // Add club_id as query parameter if it exists
    if (clubId) {
        url = `/players?club_id=${clubId}`;
    }
    
    // Send the data to the server
    fetch(url, fetchParams)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al guardar los jugadores');
            }
            return response.json();
        })
        .then(data => {
            alert('Jugadores guardados exitosamente');
            
            // Update the player IDs in the DOM
            for (const player of data) {
                const playerElement = Array.from(playerEntries).find(entry => 
                    entry.querySelector('input[name="names"]').value === player.name
                );
                
                if (playerElement) {
                    const deleteButton = playerElement.querySelector('.delete-button');
                    if (deleteButton) {
                        deleteButton.id = player.id.toString();
                    }
                    
                    // Make the name input readonly
                    const nameInput = playerElement.querySelector('input[name="names"]');
                    if (nameInput) {
                        nameInput.readOnly = true;
                    }
                }
            }
            
            // Recapturar estado inicial después de guardar
            if (window.playerChangeTracker) {
                window.playerChangeTracker.captureInitialState();
                window.playerChangeTracker.updateChangeIndicators();
                
                // Manejar auto-submit si fue solicitado
                handleAutoSubmitAfterSave();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al guardar los jugadores: ' + error.message);
        })
        .finally(() => {
            // Remove the spinner and re-enable the button
            saveBtn.removeChild(spinner);
            saveBtn.disabled = false;
        });
}

// Eliminar jugador
function deletePlayer(button) {
    playerId = button.getAttribute('id');
    const clubId = button.getAttribute('club-id');
    if (confirm("¿Estás seguro de que querés eliminar este jugador?")) {
        // Deshabilitar el botón para prevenir múltiples envíos
        button.disabled = true;

        // Mostrar un spinner encima del botón
        const spinner = document.createElement('span');
        spinner.className = 'spinner';
        spinner.style.marginRight = '0px';
        
        // Ocultar el icono del tacho de basura
        const trashIcon = button.querySelector('i.fa-trash');
        if (trashIcon) {
            trashIcon.style.display = 'none';
        }
        
        button.appendChild(spinner);

        if (clubId !== 'None' && playerId !== null) {
            fetch(`/clubs/${clubId}/players/${playerId}`, { method: 'DELETE' })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al eliminar el jugador del club');
                    }
                    return response.text();
                })
                .then(() => {
                    let container = document.getElementById("players-container");
                    container.removeChild(button.parentNode.parentNode);
                    renumerarJugadores();
                    updateToggleButtonText();
                    updateSelectedCount();
                    
                    // Recapturar estado inicial después de eliminar jugador
                    if (window.playerChangeTracker) {
                        window.playerChangeTracker.captureInitialState();
                        window.playerChangeTracker.updateChangeIndicators();
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error al eliminar el jugador del club: ' + error.message);
                })
                .finally(() => {
                    // Habilitar el botón nuevamente y remover el spinner
                    button.disabled = false;
                    button.removeChild(spinner);
                    if (trashIcon) {
                        trashIcon.style.display = 'inline';
                    }
                });
        } else if (playerId !== null) {
            fetch(`/player/${playerId}`, { method: 'DELETE' })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al eliminar el jugador');
                    }
                    return response.text();
                })
                .then(() => {
                    const container = document.getElementById("players-container");
                    container.removeChild(button.parentNode.parentNode);
                    renumerarJugadores();
                    updateToggleButtonText();
                    updateSelectedCount();
                    
                    // Recapturar estado inicial después de eliminar jugador
                    if (window.playerChangeTracker) {
                        window.playerChangeTracker.captureInitialState();
                        window.playerChangeTracker.updateChangeIndicators();
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error al eliminar el jugador: ' + error.message);
                })
                .finally(() => {
                    // Habilitar el botón nuevamente y remover el spinner
                    button.disabled = false;
                    button.removeChild(spinner);
                    if (trashIcon) {
                        trashIcon.style.display = 'inline';
                    }
                });
        } else {
            container = document.getElementById("players-container");
            container.removeChild(button.parentNode.parentNode);
            renumerarJugadores();
            updateToggleButtonText();
            updateSelectedCount();
            
            // Recapturar estado inicial después de eliminar jugador
            if (window.playerChangeTracker) {
                window.playerChangeTracker.captureInitialState();
                window.playerChangeTracker.updateChangeIndicators();
            }
        }

        return true;
    }
    return false;
}

// Botón para borrar la información de todos los jugadores
function reset() {
    if (confirm("Estás a punto de borrar la información de todos los jugadores. ¿Estás seguro de que querés continuar?")) {
        const resetBtn = document.getElementById('resetBtn');
        const spinner = document.createElement('span');
        spinner.className = 'spinner';
        resetBtn.appendChild(spinner);

        // Deshabilitar el botón para prevenir múltiples envíos
        resetBtn.disabled = true;

        fetch('/reset')
            .then(response => response.text())
            .then(() => {
                window.location.href = "/home";
            });
    }
}

// Crear el nuevo club
function createNewClub() {
    const clubName = document.getElementById('new-club-name').value;
    if (!clubName) {
        alert("Por favor, ingresá un nombre para el club.");
        return;
    }

    // Hacer la solicitud AJAX para crear el club
    fetch('/clubs/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: clubName }),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error("Error al crear el club");
    })
    .then(data => {
        // Redirigir a la página con el club recién creado seleccionado
        window.location.href = '/home?club_id=' + data.id;
    })
    .catch(error => {
        alert(error.message);
    })
    .finally(() => {
        closeCreateClubModal();
    });
}

function deleteClub(clubId) {
    if (!confirm("¿Estás seguro de que querés eliminar este club? Esta acción no se puede deshacer.")) {
        return;
    }

    fetch('/clubs/' + clubId, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (response.ok) {
            // Recargar la página para actualizar el selector
            window.location.href = "/home";
        } else {
            throw new Error("Error al eliminar el club");
        }
    })
    .catch(error => {
        alert(error.message);
    });
}

function leaveClub(clubId) {
    if (!confirm("¿Estás seguro de que querés abandonar este club?")) {
        return;
    }

    fetch('/clubs/' + clubId + '/leave', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (response.ok) {
            // Recargar la página para actualizar el selector
            window.location.href = "/home";
        } else {
            throw new Error("Error al abandonar el club");
        }
    })
    .catch(error => {
        alert(error.message);
    });
}

// Generar formaciones
function generarFormaciones(button) {
    const indice = button.id.replace('generarFormaciones', ''); // Obtiene el índice del botón

    // Validar y preparar los datos usando la función de teamLogic.js
    const payload = validateAndPrepareTeamsForFormations(indice);
    if (!payload) {
        return; // La validación falló
    }

    // Crear el spinner y agregarlo al botón
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    button.appendChild(spinner);

    // Deshabilitar el botón para prevenir múltiples clics
    button.disabled = true;

    // Enviar la solicitud usando fetch
    fetch('/formations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // Enviar como JSON
        },
        body: JSON.stringify(payload),  // Serializar el objeto completo como JSON
    })
    .then(response => response.json())  // Cambiar a .json() si el backend responde con JSON
    .then(data => {
        positionPlayers(data, indice);  // Procesar los datos de las formaciones
        
        // Mostrar el contenedor de formaciones
        const formationsContainer = document.getElementById('formations-container' + indice);
        formationsContainer.style.display = 'block';
        
        // Cambiar el estilo del botón para indicar que ya no está activo
        button.style.backgroundColor = "#777";
        button.style.cursor = "not-allowed";
        button.innerText = "Formación generada";
    })
    .catch(error => {
        console.error('Error fetching formations:', error);
        formationsContainer.innerHTML = 'Error loading formations.';  // Manejar el error
    })
    .finally(() => {
        // Si no se están mostrando los detalles llamar a toggleStats
        // Obtener el botón de "Mostrar detalles" correspondiente por su id
        const detallesButton = document.getElementById('mostrarDetalles' + indice);

        // Verificar si los detalles están ocultos
        if (detallesButton.innerText.includes('Mostrar detalles')) {
            // Llamar a toggleStats para mostrar los detalles
            toggleStats(detallesButton);
        }
    });
}
