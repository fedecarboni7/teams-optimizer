// Ejecutar el código cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    // Botón para seleccionar/deseleccionar a todos los jugadores
    const toggleButton = document.getElementById('toggle-select-button');
    const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]');
    
    toggleButton.addEventListener('click', function () {
        const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]');
        const allSelected = Array.from(checkboxes).every(checkbox => checkbox.checked);
        checkboxes.forEach(checkbox => {
            checkbox.checked = !allSelected;
        });
        updateSelectedCount();
        updateToggleButtonText();
    });

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            updateSelectedCount();
            updateToggleButtonText();
        });
    });

    // Puntuar habilidades de los jugadores con estrellas
    const starRatings = document.querySelectorAll('.star-rating');
    
    starRatings.forEach(rating => {
        const stars = rating.querySelectorAll('.star');
        const input = rating.querySelector('input[type="hidden"]');
        
        updateStars(stars, input.value);
        
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                input.value = value;
                updateStars(stars, value);
            });
        });
    });
    
    function updateStars(stars, value) {
        stars.forEach(star => {
            if (star.getAttribute('data-value') <= value) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    const existingSkillsContainers = document.querySelectorAll('.skills-container');
    existingSkillsContainers.forEach(container => {
        applyHoverEffect(container);
    });

    // Inicializar el estado del botón de scroll al cargar la página
    const scrollButton = document.getElementById('scroll-button');
    if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
        scrollButton.style.display = 'none';
    } else {
        scrollButton.style.display = 'block';
    }

    // Mostrar/Ocultar la lista de jugadores seleccionados al hacer clic en el botón flotante
    const floatingButton = document.getElementById('floating-button');
    const playersList = document.getElementById('selected-players-list');

    floatingButton.addEventListener('click', function (event) {
        event.stopPropagation();
        if (playersList.style.display === 'block') {
            playersList.style.display = 'none';
        } else {
            playersList.style.display = 'block';
        }
    });

    // Cerrar la lista si se hace clic fuera de ella
    document.addEventListener('click', function (event) {
        if (!floatingButton.contains(event.target) && !playersList.contains(event.target)) {
            playersList.style.display = 'none';
        }
    });

    // Mostrar el pop-up si el usuario no lo ha visto
    const popup = document.getElementById("popup");
    const closeButton = document.getElementById("closeButton");
  
    const hasSeenPopup = localStorage.getItem('hasSeenPopup');
  
    if (!hasSeenPopup && popup !== null) {
        setTimeout(function () {
            popup.style.display = "block";
        }, 2000);
    }
    
    if (closeButton !== null) {
        closeButton.addEventListener("click", function () {
            popup.style.display = "none";
            localStorage.setItem('hasSeenPopup', 'true');
        });
    }

});


// Buscador
function filterPlayers() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const players = document.querySelectorAll('.player-entry');

    players.forEach(player => {
        const playerName = player.querySelector('input[name="names"]').value.toLowerCase();
        if (playerName.includes(searchInput)) {
            player.style.display = '';
        } else {
            player.style.display = 'none';
        }
    });
}

