// Ejecutar el código cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    function positionPlayers(teamsData, fieldNumber) {
        const positions = {
            // Fútbol 5
            "2-1-1": {
                "GK": {top: 92, left: 50},
                "CB": [{top: 80, left: 30}, {top: 80, left: 70}],
                "CM": {top: 68, left: 50},
                "ST": {top: 54, left: 50}
            },
            "3-0-1": {
                "GK": {top: 92, left: 50},
                "CB": [{top: 75, left: 20}, {top: 80, left: 50}, {top: 75, left: 80}],
                "ST": {top: 54, left: 50}
            },
            "2-0-2": {
                "GK": {top: 92, left: 50},
                "CB": [{top: 75, left: 30}, {top: 75, left: 70}],
                "ST": [{top: 54, left: 30}, {top: 54, left: 70}]
            },
            "1-2-1": {
                "GK": {top: 92, left: 50},
                "CB": {top: 80, left: 50},
                "CM": [{top: 68, left: 30}, {top: 68, left: 70}],
                "ST": {top: 54, left: 50}
            },
            "1-1-2": {
                "GK": {top: 92, left: 50},
                "CB": {top: 80, left: 50},
                "CM": {top: 68, left: 50},
                "ST": [{top: 54, left: 30}, {top: 54, left: 70}]
            },
            "1-0-3": {
                "GK": {top: 92, left: 50},
                "CB": {top: 80, left: 50},
                "ST": [{top: 54, left: 20}, {top: 60, left: 50}, {top: 54, left: 80}]
            },
            // Fútbol 9
            "3-3-2": {
                "GK": {top: 92, left: 50},
                "CB": [{top: 82, left: 25}, {top: 82, left: 50}, {top: 82, left: 75}],
                "CM": [{top: 68, left: 25}, {top: 68, left: 50}, {top: 68, left: 75}],
                "ST": [{top: 54, left: 40}, {top: 54, left: 60}]
            },
            "4-2-2": {
                "GK": {top: 92, left: 50},
                "LB": {top: 82, left: 15},
                "CB": [{top: 82, left: 40}, {top: 82, left: 60}],
                "RB": {top: 82, left: 85},
                "CM": [{top: 68, left: 40}, {top: 68, left: 60}],
                "ST": [{top: 54, left: 40}, {top: 54, left: 60}]
            },
            "3-4-1": {
                "GK": {top: 92, left: 50},
                "CB": [{top: 82, left: 25}, {top: 82, left: 50}, {top: 82, left: 75}],
                "LM": {top: 68, left: 15},
                "CM": [{top: 68, left: 40}, {top: 68, left: 60}],
                "RM": {top: 68, left: 85},
                "ST": {top: 54, left: 50}
            },
            "4-3-1": {
                "GK": {top: 92, left: 50},
                "LB": {top: 82, left: 15},
                "CB": [{top: 82, left: 40}, {top: 82, left: 60}],
                "RB": {top: 82, left: 85},
                "CM": [{top: 68, left: 30}, {top: 68, left: 50}, {top: 68, left: 70}],
                "ST": {top: 54, left: 50}
            },
            "3-2-3": {
                "GK": {top: 92, left: 50},
                "CB": [{top: 82, left: 25}, {top: 82, left: 50}, {top: 82, left: 75}],
                "CM": [{top: 68, left: 40}, {top: 68, left: 60}],
                "LW": {top: 54, left: 25},
                "ST": {top: 54, left: 50},
                "RW": {top: 54, left: 75}
            },
            "4-1-3": {
                "GK": {top: 92, left: 50},
                "LB": {top: 82, left: 15},
                "CB": [{top: 82, left: 40}, {top: 82, left: 60}],
                "RB": {top: 82, left: 85},
                "CM": {top: 68, left: 50},
                "LW": {top: 54, left: 25},
                "ST": {top: 54, left: 50},
                "RW": {top: 54, left: 75}
            },
            // Fútbol 11
            "4-4-2": {
                "GK": {top: 92, left: 50},
                "LB": {top: 82, left: 15},
                "CB": [{top: 82, left: 37}, {top: 82, left: 62}],
                "RB": {top: 82, left: 85},
                "LM": {top: 67, left: 85},
                "CM": [{top: 67, left: 38}, {top: 67, left: 62}],
                "RM": {top: 67, left: 15},
                "ST": [{top: 54, left: 38}, {top: 54, left: 62}]
            },
            "4-3-3": {
                "GK": {top: 92, left: 50},
                "LB": {top: 82, left: 15},
                "CB": [{top: 82, left: 37}, {top: 82, left: 62}],
                "RB": {top: 82, left: 85},
                "CM": [{top: 70, left: 30}, {top: 70, left: 50}, {top: 70, left: 70}],
                "LW": {top: 56, left: 30},
                "ST": {top: 54, left: 50},
                "RW": {top: 56, left: 70}
            },
            "3-4-3": {
                "GK": {top: 92, left: 50},
                "CB": [{top: 82, left: 30}, {top: 82, left: 50}, {top: 82, left: 70}],
                "LM": {top: 70, left: 15},
                "CM": [{top: 70, left: 38}, {top: 70, left: 62}],
                "RM": {top: 70, left: 85},
                "LW": {top: 57, left: 25},
                "ST": {top: 54, left: 50},
                "RW": {top: 57, left: 75}
            },
            "4-2-3-1": {
                "GK": {top: 92, left: 50},
                "LB": {top: 82, left: 15},
                "CB": [{top: 82, left: 37}, {top: 82, left: 62}],
                "RB": {top: 82, left: 85},
                "CDM": [{top: 72, left: 37}, {top: 72, left: 62}],
                "LW": {top: 60, left: 25},
                "CAM": {top: 65, left: 50},
                "RW": {top: 60, left: 75},
                "ST": {top: 54, left: 50}
            },
            "5-4-1": {
                "GK": {top: 92, left: 50},
                "LB": {top: 82, left: 10},
                "CB": [{top: 82, left: 30}, {top: 82, left: 50}, {top: 82, left: 70}],
                "RB": {top: 82, left: 90},
                "LM": {top: 66, left: 15},
                "CM": [{top: 66, left: 38}, {top: 66, left: 62}],
                "RM": {top: 66, left: 85},
                "ST": {top: 54, left: 50}
            },
            "4-5-1": {
                "GK": {top: 92, left: 50},
                "LB": {top: 82, left: 15},
                "CB": [{top: 82, left: 37}, {top: 82, left: 62}],
                "RB": {top: 82, left: 85},
                "LM": {top: 67, left: 10},
                "CM": [{top: 67, left: 30}, {top: 67, left: 50}, {top: 67, left: 70}],
                "RM": {top: 67, left: 90},
                "ST": {top: 54, left: 50}
            },
            "3-5-2": {
                "GK": {top: 92, left: 50},
                "CB": [{top: 82, left: 30}, {top: 82, left: 50}, {top: 82, left: 70}],
                "LM": {top: 67, left: 10},
                "CM": [{top: 67, left: 30}, {top: 67, left: 50}, {top: 67, left: 70}],
                "RM": {top: 67, left: 90},
                "ST": [{top: 54, left: 40}, {top: 54, left: 60}]
            },
            "5-3-2": {
                "GK": {top: 92, left: 50},
                "LB": {top: 77, left: 15},
                "CB": [{top: 82, left: 30}, {top: 82, left: 50}, {top: 82, left: 70}],
                "RB": {top: 77, left: 85},
                "LM": {top: 67, left: 30},
                "CM": {top: 67, left: 50},
                "RM": {top: 67, left: 70},
                "ST": [{top: 54, left: 40}, {top: 54, left: 60}]
            },
            "4-1-4-1": {
                "GK": {top: 92, left: 50},
                "LB": {top: 82, left: 15},
                "CB": [{top: 82, left: 38}, {top: 82, left: 62}],
                "RB": {top: 82, left: 85},
                "CDM": {top: 75, left: 50},
                "LM": {top: 66, left: 15},
                "CM": [{top: 66, left: 38}, {top: 66, left: 62}],
                "RM": {top: 66, left: 85},
                "ST": {top: 54, left: 50}
            },
            "3-4-2-1":{
                "GK": {top: 92, left: 50},
                "CB": [{top: 82, left: 30}, {top: 82, left: 50}, {top: 82, left: 70}],
                "LM": {top: 70, left: 15},
                "CM": [{top: 70, left: 38}, {top: 70, left: 62}],
                "RM": {top: 70, left: 85},
                "AM": [{top: 58, left: 30}, {top: 58, left: 70}],
                "ST": {top: 54, left: 50}
            }
        };
        
        const field = document.getElementById('soccer-field' + fieldNumber);
        field.innerHTML = ''; // Limpiar el campo

        // Diccionario de traducción de posiciones
        const positionTranslations = {
            "GK": "PO",  // Portero
            "LB": "LI",  // Lateral Izquierdo
            "CB": "DFC", // Defensa Central
            "RB": "LD",  // Lateral Derecho
            "LM": "MI",  // Mediocampista Izquierdo
            "CM": "MC",  // Mediocampista Central
            "RM": "MD",  // Mediocampista Derecho
            "CDM": "MCD",// Mediocampista Defensivo
            "CAM": "MCO",// Mediocampista Ofensivo
            "LW": "EI",  // Extremo Izquierdo
            "RW": "ED",  // Extremo Derecho
            "ST": "DC"   // Delantero
        };
    
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
                    left = 100 - left; // Invertir la posición horizontal para el equipo de abajo
                }
        
                const playerElement = document.createElement('div');
                playerElement.className = `player ${isTopTeam ? 'team1' : 'team2'}`;
                playerElement.style.top = `${top}%`;
                playerElement.style.left = `${left}%`;
                
                // Traducir la posición antes de mostrarla
                const translatedPosition = positionTranslations[player.position] || player.position;

                playerElement.innerHTML = `
                <div class="jersey">${translatedPosition}</div>
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
        'penalty-semicircle bottom', 'penalty-area bottom', 'goal-area bottom', 'center-circle-point'].forEach(className => {
            const element = document.createElement('div');
            element.className = className;
            field.appendChild(element);
        });
    }

    window.positionPlayers = positionPlayers;
});
