// Importar dependencias
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require("path");
const app = express();
const PORT = 5001;

// Middlewares
app.use(cors());
app.use(express.json());


// Configurar middleware para servir archivos estáticos desde la carpeta css
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/Imagenes', express.static(path.join(__dirname, 'img')));
app.use('/Js', express.static(path.join(__dirname, 'js')));
app.use(express.static(__dirname));

// Ruta para servir index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'Login.html',));//  /Vistas/Altas_empleados.html    Login.html  Alta_pacientes.html  registros.html  tablas.html  grafias.html
  })

    // Conectar a MongoDB (base de datos DIF)
const mongoURI = 'mongodb+srv://Admin:la000@proyectodif.du0tm.mongodb.net/DIF'; // URI para la base de datos DIF
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Conexión a MongoDB exitosa');
    })
    .catch((error) => {
        console.log('Error de conexión a MongoDB', error);
    });

// Definir el esquema y el modelo de Trabajador en MongoDB
const trabajadorSchema = new mongoose.Schema({
    usuario: String,
    area: String,
    puesto: String,
    telefono: String,
    contra: String,
});

const Trabajador = mongoose.model('Trabajador', trabajadorSchema);

// Obtener todos los trabajadores
app.get('/api/trabajadores', async (req, res) => {
    try {
        const trabajadores = await Trabajador.find();
        res.json(trabajadores);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener trabajadores' });
    }
});

// Crear un nuevo trabajador
app.post('/api/trabajadores', async (req, res) => {
    const { usuario, area, puesto, telefono, contra } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(contra, 10);
        const newTrabajador = new Trabajador({ usuario, area, puesto, telefono, contra: hashedPassword });
        await newTrabajador.save();
        res.status(201).json(newTrabajador);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear trabajador' });
    }
});

// Actualizar un trabajador
app.put('/api/trabajadores/:id', async (req, res) => {
    const { id } = req.params;
    const { usuario, area, puesto, telefono, contra } = req.body;
    try {
        let updateData = { usuario, area, puesto, telefono };

        // Si se proporciona una nueva contraseña, la encriptamos
        if (contra) {
            const hashedPassword = await bcrypt.hash(contra, 10);
            updateData.contra = hashedPassword;
        }

        const trabajador = await Trabajador.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!trabajador) {
            return res.status(404).json({ message: 'Trabajador no encontrado' });
        }

        res.json(trabajador);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar trabajador' });
    }
});

// Eliminar un trabajador
app.delete('/api/trabajadores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const trabajador = await Trabajador.findByIdAndDelete(id);
        if (!trabajador) {
            return res.status(404).json({ message: 'Trabajador no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar trabajador' });
    }
});


