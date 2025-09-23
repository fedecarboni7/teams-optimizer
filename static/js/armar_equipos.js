// Variables globales
let players = [];
let selectedPlayers = new Set();
let teamA = [];
let teamB = [];
let availablePlayers = [];
let filteredPlayers = [];
let currentClubId = 'my-players';
let userClubs = [];
let currentScale = 5; // Variable para la escala actual
let loading = false;
let hasResults = false; // Variable para saber si hay resultados generados

// Initialize app
async function init() {
    try {
        // Cargar datos del usuario
        await loadUserClubs();
        
        // Cargar jugadores
        await loadPlayers();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Renderizar interfaz
        renderPlayers();
        updateManualMode();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Error al cargar la aplicación');
    }
}

// Cargar clubes del usuario (igual que en players.js)
async function loadUserClubs() {
    try {
        const response = await fetch('/api/user-clubs', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            userClubs = await response.json();
            populateClubSelector();
        } else {
            console.error('Error loading user clubs:', response.status);
            populateClubSelector();
        }
    } catch (error) {
        console.error('Error loading user clubs:', error);
        populateClubSelector();
    }
}

// Poblar el selector de clubes (igual que en players.js)
function populateClubSelector() {
    const selector = document.getElementById('club-select-navbar');
    const contextIcon = document.getElementById('contextIcon');
    
    // Limpiar opciones existentes excepto "Mis jugadores"
    selector.innerHTML = '<option value="my-players">Mis jugadores</option>';
    
    // Agregar clubes del usuario
    userClubs.forEach(club => {
        const option = document.createElement('option');
        option.value = club.id;
        option.textContent = club.name;
        selector.appendChild(option);
    });
    
    // Actualizar icono según contexto actual
    updateContextIcon();
}

// Actualizar el icono según el contexto actual
// Cargar jugadores (usando la misma lógica que players.js)
async function loadPlayers() {
    await loadPlayersForContext(currentClubId);
}

// Cargar jugadores según el contexto (personal o club) - igual que en players.js
async function loadPlayersForContext(contextId) {
    try {
        loading = true;
        renderPlayers(); // Mostrar loading
        
        const scale = currentScale === 5 ? '1-5' : '1-10';
        let url = `/api/players?scale=${scale}`;
        
        if (contextId !== 'my-players') {
            url += `&club_id=${contextId}`;
        }
        
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        players = data.players || data; // Manejar tanto {players: [...]} como [...]
        
        // Calcular promedio para cada jugador
        players = players.map(player => ({
            ...player,
            rating: calculateAverage(player)
        }));
        
        // Inicializar jugadores filtrados con todos los jugadores
        filteredPlayers = [...players];
        availablePlayers = [...players];
        
        // Limpiar selecciones cuando cambia el contexto
        selectedPlayers.clear();
        teamA = [];
        teamB = [];
        hasResults = false; // Resetear resultados cuando cambia el contexto
        
        // Ocultar resultados anteriores si existen
        const resultsContainer = document.getElementById('teams-results');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
        
        // Limpiar el buscador cuando cambia el contexto
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        loading = false;
        renderPlayers();
        updateManualMode();
        
    } catch (error) {
        loading = false;
        console.error('Error loading players for context:', error);
        showError('Error al cargar jugadores');
        players = [];
        filteredPlayers = [];
        availablePlayers = [];
        renderPlayers();
    }
}

// Función para cambiar escala (igual que en players.js)
function setScale(scale) {
    currentScale = scale;
    
    // Actualizar botones activos
    document.querySelectorAll('.scale-option').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Recargar jugadores de la tabla correspondiente
    loadPlayers();
}

// Cambiar contexto (club o personal) - igual que en players.js
async function switchContext() {
    const selector = document.getElementById('club-select-navbar');
    const selectedValue = selector.value;
    
    // Mostrar feedback visual mientras cambia el contexto
    selector.disabled = true;
    
    try {
        currentClubId = selectedValue;
        updateContextIcon();
        
        // Recargar jugadores según el nuevo contexto
        await loadPlayersForContext(selectedValue);
        
    } catch (error) {
        // Si hay error, restaurar la selección anterior y mostrar error
        console.error('Error switching context:', error);
        showError('Error al cambiar el contexto. Intenta de nuevo.');
    } finally {
        selector.disabled = false;
    }
}

