const trabajadorSelect = document.getElementById('trabajador');
const pacientesSelect = document.getElementById('pacientes');
const atencionForm = document.getElementById('atencionForm');

// Cargar trabajadores y pacientes al iniciar la página
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Obtener trabajadores
        const trabajadoresResponse = await axios.get('/api/trabajadores');
        const trabajadores = trabajadoresResponse.data;
        trabajadores.forEach(trabajador => {
            const option = document.createElement('option');
            option.value = JSON.stringify({
                nombre: trabajador.usuario,
                cargo: trabajador.puesto,
                puesto: trabajador.area,
            });
            option.textContent = `${trabajador.usuario} (${trabajador.puesto})`;
            trabajadorSelect.appendChild(option);
        });

        // Obtener pacientes
        const pacientesResponse = await axios.get('/api/pacientes');
        const pacientes = pacientesResponse.data;
        pacientes.forEach(paciente => {
            const option = document.createElement('option');
            option.value = JSON.stringify({
                nombre: paciente.paciente,
                diagnostico: paciente.diagnostico,
                horario: paciente.horario,
            });
            option.textContent = `${paciente.paciente} (${paciente.diagnostico})`;
            pacientesSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
});

// Enviar el formulario
atencionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const trabajador = JSON.parse(trabajadorSelect.value);
    const pacientesSeleccionados = Array.from(pacientesSelect.selectedOptions).map(option => JSON.parse(option.value));

    if (!trabajador || pacientesSeleccionados.length === 0) {
        alert('Seleccione un trabajador y al menos un paciente');
        return;
    }

    try {
        // Crear un registro de atención por cada paciente seleccionado
        const respuestas = await Promise.all(
            pacientesSeleccionados.map(paciente =>
                axios.post('/api/atenciones', { trabajador, paciente })
            )
        );

        alert('Atenciones registradas exitosamente');
        console.log('Respuestas del servidor:', respuestas.map(res => res.data));
    } catch (error) {
        console.error('Error al registrar las atenciones:', error);
        alert('Hubo un error al registrar las atenciones');
    }
});


function irAPagina(url) {
    window.location.href = url;
  }