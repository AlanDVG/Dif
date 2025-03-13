function validarFormulario(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    document.getElementById('loading-spinner').style.display = 'block';

    fetch('http://localhost:5001/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario: username, contra: password }),
    })
    .then(response => {
        document.getElementById('loading-spinner').style.display = 'none';

        if (!response.ok) {
            return response.json().then(errMessage => { 
                throw new Error(errMessage.message); 
            });
        }

        // Si la respuesta es exitosa, leerla como JSON
        return response.json();
    })
    .then(data => {
        console.log('Inicio de sesión exitoso:', data);
        alert(data.message);  // Mostrar el mensaje del objeto JSON

        // Redirigir según el puesto del empleado
        if (data.puesto === 'Administrador') {
            window.location.href = '../Vistas/menu.html';  // Redirigir a menu.html si es administrador
        } else {
            window.location.href = '../Vistas/menu2.html';  // Redirigir a menu2.html si no es administrador
        }
    })
    .catch(error => {
        console.error('Error:', error.message);
        alert(error.message);  // Mostrar el mensaje del error
    });
}