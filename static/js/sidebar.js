// Sidebar.js - Funcionalidad específica del sidebar
document.addEventListener('DOMContentLoaded', () => {
    initializeSidebar();
});

function initializeSidebar() {
    // Auto-cerrar sidebar en pantallas grandes
    handleSidebarResize();
    window.addEventListener('resize', debounce(handleSidebarResize, 250));
    
    // Marcar página activa
    highlightActiveNavItem();
}

function handleSidebarResize() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth > 768) {
        // En pantallas grandes, cerrar sidebar por defecto
        if (sidebar) {
            sidebar.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        }
    }
}

function highlightActiveNavItem() {
    const navItems = document.querySelectorAll('.nav-item');
    const currentPath = window.location.pathname;
    
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Mapear rutas a elementos del menú
    const pathMap = {
        '/home': 'equipos',
        '/players': 'jugadores', 
        '/clubs': 'clubes',
        '/profile': 'perfil'
    };
    
    const activePage = pathMap[currentPath];
    if (activePage) {
        const activeItem = document.querySelector(`[onclick="navigateTo('${activePage}')"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
}