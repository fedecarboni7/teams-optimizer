// Ejecutar el código cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    function positionPlayers(teamsData) {
        const positions = {
            // Fútbol 5
            "2-1-1": {
                "GK": {top: 92, left: 50},
                "CB": [{top: 80, left: 30}, {top: 80, left: 70}],
                "CM": {top: 68, left: 50},
                "ST": {top: 55, left: 50}
            },
            "3-0-1": {
                "GK": {top: 92, left: 50},
                "CB": [{top: 75, left: 20}, {top: 80, left: 50}, {top: 75, left: 80}],
                "ST": {top: 55, left: 50}
            },
            "2-0-2": {
                "GK": {top: 92, left: 50},
                "CB": [{top: 75, left: 30}, {top: 75, left: 70}],
                "ST": [{top: 55, left: 30}, {top: 55, left: 70}]
            },
            "1-2-1": {
                "GK": {top: 92, left: 50},
                "CB": {top: 80, left: 50},
                "CM": [{top: 68, left: 30}, {top: 68, left: 70}],
                "ST": {top: 55, left: 50}
            },
            "1-1-2": {
                "GK": {top: 92, left: 50},
                "CB": {top: 80, left: 50},
                "CM": {top: 68, left: 50},
                "ST": [{top: 55, left: 30}, {top: 55, left: 70}]
            },
            "1-0-3": {
                "GK": {top: 92, left: 50},
                "CB": {top: 80, left: 50},
                "ST": [{top: 55, left: 20}, {top: 60, left: 50}, {top: 55, left: 80}]
            },
            // Fútbol 11
            "4-4-2": {
                "GK": {top: 90, left: 50},
                "RB": {top: 70, left: 15},
                "CB": [{top: 70, left: 30}, {top: 70, left: 70}],
                "LB": {top: 70, left: 85},
                "RM": {top: 45, left: 15},
                "CM": [{top: 45, left: 30}, {top: 45, left: 70}],
                "LM": {top: 45, left: 85},
                "ST": [{top: 20, left: 30}, {top: 20, left: 70}]
            }
        };
    
        const field = document.querySelector('#soccer-field');
        field.innerHTML = ''; // Limpiar el campo
    
        function positionTeam(teamData, isTopTeam) {
            // Creamos una copia del objeto de posiciones para evitar modificar el original
            const teamPositions = JSON.parse(JSON.stringify(positions[teamData.formation]));
            teamData.players.forEach(player => {
                const position = teamPositions[player.position];
                let top, left;
        
                if (Array.isArray(position) && position.length > 0) {  // Aseguramos que el array no esté vacío
                    const pos = {...position[0]};  // Hacemos una copia del primer elemento sin modificar el array original
                    top = pos.top;
                    left = pos.left;
                    position.shift();  // Eliminamos el primer elemento del array solo si es necesario
                } else if (position && position.top !== undefined && position.left !== undefined) {  // Verificamos que 'position' no sea undefined y tenga las propiedades 'top' y 'left'
                    top = position.top;
                    left = position.left;
                }
        
                if (!isTopTeam) {
                    top = 100 - top; // Invertir la posición vertical para el equipo de abajo
                }
        
                const playerElement = document.createElement('div');
                playerElement.className = `player ${isTopTeam ? 'team1' : 'team2'}`;
                playerElement.style.top = `${top}%`;
                playerElement.style.left = `${left}%`;
                playerElement.innerHTML = `
                <div class="jersey">${player.number}</div>
                <div class="name">${player.name}</div>
                `;
        
                field.appendChild(playerElement);
            });
        }
    
        // Posicionar los jugadores de cada equipo
        const team1Data = teamsData.team1;
        const team2Data = teamsData.team2;
        
        positionTeam(team1Data, true);
        positionTeam(team2Data, false);
    
        // Volver a añadir los elementos del campo
        ['goal-area top', 'penalty-area top', 'penalty-semicircle top', 'center-circle', 'center-line', 
        'penalty-semicircle bottom', 'penalty-area bottom', 'goal-area bottom'].forEach(className => {
            const element = document.createElement('div');
            element.className = className;
            field.appendChild(element);
        });
    }
    positionPlayers(formations);
});