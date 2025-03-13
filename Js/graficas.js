const trabajadorSelect = document.getElementById('trabajador');
const areaSelect = document.getElementById('area');
const periodoSelect = document.getElementById('periodo');
const atencionesChartCanvas = document.getElementById('atencionesChart').getContext('2d');

let atencionesChart;

// Cargar trabajadores y áreas al iniciar la página
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const trabajadoresResponse = await axios.get('/api/trabajadores');
        const areasResponse = await axios.get('/api/atenciones/areas');

        // Llenar el select de trabajadores
        trabajadoresResponse.data.forEach(trabajador => {
            const option = document.createElement('option');
            option.value = trabajador.usuario;
            option.textContent = trabajador.usuario;
            trabajadorSelect.appendChild(option);
        });

        // Llenar el select de áreas
        areasResponse.data.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            areaSelect.appendChild(option);
        });

        // Cargar datos iniciales
        cargarDatos();
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
});

// Cargar datos al cambiar los filtros
trabajadorSelect.addEventListener('change', cargarDatos);
areaSelect.addEventListener('change', cargarDatos);
periodoSelect.addEventListener('change', cargarDatos);

// Función para cargar los datos y actualizar la gráfica
async function cargarDatos() {
    const trabajador = trabajadorSelect.value;
    const area = areaSelect.value;
    const periodo = periodoSelect.value;

    try {
        const response = await axios.get('/api/atenciones/filtro', {
            params: { trabajador, area, periodo },
        });
        const datos = response.data;
        actualizarGrafica(datos, periodo);
    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }
}

// Función para actualizar la gráfica
function actualizarGrafica(datos, periodo) {
    const labels = datos.map(item => `Período ${item._id.periodo}`);
    const data = datos.map(item => item.totalPacientes);

    if (atencionesChart) {
        atencionesChart.destroy();
    }

    atencionesChart = new Chart(atencionesChartCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes Atendidos',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}