// Validar formulario
function validateForm(event) {
    let playersContainer = document.getElementById('players-container');
    let playerEntries = playersContainer.getElementsByClassName('player-entry');
    
    // Validar que hay al menos tres jugadores
    if (playerEntries.length < 3) {
        alert('Debes crear al menos tres jugadores.');
        event.preventDefault();
        return false;
    }
    
    // Validar que todos los campos estén completos
    for (let entry of playerEntries) {
        let inputs = entry.getElementsByTagName('input');
        let nameInput = entry.querySelector('input[name="names"]');
        for (let input of inputs) {
            if (input.type !== 'checkbox' && input.value.trim() === '') {
                alert('Por favor, completá todos los campos. Para el jugador: ' + nameInput.value + ',' + ' el campo: ' + input.name + '.');
                event.preventDefault();
                return false;
            }
        }
    }
    
    // Validar que al menos tres checkbox estén seleccionados
    let selectedPlayers = document.querySelectorAll('input[name="selectedPlayers"]:checked');
    if (selectedPlayers.length < 3) {
        alert('Por favor, selecciona al menos tres jugadores.');
        event.preventDefault();
        return false;
    }

    // Validar que haya un máximo de 22 jugadores seleccionados
    if (selectedPlayers.length > 22) {
        alert('El máximo de jugadores seleccionados es 22.');
        event.preventDefault();
        return false;
    }

    // Validar que todos los nombres sean distintos
    let names = new Set();
    for (let entry of playerEntries) {
        let nameInput = entry.querySelector('input[name="names"]');
        if (nameInput) {
            let playerName = nameInput.value.trim();
            if (names.has(playerName)) {
                alert('Los nombres de los jugadores deben ser distintos. Nombre duplicado: ' + playerName);
                event.preventDefault();
                return false;
            }
            names.add(playerName);
        }
    }

    const submitBtn = document.getElementById('submitBtn');
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    submitBtn.appendChild(spinner);

    // Deshabilitar el botón para prevenir múltiples envíos
    submitBtn.disabled = true;

    // Crear el objeto FormData para enviar los datos del formulario
    let formData = new FormData(event.target);

    // definir una variable global para almacenar los datos de los jugadores
    window.playerDataDict = {};
    window.teams = {};

    // Enviar la solicitud usando fetch
    fetch('/submit', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        document.querySelector('#teams-container').innerHTML = data.html;
        playerDataDict = data.player_data_dict;
        teams = data.teams;
    })
    .catch(error => {
        alert('Hubo un error al enviar los datos.');
        console.error('Error:', error);
    })
    .finally(() => {
        // Habilitar el botón nuevamente y remover el spinner
        submitBtn.disabled = false;
        submitBtn.removeChild(spinner);
    });

    return false;
}

