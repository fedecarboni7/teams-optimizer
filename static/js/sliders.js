// Sliders.js - Funcionalidad específica para sliders de habilidades
document.addEventListener('DOMContentLoaded', () => {
    initializeSliders();
});

function initializeSliders() {
    // Puntuar habilidades de los jugadores con sliders
    const sliderRatings = document.querySelectorAll('.slider-rating');
    
    sliderRatings.forEach(rating => {
        const slider = rating.querySelector('.skill-slider');
        const input = rating.querySelector('input[type="hidden"]');
        const valueDisplay = rating.querySelector('.slider-value');
        
        if (input.value) {
            slider.value = input.value;
            if (valueDisplay) {
                valueDisplay.textContent = input.value;
            }
        }
        
        slider.addEventListener('input', function() {
            const value = this.value;
            input.value = value;
            if (valueDisplay) {
                valueDisplay.textContent = value;
            }
        });
    });

    const existingSkillsContainers = document.querySelectorAll('.skills-container');
    existingSkillsContainers.forEach(container => {
        applySliderEffect(container);
    });
}

// Aplicar efecto a los sliders cuando se crean
function applySliderEffect(skillsContainer) {
    if (!skillsContainer) return;
    
    const sliders = skillsContainer.querySelectorAll('.skill-slider');
    
    sliders.forEach(slider => {
        updateSliderBackground(slider);
        
        slider.addEventListener('input', function() {
            updateSliderBackground(this);
            
            // Actualizar el valor mostrado
            const sliderRating = this.closest('.slider-rating');
            if (sliderRating) {
                const hiddenInput = sliderRating.querySelector('input[type="hidden"]');
                const valueDisplay = sliderRating.querySelector('.slider-value');
                const value = this.value;

                if (hiddenInput) hiddenInput.value = value;
                if (valueDisplay) valueDisplay.textContent = value;
            }
        });
    });
}

// Actualizar el fondo del slider basado en su valor
function updateSliderBackground(slider) {
    const value = slider.value;
    const max = slider.max;
    const percentage = (value / max) * 100;
    
    // Crear gradiente que muestra el progreso
    slider.style.background = `linear-gradient(to right, var(--accent-color) 0%, var(--accent-color) ${percentage}%, #444 ${percentage}%, #444 100%)`;
}

// Crear sliders para un nuevo jugador
function createPlayerSkillSliders(skillsContainer, scale = 5) {
    const skills = [
        { name: 'pace', label: 'Velocidad' },
        { name: 'shooting', label: 'Definición' },
        { name: 'passing', label: 'Pase' },
        { name: 'dribbling', label: 'Regate' },
        { name: 'defending', label: 'Defensa' },
        { name: 'physical', label: 'Físico' },
        { name: 'crossing', label: 'Centro' },
        { name: 'finishing', label: 'Finalización' },
        { name: 'heading_accuracy', label: 'Cabeceo' },
        { name: 'short_passing', label: 'Pase Corto' },
        { name: 'volleys', label: 'Voleas' },
        { name: 'dribbles', label: 'Regates' },
        { name: 'curve', label: 'Curva' },
        { name: 'free_kick_accuracy', label: 'Tiros Libres' },
        { name: 'long_passing', label: 'Pase Largo' },
        { name: 'ball_control', label: 'Control' },
        { name: 'acceleration', label: 'Aceleración' },
        { name: 'sprint_speed', label: 'Velocidad Sprint' },
        { name: 'agility', label: 'Agilidad' },
        { name: 'reactions', label: 'Reacciones' },
        { name: 'balance', label: 'Equilibrio' },
        { name: 'shot_power', label: 'Potencia Disparo' },
        { name: 'jumping', label: 'Salto' },
        { name: 'stamina', label: 'Resistencia' },
        { name: 'strength', label: 'Fuerza' },
        { name: 'long_shots', label: 'Disparos Lejanos' },
        { name: 'aggression', label: 'Agresividad' },
        { name: 'interceptions', label: 'Intercepciones' },
        { name: 'positioning', label: 'Posicionamiento' },
        { name: 'vision', label: 'Visión' }
    ];

    skills.forEach(skill => {
        const skillEntry = document.createElement('div');
        skillEntry.className = 'skill-entry';
        
        skillEntry.innerHTML = `
            <label>${skill.label}:</label>
            <div class="slider-rating" data-skill="${skill.name}">
                <input type="range" class="skill-slider" min="1" max="${scale}" value="1" step="1">
                <span class="slider-value">1</span>
                <input type="hidden" name="${skill.name}" value="1">
            </div>
        `;
        
        skillsContainer.appendChild(skillEntry);
    });
    
    // Aplicar efectos a los nuevos sliders
    applySliderEffect(skillsContainer);
}

// Actualizar la escala de todos los sliders
function updateSlidersScale(newScale) {
    const sliders = document.querySelectorAll('.skill-slider');
    
    sliders.forEach(slider => {
        const currentValue = parseInt(slider.value);
        const currentMax = parseInt(slider.max);
        
        // Convertir el valor actual a la nueva escala
        const newValue = Math.round((currentValue / currentMax) * newScale);
        
        slider.max = newScale;
        slider.value = newValue;
        
        // Actualizar elementos relacionados
        const sliderRating = slider.closest('.slider-rating');
        if (sliderRating) {
            const hiddenInput = sliderRating.querySelector('input[type="hidden"]');
            const valueDisplay = sliderRating.querySelector('.slider-value');
            
            if (hiddenInput) hiddenInput.value = newValue;
            if (valueDisplay) valueDisplay.textContent = newValue;
        }
        
        // Actualizar fondo
        updateSliderBackground(slider);
    });
}