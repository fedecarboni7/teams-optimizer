document.addEventListener('DOMContentLoaded', function () {
    // Llamar funciones de ui.js para inicializar eventos
    updateSelectedCount();
    updateToggleButtonText();
    
    // Inicializar el sistema de seguimiento de cambios
    if (window.playerChangeTracker) {
        // Capturar estado inicial después de que se carguen los jugadores existentes
        setTimeout(() => {
            window.playerChangeTracker.captureInitialState();
            window.playerChangeTracker.setupChangeListeners();
        }, 100);
    }
    
    // Configurar evento de scroll
    window.addEventListener('scroll', function () {
        const scrollButton = document.getElementById('scroll-button');
        const submitBtn = document.getElementById('submitBtn');
        const submitBtnPosition = submitBtn.getBoundingClientRect().top + window.scrollY;
        const windowBottom = window.scrollY + window.innerHeight;
        if (windowBottom >= submitBtnPosition) {
            scrollButton.style.display = 'none';
        } else {
            scrollButton.style.display = 'block';
        }
    });
});