/**
 * Common functionality shared across multiple pages
 * Contains sidebar, navigation, and utility functions
 */

// Navigation routes
const routes = {
    'equipos': '/home',
    'jugadores': '/players',
    'clubes': '/clubs',
    'perfil': '/profile'
};

/**
 * Sidebar functionality
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    }
}

/**
 * Navigation between pages
 */
function navigateTo(page) {
    if (routes[page]) {
        window.location.href = routes[page];
    }
}

/**
 * Update context icon based on current selection
 */
function updateContextIcon() {
    const contextIcon = document.getElementById('contextIcon');
    const selector = document.getElementById('club-select-navbar');
    
    if (contextIcon && selector) {
        if (selector.value === 'my-players') {
            contextIcon.textContent = '👤'; // Icono de usuario personal
        } else {
            contextIcon.textContent = '⚽'; // Icono de club
        }
    }
}

/**
 * Common error handling
 */
function showError(message) {
    console.error(message);
    // TODO: Add visual notification for the user
    // This could be improved with a toast notification system
}

/**
 * Common success handling
 */
function showSuccess(message) {
    console.log(message);
    // TODO: Add visual notification for the user
}

/**
 * Initialize common functionality when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize context icon
    updateContextIcon();
    
    // Add click listeners for sidebar overlay
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
        overlay.addEventListener('click', toggleSidebar);
    }
});