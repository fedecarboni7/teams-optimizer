// Sistema de seguimiento de cambios en jugadores
class PlayerChangeTracker {
    constructor() {
        this.originalPlayerData = new Map();
        this.hasUnsavedChanges = false;
        this.hasNewPlayers = false;
        this.init();
    }

    init() {
        // Inicializar el seguimiento cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', () => {
            this.captureInitialState();
            this.setupChangeListeners();
        });
    }

    captureInitialState() {
        // Capturar el estado inicial de todos los jugadores existentes
        const playerEntries = document.querySelectorAll('.player-entry');
        playerEntries.forEach((entry, index) => {
            const playerData = this.extractPlayerData(entry);
            if (playerData) {
                this.originalPlayerData.set(index, playerData);
            }
        });
    }

    extractPlayerData(playerEntry) {
        const nameInput = playerEntry.querySelector('input[name="names"]');
        if (!nameInput) return null;

        const playerData = {
            name: nameInput.value.trim(),
            skills: {},
            isReadOnly: nameInput.readOnly,
            hasId: false
        };

        // Verificar si el jugador está guardado (tiene ID)
        const deleteButton = playerEntry.querySelector('.delete-button');
        playerData.hasId = deleteButton && deleteButton.id && deleteButton.id !== '';

        // Extraer habilidades
        const skillInputs = playerEntry.querySelectorAll('input[type="hidden"]');
        skillInputs.forEach(input => {
            if (input.name && input.value) {
                playerData.skills[input.name] = parseInt(input.value) || 0;
            }
        });

        return playerData;
    }

    setupChangeListeners() {
        // Escuchar cambios en las estrellas (habilidades)
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('star')) {
                // Pequeño delay para permitir que el valor se actualice
                setTimeout(() => {
                    this.checkForChanges();
                }, 10);
            }
        });

        // Escuchar cambios en los nombres de jugadores
        document.addEventListener('input', (event) => {
            if (event.target.name === 'names') {
                this.checkForChanges();
            }
        });

        // Escuchar cuando se agregan nuevos jugadores
        this.observeNewPlayers();
    }

    observeNewPlayers() {
        const playersContainer = document.getElementById('players-container');
        if (!playersContainer) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && 
                            node.classList.contains('player-entry')) {
                            this.hasNewPlayers = true;
                            this.hasUnsavedChanges = true;
                        }
                    });
                }
            });
        });

        observer.observe(playersContainer, {
            childList: true,
            subtree: false
        });
    }

    checkForChanges() {
        const playerEntries = document.querySelectorAll('.player-entry');
        let changesDetected = false;

        playerEntries.forEach((entry, index) => {
            const currentData = this.extractPlayerData(entry);
            if (!currentData) return;

            // Si es un jugador nuevo (no estaba en el estado inicial)
            if (!this.originalPlayerData.has(index)) {
                changesDetected = true;
                return;
            }

            const originalData = this.originalPlayerData.get(index);

            // Verificar cambios en el nombre
            if (currentData.name !== originalData.name) {
                changesDetected = true;
                return;
            }

            // Verificar cambios en habilidades
            for (const skill in currentData.skills) {
                if (currentData.skills[skill] !== originalData.skills[skill]) {
                    changesDetected = true;
                    return;
                }
            }

            // Verificar si hay nuevas habilidades
            for (const skill in originalData.skills) {
                if (!(skill in currentData.skills)) {
                    changesDetected = true;
                    return;
                }
            }
        });

        this.hasUnsavedChanges = changesDetected || this.hasNewPlayers;
        
        // Actualizar indicadores visuales
        this.updateChangeIndicators();
    }

    hasUnsavedPlayerChanges() {
        this.checkForChanges();
        
        // También verificar si hay jugadores nuevos sin guardar
        const playerEntries = document.querySelectorAll('.player-entry');
        for (const entry of playerEntries) {
            const nameInput = entry.querySelector('input[name="names"]');
            const deleteButton = entry.querySelector('.delete-button');
            
            // Si es un jugador nuevo (sin ID) o no es de solo lectura
            if (!nameInput.readOnly || !deleteButton.id || deleteButton.id === '') {
                return true;
            }
        }

        return this.hasUnsavedChanges;
    }

    getUnsavedPlayers() {
        const unsavedPlayers = [];
        const playerEntries = document.querySelectorAll('.player-entry');

        playerEntries.forEach((entry, index) => {
            const nameInput = entry.querySelector('input[name="names"]');
            const deleteButton = entry.querySelector('.delete-button');
            
            if (nameInput) {
                // Jugador nuevo sin guardar
                if (!nameInput.readOnly || !deleteButton.id || deleteButton.id === '') {
                    unsavedPlayers.push(nameInput.value || `Jugador ${index + 1}`);
                    return;
                }

                // Jugador existente con cambios
                const currentData = this.extractPlayerData(entry);
                const originalData = this.originalPlayerData.get(index);
                
                if (originalData && this.hasPlayerChanged(currentData, originalData)) {
                    unsavedPlayers.push(nameInput.value || `Jugador ${index + 1}`);
                }
            }
        });

        return unsavedPlayers;
    }

    hasPlayerChanged(currentData, originalData) {
        if (!currentData || !originalData) return true;

        // Verificar cambios en el nombre
        if (currentData.name !== originalData.name) return true;

        // Verificar cambios en habilidades
        for (const skill in currentData.skills) {
            if (currentData.skills[skill] !== originalData.skills[skill]) {
                return true;
            }
        }

        // Verificar si hay nuevas habilidades o se eliminaron
        const currentSkills = Object.keys(currentData.skills).sort();
        const originalSkills = Object.keys(originalData.skills).sort();
        
        return JSON.stringify(currentSkills) !== JSON.stringify(originalSkills);
    }

    resetChangeTracking() {
        this.hasUnsavedChanges = false;
        this.hasNewPlayers = false;
        this.captureInitialState();
    }

    markPlayerAsSaved(playerIndex) {
        const playerEntries = document.querySelectorAll('.player-entry');
        if (playerEntries[playerIndex]) {
            const currentData = this.extractPlayerData(playerEntries[playerIndex]);
            if (currentData) {
                this.originalPlayerData.set(playerIndex, currentData);
            }
        }
    }

    getNewPlayers() {
        const newPlayers = [];
        const playerEntries = document.querySelectorAll('.player-entry');
        
        playerEntries.forEach((entry) => {
            const nameInput = entry.querySelector('input[name="names"]');
            if (nameInput && nameInput.value.trim() && this.isNewPlayer(entry)) {
                newPlayers.push(nameInput.value.trim());
            }
        });
        
        return newPlayers;
    }

    getModifiedPlayers() {
        const modifiedPlayers = [];
        const playerEntries = document.querySelectorAll('.player-entry');
        
        playerEntries.forEach((entry, index) => {
            const nameInput = entry.querySelector('input[name="names"]');
            if (nameInput && nameInput.value.trim() && !this.isNewPlayer(entry)) {
                const currentData = this.extractPlayerData(entry);
                const originalData = this.originalPlayerData.get(index);
                if (originalData && this.hasPlayerChanged(currentData, originalData)) {
                    modifiedPlayers.push(nameInput.value.trim());
                }
            }
        });
        
        return modifiedPlayers;
    }

    isNewPlayer(playerEntry) {
        const deleteButton = playerEntry.querySelector('.delete-button');
        const nameInput = playerEntry.querySelector('input[name="names"]');
        return !deleteButton.id || !nameInput.readOnly;
    }

    isPlayerModified(index) {
        const playerEntries = document.querySelectorAll('.player-entry');
        if (!playerEntries[index]) return false;
        
        const currentData = this.extractPlayerData(playerEntries[index]);
        const originalData = this.originalPlayerData.get(index);
        
        return originalData && this.hasPlayerChanged(currentData, originalData);
    }

    discardChanges() {
        const playerEntries = document.querySelectorAll('.player-entry');
        
        playerEntries.forEach((entry, index) => {
            const originalData = this.originalPlayerData.get(index);
            if (originalData && !this.isNewPlayer(entry)) {
                // Restaurar datos originales para jugadores existentes
                this.restorePlayerData(entry, originalData);
            }
        });
        
        // Remover indicadores visuales
        this.removeAllChangeIndicators();
        this.captureInitialState();
    }

    restorePlayerData(playerEntry, originalData) {
        const nameInput = playerEntry.querySelector('input[name="names"]');
        if (nameInput && !nameInput.readOnly) {
            nameInput.value = originalData.name;
        }

        // Restaurar habilidades
        Object.entries(originalData.skills).forEach(([skillName, value]) => {
            const skillRating = playerEntry.querySelector(`[data-skill="${skillName}"]`);
            if (skillRating) {
                const stars = skillRating.querySelectorAll('.star');
                const hiddenInput = skillRating.querySelector('input[type="hidden"]');
                
                hiddenInput.value = value;
                stars.forEach(star => {
                    if (star.getAttribute('data-value') <= value) {
                        star.classList.add('active');
                    } else {
                        star.classList.remove('active');
                    }
                });
            }
        });
    }

    addChangeIndicator(playerEntry) {
        // Agregar indicador visual de cambios
        let indicator = playerEntry.querySelector('.change-indicator');
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.className = 'change-indicator';
            indicator.style.fontSize = '16px';
            indicator.style.marginRight = '5px';
            indicator.style.position = 'relative';
            
            const playerHeader = playerEntry.querySelector('.player-header');
            if (playerHeader) {
                playerHeader.insertBefore(indicator, playerHeader.firstChild);
            }
        }
        
        // Determinar tipo de cambio
        if (this.isNewPlayer(playerEntry)) {
            indicator.innerHTML = '✱ ';
            indicator.style.color = '#4ecdc4';
            indicator.className = 'change-indicator new-player';
            indicator.title = 'Jugador nuevo sin guardar';
            playerEntry.classList.add('is-new');
            playerEntry.classList.remove('has-changes');
        } else {
            indicator.innerHTML = '● ';
            indicator.style.color = '#ff6b35';
            indicator.className = 'change-indicator modified-player';
            indicator.title = 'Este jugador tiene cambios sin guardar';
            playerEntry.classList.add('has-changes');
            playerEntry.classList.remove('is-new');
        }
    }

    removeChangeIndicator(playerEntry) {
        const indicator = playerEntry.querySelector('.change-indicator');
        if (indicator) {
            indicator.remove();
        }
        // Limpiar clases CSS del entry
        playerEntry.classList.remove('has-changes', 'is-new');
    }

    removeAllChangeIndicators() {
        const indicators = document.querySelectorAll('.change-indicator');
        indicators.forEach(indicator => indicator.remove());
        
        // Limpiar clases CSS de todos los entries
        const playerEntries = document.querySelectorAll('.player-entry');
        playerEntries.forEach(entry => {
            entry.classList.remove('has-changes', 'is-new');
        });
    }

    updateChangeIndicators() {
        const playerEntries = document.querySelectorAll('.player-entry');
        
        playerEntries.forEach((entry, index) => {
            if (this.isPlayerModified(index) || this.isNewPlayer(entry)) {
                this.addChangeIndicator(entry);
            } else {
                this.removeChangeIndicator(entry);
            }
        });
    }
}

