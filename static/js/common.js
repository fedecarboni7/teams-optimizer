// Common.js - Funciones compartidas y listeners DOM
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar funcionalidades comunes
    initializeCommonEventListeners();
    setupModalEvents();
});

// Event listeners comunes
function initializeCommonEventListeners() {
    // Listener para cerrar modales con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Listener para cerrar modales clickeando fuera
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Configurar eventos de modales
function setupModalEvents() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    });
}

// Funciones de utilidad para modales
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Funciones de sidebar (common across pages)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
        document.body.classList.toggle('sidebar-open');
    }
}

function navigateTo(page) {
    const routes = {
        'equipos': '/home',
        'jugadores': '/players', 
        'clubes': '/clubs',
        'perfil': '/profile'
    };
    
    if (routes[page]) {
        window.location.href = routes[page];
    }
}

// Funciones de utilidad generales
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'info') {
    // Crear notificación simple
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}