let selectedPlayers = [];
let teamsData = [];
let currentTeamOption = 0;
let players = [];

// Función para cargar jugadores desde el backend
async function loadPlayers() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const clubId = urlParams.get('club_id');
        const scale = urlParams.get('scale') || '1-5';
        
        const data = await TeamsAPI.getPlayers(clubId, scale);
        players = data.players;
        renderAvailablePlayers();
    } catch (error) {
        console.error('Error al cargar jugadores:', error);
        showError('Error al cargar la lista de jugadores');
    }
}

// Función para mostrar errores
function showError(message) {
    const container = document.getElementById('availablePlayers');
    container.innerHTML = `<div class="error">${message}</div>`;
}

// Función para calcular el promedio de habilidades
function calculateAverage(player) {
    const skills = [
        player.velocidad, player.resistencia, player.control,
        player.pases, player.tiro, player.defensa,
        player.habilidad_arquero, player.fuerza_cuerpo, player.vision
    ];
    return Math.round(skills.reduce((a, b) => a + b, 0) / skills.length);
}

// Función para renderizar jugadores disponibles
function renderAvailablePlayers() {
    const container = document.getElementById('availablePlayers');
    container.innerHTML = '';

    if (players.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No hay jugadores disponibles</p>';
        return;
    }

    players.forEach(player => {
        const isSelected = selectedPlayers.some(p => p.id === player.id);
        const average = calculateAverage(player);
        
        const playerCard = document.createElement('div');
        playerCard.className = `player-card ${isSelected ? 'selected' : ''}`;
        playerCard.onclick = () => togglePlayer(player);
        
        playerCard.innerHTML = `
            <div class="player-info">
                <div class="player-avatar">
                    ${'👤'}
                </div>
                <div class="player-details">
                    <h4>${player.name}</h4>
                    <p>Promedio: ${average}/10</p>
                </div>
            </div>
            <div class="skills-mini">
                <div class="skill-mini">
                    <div>Vel</div>
                    <div>${player.velocidad}</div>
                </div>
                <div class="skill-mini">
                    <div>Res</div>
                    <div>${player.resistencia}</div>
                </div>
                <div class="skill-mini">
                    <div>Con</div>
                    <div>${player.control}</div>
                </div>
                <div class="skill-mini">
                    <div>Pas</div>
                    <div>${player.pases}</div>
                </div>
                <div class="skill-mini">
                    <div>Tir</div>
                    <div>${player.tiro}</div>
                </div>
                <div class="skill-mini">
                    <div>Def</div>
                    <div>${player.defensa}</div>
                </div>
                <div class="skill-mini">
                    <div>Arq</div>
                    <div>${player.habilidad_arquero}</div>
                </div>
                <div class="skill-mini">
                    <div>Fue</div>
                    <div>${player.fuerza_cuerpo}</div>
                </div>
                <div class="skill-mini">
                    <div>Vis</div>
                    <div>${player.vision}</div>
                </div>
            </div>
        `;
        
        container.appendChild(playerCard);
    });
}

// Función para togglear selección de jugador
function togglePlayer(player) {
    const index = selectedPlayers.findIndex(p => p.id === player.id);
    
    if (index === -1) {
        selectedPlayers.push(player);
    } else {
        selectedPlayers.splice(index, 1);
    }
    
    updateSelectedDisplay();
    renderAvailablePlayers();
}

// Función para actualizar la visualización de jugadores seleccionados
function updateSelectedDisplay() {
    const selectedList = document.getElementById('selectedList');
    const playerCount = document.getElementById('playerCount');
    const buildBtn = document.getElementById('buildTeamsBtn');
    
    playerCount.textContent = selectedPlayers.length;
    buildBtn.disabled = selectedPlayers.length < 4; // Mínimo 4 jugadores para 2 equipos
    
    if (selectedPlayers.length === 0) {
        selectedList.innerHTML = '<p style="color: #666; font-style: italic;">Selecciona jugadores de la lista</p>';
        return;
    }
    
    selectedList.innerHTML = selectedPlayers.map(player => `
        <div class="selected-player">
            <span>${player.name}</span>
            <button class="remove-player" onclick="removePlayer(${player.id})">×</button>
        </div>
    `).join('');
}

// Función para remover jugador
function removePlayer(playerId) {
    selectedPlayers = selectedPlayers.filter(p => p.id !== playerId);
    updateSelectedDisplay();
    renderAvailablePlayers();
}

