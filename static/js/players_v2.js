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
    await loadPlayersForContext(currentClubId);
}

// Función para renderizar la lista de jugadores
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

    if (players.length === 0) {
        const contextName = currentClubId === 'my-players' ? 'personales' : 
                          userClubs.find(club => club.id == currentClubId)?.name || 'de este club';
        
        playersList.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 18px; color: #aaa; margin-bottom: 10px;">👤 No hay jugadores en ${contextName}</div>
                <div style="font-size: 14px; color: #666;">¡Agrega tu primer jugador para comenzar!</div>
            </div>
        `;
        return;
    }

    players.forEach(player => {
        const playerRow = document.createElement('div');
        playerRow.className = 'player-row';
        playerRow.onclick = () => viewPlayer(player.id);
        
        const initial = player.name.charAt(0).toUpperCase();
        const score = calculateAverage(player);
        const lastModified = player.updated_at;
        
        playerRow.innerHTML = `
            <div class="player-name">
                <div class="player-initial">${initial}</div>
                <div class="player-full-name">${player.name}</div>
            </div>
            <div class="score">${score}/${currentScale}</div>
            <div class="last-modified">${formatDate(lastModified)}</div>
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

// Función para crear el radar chart
function createRadarChart(canvasId, playerData) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    return new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Velocidad', 'Resistencia', 'Pases', 'Tiro', 'Defensa', 'Fuerza Cuerpo', 'Control', 'Habilidad Arquero', 'Visión'],
            datasets: [{
                label: ' Puntos',
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
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(0, 123, 255, 1)',
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
                    max: currentScale,
                    min: 0,
                    ticks: {
                        stepSize: currentScale === 5 ? 1 : 2
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

// Variables para el modo de edición
let isEditMode = false;
let currentEditingPlayer = null;

// Función para ver detalles del jugador
function viewPlayer(id) {
    const player = players.find(p => p.id === id);
    if (player) {
        currentEditingPlayer = player;
        isEditMode = false;
        renderPlayerModal(player);
        document.getElementById('playerModal').style.display = 'block';
    }
}

// Función para renderizar el modal del jugador
function renderPlayerModal(player) {
    const details = document.getElementById('player-details');
    const average = calculateAverage(player);
    const lastModified = player.updated_at;
    const initial = player.name.charAt(0).toUpperCase();

    details.innerHTML = `
        <div class="player-detail-header">
            <div class="player-detail-avatar">
                <div class="avatar-initials">${initial}</div>
            </div>
            <div class="player-detail-info">
                <h3>${player.name}</h3>
                <p class="average-score">Promedio General: ${average}/${currentScale}</p>
                <p class="last-modified">Última Modificación: ${formatDate(lastModified)}</p>
            </div>
        </div>
        
        <div class="chart-container-modal">
            <canvas id="detail-chart-${player.id}" width="300" height="300"></canvas>
        </div>
        
        <div id="view-mode" class="view-mode" style="display: ${isEditMode ? 'none' : 'block'}">
            <div class="skills-detail-grid">
                <div class="skill-detail-item">
                    <span class="skill-detail-name">Velocidad</span>
                    <span class="skill-detail-value">${player.velocidad}/${currentScale}</span>
                </div>
                <div class="skill-detail-item">
                    <span class="skill-detail-name">Resistencia</span>
                    <span class="skill-detail-value">${player.resistencia}/${currentScale}</span>
                </div>
                <div class="skill-detail-item">
                    <span class="skill-detail-name">Pases</span>
                    <span class="skill-detail-value">${player.pases}/${currentScale}</span>
                </div>
                <div class="skill-detail-item">
                    <span class="skill-detail-name">Tiro</span>
                    <span class="skill-detail-value">${player.tiro}/${currentScale}</span>
                </div>
                <div class="skill-detail-item">
                    <span class="skill-detail-name">Defensa</span>
                    <span class="skill-detail-value">${player.defensa}/${currentScale}</span>
                </div>
                <div class="skill-detail-item">
                    <span class="skill-detail-name">Fuerza Cuerpo</span>
                    <span class="skill-detail-value">${player.fuerza_cuerpo}/${currentScale}</span>
                </div>
                <div class="skill-detail-item">
                    <span class="skill-detail-name">Control</span>
                    <span class="skill-detail-value">${player.control}/${currentScale}</span>
                </div>
                <div class="skill-detail-item">
                    <span class="skill-detail-name">Habilidad Arquero</span>
                    <span class="skill-detail-value">${player.habilidad_arquero}/${currentScale}</span>
                </div>
                <div class="skill-detail-item">
                    <span class="skill-detail-name">Visión</span>
                    <span class="skill-detail-value">${player.vision}/${currentScale}</span>
                </div>
            </div>
        </div>
        
        <div id="edit-mode" class="edit-form" style="display: ${isEditMode ? 'block' : 'none'}">
            <div class="form-group">
                <label for="edit-player-name">Nombre del Jugador</label>
                <input type="text" id="edit-player-name" value="${player.name}" />
            </div>
            
            <div class="form-group">
                <label>Habilidades (1-${currentScale})</label>
                <div class="skills-edit-grid">
                    <div class="skill-input">
                        <label for="edit-velocidad">Velocidad</label>
                        <input type="number" id="edit-velocidad" min="1" max="${currentScale}" value="${player.velocidad}" />
                    </div>
                    <div class="skill-input">
                        <label for="edit-resistencia">Resistencia</label>
                        <input type="number" id="edit-resistencia" min="1" max="${currentScale}" value="${player.resistencia}" />
                    </div>
                    <div class="skill-input">
                        <label for="edit-pases">Pases</label>
                        <input type="number" id="edit-pases" min="1" max="${currentScale}" value="${player.pases}" />
                    </div>
                    <div class="skill-input">
                        <label for="edit-tiro">Tiro</label>
                        <input type="number" id="edit-tiro" min="1" max="${currentScale}" value="${player.tiro}" />
                    </div>
                    <div class="skill-input">
                        <label for="edit-defensa">Defensa</label>
                        <input type="number" id="edit-defensa" min="1" max="${currentScale}" value="${player.defensa}" />
                    </div>
                    <div class="skill-input">
                        <label for="edit-fuerza_cuerpo">Fuerza Cuerpo</label>
                        <input type="number" id="edit-fuerza_cuerpo" min="1" max="${currentScale}" value="${player.fuerza_cuerpo}" />
                    </div>
                    <div class="skill-input">
                        <label for="edit-control">Control</label>
                        <input type="number" id="edit-control" min="1" max="${currentScale}" value="${player.control}" />
                    </div>
                    <div class="skill-input">
                        <label for="edit-habilidad_arquero">Habilidad Arquero</label>
                        <input type="number" id="edit-habilidad_arquero" min="1" max="${currentScale}" value="${player.habilidad_arquero}" />
                    </div>
                    <div class="skill-input">
                        <label for="edit-vision">Visión</label>
                        <input type="number" id="edit-vision" min="1" max="${currentScale}" value="${player.vision}" />
                    </div>
                </div>
            </div>
        </div>
        
        <div class="modal-actions">
            <button class="btn btn-primary" id="edit-btn" onclick="toggleEditMode()" style="display: ${isEditMode ? 'none' : 'flex'}">
                ✏️ Editar
            </button>
            <button class="btn btn-primary" id="save-btn" onclick="savePlayerEdits()" style="display: ${isEditMode ? 'flex' : 'none'}">
                💾 Guardar
            </button>
            <button class="btn btn-secondary" id="cancel-btn" onclick="cancelEdit()" style="display: ${isEditMode ? 'flex' : 'none'}">
                ❌ Cancelar
            </button>
            <button class="btn btn-danger" onclick="deletePlayerFromModal(${player.id})">
                🗑️ Eliminar
            </button>
        </div>
    `;
    
    // Crear el radar chart después de que el elemento esté en el DOM
    setTimeout(() => {
        createRadarChart(`detail-chart-${player.id}`, player);
        
        // Agregar validación en tiempo real a los inputs de habilidades
        if (isEditMode) {
            const skillInputs = ['velocidad', 'resistencia', 'pases', 'tiro', 'defensa', 'fuerza_cuerpo', 'control', 'habilidad_arquero', 'vision'];
            
            skillInputs.forEach(skill => {
                const input = document.getElementById(`edit-${skill}`);
                if (input) {
                    // Validar al cambiar el valor
                    input.addEventListener('input', function() {
                        let value = parseInt(this.value);
                        
                        // Corregir valores fuera del rango
                        if (value < 1) {
                            this.value = 1;
                        } else if (value > currentScale) {
                            this.value = currentScale;
                        }
                    });
                    
                    // Validar al perder el foco
                    input.addEventListener('blur', function() {
                        let value = parseInt(this.value);
                        
                        if (isNaN(value) || value < 1) {
                            this.value = 1;
                        } else if (value > currentScale) {
                            this.value = currentScale;
                        }
                    });
                }
            });
        }
    }, 100);
}

// Función para toggle entre modo vista y edición
function toggleEditMode() {
    isEditMode = true;
    renderPlayerModal(currentEditingPlayer);
}

// Función para cancelar la edición
function cancelEdit() {
    isEditMode = false;
    renderPlayerModal(currentEditingPlayer);
}

// Función para mostrar mensaje de éxito
function showSuccessMessage(message) {
    // Crear un toast o mensaje temporal
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
        toast.style.transform = 'translateX(-10px)';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Función para guardar los cambios del jugador
async function savePlayerEdits() {
    try {
        // Validar nombre
        const name = document.getElementById('edit-player-name').value.trim();
        if (!name) {
            alert('El nombre del jugador es obligatorio');
            return;
        }

        // Validar y obtener valores de habilidades
        const skillValues = {};
        const skillKeys = ['velocidad', 'resistencia', 'pases', 'tiro', 'defensa', 'fuerza_cuerpo', 'control', 'habilidad_arquero', 'vision'];
        
        for (const skill of skillKeys) {
            const value = parseInt(document.getElementById(`edit-${skill}`).value);
            
            // Validar que el valor esté en el rango correcto
            if (isNaN(value) || value < 1 || value > currentScale) {
                alert(`El valor de ${skill.replace('_', ' ')} debe estar entre 1 y ${currentScale}`);
                return;
            }
            
            skillValues[skill] = value;
        }

        const playerData = {
            id: currentEditingPlayer.id,
            name: name,
            ...skillValues,
            club_id: currentEditingPlayer.club_id || null
        };

        await savePlayer(playerData);
        
        // Actualizar el jugador actual con los nuevos datos
        Object.assign(currentEditingPlayer, playerData);
        
        // Mostrar mensaje de éxito
        showSuccessMessage('✓ Jugador guardado exitosamente');
        
        // Cambiar a modo vista sin cerrar el modal
        isEditMode = false;
        renderPlayerModal(currentEditingPlayer);
        
    } catch (error) {
        alert('Error al guardar los cambios: ' + error.message);
    }
}

// Función para eliminar jugador desde el modal
async function deletePlayerFromModal(id) {
    const player = players.find(p => p.id === id);
    if (player && confirm(`¿Estás seguro de que quieres eliminar a ${player.name}?`)) {
        try {
            const scale = currentScale === 5 ? '1-5' : '1-10';
            const response = await fetch(`/api/players/${id}?scale=${scale}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) throw new Error(`Error ${response.status}`);
            
            closeModal();
            await loadPlayers(); // Recargar la lista
        } catch (error) {
            alert('Error al eliminar el jugador: ' + error.message);
        }
    }
}

// Función para cerrar modal
function closeModal() {
    // Limpiar cualquier chart existente
    const details = document.getElementById('player-details');
    const canvases = details.querySelectorAll('canvas');
    canvases.forEach(canvas => {
        const chart = Chart.getChart(canvas);
        if (chart) {
            chart.destroy();
        }
    });
    
    // Resetear modo de edición
    isEditMode = false;
    currentEditingPlayer = null;
    
    document.getElementById('playerModal').style.display = 'none';
}

// Función para agregar un jugador
function addPlayer() {
    openPlayerModal();
}

// Función para abrir modal de edición/creación
function openPlayerModal() {
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
        
        if (currentClubId !== 'my-players') {
            playerData.club_id = currentClubId;
        }
        else {
            playerData.club_id = null;
        }

        savePlayer(playerData);
    }
}

// Función para guardar jugador
async function savePlayer(playerData) {
    try {
        const scale = currentScale === 5 ? '1-5' : '1-10';
        const response = await fetch(`/api/player?scale=${scale}`, {
            method: playerData.id ? 'PUT' : 'POST', // Usar POST para crear y PUT para editar
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(playerData)
        });
        
        if (!response.ok) throw new Error(`Error ${response.status}`);
        await loadPlayers(); // Recargar la lista
    } catch (error) {
        alert('Error al guardar el jugador: ' + error.message);
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

// Variables para el contexto actual
let currentClubId = 'my-players';
let userClubs = [];

// Cargar clubes del usuario
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
            // Si falla, al menos mantener "Mis jugadores"
            populateClubSelector();
        }
    } catch (error) {
        console.error('Error loading user clubs:', error);
        // Si falla, al menos mantener "Mis jugadores"
        populateClubSelector();
    }
}

// Poblar el selector de clubes
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
    
    // Agregar opción para crear nuevo club
    const createOption = document.createElement('option');
    createOption.value = 'create-club';
    createOption.textContent = '+ Crear nuevo club';
    selector.appendChild(createOption);
    
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

// Cambiar contexto (club o personal)
async function switchContext() {
    const selector = document.getElementById('club-select-navbar');
    const selectedValue = selector.value;
    
    if (selectedValue === 'create-club') {
        // Restaurar el valor anterior
        selector.value = currentClubId;
        // TODO: Abrir modal para crear club
        alert('Función para crear club en desarrollo');
        return;
    }
    
    // Mostrar feedback visual mientras cambia el contexto
    const originalText = selector.options[selector.selectedIndex].text;
    selector.disabled = true;
    
    try {
        currentClubId = selectedValue;
        updateContextIcon();
        
        // Recargar jugadores según el nuevo contexto
        await loadPlayersForContext(selectedValue);
        
        // Mostrar mensaje de éxito brevemente
        const contextInfo = selectedValue === 'my-players' ? 'Mis jugadores' : 
                          userClubs.find(club => club.id == selectedValue)?.name || 'Club desconocido';
        
    } catch (error) {
        // Si hay error, restaurar la selección anterior y mostrar error
        console.error('Error switching context:', error);
        alert('Error al cambiar el contexto. Intenta de nuevo.');
    } finally {
        selector.disabled = false;
    }
}

// Cargar jugadores según el contexto (personal o club)
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
        players = await response.json();
        
        loading = false;
        renderPlayers();
    } catch (error) {
        loading = false;
        console.error('Error loading players for context:', error);
        renderPlayers(); // Mostrar error
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    loadUserClubs();
    loadPlayers();
});