// Calcular promedio de habilidades
function calculateAverage(player) {
    const skillKeys = ['velocidad', 'resistencia', 'pases', 'tiro', 'defensa', 'fuerza_cuerpo', 'control', 'habilidad_arquero', 'vision'];
    const skillValues = skillKeys.map(key => player[key]).filter(val => typeof val === 'number');
    
    if (skillValues.length === 0) return 0;
    
    const average = skillValues.reduce((a, b) => a + b, 0) / skillValues.length;
    return Math.round(average * 10) / 10;
}

function setupEventListeners() {
    // Mode selector
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const mode = e.target.dataset.mode;
            document.getElementById('automatic-mode').classList.toggle('hidden', mode !== 'automatic');
            document.getElementById('manual-mode').classList.toggle('hidden', mode !== 'manual');
            
            // Manejar visibilidad de resultados generados
            const resultsContainer = document.getElementById('teams-results');
            if (resultsContainer) {
                if (mode === 'manual') {
                    // Ocultar resultados cuando se pasa a modo manual
                    resultsContainer.style.display = 'none';
                } else if (mode === 'automatic' && hasResults) {
                    // Mostrar resultados cuando se vuelve a modo automático y hay resultados
                    resultsContainer.style.display = 'block';
                }
            }
        });
    });

    // Search functionality
    document.getElementById('search-input').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filteredPlayers = players.filter(player => 
            player.name.toLowerCase().includes(searchTerm)
        );
        renderPlayers();
    });

    // Generate teams button
    document.querySelector('.generate-btn').addEventListener('click', generateTeams);
}

// Actualizar selector de clubes
function updateClubSelector() {
    const clubSelect = document.getElementById('club-select-navbar');
    const contextIcon = document.getElementById('contextIcon');
    
    // Limpiar opciones existentes (excepto "Mis jugadores")
    const myPlayersOption = clubSelect.querySelector('option[value="my-players"]');
    clubSelect.innerHTML = '';
    clubSelect.appendChild(myPlayersOption);
    
    // Agregar clubes del usuario
    userClubs.forEach(club => {
        const option = document.createElement('option');
        option.value = club.id;
        option.textContent = club.name;
        clubSelect.appendChild(option);
    });
    
    // Actualizar icono según contexto
    if (currentClubId === 'my-players') {
        contextIcon.textContent = '👤';
    } else {
        contextIcon.textContent = '🏆';
    }
}

function renderPlayers() {
    const playersList = document.getElementById('players-list');
    
    if (loading) {
        playersList.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 18px; color: #aaa; margin-bottom: 10px;">⚽ Cargando jugadores...</div>
                <div style="font-size: 14px; color: #666;">Esto puede tomar unos segundos</div>
            </div>
        `;
        return;
    }
    
    playersList.innerHTML = '';

    const playersToShow = filteredPlayers;
    
    if (playersToShow.length === 0) {
        const contextName = currentClubId === 'my-players' ? 'creados' : 
                          userClubs.find(club => club.id == currentClubId)?.name || 'de este club';
        
        const searchTerm = document.getElementById('search-input')?.value?.toLowerCase().trim() || '';
        
        // Mostrar mensaje diferente si es por búsqueda o por falta de jugadores
        const message = searchTerm !== '' ? 
            `🔍 No se encontraron jugadores con "${searchTerm}"` :
            `👤 No hay jugadores ${contextName}`;
        
        const subMessage = searchTerm !== '' ?
            'Intenta con otro término de búsqueda' :
            '¡Agrega jugadores para comenzar a armar equipos!';
        
        playersList.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 18px; color: #aaa; margin-bottom: 10px;">${message}</div>
                <div style="font-size: 14px; color: #666;">${subMessage}</div>
            </div>
        `;
        return;
    }

    filteredPlayers.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        
        const isSelected = selectedPlayers.has(player.name);
        
        playerItem.innerHTML = `
            <div class="player-info">
                <div class="checkbox ${isSelected ? 'checked' : ''}" data-player="${player.name}"></div>
                <span class="player-name">${player.name}</span>
            </div>
            <span class="player-rating">${player.rating}/${currentScale}</span>
        `;
        
        // Add click event to checkbox
        const checkbox = playerItem.querySelector('.checkbox');
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlayerSelection(player.name);
        });
        
        playersList.appendChild(playerItem);
    });

    updatePlayersCount();
}

