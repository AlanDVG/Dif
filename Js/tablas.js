const periodoSelect = document.getElementById('periodo');
const areaSelect = document.getElementById('area');
const reporteTableBody = document.getElementById('reporteTableBody');
const descargarPdfBtn = document.getElementById('descargarPdf');
const atencionesChartCanvas = document.getElementById('atencionesChart').getContext('2d');

let atencionesChart;

// Cargar áreas al iniciar la página
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Obtener áreas únicas
        const areasResponse = await axios.get('/api/atenciones/areas');
        const areas = areasResponse.data;

        // Llenar el selector de áreas
        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            areaSelect.appendChild(option);
        });

        // Cargar datos iniciales
        cargarDatos();
    } catch (error) {
        console.error('Error al cargar las áreas:', error);
    }
});

// Cargar datos al cambiar el período o el área
periodoSelect.addEventListener('change', cargarDatos);
areaSelect.addEventListener('change', cargarDatos);

// Función para cargar los datos
// Función para cargar los datos
async function cargarDatos() {
    const periodo = periodoSelect.value;
    const area = areaSelect.value;

    try {
        const response = await axios.get(`/api/atenciones/${periodo}`, {
            params: { area }, // Enviar el área como parámetro
        });
        const datos = response.data;
        console.log("Datos recibidos del servidor:", datos); // Depuración
        mostrarDatos(datos, periodo);
        mostrarGrafica(datos, periodo);
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        alert('Hubo un error al cargar los datos');
    }
}

// Función para mostrar los datos en la tabla
function mostrarDatos(datos, periodo) {
    reporteTableBody.innerHTML = '';
    datos.forEach(item => {
        const row = document.createElement('tr');
        const periodoTexto = obtenerPeriodoTexto(item._id, periodo);
        row.innerHTML = `
            <td>${item._id.trabajador}</td>
            <td>${item._id.area}</td>
            <td>${periodoTexto}</td>
            <td>${item.totalPacientes}</td>
        `;
        reporteTableBody.appendChild(row);
    });
}

function obtenerPeriodoTexto(id, periodo) {
    switch (periodo) {
        case 'semana':
            return `Semana ${id.semana} del ${id.año}`;
        case 'mes':
            return `Mes ${id.mes} del ${id.año}`;
        case 'trimestre':
            return `Trimestre ${id.trimestre} del ${id.año}`;
        case 'año':
            return `Año ${id.año}`;
        default:
            return 'Período no válido';
    }
}

// Función para mostrar la gráfica
function mostrarGrafica(datos, periodo) {
    const labels = datos.map(item => `${item._id.trabajador} (${item._id.area})`);
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

// Función para descargar la tabla y la gráfica como PDF
descargarPdfBtn.addEventListener('click', async () => {
    const tabla = document.getElementById('reporteTable');
    const grafica = document.getElementById('atencionesChart');
    const periodo = periodoSelect.value;

    // Capturar la tabla como imagen
    const tablaCanvas = await html2canvas(tabla);
    const tablaImgData = tablaCanvas.toDataURL('image/png');

    // Capturar la gráfica como imagen
    const graficaCanvas = await html2canvas(grafica);
    const graficaImgData = graficaCanvas.toDataURL('image/png');

    // Crear un PDF
    const pdf = new jspdf.jsPDF('p', 'mm', 'a4'); // Crear un PDF en formato A4
    const imgWidth = 180; // Ancho de la imagen en el PDF
    const tablaImgHeight = (tablaCanvas.height * imgWidth) / tablaCanvas.width; // Altura proporcional de la tabla
    const graficaImgHeight = (graficaCanvas.height * imgWidth) / graficaCanvas.width; // Altura proporcional de la gráfica

    // Agregar la tabla al PDF
    pdf.addImage(tablaImgData, 'PNG', 15, 15, imgWidth, tablaImgHeight);

    // Agregar la gráfica al PDF
    pdf.addPage(); // Agregar una nueva página
    pdf.addImage(graficaImgData, 'PNG', 15, 15, imgWidth, graficaImgHeight);

    // Guardar el PDF
    pdf.save(`reporte_${periodo}.pdf`);
});

function irAPagina(url) {
    window.location.href = url;
}

trabajadorSelect.addEventListener('change', cargarDatos);
