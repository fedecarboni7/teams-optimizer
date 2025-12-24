// Compartir resultados de los equipos
function compartirEquipos(button) {
    const indice = button.id.replace('shareButton', ''); // Obtiene el índice del botón
    const contenedor = document.getElementById('resultados-equipos' + indice);
    // Construye el texto a compartir
    let textoCompartir = '';
    const titulos = contenedor.querySelectorAll('h2');
    const listasJugadores = contenedor.querySelectorAll('ul');
    for (let i = 0; i < titulos.length; i++) {
        textoCompartir += '*' + titulos[i].innerText + '*\n'; // Agrega el título
        
        // Itera sobre los jugadores en la lista
        const jugadores = listasJugadores[i].querySelectorAll('li');
        for (let j = 0; j < jugadores.length; j++) {
            // Obtener solo el nombre del jugador desde el span player-name
            const playerNameElement = jugadores[j].querySelector('.player-name');
            const playerName = playerNameElement ? playerNameElement.textContent : jugadores[j].innerText;
            textoCompartir += (j + 1) + '. ' + playerName + '\n'; // Agrega el jugador con número
        }
        textoCompartir += '\n'; // Agrega una línea en blanco entre equipos
    }
    textoCompartir += 'Generado con: https://armarequipos.up.railway.app'; // Agrega el enlace al sitio web
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
        createCarousel(contentContainer.querySelector('.carousel-container'));
    } else {
        contentContainer.style.display = "none";
        textSpan.textContent = "Mostrar detalles";
    }
}

function navigateTo(page) {
    const routes = {
        'jugadores': '/jugadores',
        'equipos': '/home',
        'clubes': '/clubes',
        'perfil': '/perfil'
    };
    
    if (routes[page]) {
        window.location.href = routes[page];
    }
}

// Función común para toggle del sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

// Función común para actualizar el icono de contexto
function updateContextIcon() {
    const contextIcon = document.getElementById('contextIcon');
    const selector = document.getElementById('club-select-navbar');
    
    if (selector && selector.value === 'my-players') {
        contextIcon.textContent = '👤'; // Icono de usuario personal
    } else {
        contextIcon.textContent = '⚽'; // Icono de club
    }
}

// Función común para mostrar errores
function showError(message) {
    console.error(message);
    // Aquí podrías agregar una notificación visual para el usuario
}