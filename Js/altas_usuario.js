const apiUrl = 'http://localhost:5001/api/trabajador'; // Cambia al endpoint correcto de tu servidor

const form = document.getElementById('userForm');
const userTable = document.getElementById('userTable');
let currentUserId = null;
let existingUsers = []; // Array para almacenar los usuarios existentes

async function fetchUsers() {
    const response = await axios.get('/api/trabajadores');
    const users = response.data;
    existingUsers = users.map(user => user.usuario.toLowerCase()); // Guardamos los nombres en minúsculas para comparación
    userTable.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.usuario}</td>
            <td>${user.area}</td>
            <td>${user.puesto}</td>
            <td>${user.telefono}</td>
            <td>${user.contra}</td>
            <td>
                <button class="btn btn-warning btn-sm me-2" onclick="editUser('${user._id}', '${user.usuario}', '${user.area}', '${user.puesto}', '${user.telefono}', '${user.contra}')">Edit</button>
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

    // Verificar si el usuario ya existe
    if (existingUsers.includes(data.usuario.toLowerCase())) {
        alert("Error: El nombre de usuario ya existe. Por favor, elige otro.");
        return;
    }

    if (!currentUserId) {
        await axios.post('/api/trabajadores', data);
    }

    form.reset();
    fetchUsers();
});


function editUser(id, usuario, area, puesto, telefono, contra) {
    document.getElementById('userId_modal').value = id;
    document.getElementById('usuario_modal').value = usuario;
    document.getElementById('area_modal').value = area;
    document.getElementById('puesto_modal').value = puesto;
    document.getElementById('telefono_modal').value = telefono;
    document.getElementById('contra_modal').value = contra;

    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();

    currentUserId = id;
}

async function updateUserModal() {
    const id = document.getElementById('userId_modal').value;
    const usuario = document.getElementById('usuario_modal').value;
    const area = document.getElementById('area_modal').value;
    const puesto = document.getElementById('puesto_modal').value;
    const telefono = document.getElementById('telefono_modal').value;
    const contra = document.getElementById('contra_modal').value;

    const updateData = { usuario, area, puesto, telefono };
    if (contra) updateData.contra = contra;

    await axios.put(`/api/trabajadores/${id}`, updateData);

    const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
    editModal.hide();

    clearModal();
    fetchUsers();
}

function clearModal() {
    currentUserId = null;
    document.getElementById('userId_modal').value = '';
    document.getElementById('usuario_modal').value = '';
    document.getElementById('area_modal').value = '';
    document.getElementById('puesto_modal').value = '';
    document.getElementById('telefono_modal').value = '';
    document.getElementById('contra_modal').value = '';
}

async function deleteUser(id) {
    if (confirm('¿Estás seguro de eliminar el usuario?')) {
        await axios.delete(`/api/trabajadores/${id}`);
        fetchUsers();
    }
}

fetchUsers();

function irAPagina(url) {
    window.location.href = url;
  }

const contraInput = document.getElementById("contra");
const mensajeError = document.getElementById("error-mensaje");

contraInput.addEventListener("input", function () {
if (this.value.length < 8 || this.value.length > 16) {
          mensajeError.style.display = "block"; // Muestra el mensaje
} else {
          mensajeError.style.display = "none"; // Oculta el mensaje cuando es válido
}
});