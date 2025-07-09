let currentPlayerId = null;
let players = [];
let loading = false;

// Función para obtener las iniciales de un nombre
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2); // Máximo 2 iniciales
}

// Función para crear el radar chart
function createRadarChart(canvasId, playerData) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    return new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Velocidad', 'Resistencia', 'Pases', 'Tiro', 'Defensa', 'Fuerza Cuerpo', 'Control', 'Habilidad Arquero', 'Visión'],
            datasets: [{
                label: 'Habilidades',
                data: [
                    playerData.velocidad,
                    playerData.resistencia,
                    playerData.pases,
                    playerData.tiro,
                    playerData.defensa,
                    playerData.fuerza_cuerpo,
                    playerData.control,
                    playerData.habilidad_arquero,
                    playerData.vision
                ],
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 10,
                    min: 0,
                    ticks: {
                        stepSize: 2
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Función para renderizar los jugadores
async function renderPlayers() {
    const grid = document.getElementById('playersGrid');
    
    if (loading) {
        grid.innerHTML = '<div class="loading">Cargando jugadores...</div>';
        return;
    }

    grid.innerHTML = '';

    if (players.length === 0) {
        grid.innerHTML = '<div class="empty-state">No hay jugadores registrados. ¡Agrega tu primer jugador!</div>';
        return;
    }

    players.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        
        const averageSkill = Math.round(
            Object.values(player.skills || player).filter(val => typeof val === 'number').reduce((a, b) => a + b, 0) / 9
        );

        playerCard.innerHTML = `
            <div class="player-header">
                <div class="player-avatar">
                    <div class="avatar-initials">${getInitials(player.name)}</div>
                </div>
                <div class="player-info">
                    <h3>${player.name}</h3>
                    <p>Promedio: ${averageSkill}/10</p>
                </div>
            </div>
            <div class="chart-container">
                <canvas id="chart-${player.id}"></canvas>
            </div>
            <div class="skills-list">
                <div class="skill-item">
                    <div class="skill-name">Velocidad</div>
                    <div class="skill-value">${player.skills?.velocidad || player.velocidad}</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Resistencia</div>
                    <div class="skill-value">${player.skills?.resistencia || player.resistencia}</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Pases</div>
                    <div class="skill-value">${player.skills?.pases || player.pases}</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Tiro</div>
                    <div class="skill-value">${player.skills?.tiro || player.tiro}</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Defensa</div>
                    <div class="skill-value">${player.skills?.defensa || player.defensa}</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Fuerza Cuerpo</div>
                    <div class="skill-value">${player.skills?.fuerza_cuerpo || player.fuerza_cuerpo}</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Control</div>
                    <div class="skill-value">${player.skills?.control || player.control}</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Habilidad Arquero</div>
                    <div class="skill-value">${player.skills?.habilidad_arquero || player.habilidad_arquero}</div>
                </div>
                <div class="skill-item">
                    <div class="skill-name">Visión</div>
                    <div class="skill-value">${player.skills?.vision || player.vision}</div>
                </div>
            </div>
            <button class="btn btn-primary" onclick="editPlayer(${player.id})">
                ✏️ Editar
            </button>
            <button class="btn btn-secondary" onclick="deletePlayer(${player.id})">
                🗑️ Eliminar
            </button>
        `;

        grid.appendChild(playerCard);

        // Crear el radar chart después de que el elemento esté en el DOM
        setTimeout(() => {
            createRadarChart(`chart-${player.id}`, player);
        }, 100);
    });
}

// Función para abrir el modal
function openModal(playerId = null) {
    currentPlayerId = playerId;
    const modal = document.getElementById('playerModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('playerForm');

    if (playerId) {
        // Modo edición
        modalTitle.textContent = 'Editar Jugador';
        const player = players.find(p => p.id === playerId);
        
        document.getElementById('playerName').value = player.name;
        document.getElementById('velocidad').value = player.velocidad || player.skills?.velocidad;
        document.getElementById('resistencia').value = player.resistencia || player.skills?.resistencia;
        document.getElementById('pases').value = player.pases || player.skills?.pases;
        document.getElementById('tiro').value = player.tiro || player.skills?.tiro;
        document.getElementById('defensa').value = player.defensa || player.skills?.defensa;
        document.getElementById('fuerza_cuerpo').value = player.fuerza_cuerpo || player.skills?.fuerza_cuerpo;
        document.getElementById('control').value = player.control || player.skills?.control;
        document.getElementById('habilidad_arquero').value = player.habilidad_arquero || player.skills?.habilidad_arquero;
        document.getElementById('vision').value = player.vision || player.skills?.vision;
    } else {
        // Modo creación
        modalTitle.textContent = 'Agregar Nuevo Jugador';
        form.reset();
        
        // Resetear valores por defecto
        ['velocidad', 'resistencia', 'pases', 'tiro', 'defensa', 'fuerza_cuerpo', 'control', 'habilidad_arquero', 'vision'].forEach(skill => {
            document.getElementById(skill).value = 5;
        });
    }

    modal.style.display = 'block';
}

// Función para cerrar el modal
function closeModal() {
    document.getElementById('playerModal').style.display = 'none';
}

// Función para editar jugador
function editPlayer(playerId) {
    openModal(playerId);
}

// Función para eliminar jugador
async function deletePlayer(playerId) {
    if (confirm('¿Estás seguro de que quieres eliminar este jugador?')) {
        try {
            await playersAPI.deletePlayer(playerId);
            await loadPlayers(); // Recargar la lista
        } catch (error) {
            alert('Error al eliminar el jugador: ' + error.message);
        }
    }
}

// Manejar envío del formulario
document.getElementById('playerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    
    const playerData = {
        name: formData.get('name'),
        skills: {
            velocidad: parseInt(document.getElementById('velocidad').value),
            resistencia: parseInt(document.getElementById('resistencia').value),
            pases: parseInt(document.getElementById('pases').value),
            tiro: parseInt(document.getElementById('tiro').value),
            defensa: parseInt(document.getElementById('defensa').value),
            fuerza_cuerpo: parseInt(document.getElementById('fuerza_cuerpo').value),
            control: parseInt(document.getElementById('control').value),
            habilidad_arquero: parseInt(document.getElementById('habilidad_arquero').value),
            vision: parseInt(document.getElementById('vision').value)
        }
    };

        savePlayer(playerData);
});

// Función para cargar jugadores desde el backend
async function loadPlayers() {
    try {
        loading = true;
        renderPlayers(); // Mostrar loading
        
        players = await playersAPI.getPlayers();
        loading = false;
        renderPlayers();
    } catch (error) {
        loading = false;
        console.error('Error loading players:', error);
        const grid = document.getElementById('playersGrid');
        grid.innerHTML = '<div class="error">Error al cargar jugadores. Por favor, recarga la página.</div>';
    }
}

// Función para guardar jugador
async function savePlayer(playerData) {
    try {
        // Convertir a formato esperado por el backend
        const backendPlayerData = {
            name: playerData.name,
            velocidad: playerData.skills.velocidad,
            resistencia: playerData.skills.resistencia,
            pases: playerData.skills.pases,
            tiro: playerData.skills.tiro,
            defensa: playerData.skills.defensa,
            fuerza_cuerpo: playerData.skills.fuerza_cuerpo,
            control: playerData.skills.control,
            habilidad_arquero: playerData.skills.habilidad_arquero,
            vision: playerData.skills.vision
        };

        // Si estamos editando, preservar el ID
        if (currentPlayerId) {
            backendPlayerData.id = currentPlayerId;
        }

        // Enviar como array al backend (el endpoint espera un array)
        await playersAPI.savePlayers([backendPlayerData]);
        
        closeModal();
        await loadPlayers(); // Recargar la lista
    } catch (error) {
        alert('Error al guardar el jugador: ' + error.message);
    }
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('playerModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Inicializar la aplicación
loadPlayers();
