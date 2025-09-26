/**
 * Common utilities and helper functions
 * Shared across all pages of the application
 */

// Common utility functions
const Common = {
    // Simple modal management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // Form validation helpers
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Loading state management
    showLoadingSpinner(button) {
        if (button.querySelector('.spinner')) return; // Avoid multiple spinners
        
        const spinner = document.createElement('span');
        spinner.className = 'spinner';
        button.appendChild(spinner);
        button.disabled = true;
    },

    hideLoadingSpinner(button) {
        const spinner = button.querySelector('.spinner');
        if (spinner) {
            spinner.remove();
        }
        button.disabled = false;
    },

    // Simple notification system
    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    },

    // HTTP helper functions
    async fetchAPI(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            this.showNotification('Error en la conexión', 'error');
            throw error;
        }
    }
};

// Global event delegation for data-action attributes
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
        const action = e.target.getAttribute('data-action');
        if (!action) return;

        // Handle common actions
        switch (action) {
            case 'close-modal':
                const modalId = e.target.getAttribute('data-modal');
                if (modalId) {
                    Common.closeModal(modalId);
                }
                break;
        }
    });
});

// Export for use in other modules
window.Common = Common;