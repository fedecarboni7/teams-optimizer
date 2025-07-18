// Configuración de escala
let currentScale = 5;

// Variables globales
let players = [];
let loading = false;

// Función para formatear fecha
function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

// Función para calcular promedio de habilidades
function calculateAverage(player) {
    const skillKeys = ['velocidad', 'resistencia', 'pases', 'tiro', 'defensa', 'fuerza_cuerpo', 'control', 'habilidad_arquero', 'vision'];
    const skillValues = skillKeys.map(key => player[key]).filter(val => typeof val === 'number');
    
    if (skillValues.length === 0) return 0;
    
    const average = skillValues.reduce((a, b) => a + b, 0) / skillValues.length;
    
    // No hacer conversión - cada tabla maneja su propia escala
    return Math.round(average * 10) / 10; // Redondear a 1 decimal
}

// Función para cargar jugadores desde el backend
async function loadPlayers() {
    try {
        loading = true;
        renderPlayers(); // Mostrar loading
        
        // Usar endpoint unificado con parámetro de escala
        const scale = currentScale === 5 ? '1-5' : '1-10';
        const response = await fetch(`/api/players?scale=${scale}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`Error ${response.status}`);
        players = await response.json();
        
        loading = false;
        renderPlayers();
    } catch (error) {
        loading = false;
        console.error('Error loading players:', error);
        const playersList = document.getElementById('players-list');
        playersList.innerHTML = '<div class="error" style="text-align: center; color: red; padding: 20px;">Error al cargar jugadores. Por favor, recarga la página.</div>';
    }
}

// Función para renderizar la lista de jugadores
function renderPlayers() {
    const playersList = document.getElementById('players-list');
    
    if (loading) {
        playersList.innerHTML = '<div style="text-align: center; padding: 20px;">Cargando jugadores...</div>';
        return;
    }
    
    playersList.innerHTML = '';

    if (players.length === 0) {
        playersList.innerHTML = '<div style="text-align: center; padding: 20px;">No hay jugadores registrados. ¡Agrega tu primer jugador!</div>';
        return;
    }

    players.forEach(player => {
        const playerRow = document.createElement('div');
        playerRow.className = 'player-row';
        
        const initial = player.name.charAt(0).toUpperCase();
        const score = calculateAverage(player);
        const lastModified = player.updated_at || player.created_at || new Date();
        
        playerRow.innerHTML = `
            <div class="player-name">
                <div class="player-initial">${initial}</div>
                <div class="player-full-name">${player.name}</div>
            </div>
            <div class="score">${score}/${currentScale}</div>
            <div class="last-modified">${formatDate(lastModified)}</div>
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
    
    // Recargar jugadores de la tabla correspondiente
    loadPlayers();
}

// Función para ver detalles del jugador
function viewPlayer(id) {
    const player = players.find(p => p.id === id);
    if (player) {
        const details = document.getElementById('player-details');
        const average = calculateAverage(player);
        const createdDate = player.created_at || new Date();
        const lastModified = player.updated_at || player.created_at || new Date();
        
        details.innerHTML = `
            <p><strong>Nombre:</strong> ${player.name}</p>
            <p><strong>Promedio General:</strong> ${average}/${currentScale}</p>
            <p><strong>Fecha de Creación:</strong> ${formatDate(createdDate)}</p>
            <p><strong>Última Modificación:</strong> ${formatDate(lastModified)}</p>
            <br>
            <h4>Habilidades Detalladas (1-10):</h4>
            <p><strong>Velocidad:</strong> ${player.velocidad}</p>
            <p><strong>Resistencia:</strong> ${player.resistencia}</p>
            <p><strong>Pases:</strong> ${player.pases}</p>
            <p><strong>Tiro:</strong> ${player.tiro}</p>
            <p><strong>Defensa:</strong> ${player.defensa}</p>
            <p><strong>Fuerza Cuerpo:</strong> ${player.fuerza_cuerpo}</p>
            <p><strong>Control:</strong> ${player.control}</p>
            <p><strong>Habilidad Arquero:</strong> ${player.habilidad_arquero}</p>
            <p><strong>Visión:</strong> ${player.vision}</p>
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
    openPlayerModal();
}

// Función para abrir modal de edición/creación
function openPlayerModal(playerId = null) {
    // Por ahora simulamos con prompt hasta que implementemos el modal completo
    // TODO: Implementar modal completo con todas las habilidades
    const name = prompt('Ingresa el nombre del jugador:');
    if (name && name.trim()) {
        // Valores por defecto según la escala
        const defaultValue = currentScale === 5 ? 3 : 5;
        
        const playerData = {
            name: name.trim(),
            velocidad: defaultValue,
            resistencia: defaultValue,
            pases: defaultValue,
            tiro: defaultValue,
            defensa: defaultValue,
            fuerza_cuerpo: defaultValue,
            control: defaultValue,
            habilidad_arquero: defaultValue,
            vision: defaultValue
        };
        
        if (playerId) {
            playerData.id = playerId;
        }
        
        savePlayer(playerData);
    }
}

// Función para guardar jugador
async function savePlayer(playerData) {
    try {
        // Usar endpoint unificado con parámetro de escala
        const scale = currentScale === 5 ? '1-5' : '1-10';
        const response = await fetch(`/api/players?scale=${scale}`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(playerData) // Enviar como objeto individual
        });
        
        if (!response.ok) throw new Error(`Error ${response.status}`);
        await loadPlayers(); // Recargar la lista
    } catch (error) {
        alert('Error al guardar el jugador: ' + error.message);
    }
}

// Función para editar un jugador
function editPlayer(id) {
    const player = players.find(p => p.id === id);
    if (player) {
        // Por ahora simulamos con prompts hasta que implementemos el modal completo
        // TODO: Implementar modal completo con todas las habilidades
        const newName = prompt('Editar nombre:', player.name);
        
        if (newName && newName.trim()) {
            const playerData = {
                id: player.id,
                name: newName.trim(),
                velocidad: player.velocidad,
                resistencia: player.resistencia,
                pases: player.pases,
                tiro: player.tiro,
                defensa: player.defensa,
                fuerza_cuerpo: player.fuerza_cuerpo,
                control: player.control,
                habilidad_arquero: player.habilidad_arquero,
                vision: player.vision
            };
            
            savePlayer(playerData);
        }
    }
}

// Función para eliminar un jugador
async function deletePlayer(id) {
    const player = players.find(p => p.id === id);
    if (player && confirm(`¿Estás seguro de que quieres eliminar a ${player.name}?`)) {
        try {
            // Usar endpoint unificado con parámetro de escala
            const scale = currentScale === 5 ? '1-5' : '1-10';
            const response = await fetch(`/api/players/${id}?scale=${scale}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) throw new Error(`Error ${response.status}`);
            await loadPlayers(); // Recargar la lista
        } catch (error) {
            alert('Error al eliminar el jugador: ' + error.message);
        }
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
    loadPlayers();
});