// Función para crear iconos SVG simplificados
function createIcon(name, className = '') {
    const iconMap = {
        'users': `<svg class="${className}" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m22 21-3.5-3.5"/></svg>`,
        'user-check': `<svg class="${className}" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16,11 18,13 22,9"/></svg>`,
        'trophy': `<svg class="${className}" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55.47.98.97 1.21C12.04 18.75 13 20.24 13 22"/><path d="M14 14.66V17c0 .55-.47.98-.97 1.21C11.96 18.75 11 20.24 11 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`,
        'zap': `<svg class="${className}" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>`,
        'clock': `<svg class="${className}" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>`,
        'trending-up': `<svg class="${className}" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>`,
        'map-pin': `<svg class="${className}" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
    };
    return iconMap[name] || '';
}

// Variables globales para almacenar los datos del dashboard
let dashboardStats = null;

// Función para inicializar los datos del dashboard
function initializeDashboard(stats) {
    dashboardStats = stats;
}

// Función genérica para cambiar períodos de tiempo
function changePeriod(type, period) {
    const dataMap = {
        'users': {
            '24h': { 
                value: dashboardStats.new_users_24h, 
                label: 'Últimas 24 horas', 
                color: '#fb923c'
            },
            '7d': { 
                value: dashboardStats.new_users_week, 
                label: 'Últimos 7 días', 
                color: '#818cf8'
            },
            '30d': { 
                value: dashboardStats.new_users_month, 
                label: 'Último mes', 
                color: '#f472b6'
            }
        },
        'clubs': {
            '24h': { 
                value: dashboardStats.new_clubs_24h, 
                label: 'Últimas 24 horas', 
                color: '#fb923c'
            },
            '7d': { 
                value: dashboardStats.new_clubs_week, 
                label: 'Últimos 7 días', 
                color: '#818cf8'
            },
            '30d': { 
                value: dashboardStats.new_clubs_month, 
                label: 'Último mes', 
                color: '#f472b6'
            }
        }
    };

    const data = dataMap[type]?.[period];
    if (!data) return;

    // Definir elementos según el tipo
    const elementIds = {
        'users': {
            value: 'new-users-value',
            subtitle: 'new-users-subtitle',
            buttons: '.period-btn'
        },
        'clubs': {
            value: 'new-clubs-value',
            subtitle: 'new-clubs-subtitle',
            buttons: '.period-btn-clubs'
        }
    };

    const elements = elementIds[type];
    if (!elements) return;

    // Actualizar contenido de la tarjeta
    const valueElement = document.getElementById(elements.value);
    const subtitleElement = document.getElementById(elements.subtitle);

    if (valueElement && subtitleElement) {
        valueElement.textContent = data.value;
        subtitleElement.textContent = data.label;
        subtitleElement.style.color = data.color;
    }

    // Actualizar botones activos
    document.querySelectorAll(elements.buttons).forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`${elements.buttons}[data-period="${period}"]`).classList.add('active');
}

// Funciones de interfaz (mantienen compatibilidad)
function changeNewUsersPeriod(period) {
    changePeriod('users', period);
}

function changeNewClubsPeriod(period) {
    changePeriod('clubs', period);
}

// Función principal para cargar y mostrar datos
function loadDashboard() {
    try {
        // Verificar que tenemos los datos
        if (!dashboardStats) {
            throw new Error('No se han inicializado los datos del dashboard');
        }
        
        // Renderizar el dashboard inmediatamente
        renderDashboard(dashboardStats);
        
    } catch (error) {
        console.error('Error cargando dashboard:', error);
        document.getElementById('app').innerHTML = `
            <div class="loading-screen">
                <p style="color: #ef4444; font-size: 1.25rem;">Error cargando los datos del dashboard</p>
                <p style="color: #94a3b8; margin-top: 0.5rem;">Por favor, intenta recargar la página</p>
            </div>
        `;
    }
}

// Función para renderizar el dashboard
function renderDashboard(stats) {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <!-- Header -->
        <div class="header">
            <div class="header-content">
                <div>
                    <h1 class="header-title">
                        ${createIcon('trending-up', 'metric-icon')}
                        App Usage Analytics
                    </h1>
                    <p class="header-subtitle">Análisis de comportamiento y engagement de usuarios</p>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="status-badge">
                        <div class="pulse-dot"></div>
                        ${stats.active_users} usuarios activos
                    </div>
                    <a href="/home" class="back-button">Volver a la aplicación</a>
                </div>
            </div>
        </div>

        <div class="container">
            <!-- Métricas de Usuarios -->
            <div class="section-header">
                <h2 class="section-title">👥 Métricas de Usuarios</h2>
            </div>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-header">
                        ${createIcon('users', 'metric-icon')}
                        <span class="metric-emoji">📱</span>
                    </div>
                    <h3 class="metric-title">Total Usuarios</h3>
                    <p class="metric-value">${stats.total_users}</p>
                    <p class="metric-subtitle" style="color: #93c5fd;">${stats.engagement_rate}% están activos</p>
                </div>                <div class="metric-card">
                    <div class="metric-header">
                        ${createIcon('clock', 'metric-icon orange')}
                        <span class="metric-emoji">🆕</span>
                    </div>
                    <div class="period-selector">
                        <button class="period-btn active" data-period="24h" onclick="changeNewUsersPeriod('24h')">24h</button>
                        <button class="period-btn" data-period="7d" onclick="changeNewUsersPeriod('7d')">7d</button>
                        <button class="period-btn" data-period="30d" onclick="changeNewUsersPeriod('30d')">30d</button>
                    </div>
                    <h3 class="metric-title">Usuarios Nuevos</h3>
                    <p class="metric-value" id="new-users-value">${stats.new_users_24h}</p>
                    <p class="metric-subtitle" id="new-users-subtitle" style="color: #fb923c;">Últimas 24 horas</p>
                </div>
            </div>

            <!-- Métricas de Jugadores -->
            <div class="section-header">
                <h2 class="section-title">⚽ Métricas de Jugadores</h2>
            </div>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-header">
                        ${createIcon('user-check', 'metric-icon green')}
                        <span class="metric-emoji">⚽</span>
                    </div>
                    <h3 class="metric-title">Creación de Jugadores</h3>
                    <p class="metric-value">${stats.player_creation_rate}%</p>
                    <p class="metric-subtitle" style="color: #86efac;">${stats.users_with_players} usuarios han creado jugadores</p>
                </div>

                <div class="metric-card">
                    <div class="metric-header">
                        ${createIcon('zap', 'metric-icon purple')}
                        <span class="metric-emoji">🎯</span>
                    </div>
                    <h3 class="metric-title">Promedio Jugadores</h3>
                    <p class="metric-value">${stats.avg_players_per_user}</p>
                    <p class="metric-subtitle" style="color: #d8b4fe;">Por usuario activo</p>
                </div>
            </div>

            <!-- Métricas de Clubes -->
            <div class="section-header">
                <h2 class="section-title">🏟️ Métricas de Clubes</h2>
            </div>

            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-header">
                        ${createIcon('map-pin', 'metric-icon purple')}
                        <span class="metric-emoji">🏟️</span>
                    </div>
                    <h3 class="metric-title">Total Clubes</h3>
                    <p class="metric-value">${stats.total_clubs}</p>
                    <p class="metric-subtitle" style="color: #d8b4fe;">Comunidades activas</p>
                </div>                <div class="metric-card">
                    <div class="metric-header">
                        ${createIcon('clock', 'metric-icon')}
                        <span class="metric-emoji">🆕</span>
                    </div>
                    <div class="period-selector-clubs">
                        <button class="period-btn-clubs active" data-period="24h" onclick="changeNewClubsPeriod('24h')">24h</button>
                        <button class="period-btn-clubs" data-period="7d" onclick="changeNewClubsPeriod('7d')">7d</button>
                        <button class="period-btn-clubs" data-period="30d" onclick="changeNewClubsPeriod('30d')">30d</button>
                    </div>
                    <h3 class="metric-title">Clubes Nuevos</h3>
                    <p class="metric-value" id="new-clubs-value">${stats.new_clubs_24h}</p>
                    <p class="metric-subtitle" id="new-clubs-subtitle" style="color: #93c5fd;">Últimas 24 horas</p>
                </div>
                
                <div class="metric-card">
                    <div class="metric-header">
                        ${createIcon('users', 'metric-icon blue')}
                        <span class="metric-emoji">⚽</span>
                    </div>
                    <h3 class="metric-title">Promedio Usuarios</h3>
                    <p class="metric-value">${stats.avg_users_per_club}</p>
                    <p class="metric-subtitle" style="color: #60a5fa;">Por club</p>
                </div>
                
                <div class="metric-card">
                    <div class="metric-header">
                        ${createIcon('trophy', 'metric-icon yellow')}
                        <span class="metric-emoji">🏟️</span>
                    </div>
                    <h3 class="metric-title">Participación en Clubes</h3>
                    <p class="metric-value">${stats.club_participation_rate}%</p>
                    <p class="metric-subtitle" style="color: #fbbf24;">${stats.users_in_clubs} usuarios en clubes</p>
                </div>
            </div>
            <!-- Insights finales -->
            <div class="insights">
                <div class="insights-card">
                    <h4 class="insights-title">💡 Insights Clave</h4>
                    <div class="insights-grid">
                        <p class="insight-purple">
                            <strong>${stats.engagement_rate}%</strong> de tus usuarios están creando contenido activamente
                        </p>
                        <p class="insight-green">
                            <strong>${stats.users_with_players}</strong> usuarios han creado jugadores para sus equipos
                        </p>
                        <p class="insight-yellow">
                            <strong>${stats.total_clubs}</strong> comunidades activas con <strong>${stats.avg_users_per_club}</strong> usuarios promedio por club
                        </p>
                        <p class="insight-blue">
                            <strong>${stats.new_users_month}</strong> nuevos usuarios este mes - Crecimiento del <strong>${Math.round((stats.new_users_month / stats.total_users) * 100)}%</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
});