// Agregar jugador
function addPlayer() {
    const container = document.getElementById("players-container");
    const playerCount = container.children.length;
    const playerDiv = document.createElement("div");

    playerDiv.className = "player-entry";

    // Player Header
    const playerHeader = document.createElement("div");
    playerHeader.className = "player-header";

    // Checkbox para seleccionar jugador
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "selectedPlayers";
    checkbox.value = playerCount;
    checkbox.checked = true;
    playerHeader.appendChild(checkbox);

    // Añadir el manejador de eventos para los checkboxes nuevos
    checkbox.addEventListener('change', function () {
        updateSelectedCount();
        updateToggleButtonText();
    });

    // Nombre del jugador
    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Jugador " + (playerCount + 1) + ":";
    playerHeader.appendChild(nameLabel);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.name = "names";
    nameInput.required = true;
    nameInput.placeholder = "Nombre";
    nameInput.style.flex = "1"; // Asegurar que el input de nombre se expanda
    playerHeader.appendChild(nameInput);

    playerDiv.appendChild(playerHeader);

    // Botón para mostrar/ocultar detalles
    const toggleButton = document.createElement("button");
    toggleButton.className = "toggle-details";
    toggleButton.type = "button";
    toggleButton.innerHTML = '<i class="fa-solid fa-angle-down toggle-icon"></i>';
    toggleButton.addEventListener("click", function() {
        toggleDetails(this);
    });
    playerHeader.appendChild(toggleButton);

    // Contenedor para habilidades
    const detailsContainer = document.createElement("div");
    detailsContainer.className = "details-container";
    detailsContainer.style.display = "block";
    detailsContainer.style.maxHeight = "383px";
    detailsContainer.style.paddingBottom = "5px";

    // Skills Container
    const skillsContainer = document.createElement("div");
    skillsContainer.className = "skills-container";

    // Crear skills
    const skills = ['velocidad', 'resistencia', 'control', 'pases', 'tiro', 'defensa', 'habilidad_arquero', 'fuerza_cuerpo', 'vision'];

    skills.forEach(skill => {
        const skillEntry = document.createElement("div");
        skillEntry.className = "skill-entry";

        const label = document.createElement("label");
        label.textContent = skill.charAt(0).toUpperCase() + skill.slice(1).replace('_', ' ') + ":";
        label.textContent = label.textContent.replace('Habilidad arquero', 'Hab. Arquero');

        const starRating = document.createElement("div");
        starRating.className = "star-rating";
        starRating.setAttribute("data-skill", skill);

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement("span");
            star.className = "star";
            star.textContent = "★";
            star.setAttribute("data-value", i);
            starRating.appendChild(star);
        }

        const hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.name = skill;
        hiddenInput.required = true;

        starRating.appendChild(hiddenInput);

        skillEntry.appendChild(label);
        skillEntry.appendChild(starRating);
        skillsContainer.appendChild(skillEntry);
    });

    detailsContainer.appendChild(skillsContainer);
    playerDiv.appendChild(detailsContainer);

    // Agregar funcionalidad a las estrellas
    skillsContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('star')) {
            const starRating = event.target.closest('.star-rating');
            const stars = starRating.querySelectorAll('.star');
            const hiddenInput = starRating.querySelector('input[type="hidden"]');
            const value = event.target.getAttribute('data-value');

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

    // Botón para eliminar
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";

    const trashIcon = document.createElement("i");
    trashIcon.className = "fa-solid fa-trash";
    
    deleteButton.appendChild(trashIcon);

    deleteButton.addEventListener("click", function() {
        container.removeChild(playerDiv);
        renumerarJugadores();
        updateSelectedCount();
        updateToggleButtonText();
    });
    playerHeader.appendChild(deleteButton);

    container.appendChild(playerDiv);

    applyHoverEffect(skillsContainer);
    updateSelectedCount();

    // Hide the details of the other players and rotate the toggle button
    const toggleButtons = document.querySelectorAll('.toggle-details');
    toggleButtons.forEach(button => {
        const details = button.parentNode.nextElementSibling;
        const icon = button.querySelector('.toggle-icon');
        if (details.style.maxHeight != "0px") {
            details.style.maxHeight = "0px";
            details.style.paddingBottom = "0px";
            icon.classList.remove('rotate');
        }
        toggleDetails(toggleButton)
        const icon_ = toggleButton.querySelector('.toggle-icon');
        icon_.classList.remove('rotate');
    });
}

// Asignar un número a cada jugador agregado
function renumerarJugadores() {
    const container = document.getElementById("players-container");
    const jugadores = container.children;
    for (let i = 0; i < jugadores.length; i++) {
      const jugador = jugadores[i];
      const label = jugador.querySelector(".player-header label");
      label.textContent = "Jugador " + (i + 1) + ":";
      // Actualizar el valor del checkbox (opcional, si lo usas para algo)
      const checkbox = jugador.querySelector(".player-header input[type='checkbox']");
      if (checkbox) {
        checkbox.value = i;
      }
    }
}

// Mostrar u ocultar detalles de un jugador
function rotateIcon(detailsContainer, icon) {
    //wait for the animation to finish before removing the class
    detailsContainer.addEventListener('transitionend', function() {
        if (detailsContainer.style.maxHeight === "0px") {
            if (icon) {
                icon.classList.remove('rotate');
            } else {
                icon = detailsContainer.previousElementSibling.querySelector('.toggle-icon');
                icon.classList.remove('rotate');
            }
        } else {
            if (icon) {
                icon.classList.add('rotate');
            } else {
                icon = detailsContainer.previousElementSibling.querySelector('.toggle-icon');
                icon.classList.add('rotate');
            }
        }
    });
}

function toggleDetails(element) {
    const detailsContainer = element.parentNode.nextElementSibling;
    const icon = element.querySelector('.toggle-icon');

    if (detailsContainer.style.maxHeight === "0px") {
        detailsContainer.style.maxHeight = detailsContainer.scrollHeight + "px";
        detailsContainer.style.paddingBottom = "5px";
    } else {
        detailsContainer.style.maxHeight = "0px";
        detailsContainer.style.paddingBottom = "0px";
    }

    rotateIcon(detailsContainer, icon);
}