function togglePlayerSelection(playerName) {
    if (selectedPlayers.has(playerName)) {
        selectedPlayers.delete(playerName);
    } else {
        selectedPlayers.add(playerName);
    }
    renderPlayers();
}

function updatePlayersCount() {
    const count = selectedPlayers.size;
    document.getElementById('players-count').textContent = `Seleccionados: ${count} jugadores`;
}

// Manual mode functions
function updateManualMode() {
    renderAvailablePlayers();
    renderTeamPlayers();
    updateTeamCounts();
    renderManualComparison();
}

function renderAvailablePlayers() {
    const container = document.getElementById('available-players-list');
    container.innerHTML = '';

    availablePlayers.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'available-player';
        playerDiv.innerHTML = `
            <div class="player-info">
                <span class="player-name">👤 ${player.name}</span>
                <span class="player-rating">${player.rating}</span>
            </div>
            <div class="add-buttons">
                <button class="add-btn" onclick="addToTeam('A', '${player.name}')">+</button>
                <button class="add-btn team-b" onclick="addToTeam('B', '${player.name}')">+</button>
            </div>
        `;
        container.appendChild(playerDiv);
    });
}

function renderTeamPlayers() {
    renderTeam('A', teamA, 'team-a-players');
    renderTeam('B', teamB, 'team-b-players');
}

function renderTeam(teamName, team, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    team.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'team-player';
        playerDiv.innerHTML = `
            <div class="player-info">
                <span class="player-name">👤 ${player.name}</span>
                <span class="player-rating">${player.rating}</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <button class="swap-btn" onclick="swapTeam('${teamName}', '${player.name}')">🔃</button>
                <button class="remove-btn" onclick="removeFromTeam('${teamName}', '${player.name}')">−</button>
            </div>
        `;
        container.appendChild(playerDiv);
    });
}

// Renderizar gráficos de comparación en modo manual reutilizando el layout de results
function renderManualComparison() {
    // Crear contenedor si no existe
    let comparison = document.getElementById('manual-comparison');
    if (!comparison) {
        const manualMode = document.getElementById('manual-mode');
        comparison = document.createElement('div');
        comparison.id = 'manual-comparison';
        comparison.className = 'stats-container';
        manualMode.appendChild(comparison);
    }

    // Si no hay jugadores en ambos equipos, ocultar
    const teamSize = Math.min(teamA.length, teamB.length);
    if (teamSize === 0) {
        comparison.style.display = 'none';
        comparison.innerHTML = '';
        return;
    }

    // Construir tabla de habilidades y contenedores de gráficos como en results
    const skills = [
        ['velocidad', 'Velocidad'],
        ['resistencia', 'Resistencia'],
        ['control', 'Control'],
        ['pases', 'Pases'],
        ['fuerza_cuerpo', 'Fuerza cuerpo'],
        ['habilidad_arquero', 'Hab. Arquero'],
        ['defensa', 'Defensa'],
        ['tiro', 'Tiro'],
        ['vision', 'Visión'],
    ];

    // Calcular totales por equipo
    const totalsA = Object.fromEntries(skills.map(([k]) => [k, 0]));
    const totalsB = Object.fromEntries(skills.map(([k]) => [k, 0]));
    teamA.forEach(p => skills.forEach(([k]) => totalsA[k] += p[k] || 0));
    teamB.forEach(p => skills.forEach(([k]) => totalsB[k] += p[k] || 0));
    const totalA = Object.values(totalsA).reduce((a,b)=>a+b,0);
    const totalB = Object.values(totalsB).reduce((a,b)=>a+b,0);

    comparison.style.display = 'block';
    comparison.innerHTML = `
        <div class="button-container">
            <button type="button" id="mostrarDetallesManual" class="details-btn">
                <i class="fas fa-chart-bar" style="padding-right: 5px;"></i>
                <span>Mostrar detalles</span>
            </button>
        </div>
        <div class="content-container" id="content-containerManual" data-players-count="${teamSize}" style="display: none;">
            <div class="swiper">
                <div class="swiper-wrapper">
                    <div class="swiper-slide">
                        <div class="table-container">
                            <table id="skills-tableManual">
                                <thead>
                                    <tr>
                                        <th>Habilidad</th>
                                        <th>Equipo 1</th>
                                        <th>Equipo 2</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${skills.map(([k, label]) => `
                                        <tr>
                                            <td>${label}</td>
                                            <td>${totalsA[k]}</td>
                                            <td>${totalsB[k]}</td>
                                        </tr>
                                    `).join('')}
                                    <tr>
                                        <td>Total</td>
                                        <td>${totalA}</td>
                                        <td>${totalB}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="swiper-slide">
                        <div class="chart-container">
                            <canvas></canvas>
                        </div>
                    </div>
                    <div class="swiper-slide">
                        <div class="bar-chart-container">
                            <canvas></canvas>
                        </div>
                    </div>
                </div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
            </div>
        </div>
    `;

    // Wire up toggle
    const btn = document.getElementById('mostrarDetallesManual');
    btn.onclick = () => {
        const container = document.getElementById('content-containerManual');
        const textSpan = btn.querySelector('span');
        if (container.style.display === 'none' || container.style.display === '') {
            container.style.display = 'flex';
            textSpan.textContent = 'Ocultar detalles';
            // Pasar conteo de jugadores para escalar gráficos
            container.dataset.playersCount = String(teamSize);
            createRadarChart(container);
            createBarChart(container);
            createSwiper();
        } else {
            container.style.display = 'none';
            textSpan.textContent = 'Mostrar detalles';
        }
    };
}

