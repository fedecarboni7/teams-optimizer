// Mock data - simulating API response
const mockPlayers = [
    { name: "Añay", rating: 75 },
    { name: "Dani Rincón", rating: 75 },
    { name: "Eze Blanco", rating: 75 },
    { name: "Nano", rating: 75 },
    { name: "Fede", rating: 75 },
    { name: "Fede H", rating: 75 },
    { name: "Gastón", rating: 75 },
    { name: "Kim", rating: 75 },
    { name: "Lucas", rating: 75 },
    { name: "Mati", rating: 75 },
    { name: "Mike", rating: 72 }
];

let players = [];
let selectedPlayers = new Set();
let teamA = [];
let teamB = [];
let availablePlayers = [];
let filteredPlayers = [];

// Initialize app
async function init() {
    try {
        // Simulate API call
        await loadPlayers();
        setupEventListeners();
        renderPlayers();
        updateManualMode();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Simulate API call to load players
async function loadPlayers() {
    // Simulating network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    players = [...mockPlayers];
    filteredPlayers = [...players];
    availablePlayers = [...players];
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
}

function renderPlayers() {
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';

    filteredPlayers.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        
        const isSelected = selectedPlayers.has(player.name);
        
        playerItem.innerHTML = `
            <div class="player-info">
                <div class="checkbox ${isSelected ? 'checked' : ''}" data-player="${player.name}"></div>
                <span class="player-name">${player.name}</span>
            </div>
            <span class="player-rating">${player.rating}</span>
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
    document.getElementById('players-count').textContent = `Seleccionados: ${count} players`;
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
    document.getElementById('team-a-count').textContent = `${teamA.length} players`;
    document.getElementById('team-b-count').textContent = `${teamB.length} players`;
    document.getElementById('available-count').textContent = `${availablePlayers.length} players`;
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