const calendarElement = document.getElementById('calendar');
const monthSelect = document.getElementById('monthSelect');
const yearSelect = document.getElementById('yearSelect');
let selectedDay;

// Generar opciones de año
function populateYears() {
  const currentYear = new Date().getFullYear();
  for (let year = currentYear - 5; year <= currentYear + 5; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
  yearSelect.value = currentYear;
}
populateYears();

// Generar calendario cuando se selecciona un mes o año
monthSelect.addEventListener('change', generateCalendar);
yearSelect.addEventListener('change', generateCalendar);
generateCalendar();

function generateCalendar() {
  const month = parseInt(monthSelect.value);
  const year = parseInt(yearSelect.value);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendarElement.innerHTML = '';

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.classList.add('col-2', 'calendar-cell');
    cell.textContent = day;
    cell.dataset.day = day;
    cell.addEventListener('click', () => openDocumentModal(day, month, year));
    calendarElement.appendChild(cell);
  }
}

function openDocumentModal(day, month, year) {
  selectedDay = `${year}-${month}-${day}`;
  const savedDocument = localStorage.getItem(selectedDay);

  if (savedDocument) {
    alert(`Documento guardado en ${selectedDay}: ${savedDocument}`);
  } else {
    const documentModal = new bootstrap.Modal(document.getElementById('documentModal'));
    documentModal.show();
  }
}

document.getElementById('saveDocument').addEventListener('click', saveDocument);

function saveDocument() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      localStorage.setItem(selectedDay, e.target.result);
      alert('Documento guardado exitosamente.');
    };
    reader.readAsDataURL(file);
  }
}

function irAPagina(url) {
  window.location.href = url;
}