function updateTeamCounts() {
    document.getElementById('team-a-count').textContent = `${teamA.length} jugadores`;
    document.getElementById('team-b-count').textContent = `${teamB.length} jugadores`;
    document.getElementById('available-count').textContent = `${availablePlayers.length} jugadores`;
}

function addToTeam(teamName, playerName) {
    const player = availablePlayers.find(p => p.name === playerName);
    if (!player) return;

    if (teamName === 'A') {
        teamA.push(player);
    } else {
        teamB.push(player);
    }

    availablePlayers = availablePlayers.filter(p => p.name !== playerName);
    updateManualMode();
}

function removeFromTeam(teamName, playerName) {
    let player;
    
    if (teamName === 'A') {
        player = teamA.find(p => p.name === playerName);
        teamA = teamA.filter(p => p.name !== playerName);
    } else {
        player = teamB.find(p => p.name === playerName);
        teamB = teamB.filter(p => p.name !== playerName);
    }

    if (player) {
        availablePlayers.push(player);
        availablePlayers.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    updateManualMode();
}

function swapTeam(currentTeam, playerName) {
    let player;
    
    if (currentTeam === 'A') {
        player = teamA.find(p => p.name === playerName);
        teamA = teamA.filter(p => p.name !== playerName);
        teamB.push(player);
    } else {
        player = teamB.find(p => p.name === playerName);
        teamB = teamB.filter(p => p.name !== playerName);
        teamA.push(player);
    }
    
    updateManualMode();
}

// Generate optimized teams function
async function generateTeams() {
    const generateBtn = document.querySelector('.generate-btn');
    
    // Validate that there are selected players
    if (selectedPlayers.size < 3) {
        alert('Necesitas seleccionar al menos 3 jugadores para armar equipos');
        return;
    }
    
    // Get player IDs from selected player names
    const selectedPlayerIds = Array.from(selectedPlayers).map(playerName => {
        const player = players.find(p => p.name === playerName);
        return player ? player.id : null;
    }).filter(id => id !== null);
    
    if (selectedPlayerIds.length !== selectedPlayers.size) {
        alert('Error: No se pudieron encontrar algunos jugadores seleccionados');
        return;
    }
    
    // Show loading state
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '⚽ Generando equipos...';
    generateBtn.disabled = true;
    
    try {
        // Prepare data for API call
        const requestData = {
            selected_player_ids: selectedPlayerIds,
            club_id: currentClubId !== 'my-players' ? parseInt(currentClubId) : null,
            scale: currentScale === 5 ? '1-5' : '1-10'
        };
        
        // Call the backend API
        const response = await fetch('/api/build-teams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al generar equipos');
        }
        
        const data = await response.json();
        
        // Transform API response to format expected by results template
        const transformedData = transformTeamsData(data);
        
        // Render the results
        displayTeamsResults(transformedData);
        
    } catch (error) {
        console.error('Error generating teams:', error);
        alert('Error al generar equipos: ' + error.message);
    } finally {
        // Restore button state
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
    }
}

