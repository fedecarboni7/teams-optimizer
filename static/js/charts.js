
// Variables globales para almacenar gráficos por número de contenedor
window.radarCharts = {};
window.barCharts = {};

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
    if (window.radarCharts[containerNumber]) {
        window.radarCharts[containerNumber].destroy();
    }

    // Create the new radar chart
    window.radarCharts[containerNumber] = new Chart(ctx, {
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

// Crear gráfico de barras horizontales
function createBarChart(contentContainer) {
    const tableContainer = contentContainer.querySelector('.table-container');
    const chartContainer = contentContainer.querySelector('.bar-chart-container');
    const canvas = chartContainer.querySelector('canvas');
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
    if (window.barCharts[containerNumber]) {
        window.barCharts[containerNumber].destroy();
    }

    // Crear el nuevo gráfico de barras
    window.barCharts[containerNumber] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: skills,
            datasets: [{
                label: 'Equipo 1',
                data: team1Data,
                backgroundColor: 'rgba(54, 162, 235, 0.2)', // Azul
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 3,
                pointBackgroundColor: 'rgb(54, 162, 235)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(54, 162, 235)'
            }, {
                label: 'Equipo 2',
                data: team2Data,
                backgroundColor: 'rgba(255, 99, 132, 0.2)', // Rojo
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 3,
                pointBackgroundColor: 'rgb(255, 99, 132)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(255, 99, 132)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // Cambia la orientación a barras horizontales
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.4)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#e0e0e0'
                    }
                },
                y: {
                    grid: {
                        display: false // Oculta las líneas de la grilla en el eje Y
                    },
                    ticks: {
                        color: '#e0e0e0',
                        font: {
                            size: 14,
                            weight: 500,
                            family:'Segoe UI'
                        }
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

// Inicializar el carrusel Swiper
function createSwiper() {
    const swiper = new Swiper('.swiper', {
        loop: true,
      
        // Navigation arrows
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }
    });
}