// Aplicar efecto hover a las estrellas
function applyHoverEffect(container) {
    container.addEventListener('mouseover', function(event) {
        if (event.target.classList.contains('star')) {
            const starRating = event.target.closest('.star-rating');
            const stars = starRating.querySelectorAll('.star');
            const hoverValue = parseInt(event.target.getAttribute('data-value'));

            stars.forEach(star => {
                const starValue = parseInt(star.getAttribute('data-value'));
                if (starValue <= hoverValue) {
                    star.classList.add('hover');
                    star.classList.remove('active');
                } else {
                    star.classList.remove('hover');
                    star.classList.remove('active');
                }
            });
        }
    });

    container.addEventListener('mouseout', function(event) {
        if (event.target.classList.contains('star')) {
            const starRating = event.target.closest('.star-rating');
            const stars = starRating.querySelectorAll('.star');
            const selectedValue = parseInt(starRating.querySelector('input[type="hidden"]').value);

            stars.forEach(star => {
                star.classList.remove('hover');
                if (parseInt(star.getAttribute('data-value')) <= selectedValue) {
                    star.classList.add('active');
                } else {
                    star.classList.remove('active');
                }
            });
        }
    });
}

// Eliminar jugador
function deletePlayer(playerId) {
    if (confirm("¿Estás seguro de que querés eliminar este jugador?")) {
        const deleteBtn = document.getElementById('deleteBtn' + playerId);

        // Deshabilitar el botón para prevenir múltiples envíos
        deleteBtn.disabled = true;

        fetch(`/player/${playerId}`, { method: 'DELETE' })
            .then(response => response.text())
            .then(() => {
                window.location.href = '/';
            });
    }
    updateSelectedCount();
}

// Actualizar el texto del botón de seleccionar/deseleccionar según el estado actual de los checkboxes
function updateToggleButtonText() {
    const toggleButton = document.getElementById('toggle-select-button');
    const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]');
    const allSelected = Array.from(checkboxes).every(checkbox => checkbox.checked);
    toggleButton.textContent = allSelected ? "Deseleccionar a todos" : "Seleccionar a todos";
}

// Botón para borrar la información de todos los jugadores
function reset() {
    if (confirm("Estás a punto de borrar la información de todos los jugadores. ¿Estás seguro de que querés continuar?")) {
        const resetBtn = document.getElementById('resetBtn');
        const spinner = document.createElement('span');
        spinner.className = 'spinner';
        resetBtn.appendChild(spinner);

        // Deshabilitar el botón para prevenir múltiples envíos
        resetBtn.disabled = true;

        fetch('/reset')
            .then(response => response.text())
            .then(() => {
                window.location.href = '/';
            });
    }
}

// Actualizar el contador de jugadores seleccionados
function updateSelectedCount() {
    let selectedCount = document.querySelectorAll('input[name="selectedPlayers"]:checked').length;
    document.getElementById('selected-count').textContent = selectedCount;

    updateSelectedPlayersList();
}

// Actualizar la lista de jugadores seleccionados
function updateSelectedPlayersList() {
    let selectedPlayers = document.querySelectorAll('input[name="selectedPlayers"]:checked');
    let selectedPlayersUL = document.getElementById('selected-players-ul');

    selectedPlayersUL.innerHTML = ''; // Clear the list

    selectedPlayers.forEach(playerCheckbox => {
        let playerId = playerCheckbox.value;
        let playerName = playerCheckbox.nextElementSibling.nextElementSibling.value;

        let listItem = document.createElement('li');
        let playerText = document.createElement('span');
        playerText.textContent = playerName;

        listItem.appendChild(createDeselectButton(playerId));
        listItem.appendChild(playerText);
        selectedPlayersUL.appendChild(listItem);
    });
}

// Crear botón para deseleccionar un jugador de la lista del contador
function createDeselectButton(playerId) {
    let button = document.createElement('button');
    button.textContent = '✖';
    button.onclick = function(event) {
        event.stopPropagation();
        deselectPlayer(playerId);
    };
    return button;
}