// Transform API response to format expected by results template
function transformTeamsData(apiData) {
    const teams = [];
    const skills = {
        "velocidad": "Velocidad", 
        "resistencia": "Resistencia", 
        "control": "Control", 
        "pases": "Pases", 
        "fuerza_cuerpo": "Fuerza cuerpo", 
        "habilidad_arquero": "Hab. Arquero", 
        "defensa": "Defensa", 
        "tiro": "Tiro", 
        "vision": "Visión"
    };
    
    // Create player data dictionary for global access
    window.playerDataDict = {};
    
    apiData.teams.forEach((teamOption, optionIndex) => {
        // Process team 1
        const team1Players = teamOption.team1.map(p => p.name);
        const team1Skills = calculateTeamSkills(teamOption.team1);
        teams.push([team1Players, team1Skills]);
        
        // Process team 2  
        const team2Players = teamOption.team2.map(p => p.name);
        const team2Skills = calculateTeamSkills(teamOption.team2);
        teams.push([team2Players, team2Skills]);
        
        // Add players to global dictionary
        [...teamOption.team1, ...teamOption.team2].forEach(player => {
            window.playerDataDict[player.name] = {
                id: player.id,
                velocidad: player.velocidad,
                resistencia: player.resistencia,
                control: player.control,
                pases: player.pases,
                fuerza_cuerpo: player.fuerza_cuerpo,
                habilidad_arquero: player.habilidad_arquero,
                defensa: player.defensa,
                tiro: player.tiro,
                vision: player.vision
            };
        });
    });
    
    // Store teams in global variable for other functions
    window.teams = teams;
    
    return {
        teams: teams,
        skills: skills,
        min_difference_total: apiData.difference,
        len_teams: teams.length
    };
}

// Calculate team skills totals and averages
function calculateTeamSkills(teamPlayers) {
    const teamSkills = {
        "velocidad": {"total": 0, "avg": 0},
        "resistencia": {"total": 0, "avg": 0},
        "control": {"total": 0, "avg": 0},
        "pases": {"total": 0, "avg": 0},
        "tiro": {"total": 0, "avg": 0},
        "defensa": {"total": 0, "avg": 0},
        "habilidad_arquero": {"total": 0, "avg": 0},
        "fuerza_cuerpo": {"total": 0, "avg": 0},
        "vision": {"total": 0, "avg": 0}
    };
    
    // Sum all skills
    teamPlayers.forEach(player => {
        Object.keys(teamSkills).forEach(skill => {
            teamSkills[skill]["total"] += player[skill] || 0;
        });
    });
    
    // Calculate averages
    const numPlayers = teamPlayers.length;
    Object.keys(teamSkills).forEach(skill => {
        teamSkills[skill]["avg"] = String(Math.round((teamSkills[skill]["total"] / numPlayers) * 100) / 100).replace(".", ",");
    });
    
    // Calculate total skills
    const totalSkills = Object.values(teamSkills).reduce((sum, skill) => sum + skill["total"], 0);
    const avgSkills = String(Math.round((totalSkills / numPlayers) * 100) / 100).replace(".", ",");
    
    return [teamSkills, totalSkills, avgSkills];
}

