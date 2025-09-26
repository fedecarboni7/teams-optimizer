/**
 * Players Table Module
 * Handles player table operations: sorting, filtering, rendering
 */

const PlayersTable = {
    // State management
    state: {
        players: [],
        filteredPlayers: [],
        searchTerm: '',
        currentSort: { column: 'name', direction: 'asc' },
        loading: false,
        currentScale: 5
    },

    // Initialize the module
    init() {
        this.bindEvents();
        this.loadPlayers();
    },

    // Bind event listeners
    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('player-search');
        if (searchInput) {
            searchInput.addEventListener('keyup', () => this.filterPlayers());
        }

        // Table header clicks for sorting
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-sort')) {
                const column = e.target.getAttribute('data-sort');
                this.sortPlayers(column);
            }
        });

        // Add player button
        const addPlayerBtn = document.querySelector('[data-action="add-player"]');
        if (addPlayerBtn) {
            addPlayerBtn.addEventListener('click', () => this.showAddPlayerModal());
        }
    },

    // Filter players by search term
    filterPlayers() {
        const searchInput = document.getElementById('player-search');
        this.state.searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        
        if (this.state.searchTerm === '') {
            this.state.filteredPlayers = [...this.state.players];
        } else {
            this.state.filteredPlayers = this.state.players.filter(player => 
                player.name.toLowerCase().includes(this.state.searchTerm)
            );
        }
        
        this.applySortToFilteredPlayers();
        this.renderPlayers();
    },

    // Sort players by column
    sortPlayers(column) {
        // Toggle direction if same column, otherwise set to ascending
        if (this.state.currentSort.column === column) {
            this.state.currentSort.direction = this.state.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.state.currentSort.column = column;
            this.state.currentSort.direction = 'asc';
        }
        
        this.applySortToFilteredPlayers();
        this.state.loading = false;
        this.renderPlayers();
    },

    // Apply sorting to filtered players
    applySortToFilteredPlayers() {
        this.state.filteredPlayers.sort((a, b) => {
            let valueA, valueB;
            
            switch (this.state.currentSort.column) {
                case 'name':
                    valueA = a.name.toLowerCase();
                    valueB = b.name.toLowerCase();
                    break;
                case 'score':
                    valueA = this.calculateAverage(a);
                    valueB = this.calculateAverage(b);
                    break;
                case 'date':
                    valueA = new Date(a.updated_at || a.created_at);
                    valueB = new Date(b.updated_at || b.created_at);
                    break;
                default:
                    return 0;
            }
            
            if (valueA < valueB) {
                return this.state.currentSort.direction === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return this.state.currentSort.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    },

    // Calculate average score for a player
    calculateAverage(player) {
        const skillKeys = ['velocidad', 'resistencia', 'pases', 'tiro', 'defensa', 'fuerza_cuerpo', 'control', 'habilidad_arquero', 'vision'];
        const skillValues = skillKeys.map(key => player[key]).filter(val => typeof val === 'number');
        
        if (skillValues.length === 0) return 0;
        
        const average = skillValues.reduce((a, b) => a + b, 0) / skillValues.length;
        return Math.round(average * 10) / 10;
    },

    // Format date for display
    formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    },

    // Render players table
    renderPlayers() {
        const playersList = document.getElementById('players-list');
        if (!playersList) return;

        if (this.state.loading) {
            playersList.innerHTML = '<div class="loading">Cargando jugadores...</div>';
            return;
        }

        if (this.state.filteredPlayers.length === 0) {
            playersList.innerHTML = '<div class="no-players">No se encontraron jugadores</div>';
            return;
        }

        const playersHTML = this.state.filteredPlayers.map(player => `
            <div class="player-row" data-player-id="${player.id}">
                <div class="player-name">${player.name}</div>
                <div class="player-score">${this.calculateAverage(player).toFixed(1)}</div>
                <div class="player-date">${this.formatDate(player.updated_at || player.created_at)}</div>
                <div class="player-actions">
                    <button class="btn-icon" data-action="view-player" data-player-id="${player.id}">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-icon" data-action="edit-player" data-player-id="${player.id}">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" data-action="delete-player" data-player-id="${player.id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        playersList.innerHTML = playersHTML;
    },

    // Load players from backend
    async loadPlayers() {
        this.state.loading = true;
        this.renderPlayers();

        try {
            // This would typically call the API
            // For now, check if there's a global function to call
            if (typeof loadPlayersForContext === 'function') {
                await loadPlayersForContext(this.getCurrentClubId());
            }
        } catch (error) {
            console.error('Error loading players:', error);
            window.Common?.showNotification('Error al cargar jugadores', 'error');
        } finally {
            this.state.loading = false;
        }
    },

    // Get current club ID
    getCurrentClubId() {
        const selector = document.getElementById('club-select-navbar');
        return selector ? selector.value : 'my-players';
    },

    // Show add player modal
    showAddPlayerModal() {
        window.Common?.openModal('createPlayerModal');
    },

    // Update players list (called from external functions)
    updatePlayers(players) {
        this.state.players = players;
        this.state.filteredPlayers = [...players];
        this.applySortToFilteredPlayers();
        this.renderPlayers();
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.players-page')) {
        PlayersTable.init();
    }
});

// Export for global access
window.PlayersTable = PlayersTable;