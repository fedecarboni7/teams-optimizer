// Configuración de escala
let currentScale = 5;

// Datos de jugadores iniciales
let players = [
    { 
        id: 1, 
        name: 'Andy', 
        initial: 'A', 
        score: 4, 
        lastModified: new Date('2024-01-15 10:30:00'),
        createdDate: new Date('2024-01-01 09:00:00'),
        totalGames: 15,
        averageScore: 4.2
    },
    { 
        id: 2, 
        name: 'Choldo', 
        initial: 'C', 
        score: 3, 
        lastModified: new Date('2024-01-14 16:45:00'),
        createdDate: new Date('2024-01-02 11:20:00'),
        totalGames: 12,
        averageScore: 3.8
    }
];

// Función para formatear fecha
function formatDate(date) {
    return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

// Función para renderizar la lista de jugadores
function renderPlayers() {
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';

    players.forEach(player => {
        const playerRow = document.createElement('div');
        playerRow.className = 'player-row';
        playerRow.innerHTML = `
            <div class="player-name">
                <div class="player-initial">${player.initial}</div>
                <div class="player-full-name">${player.name}</div>
            </div>
            <div class="score">${player.score}/${currentScale}</div>
            <div class="last-modified">${formatDate(player.lastModified)}</div>
            <div class="actions">
                <button class="action-btn view-btn" onclick="viewPlayer(${player.id})" title="Ver detalles">👁️</button>
                <button class="action-btn edit-btn" onclick="editPlayer(${player.id})" title="Editar">✏️</button>
                <button class="action-btn delete-btn" onclick="deletePlayer(${player.id})" title="Eliminar">🗑️</button>
            </div>
        `;
        playersList.appendChild(playerRow);
    });
}

// Función para cambiar escala
function setScale(scale) {
    currentScale = scale;
    
    // Actualizar botones activos
    document.querySelectorAll('.scale-option').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Convertir puntuaciones existentes
    players.forEach(player => {
        if (scale === 10 && player.score <= 5) {
            player.score = Math.round(player.score * 2);
        } else if (scale === 5 && player.score > 5) {
            player.score = Math.round(player.score / 2);
        }
    });
    
    renderPlayers();
}

// Función para ver detalles del jugador
function viewPlayer(id) {
    const player = players.find(p => p.id === id);
    if (player) {
        const details = document.getElementById('player-details');
        details.innerHTML = `
            <p><strong>Nombre:</strong> ${player.name}</p>
            <p><strong>Puntuación Actual:</strong> ${player.score}/${currentScale}</p>
            <p><strong>Fecha de Creación:</strong> ${formatDate(player.createdDate)}</p>
            <p><strong>Última Modificación:</strong> ${formatDate(player.lastModified)}</p>
            <p><strong>Total de Partidas:</strong> ${player.totalGames}</p>
            <p><strong>Promedio General:</strong> ${player.averageScore.toFixed(1)}</p>
        `;
        document.getElementById('playerModal').style.display = 'block';
    }
}

// Función para cerrar modal
function closeModal() {
    document.getElementById('playerModal').style.display = 'none';
}

// Función para agregar un jugador
function addPlayer() {
    const name = prompt('Ingresa el nombre del jugador:');
    if (name && name.trim()) {
        const now = new Date();
        const newPlayer = {
            id: Date.now(),
            name: name.trim(),
            initial: name.trim().charAt(0).toUpperCase(),
            score: 0,
            lastModified: now,
            createdDate: now,
            totalGames: 0,
            averageScore: 0
        };
        players.push(newPlayer);
        renderPlayers();
    }
}

// Función para editar un jugador
function editPlayer(id) {
    const player = players.find(p => p.id === id);
    if (player) {
        const newName = prompt('Editar nombre:', player.name);
        const newScore = prompt(`Editar puntuación (1-${currentScale}):`, player.score);
        
        if (newName && newName.trim()) {
            player.name = newName.trim();
            player.initial = newName.trim().charAt(0).toUpperCase();
            player.lastModified = new Date();
        }
        
        if (newScore !== null && !isNaN(newScore) && newScore >= 1 && newScore <= currentScale) {
            player.score = parseInt(newScore);
            player.lastModified = new Date();
        }
        
        renderPlayers();
    }
}

// Función para eliminar un jugador
function deletePlayer(id) {
    const player = players.find(p => p.id === id);
    if (player && confirm(`¿Estás seguro de que quieres eliminar a ${player.name}?`)) {
        players = players.filter(p => p.id !== id);
        renderPlayers();
    }
}

// Función para toggle del sidebar
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

// Función para navegación
function navigateTo(page) {
    // Actualizar elementos activos
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Simular navegación
    switch(page) {
        case 'jugadores':
            // Ya estamos en esta página
            break;
        case 'equipos':
            alert('Función de "Armar Equipos" pendiente de implementación');
            break;
        case 'configuracion':
            alert('Función de "Configuración" pendiente de implementación');
            break;
    }
    
    toggleSidebar();
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('playerModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    renderPlayers();
});