// Display the teams results using the results template format
function displayTeamsResults(data) {
    const resultsContainer = document.getElementById('teams-results');
    
    // Generate HTML similar to results.html template
    let html = `
        <div class="results-section">
            <h2>Resultados de Equipos Optimizados</h2>
            <p>Diferencia mínima entre equipos: ${data.min_difference_total}</p>
            <p>Mejores combinaciones posibles: ${Math.floor(data.len_teams / 2)}</p>
            <hr>
    `;
    
    // Generate team options
    for (let i = 0; i < data.len_teams - 1; i += 2) {
        const optionNumber = Math.floor(i / 2) + 1;
        
        if (data.len_teams > 2) {
            html += `<p>Opción ${optionNumber}</p>`;
        }
        
        html += `
            <div id="popup" class="popup">
                <div class="popup-content">
                <button type="button" class="swap-button"><i class="fa-solid fa-right-left"></i></button>
                <p>Ahora podés intercambiar jugadores entre equipos usando este botón y ver las nuevas estadísticas de cada equipo. Para restaurar la disposición óptima de los equipos, volvé a tocar el botón "Armar Equipos".</p>
                <button id="closeButton">Cerrar</button>
                </div>
            </div>
            <div class="team-container" id="resultados-equipos${optionNumber}">
                <div class="team">
                    <h2>Equipo 1</h2>
                    <ul class="team-list" data-index="${i}">
        `;
        
        // Add team 1 players
        data.teams[i][0].forEach((player, index) => {
            html += `
                <li class="player-item">
                    <span class="player-number">${index + 1}.</span>
                    <span class="player-name">${player}</span>
                    <button type="button" class="swap-button" onclick="swapPlayer('${player}', '${i}', '${i + 1}')"><i class="fa-solid fa-right-left"></i></button>
                </li>
            `;
        });
        
        html += `
                    </ul>
                </div>
                <div class="team">
                    <h2>Equipo 2</h2>
                    <ul class="team-list" data-index="${i + 1}">
        `;
        
        // Add team 2 players
        data.teams[i + 1][0].forEach((player, index) => {
            html += `
                <li class="player-item">
                    <span class="player-number">${index + 1}.</span>
                    <span class="player-name">${player}</span>
                    <button type="button" class="swap-button" onclick="swapPlayer('${player}', '${i + 1}', '${i}')"><i class="fa-solid fa-right-left"></i></button>
                </li>
            `;
        });
        
        html += `
                    </ul>
                </div>
                <div class="stats-container">
                    <div class="button-container">
                        <button type="button" id="mostrarDetalles${optionNumber}" onclick="toggleStats(this)">
                            <i class="fas fa-chart-bar" style="padding-right: 5px;"></i>
                            <span>Mostrar detalles</span>
                        </button>
                        <button type="button" id="shareButton${optionNumber}" onclick="compartirEquipos(this)">
                            <i class="fas fa-share" style="padding-right: 5px;"></i> Enviar equipos
                        </button>
                        <button type="button" id="generarFormaciones${optionNumber}" onclick="generarFormaciones(this)">
                            <i class="fa-solid fa-wand-magic-sparkles" style="padding-right: 5px;"></i>
                            Generar formaciones
                        </button>
                    </div>
                    <div class="content-container" id="content-container${optionNumber}" style="display: none;">
                        <!-- Slider main container -->
                        <div class="swiper">
                            <div class="swiper-wrapper">
                                <div class="swiper-slide">
                                    <div class="table-container">
                                        <table id="skills-table${optionNumber}">
                                            <thead>
                                                <tr>
                                                    <th>Habilidad</th>
                                                    <th>Equipo 1</th>
                                                    <th>Equipo 2</th>
                                                </tr>
                                            </thead>
                                            <tbody>
        `;
        
        // Add skills rows
        Object.entries(data.skills).forEach(([key, value]) => {
            html += `
                <tr>
                    <td>${value}</td>
                    <td>${data.teams[i][1][0][key]["total"]}</td>
                    <td>${data.teams[i + 1][1][0][key]["total"]}</td>
                </tr>
            `;
        });
        
        html += `
                                                <tr>
                                                    <td>Total</td>
                                                    <td>${data.teams[i][1][1]}</td>
                                                    <td>${data.teams[i + 1][1][1]}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div class="swiper-slide">
                                    <div class="chart-container">
                                        <canvas></canvas>
                                    </div>
                                </div>
                                <div class="swiper-slide">
                                    <div class="bar-chart-container">
                                        <canvas></canvas>
                                    </div>
                                </div>
                            </div>
                            <div class="swiper-button-prev"></div>
                            <div class="swiper-button-next"></div>
                        </div>
                        <!-- Formations container -->
                        <div id="formations-container${optionNumber}" style="display: none;">
                            <div class="field-container">
                                <div id="soccer-field${optionNumber}" class="soccer-field">
                                    <!-- Players will be positioned here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    
    // Set the HTML and show the results
    resultsContainer.innerHTML = html;
    resultsContainer.style.display = 'block';
    hasResults = true; // Marcar que hay resultados generados
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Initialize components that might be needed for the results view
    if (typeof createSwiper === 'function') {
        createSwiper();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);