// Login
app.post('/login', async (req, res) => {
    const { usuario, contra } = req.body;

    if (!usuario || !contra) {
        return res.status(400).json({ message: 'Faltan datos para el inicio de sesión' });
    }

    try {
        const trabajador = await Trabajador.findOne({ usuario });
        if (!trabajador) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const isPasswordValid = await bcrypt.compare(contra, trabajador.contra);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Incluir el puesto del trabajador en la respuesta
        res.status(200).json({ 
            message: 'Inicio de sesión exitoso',
            puesto: trabajador.puesto  // Usar el campo "puesto"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error en el servidor durante el inicio de sesión' });
    }
});

// Definir el esquema y el modelo de Paciente en MongoDB
// Esquema y modelo de Paciente
const pacienteSchema = new mongoose.Schema({
    paciente: String,
    edad: String,
    direccion: String,
    telefono: String,
    diagnostico: String,
    horario: String,
    dias: String,
});
const Paciente = mongoose.model('Paciente', pacienteSchema);

// Rutas de Paciente
app.get('/api/pacientes', async (req, res) => {
    try {
        const pacientes = await Paciente.find();
        res.json(pacientes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pacientes' });
    }
});

app.post('/api/pacientes', async (req, res) => {
    const { paciente, edad, direccion, telefono, diagnostico, horario, dias } = req.body;
    try {
        // Validación básica
        if (!paciente || !edad || !direccion || !telefono) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        const newPaciente = new Paciente({ paciente, edad, direccion, telefono, diagnostico, horario, dias });
        await newPaciente.save();
        res.status(201).json(newPaciente);
    } catch (error) {
        console.error('Error al crear paciente:', error);
        res.status(500).json({ message: 'Error al crear paciente', error: error.message });
    }
});

app.put('/api/pacientes/:id', async (req, res) => {
    const { id } = req.params;
    const { paciente, edad, direccion, telefono, diagnostico, horario, dias } = req.body;
    try {
        const updateData = { paciente, edad, direccion, telefono, diagnostico, horario, dias };
        const pacienteActualizado = await Paciente.findByIdAndUpdate(id, updateData, { new: true });
        if (!pacienteActualizado) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }
        res.json(pacienteActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar paciente' });
    }
});

app.delete('/api/pacientes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const paciente = await Paciente.findByIdAndDelete(id);
        if (!paciente) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar paciente' });
    }
});

//registros
const registroSchema = new mongoose.Schema({
    nombre: String,
    puesto: String,
    area: String,
    pacientes: Number,
    fecha: Date,
});

const registro = mongoose.model('registro', registroSchema);
app.use(express.json());

app.post('/api/registro', async (req, res) => {
    const { nombre, puesto, area, pacientes, fecha } = req.body;

    if (!nombre || !puesto || !area || !pacientes || !fecha) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        const nuevoRegistro = new registro({ nombre, puesto, area, pacientes, fecha });
        await nuevoRegistro.save();
        res.status(200).json({ message: 'Datos registrados exitosamente' });
    } catch (error) {
        console.error('Error al guardar en MongoDB:', error);
        res.status(500).json({ message: 'Error al registrar los datos', error });
    }
});


// Esquema para la relación trabajador-paciente
const atencionSchema = new mongoose.Schema({
    trabajador: {
        nombre: String,
        cargo: String,
        puesto: String,
    },
    paciente: {
        nombre: String,
        diagnostico: String,
        horario: String,
    },
    fecha: {
        type: String, // Cambiar a String en lugar de Date
        default: () => new Date().toISOString().split('T')[0], // Guardar solo YYYY-MM-DD
    },
});

const Atencion = mongoose.model('Atencion', atencionSchema);

