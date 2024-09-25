function positionPlayers(formationData) {
    const field = document.querySelector('.soccer-field');
    const goalArea = document.querySelector('.goal-area');
    const penaltyArea = document.querySelector('.penalty-area');
    const penaltySemiCircle = document.querySelector('.penalty-semicircle');
    const centerCircle = document.querySelector('.center-circle');
    const centerLine = document.querySelector('.center-line');
    field.innerHTML = ''; // Limpiar el campo
  
    const positions = {
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
      },
      // Fútbol 5
      "2-1-1": {
        "GK": {top: 90, left: 50},
        "CB": [{top: 70, left: 30}, {top: 70, left: 70}],
        "CM": {top: 45, left: 50},
        "ST": {top: 30, left: 50}
      },
      "3-0-1": {
        "GK": {top: 90, left: 50},
        "CB": [{top: 60, left: 20}, {top: 70, left: 50}, {top: 60, left: 80}],
        "ST": {top: 30, left: 50}
      },
      "2-0-2": {
        "GK": {top: 90, left: 50},
        "CB": [{top: 70, left: 30}, {top: 70, left: 70}],
        "ST": [{top: 30, left: 30}, {top: 30, left: 70}]
      },
      "1-2-1": {
        "GK": {top: 90, left: 50},
        "CB": {top: 70, left: 50},
        "CM": [{top: 50, left: 30}, {top: 50, left: 70}],
        "ST": {top: 30, left: 50}
      },
      "1-1-2": {
        "GK": {top: 90, left: 50},
        "CB": {top: 70, left: 50},
        "CM": {top: 50, left: 50},
        "ST": [{top: 30, left: 30}, {top: 30, left: 70}]
      },
      "1-0-3": {
        "GK": {top: 90, left: 50},
        "CB": {top: 70, left: 50},
        "ST": [{top: 30, left: 20}, {top: 20, left: 50}, {top: 30, left: 80}]
      }
    };
  
    formationData.players.forEach(player => {
      const position = positions[formationData.formation][player.position];
      let top, left;
  
      if (Array.isArray(position)) {
        // Si hay múltiples jugadores en la misma posición, usa el primero disponible
        const pos = position.shift();
        top = pos.top;
        left = pos.left;
      } else {
        top = position.top;
        left = position.left;
      }
  
      const playerElement = document.createElement('div');
      playerElement.className = 'player';
      playerElement.style.top = `${top}%`;
      playerElement.style.left = `${left}%`;
      playerElement.innerHTML = `
        <div class="jersey">${player.number}</div>
        <div class="name">${player.name}</div>
      `;
  
      field.appendChild(playerElement);
      field.appendChild(goalArea);
      field.appendChild(penaltyArea);
      field.appendChild(centerCircle);
      field.appendChild(centerLine);
      field.appendChild(penaltySemiCircle);
    });
  }
  
formationData = {'formation': '1-2-1', 'players': [{'position': 'GK', 'number': 1, 'name': 'Marcos'}, {'position': 'CB', 'number': 2, 'name': 'María'}, {'position': 'CM', 'number': 3, 'name': 'Santiago'}, {'position': 'CM', 'number': 4, 'name': 'Juan'}, {'position': 'ST', 'number': 5, 'name': 'Carlos'}]};
positionPlayers(formationData);