// Función para limpiar selección
function clearSelection() {
    selectedPlayers = [];
    updateSelectedDisplay();
    renderAvailablePlayers();
    document.getElementById('teamsSection').classList.remove('show');
}

// Función para armar equipos
async function buildTeams() {
    const buildBtn = document.getElementById('buildTeamsBtn');
    const teamsSection = document.getElementById('teamsSection');
    
    buildBtn.disabled = true;
    buildBtn.innerHTML = '<div class="spinner"></div> Armando equipos...';
    
    try {
        const response = await callBuildTeamsAPI();
        teamsData = response.teams;
        currentTeamOption = 0;
        
        displayTeamsOptions();
        displayTeams();
        teamsSection.classList.add('show');
        
    } catch (error) {
        console.error('Error al armar equipos:', error);
        alert('Error al armar equipos. Por favor, intenta de nuevo.');
    } finally {
        buildBtn.disabled = false;
        buildBtn.innerHTML = '🏆 Armar Equipos';
    }
}

// Función para llamar al API de armar equipos
async function callBuildTeamsAPI() {
    const urlParams = new URLSearchParams(window.location.search);
    const clubId = urlParams.get('club_id');
    const scale = urlParams.get('scale') || '1-5';
    
    const selectedPlayerIds = selectedPlayers.map(p => p.id);
    
    return await TeamsAPI.buildTeams(selectedPlayerIds, clubId, scale);
}

// Función para mostrar opciones de equipos
function displayTeamsOptions() {
    const optionsContainer = document.getElementById('teamsOptions');
    
    if (teamsData.length <= 1) {
        optionsContainer.style.display = 'none';
        return;
    }
    
    optionsContainer.style.display = 'block';
    optionsContainer.innerHTML = `
        <h3 style="text-align: center; margin-bottom: 15px;">Opciones de Equipos</h3>
        <div class="option-selector">
            ${teamsData.map((_, index) => `
                <button class="option-btn ${index === currentTeamOption ? 'active' : ''}" 
                        onclick="selectTeamOption(${index})">
                    Opción ${index + 1}
                </button>
            `).join('')}
        </div>
    `;
}

// Función para seleccionar opción de equipo
function selectTeamOption(optionIndex) {
    currentTeamOption = optionIndex;
    displayTeamsOptions();
    displayTeams();
}

// Función para mostrar equipos
function displayTeams() {
    const teamsDisplay = document.getElementById('teamsDisplay');
    const currentTeams = teamsData[currentTeamOption];
    
    if (!currentTeams) return;
    
    teamsDisplay.innerHTML = `
        <div class="teams-display">
            <div class="team">
                <h3>🔴 Equipo 1</h3>
                ${renderTeam(currentTeams.team1)}
            </div>
            <div class="team">
                <h3>🔵 Equipo 2</h3>
                ${renderTeam(currentTeams.team2)}
            </div>
        </div>
    `;
}

// Función para renderizar un equipo
function renderTeam(teamPlayers) {
    const teamStats = calculateTeamStats(teamPlayers);
    
    return `
        <div class="team-stats">
            <div class="stat-item">
                <div class="stat-label">Promedio</div>
                <div class="stat-value">${teamStats.average}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Ataque</div>
                <div class="stat-value">${teamStats.attack}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Defensa</div>
                <div class="stat-value">${teamStats.defense}</div>
            </div>
        </div>
        <div class="team-players">
            ${teamPlayers.map(player => `
                <div class="team-player">
                    <div class="team-player-avatar">
                        ${'👤'}
                    </div>
                    <div class="team-player-info">
                        <div class="team-player-name">${player.name}</div>
                        <div class="team-player-skills">
                            Prom: ${calculateAverage(player)} | 
                            Tir: ${player.tiro} | 
                            Def: ${player.defensa} | 
                            Pas: ${player.pases}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Función para calcular estadísticas del equipo
function calculateTeamStats(teamPlayers) {
    const averages = teamPlayers.map(calculateAverage);
    const attacks = teamPlayers.map(p => (p.tiro + p.velocidad + p.control) / 3);
    const defenses = teamPlayers.map(p => (p.defensa + p.fuerza_cuerpo + p.resistencia) / 3);
    
    return {
        average: Math.round(averages.reduce((a, b) => a + b, 0) / averages.length),
        attack: Math.round(attacks.reduce((a, b) => a + b, 0) / attacks.length),
        defense: Math.round(defenses.reduce((a, b) => a + b, 0) / defenses.length)
    };
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    loadPlayers();
    updateSelectedDisplay();
});