// Ruta para obtener todos los registros de atención
app.get('/api/atenciones', async (req, res) => {
    try {
        const atenciones = await Atencion.find();
        res.json(atenciones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las atenciones', error });
    }
});

// Ruta para crear un nuevo registro de atención
app.post('/api/atenciones', async (req, res) => {
    const { trabajador, paciente } = req.body;

    if (!trabajador || !paciente) {
        return res.status(400).json({ message: 'Faltan datos del trabajador o paciente' });
    }

    try {
        const nuevaAtencion = new Atencion({ trabajador, paciente });
        await nuevaAtencion.save();
        res.status(201).json(nuevaAtencion);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la atención', error });
    }
});

// prueba 1 ////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Ruta para obtener áreas únicas
// Ruta para obtener el número de pacientes atendidos por trabajador y área, agrupados por semana
app.get('/api/atenciones/semana', async (req, res) => {
    const { area } = req.query; // Obtener el área desde la consulta

    try {
        const match = {};
        if (area) match["trabajador.puesto"] = area; // Aplicar filtro por área

        const atenciones = await Atencion.aggregate([
            { $match: match }, // Aplicar el filtro
            {
                $group: {
                    _id: {
                        trabajador: "$trabajador.nombre",
                        area: "$trabajador.puesto",
                        semana: { $week: { $toDate: "$fecha" } },
                        año: { $year: { $toDate: "$fecha" } },
                    },
                    totalPacientes: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.año": 1, "_id.semana": 1 },
            },
        ]);
        //console.log("Datos agrupados por semana:", atenciones); // Depuración
        res.json(atenciones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los datos', error });
    }
});

// Ruta para obtener el número de pacientes atendidos por trabajador y área, agrupados por mes
app.get('/api/atenciones/mes', async (req, res) => {
    const { area } = req.query; // Obtener el área desde la consulta

    try {
        const match = {};
        if (area) match["trabajador.puesto"] = area; // Aplicar filtro por área

        const atenciones = await Atencion.aggregate([
            { $match: match }, // Aplicar el filtro
            {
                $group: {
                    _id: {
                        trabajador: "$trabajador.nombre",
                        area: "$trabajador.puesto",
                        mes: { $month: { $toDate: "$fecha" } },
                        año: { $year: { $toDate: "$fecha" } },
                    },
                    totalPacientes: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.año": 1, "_id.mes": 1 },
            },
        ]);
        //console.log("Datos agrupados por mes:", atenciones); // Depuración
        res.json(atenciones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los datos', error });
    }
});

// Ruta para obtener el número de pacientes atendidos por trabajador y área, agrupados por trimestre
app.get('/api/atenciones/trimestre', async (req, res) => {
    const { area } = req.query; // Obtener el área desde la consulta

    try {
        const match = {};
        if (area) match["trabajador.puesto"] = area; // Aplicar filtro por área

        const atenciones = await Atencion.aggregate([
            { $match: match }, // Aplicar el filtro
            {
                $group: {
                    _id: {
                        trabajador: "$trabajador.nombre",
                        area: "$trabajador.puesto",
                        trimestre: {
                            $ceil: { $divide: [{ $month: { $toDate: "$fecha" } }, 3] },
                        },
                        año: { $year: { $toDate: "$fecha" } },
                    },
                    totalPacientes: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.año": 1, "_id.trimestre": 1 },
            },
        ]);
        //console.log("Datos agrupados por trimestre:", atenciones); // Depuración
        res.json(atenciones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los datos', error });
    }
});

// Ruta para obtener el número de pacientes atendidos por trabajador y área, agrupados por año
app.get('/api/atenciones/año', async (req, res) => {
    const { area } = req.query; // Obtener el área desde la consulta

    try {
        const match = {};
        if (area) match["trabajador.puesto"] = area; // Aplicar filtro por área

        const atenciones = await Atencion.aggregate([
            { $match: match }, // Aplicar el filtro
            {
                $group: {
                    _id: {
                        trabajador: "$trabajador.nombre",
                        area: "$trabajador.puesto",
                        año: { $year: { $toDate: "$fecha" } },
                    },
                    totalPacientes: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.año": 1 },
            },
        ]);
        //console.log("Datos agrupados por año:", atenciones); // Depuración
        res.json(atenciones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los datos', error });
    }
});





// prueba 2//////////////////////////////////////////////////////////////////////////////////

// Ruta para obtener las áreas únicas
app.get('/api/atenciones/areas', async (req, res) => {
    try {
        const areas = await Atencion.distinct("trabajador.puesto");
        res.json(areas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las áreas', error });
    }
});
// Ruta para obtener los datos de atención filtrados por trabajador y área
app.get('/api/atenciones/filtro', async (req, res) => {
    const { trabajador, area, periodo } = req.query;

    try {
        let match = {};
        if (trabajador) match["trabajador.nombre"] = trabajador;
        if (area) match["trabajador.puesto"] = area;

        const atenciones = await Atencion.aggregate([
            { $match: match },
            {
                $group: {
                    _id: {
                        trabajador: "$trabajador.nombre",
                        area: "$trabajador.puesto",
                        periodo: obtenerPeriodoAgrupacion(periodo, "$fecha"),
                    },
                    totalPacientes: { $sum: 1 },
                },
            },
            { $sort: { "_id.periodo": 1 } },
        ]);

        res.json(atenciones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los datos', error });
    }
});

// Función para determinar el período de agrupación
function obtenerPeriodoAgrupacion(periodo, fecha) {
    switch (periodo) {
        case 'semana':
            return { $week: { $toDate: fecha } };
        case 'mes':
            return { $month: { $toDate: fecha } };
        case 'trimestre':
            return {
                $ceil: { $divide: [{ $month: { $toDate: fecha } }, 3] },
            };
        case 'año':
            return { $year: { $toDate: fecha } };
        default:
            return null;
    }
}



// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
