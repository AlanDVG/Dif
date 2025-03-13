const apiUrl = 'http://localhost:5001/api/pacientes'; // Cambia al endpoint correcto de tu servidor

const form = document.getElementById('userForm');
const userTable = document.getElementById('userTable');
let currentUserId = null;

async function fetchUsers() {
    const response = await axios.get(apiUrl);
    const users = response.data;
    userTable.innerHTML = '';
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.paciente}</td>
            <td>${user.edad}</td>
            <td>${user.direccion}</td>
            <td>${user.telefono}</td>
            <td>${user.diagnostico}</td>
            <td>${user.horario}</td>
            <td>${user.dias}</td>
            <td>
                <button class="btn btn-warning btn-sm me-2" onclick="editUser('${user._id}', '${user.paciente}', '${user.edad}', '${user.direccion}', '${user.telefono}', '${user.diagnostico}', '${user.horario}', '${user.dias}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteUser('${user._id}')">Delete</button>
            </td>
        `;
        userTable.appendChild(row);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        if (!currentUserId) {
            await axios.post(apiUrl, data);
        } else {
            await axios.put(`${apiUrl}/${currentUserId}`, data);
        }
        form.reset();
        fetchUsers();
    } catch (error) {
        console.error('Error al guardar el paciente:', error);
        alert('Hubo un error al guardar el paciente. Por favor, inténtalo de nuevo.');
    }
});

function editUser(id, paciente, edad, direccion, telefono, diagnostico, horario, dias) {
    document.getElementById('userId_modal').value = id;
    document.getElementById('paciente_modal').value = paciente;
    document.getElementById('edad_modal').value = edad;
    document.getElementById('direccion_modal').value = direccion;
    document.getElementById('telefono_modal').value = telefono;
    document.getElementById('diagnostico_modal').value = diagnostico;
    document.getElementById('horario_modal').value = horario;
    document.getElementById('dias_modal').value = dias;

    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();

    currentUserId = id;
}

async function updateUserModal() {
    const id = document.getElementById('userId_modal').value;
    const paciente = document.getElementById('paciente_modal').value;
    const edad = document.getElementById('edad_modal').value;
    const direccion = document.getElementById('direccion_modal').value;
    const telefono = document.getElementById('telefono_modal').value;
    const diagnostico = document.getElementById('diagnostico_modal').value;
    const horario = document.getElementById('horario_modal').value;
    const dias = document.getElementById('dias_modal').value;

    const updateData = { paciente, edad, direccion, telefono, diagnostico, horario, dias };

    await axios.put(`${apiUrl}/${id}`, updateData);

    const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
    editModal.hide();

    clearModal();
    fetchUsers();
}

function clearModal() {
    currentUserId = null;
    document.getElementById('userId_modal').value = '';
    document.getElementById('paciente_modal').value = '';
    document.getElementById('edad_modal').value = '';
    document.getElementById('direccion_modal').value = '';
    document.getElementById('telefono_modal').value = '';
    document.getElementById('diagnostico_modal').value = '';
    document.getElementById('horario_modal').value = '';
    document.getElementById('dias_modal').value = '';
}

async function deleteUser(id) {
    if (confirm('¿Estás seguro de eliminar el paciente?')) {
        await axios.delete(`${apiUrl}/${id}`);
        fetchUsers();
    }
}

fetchUsers();

function irAPagina(url) {
    window.location.href = url;
  }