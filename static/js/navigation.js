// Navigation.js - Funcionalidad específica para navegación y scroll
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
});

function initializeNavigation() {
    // Inicializar el estado del botón de scroll al cargar la página
    const scrollButton = document.getElementById('scroll-button');
    if (scrollButton) {
        updateScrollButtonVisibility();
        
        // Actualizar visibilidad en scroll
        window.addEventListener('scroll', debounce(updateScrollButtonVisibility, 100));
    }
}

// Botón de scroll al formulario
function scrollToSubmit() {
    const submitButton = document.getElementById('submitBtn');
    if (submitButton) {
        submitButton.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
    }
}

// Actualizar visibilidad del botón de scroll
function updateScrollButtonVisibility() {
    const scrollButton = document.getElementById('scroll-button');
    if (!scrollButton) return;
    
    const windowHeight = window.innerHeight;
    const documentHeight = document.body.scrollHeight;
    const scrollTop = window.scrollY;
    
    // Mostrar botón si no estamos cerca del final de la página
    if (scrollTop + windowHeight >= documentHeight - 100) {
        scrollButton.style.display = 'none';
    } else {
        scrollButton.style.display = 'block';
    }
}

// Navegación entre páginas
function navigateTo(page) {
    const routes = {
        'equipos': '/home',
        'jugadores': '/players', 
        'clubes': '/clubs',
        'perfil': '/profile'
    };
    
    if (routes[page]) {
        // Mostrar indicador de carga si existe
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
        
        window.location.href = routes[page];
    }
}

// Navegación con confirmación si hay cambios sin guardar
function navigateWithConfirmation(page) {
    if (hasUnsavedChanges()) {
        if (confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?')) {
            navigateTo(page);
        }
    } else {
        navigateTo(page);
    }
}

// Verificar si hay cambios sin guardar
function hasUnsavedChanges() {
    // Verificar si el tracker de cambios está disponible
    if (typeof window.playerChangeTracker !== 'undefined') {
        return window.playerChangeTracker.hasChanges();
    }
    
    // Verificación básica para formularios
    const forms = document.querySelectorAll('form');
    for (let form of forms) {
        const formData = new FormData(form);
        const initialData = form.dataset.initialState;
        
        if (initialData) {
            const currentData = JSON.stringify([...formData.entries()]);
            if (currentData !== initialData) {
                return true;
            }
        }
    }
    
    return false;
}

// Configurar estado inicial del formulario para detección de cambios
function setupFormChangeDetection() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const formData = new FormData(form);
        form.dataset.initialState = JSON.stringify([...formData.entries()]);
    });
}

// Manejar navegación del historial del navegador
window.addEventListener('popstate', (event) => {
    if (hasUnsavedChanges()) {
        if (!confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?')) {
            // Restaurar el estado anterior
            history.pushState(null, null, window.location.pathname);
            return;
        }
    }
});

// Configurar advertencia antes de cerrar la página
window.addEventListener('beforeunload', (event) => {
    if (hasUnsavedChanges()) {
        event.preventDefault();
        event.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
        return event.returnValue;
    }
});

// Manejar enlaces externos
document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="http"]');
    if (link && !link.href.includes(window.location.hostname)) {
        // Es un enlace externo
        if (hasUnsavedChanges()) {
            if (!confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?')) {
                event.preventDefault();
                return false;
            }
        }
    }
});