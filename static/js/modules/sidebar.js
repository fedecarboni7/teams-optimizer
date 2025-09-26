/**
 * Sidebar functionality
 * Handles sidebar toggle, navigation and overlay
 */

const Sidebar = {
    // Initialize sidebar event listeners
    init() {
        this.bindEvents();
    },

    // Bind event listeners for sidebar functionality
    bindEvents() {
        // Handle sidebar toggle
        document.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            
            if (action === 'toggle-sidebar') {
                this.toggle();
            } else if (action === 'navigate') {
                const target = e.target.getAttribute('data-target');
                if (target) {
                    this.navigateTo(target);
                }
            } else if (action === 'switch-context') {
                this.updateContextIcon();
            }
        });

        // Handle navbar club selector changes
        const clubSelector = document.getElementById('club-select-navbar');
        if (clubSelector) {
            clubSelector.addEventListener('change', () => {
                this.updateContextIcon();
                // Trigger context switch if handler exists
                if (typeof switchContext === 'function') {
                    switchContext();
                }
            });
        }
    },

    // Toggle sidebar open/close
    toggle() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
        if (overlay) {
            overlay.classList.toggle('active');
        }
    },

    // Navigate to different pages
    navigateTo(page) {
        const routes = {
            'jugadores': '/jugadores',
            'equipos': '/armar_equipos',
            'clubes': '/clubes',
            'perfil': '/perfil'
        };
        
        if (routes[page]) {
            window.location.href = routes[page];
        }
    },

    // Update context icon based on club selection
    updateContextIcon() {
        const contextIcon = document.getElementById('contextIcon');
        const selector = document.getElementById('club-select-navbar');
        
        if (contextIcon && selector) {
            if (selector.value === 'my-players') {
                contextIcon.textContent = '👤'; // Personal players icon
            } else {
                contextIcon.textContent = '⚽'; // Club icon
            }
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    Sidebar.init();
});

// Export for global access
window.Sidebar = Sidebar;