// Deseleccionar un jugador de la lista y actualizar el contador
function deselectPlayer(playerId) {
    let checkbox = document.querySelector(`input[name="selectedPlayers"][value="${playerId}"]`);
    if (checkbox) {
        checkbox.checked = false;
        updateSelectedCount();
        updateToggleButtonText();
    }
}

// Botón de scroll
function scrollToSubmit() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.scrollIntoView({ behavior: 'smooth' });
    }
}

// Evento para mostrar u ocultar el botón de scroll dependiendo de la posición de la página
window.addEventListener('scroll', function() {
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

// Compartir resultados de los equipos
function compartirEquipos(button) {
    const indice = button.id.replace('shareButton', ''); // Obtiene el índice del botón
    const contenedor = document.getElementById('resultados-equipos' + indice);
    // Construye el texto a compartir
    let textoCompartir = '';
    const titulos = contenedor.querySelectorAll('h2');
    const listasJugadores = contenedor.querySelectorAll('ul');
    for (let i = 0; i < titulos.length; i++) {
        textoCompartir += titulos[i].innerText + '\n'; // Agrega el título
        
        // Itera sobre los jugadores en la lista
        const jugadores = listasJugadores[i].querySelectorAll('li');
        for (let j = 0; j < jugadores.length; j++) {
            textoCompartir += '- ' + jugadores[j].innerText + '\n'; // Agrega el jugador
        }
        textoCompartir += '\n'; // Agrega una línea en blanco entre equipos
    }
    textoCompartir += 'Generado con: https://bit.ly/ArmarEquipos'; // Agrega el enlace al sitio web
    const shareData = {
        title: 'Resultados de los Equipos - Opción ' + (parseInt(indice)),
        text: textoCompartir
    };
    try {
        navigator.share(shareData)
    } catch (err) {
        console.log(`Error: ${err}`);
        // Opción alternativa para navegadores que no soportan Web Share API
        alert('Tu navegador no soporta la función de compartir. Por favor, copia el texto manualmente.');
        navigator.clipboard.writeText(textoCompartir)
          .then(() => {
            alert('Texto copiado al portapapeles');
          })
          .catch(err => {
            console.error('Error al copiar al portapapeles: ', err);
          });
    }
}

// Mostrar u ocultar detalles de los equipos
function toggleStats(button) {
    const contentContainer = button.parentNode.nextElementSibling;
    const textSpan = button.querySelector('span');

    if (contentContainer.style.display === "none" || contentContainer.style.display === "") {
        contentContainer.style.display = "flex";
        textSpan.textContent = "Ocultar detalles";
        createRadarChart(contentContainer);
    } else {
        contentContainer.style.display = "none";
        textSpan.textContent = "Mostrar detalles";
    }
}

function swapPlayer(player, fromTeamIndex, toTeamIndex) {
    // Obtener las listas de jugadores de ambos equipos
    var fromTeamList = document.querySelector(`.team-list[data-index='${fromTeamIndex}']`);
    var toTeamList = document.querySelector(`.team-list[data-index='${toTeamIndex}']`);

    // Buscar el elemento del jugador en la lista del equipo de origen
    var playerElement = Array.from(fromTeamList.children).find(function(element) {
        return element.querySelector(".player-name").textContent === player;
    });

    // Remover el jugador del equipo de origen
    if (playerElement) {
        fromTeamList.removeChild(playerElement);
        
        // Crear un nuevo elemento de lista para el jugador en el equipo de destino
        var newPlayerElement = document.createElement("li");
        newPlayerElement.classList.add("player-item");

        // Crear el span para el nombre del jugador
        var playerNameSpan = document.createElement("span");
        playerNameSpan.classList.add("player-name");
        playerNameSpan.textContent = player;

        // Crear el botón de swap
        var swapButton = document.createElement("button");
        swapButton.type = "button";
        swapButton.classList.add("swap-button");
        swapButton.innerHTML = `<i class="fa-solid fa-right-left"></i>`;
        swapButton.onclick = function() {
            swapPlayer(player, toTeamIndex, fromTeamIndex);
        };

        // Añadir el span del nombre del jugador y el botón al nuevo elemento de lista
        newPlayerElement.appendChild(playerNameSpan);
        newPlayerElement.appendChild(swapButton);

        // Añadir el nuevo elemento de lista al equipo de destino
        toTeamList.appendChild(newPlayerElement);
    }

    // Definir equipo 1 y equipo 2
    var team1Index = fromTeamIndex;
    var team2Index = toTeamIndex;
    if (fromTeamIndex > toTeamIndex) {
        team1Index = toTeamIndex;
        team2Index = fromTeamIndex;
    }

    // Actualizar la tabla de habilidades
    updateSkillsTable(team1Index, team2Index);

    // Actualizar el gráfico de radar
    var containerNumber = Math.floor(team1Index / 2) + 1;
    var contentContainer = document.getElementById('content-container' + containerNumber);
    createRadarChart(contentContainer);
}

function updateSkillsTable(team1Index, team2Index) {
    team1List = document.querySelector(`.team-list[data-index='${team1Index}']`);
    team2List = document.querySelector(`.team-list[data-index='${team2Index}']`);

    // Obtener los nombres de los jugadores de ambos equipos
    var team1Players = Array.from(team1List.children).map(function(element) {
        return element.querySelector(".player-name").textContent;
    });
    var team2Players = Array.from(team2List.children).map(function(element) {
        return element.querySelector(".player-name").textContent;
    });

    // Obtener las habilidades de los jugadores de ambos equipos
    var team1Skills = getTeamSkills(team1Players);
    var team2Skills = getTeamSkills(team2Players);

    // Actualizar la tabla específica de habilidades que representa la comparación de ambos equipos
    var tableNumber = Math.floor(team1Index / 2) + 1;
    var table = document.getElementById("skills-table" + tableNumber);
    var rows = table.querySelectorAll("tbody tr");
    var skills = ["velocidad", "resistencia", "control", "pases", "tiro", "defensa", "habilidad_arquero", "fuerza_cuerpo", "vision", "total"];
    for (var i = 0; i < skills.length; i++) {
        var row = rows[i];
        var cells = row.querySelectorAll("td");
        cells[1].textContent = team1Skills[skills[i]];
        cells[2].textContent = team2Skills[skills[i]];
    }
}

function getTeamSkills(players) {
    var skills = {
        velocidad: 0,
        resistencia: 0,
        control: 0,
        pases: 0,
        tiro: 0,
        defensa: 0,
        habilidad_arquero: 0,
        fuerza_cuerpo: 0,
        vision: 0,
        total: 0
    };

    // Obtener las habilidades de los jugadores leyendo playerDataDict
    players.forEach(function(player) {
        var playerSkills = playerDataDict[player];
        for (var skill in playerSkills) {
            skills[skill] += playerSkills[skill];
        }
    });

    // Calcular el total de habilidades
    skills.total = Object.values(skills).reduce(function(total, value) {
        return total + value;
    }, 0);

    return skills;
}

let radarCharts = {}; // Objeto global para almacenar gráficos por número de contenedor

// Crear gráfico de radar
function createRadarChart(contentContainer) {
    const tableContainer = contentContainer.querySelector('.table-container');
    const chartContainer = contentContainer.querySelector('.chart-container');
    const canvas = chartContainer.querySelector('canvas');
    const resultadosEquiposContainer = document.getElementById('resultados-equipos1');
    const listasJugadores = resultadosEquiposContainer.querySelectorAll('li');
    const cantidadJugadores = Math.floor(listasJugadores.length / 2);
    const containerNumber = parseInt(contentContainer.id.replace('content-container', ''));
    const ctx = canvas.getContext('2d');
    
    // Obtén los datos de la tabla
    const skills = Array.from(tableContainer.querySelectorAll('tbody tr td:first-child')).map(td => td.textContent);
    const team1Data = Array.from(tableContainer.querySelectorAll('tbody tr td:nth-child(2)')).map(td => parseInt(td.textContent));
    const team2Data = Array.from(tableContainer.querySelectorAll('tbody tr td:nth-child(3)')).map(td => parseInt(td.textContent));

    // Elimina la última fila (Total)
    skills.pop();
    team1Data.pop();
    team2Data.pop();

    // Destruir el gráfico existente si ya existe
    if (radarCharts[containerNumber]) {
        radarCharts[containerNumber].destroy();
    }

    // Create the new radar chart
    radarCharts[containerNumber] = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: skills,
            datasets: [{
                label: 'Equipo 1',
                data: team1Data,
                radius: 4,
                pointStyle: 'rect',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                pointBackgroundColor: 'rgb(54, 162, 235)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(54, 162, 235)'
            }, {
                label: 'Equipo 2',
                data: team2Data,
                radius: 4,
                pointStyle: 'triangle',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgb(255, 99, 132)',
                pointBackgroundColor: 'rgb(255, 99, 132)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(255, 99, 132)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        display: true,
                        color: 'rgba(255, 255, 255, 0.4)',
                        lineWidth: 1
                    },
                    // suggestedMin tiene que ser la cantidad de jugadores
                    suggestedMin: cantidadJugadores,
                    // suggestedMax tiene que ser la cantidad de jugadores * 5
                    suggestedMax: cantidadJugadores * 5,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.4)',
                        lineWidth: 1
                    },
                    pointLabels: {
                        color: '#e0e0e0',
                        font: {
                            size: 14,
                            weight: 500,
                            family:'Segoe UI'
                        }
                    },
                    ticks: {
                        color: '#e0e0e0',
                        font: {
                            size: 12
                        },
                        backdropColor: '#5a5a5a'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#e0e0e0',
                        font: {
                            size: 16,
                            family:'Segoe UI',
                            weight: 600
                        }
                    }
                }
            }
        }
    });
}


