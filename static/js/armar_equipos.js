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
function updateContextIcon() {
    const contextIcon = document.getElementById('contextIcon');
    const selector = document.getElementById('club-select-navbar');
    
    if (selector.value === 'my-players') {
        contextIcon.textContent = '👤'; // Icono de usuario personal
    } else {
        contextIcon.textContent = '⚽'; // Icono de club
    }
}

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

// Funciones de navegación (copiadas de players.js)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    } else {
        sidebar.classList.add('open');
        overlay.classList.add('active');
    }
}

// Función para mostrar errores
function showError(message) {
    console.error(message);
    // Aquí podrías agregar una notificación visual para el usuario
}

// Funciones de navegación (copiadas de players.js)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
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

// Cambiar contexto (club)
async function switchContext() {
    const clubSelect = document.getElementById('club-select-navbar');
    currentClubId = clubSelect.value;
    
    // Actualizar icono
    const contextIcon = document.getElementById('contextIcon');
    if (currentClubId === 'my-players') {
        contextIcon.textContent = '👤';
    } else {
        contextIcon.textContent = '🏆';
    }
    
    // Recargar jugadores
    await loadPlayers();
    
    // Limpiar selecciones y equipos
    selectedPlayers.clear();
    teamA = [];
    teamB = [];
    availablePlayers = [...players];
    
    // Actualizar interfaz
    renderPlayers();
    updateManualMode();
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
        const contextName = currentClubId === 'my-players' ? 'personales' : 
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

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);