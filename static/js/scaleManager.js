// Manejo de escalas de habilidades (1-5 vs 1-10)

// Variable global para almacenar la escala actual
window.currentScale = "1-5";

// Función para cambiar entre escalas
function toggleScale() {
    const toggle = document.getElementById('scaleToggle');
    const newScale = toggle.checked ? '1-10' : '1-5';
    
    // Mostrar loading
    showLoadingOverlay();
    
    // Determinar la URL actual
    const urlParams = new URLSearchParams(window.location.search);
    const clubId = urlParams.get('club_id');
    
    // Construir nueva URL
    let newUrl = `/home?scale=${newScale}`;
    if (clubId) {
        newUrl += `&club_id=${clubId}`;
    }
    
    // Recargar la página con la nueva escala
    window.location.href = newUrl;
}

// Función para mostrar overlay de carga
function showLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
}

// Función para ocultar overlay de carga
function hideLoadingOverlay() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Función para actualizar la función savePlayers para usar la URL correcta
function savePlayersWithScale() {
    // Obtener la escala actual
    const toggle = document.getElementById('scaleToggle');
    const currentScale = toggle.checked ? '1-10' : '1-5';
    
    // Llamar a la función savePlayers original pero con la URL correcta
    savePlayersOriginal(currentScale);
}

// Función para actualizar la función addPlayer para usar la escala correcta
function addPlayerWithScale() {
    const toggle = document.getElementById('scaleToggle');
    const currentScale = toggle.checked ? '1-10' : '1-5';
    const maxValue = currentScale === '1-10' ? 10 : 5;
    
    // Llamar a la función addPlayer original pero con el max value correcto
    addPlayerOriginal(maxValue);
}

// Función para actualizar la función deletePlayer para usar la URL correcta
function deletePlayerWithScale(button) {
    const toggle = document.getElementById('scaleToggle');
    const currentScale = toggle.checked ? '1-10' : '1-5';
    
    // Llamar a la función deletePlayer original pero con la URL correcta
    deletePlayerOriginal(button, currentScale);
}

// Función para convertir valores entre escalas
function convertSkillValue(value, fromScale, toScale) {
    if (fromScale === toScale) return value;
    
    if (fromScale === '1-5' && toScale === '1-10') {
        // Convertir de 1-5 a 1-10
        return Math.min(value * 2, 10);
    } else if (fromScale === '1-10' && toScale === '1-5') {
        // Convertir de 1-10 a 1-5
        return Math.max(1, Math.round(value / 2));
    }
    
    return value;
}

// Función para determinar la escala actual basada en el toggle
function getCurrentScale() {
    const toggle = document.getElementById('scaleToggle');
    if (!toggle) {
        // Si no hay toggle, usar la escala desde la URL o default
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('scale') || '1-5';
    }
    return toggle.checked ? '1-10' : '1-5';
}

// Función para determinar la URL de API correcta basada en la escala
function getApiUrl(endpoint, scale) {
    const baseUrl = endpoint;
    return scale === '1-10' ? baseUrl.replace('/players', '/players-v2') : baseUrl;
}

// Función para determinar la URL de eliminación correcta basada en la escala
function getDeleteUrl(playerId, scale) {
    return scale === '1-10' ? `/player-v2/${playerId}` : `/player/${playerId}`;
}

// Inicializar la escala al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Determinar la escala actual basada en los parámetros de URL
    const urlParams = new URLSearchParams(window.location.search);
    const scale = urlParams.get('scale') || '1-5';
    window.currentScale = scale;
    
    // Actualizar el toggle basado en la escala
    const toggle = document.getElementById('scaleToggle');
    if (toggle) {
        toggle.checked = scale === '1-10';
    }
    
    // Ocultar overlay de carga si existe
    hideLoadingOverlay();
});