// Crear instancia global del tracker
window.playerChangeTracker = new PlayerChangeTracker();

// Función global para validar cambios antes de enviar formulario
function validateUnsavedChanges() {
    if (!window.playerChangeTracker.hasUnsavedPlayerChanges()) {
        return false; // No hay cambios sin guardar, continuar
    }

    const modifiedPlayers = window.playerChangeTracker.getModifiedPlayers();
    const newPlayers = window.playerChangeTracker.getNewPlayers();
    
    let message = '';
    let options = '';
    
    if (newPlayers.length > 0 && modifiedPlayers.length > 0) {
        message = `Tenés jugadores nuevos: ${newPlayers.join(', ')} y cambios en: ${modifiedPlayers.join(', ')}.`;
        options = '\n\n¿Querés guardar todo antes de armar los equipos?';
    } else if (newPlayers.length > 0) {
        message = `Tenés jugadores nuevos sin guardar: ${newPlayers.join(', ')}.`;
        options = '\n\n¿Querés guardarlos antes de armar los equipos?';
    } else if (modifiedPlayers.length > 0) {
        message = `Tenés cambios sin guardar en: ${modifiedPlayers.join(', ')}.`;
        options = '\n\n¿Querés guardar los cambios, descartarlos o cancelar?';
    }
    
    if (newPlayers.length > 0) {
        // Si hay jugadores nuevos, solo opción de guardar o cancelar
        const shouldSave = confirm(message + options);
        if (shouldSave) {
            // Marcar que debe auto-enviar después de guardar
            window.playerChangeTracker.shouldAutoSubmitAfterSave = true;
            savePlayers();
            return true; // Cancelar por ahora, se reenviará después de guardar
        } else {
            return true; // Cancelar
        }
    } else {
        // Si solo hay modificaciones, dar tres opciones usando un diálogo personalizado
        const choice = prompt(message + '\n\nEscribí una opción:\n1. "guardar" - Guardar cambios y continuar\n2. "descartar" - Descartar cambios y continuar\n3. "cancelar" - No hacer nada', 'guardar');
        
        if (choice === null || choice.toLowerCase() === 'cancelar') {
            return true; // Cancelar
        } else if (choice.toLowerCase() === 'guardar') {
            // Marcar que debe auto-enviar después de guardar
            window.playerChangeTracker.shouldAutoSubmitAfterSave = true;
            savePlayers();
            return true; // Cancelar por ahora, se reenviará después de guardar
        } else if (choice.toLowerCase() === 'descartar') {
            // Descartar cambios
            window.playerChangeTracker.discardChanges();
            return false; // Continuar después de descartar
        } else {
            // Opción inválida, mostrar mensaje y cancelar
            alert('Opción inválida. Operación cancelada.');
            return true;
        }
    }
}

// Función para manejar auto-guardado después de validación exitosa
window.playerChangeTracker.shouldAutoSubmitAfterSave = false;

function handleAutoSubmitAfterSave() {
    if (window.playerChangeTracker.shouldAutoSubmitAfterSave) {
        window.playerChangeTracker.shouldAutoSubmitAfterSave = false;
        // Reenviar el formulario
        setTimeout(() => {
            const form = document.querySelector('form');
            if (form) {
                // Crear evento de submit que omita la validación
                const formData = new FormData(form);
                submitForm(formData);
            }
        }, 500);
    }
}