// Generar formaciones
function generarFormaciones(button) {
    const indice = button.id.replace('generarFormaciones', ''); // Obtiene el índice del botón

    // Obtener los índices de los equipos
    const team1 = indice * 2 - 2;
    const team2 = indice * 2 - 1;
    // Hacer una lista de las listas de teams
    const teamsList = [teams[team1], teams[team2]];

    // Validar que la cantidad de jugadores por equipo sea de 11 o 5 (para fútbol o futsal)
    if (teamsList[0][0].length !== 11 && teamsList[0][0].length !== 5) {
        alert('La cantidad de jugadores por equipo debe ser de 11 o 5.');
        return;
    }
    if (teamsList[1][0].length !== 11 && teamsList[1][0].length !== 5) {
        alert('La cantidad de jugadores por equipo debe ser de 11 o 5.');
        return;
    }

    // Crear el spinner y agregarlo al botón
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    button.appendChild(spinner);

    // Deshabilitar el botón para prevenir múltiples clics
    button.disabled = true; 
    
    // Preparar los datos a enviar al backend
    const payload = {
        player_data_dict: playerDataDict,  // Enviar el objeto directamente
        teams: teamsList
    };

    // Enviar la solicitud usando fetch
    fetch('/formations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // Enviar como JSON
        },
        body: JSON.stringify(payload),  // Serializar el objeto completo como JSON
    })
    .then(response => response.json())  // Cambiar a .json() si el backend responde con JSON
    .then(data => {
        positionPlayers(data, indice);  // Procesar los datos de las formaciones
        
        // Mostrar el contenedor de formaciones
        const formationsContainer = document.getElementById('formations-container' + indice);
        formationsContainer.style.display = 'block';
    })
    .catch(error => {
        console.error('Error fetching formations:', error);
        formationsContainer.innerHTML = 'Error loading formations.';  // Manejar el error
    })
    .finally(() => {
        // Eliminar el spinner y habilitar el botón, independientemente del resultado
        button.removeChild(spinner);
        button.disabled = false;
    });
}
