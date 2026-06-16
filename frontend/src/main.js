// Gestor de tareas (CRUD) usando Fetch y una API RESTful local (json-server)
// Si el servidor no responde, guardamos los datos en localStorage para que no se pierdan.

const API_URL = 'http://localhost:3000/tasks';
const USERS_API_URL = 'http://localhost:3000/users';
const STORAGE_KEY = 'crud-tasks-local';
const USERS_STORAGE_KEY = 'crud-users-local';

// Aquí guardamos los elementos del formulario y la lista que ya existen en HTML.
const form = document.getElementById('task-form');
const userSelect = document.getElementById('user');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const statusSelect = document.getElementById('status');
const tasksList = document.getElementById('tasks-list');

// Esta es la lista de usuarios que traemos de la API y usamos para mostrar nombres.
let usersList = [];

// Guarda las tareas en el navegador para poder usarlas cuando no haya conexión.
function saveTasksToStorage(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Lee las tareas que guardamos en localStorage si no hay servidor.
function loadTasksFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}

// Guarda la lista de usuarios en el navegador para usarla sin volver a pedirla.
function saveUsersToStorage(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Lee la lista de usuarios guardada en el navegador.
function loadUsersFromStorage() {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}

// Crea un id local para tareas cuando no hay servidor y necesitamos uno nuevo.
function createLocalId(tasks) {
    const ids = tasks.map(task => Number(task.id) || 0);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    return maxId + 1;
}

// Llena el menú de usuarios con las opciones que vienen de la API.
function fillUserSelect(users) {
    userSelect.innerHTML = '<option value="">Selecciona un usuario</option>';
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        userSelect.appendChild(option);
    });
}

// Busca el nombre del usuario según el id que tenga la tarea.
function getUserName(userId) {
    if (userId === null || userId === undefined) return null;
    const id = Number(userId);
    if (userId && isNaN(id)) return userId;
    if (!id) return null;
    const user = usersList.find(user => String(user.id) === String(id));
    return user ? user.name : null;
}

// -------------------------
// READ: obtener y mostrar tareas
// -------------------------
async function fetchTasks() {
    try {
        const res = await fetch(API_URL); // Pide las tareas al servidor local.
        const data = await res.json();
        console.log('Respuesta GET /tasks:', data); // Muestra lo que responde el servidor.
        renderTasks(data); // Dibuja la lista de tareas en la pantalla.
        saveTasksToStorage(data); // Guarda una copia por si el servidor cae.
    } catch (err) {
        console.warn('No se pudo conectar con la API, usando almacenamiento local.', err);
        const localTasks = loadTasksFromStorage();
        renderTasks(localTasks); // Usa la copia local cuando no hay servidor.
    }
}

async function fetchUsers() {
    try {
        const res = await fetch(USERS_API_URL); // Pide los usuarios al servidor local.
        if (!res.ok) {
            throw new Error(`Error HTTP ${res.status}`);
        }

        let data = await res.json();
        console.log('Respuesta GET /users:', data);

        if (!Array.isArray(data)) {
            data = data.users || data.data || [];
        }

        if (!Array.isArray(data)) {
            throw new Error('Formato inesperado en /users: se esperaba un array.');
        }

        usersList = data; // Guardamos usuarios en memoria para poder buscar nombres después.
        fillUserSelect(usersList); // Carga el select con los nombres de usuario.
        saveUsersToStorage(usersList); // Guarda los usuarios en localStorage también.

        if (usersList.length === 0) {
            console.warn('No se encontraron usuarios en /users.');
        }
    } catch (err) {
        console.warn('No se pudo conectar con /users. Usando usuarios en localStorage.', err);
        usersList = loadUsersFromStorage();
        fillUserSelect(usersList); // Si no hay servidor, usamos la versión guardada.
    }
}

// Convierte los datos JSON en elementos HTML y los muestra en la lista.
function renderTasks(tasks) {
    tasksList.innerHTML = '';

    if (!tasks || tasks.length === 0) {
        tasksList.innerHTML = '<li>No hay tareas.</li>';
        return;
    }

    tasks.forEach(task => {
        const li = document.createElement('li');
        const content = document.createElement('div');

        // Aquí mostramos el título con una etiqueta clara.
        const title = document.createElement('div');
        title.className = 'task-title';
        title.innerHTML = `<strong>Título:</strong> ${task.title}`;
        content.appendChild(title);

        // Información del usuario que creó la tarea.
        const userInfo = document.createElement('div');
        userInfo.className = 'meta';

        const taskUserId = task.userId || task.user;
        const userIdText = `Usuario: ${taskUserId || 'desconocido'}`;
        const userNameText = `Nombre: ${getUserName(taskUserId) || 'desconocido'}`;

        const userIdLine = document.createElement('div');
        userIdLine.textContent = userIdText;
        const userNameLine = document.createElement('div');
        userNameLine.textContent = userNameText;

        userInfo.appendChild(userIdLine);
        userInfo.appendChild(userNameLine);
        content.appendChild(userInfo);

        // Aquí mostramos la descripción con etiqueta.
        const desc = document.createElement('div');
        desc.className = 'meta';
        desc.textContent = `Descripción: ${task.description}`;
        content.appendChild(desc);

        // Estado y id de la tarea, para saber en qué punto está.
        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = `Estado: ${task.status || 'pendiente'} • id: ${task.id}`;
        content.appendChild(meta);

        // Botones de acción para editar o borrar.
        const actions = document.createElement('div');
        actions.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.className = 'edit';
        editBtn.addEventListener('click', () => handleEdit(task));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.className = 'delete';
        deleteBtn.addEventListener('click', () => handleDelete(task.id));

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(content);
        li.appendChild(actions);
        tasksList.appendChild(li);
    });
}

// -------------------------
// CREATE: crear una tarea nueva
// -------------------------
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario.

    if (!userSelect.value) {
        return alert('Por favor seleccione un usuario.');
    }

    // Esta constante guarda los datos que vamos a mandar a la API.
    const newTask = {
        userId: Number(userSelect.value),
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        status: statusSelect.value
    };

    if (!newTask.title || !newTask.description) {
        return alert('Por favor complete todos los campos: título y descripción.');
    }

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });

        const created = await res.json();
        console.log('Respuesta POST /tasks:', created);

        await fetchTasks(); // Vuelve a cargar la lista para que aparezca la nueva tarea.
        form.reset(); // Limpia el formulario para la próxima tarea.
    } catch (err) {
        console.warn('No se pudo conectar con la API. Se guarda la tarea en localStorage.', err);

        const localTasks = loadTasksFromStorage();
        const localTask = { ...newTask, id: createLocalId(localTasks) };
        localTasks.push(localTask);
        saveTasksToStorage(localTasks);
        renderTasks(localTasks);
        form.reset();
    }
});

// -------------------------
// DELETE: eliminar por id
// -------------------------
async function handleDelete(id) {
    const confirmDelete = confirm(`¿Seguro que desea eliminar la tarea con id ${id}?`);
    if (!confirmDelete) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        await res.json().catch(() => ({}));
        console.log(`Respuesta DELETE /tasks/${id}`);
        await fetchTasks();
    } catch (err) {
        console.warn('No se pudo conectar con la API. Se elimina la tarea en localStorage.', err);

        const localTasks = loadTasksFromStorage().filter(task => Number(task.id) !== Number(id));
        saveTasksToStorage(localTasks);
        renderTasks(localTasks);
    }
}

// -------------------------
// UPDATE: editar una tarea (usando PATCH)
// -------------------------
async function handleEdit(task) {
    const userOptions = usersList.map(user => `${user.id}: ${user.name}`).join('\n');
    const newUserIdInput = prompt(`Seleccione el id del usuario:\n${userOptions}`, task.userId || task.user || '');
    if (newUserIdInput === null) return;

    const newUserId = Number(newUserIdInput);
    const validUser = usersList.some(user => String(user.id) === String(newUserId));
    if (!newUserId || !validUser) {
        return alert('Usuario inválido.');
    }

    const newTitle = prompt('Nuevo título para la tarea:', task.title);
    if (newTitle === null) return;

    const newDescription = prompt('Nueva descripción:', task.description || '');
    if (newDescription === null) return;

    const newStatus = prompt('Nuevo estado (pendiente / en progreso / completado):', task.status || 'pendiente');
    if (newStatus === null) return;

    const updated = {
        userId: newUserId,
        title: newTitle.trim(),
        description: newDescription.trim(),
        status: newStatus.trim() || task.status
    };

    if (!updated.title || !updated.description) {
        return alert('Los campos título y descripción no pueden quedar vacíos.');
    }

    try {
        const res = await fetch(`${API_URL}/${task.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });

        const data = await res.json();
        console.log(`Respuesta PATCH /tasks/${task.id}:`, data);
        await fetchTasks();
    } catch (err) {
        console.warn('No se pudo conectar con la API. Se actualiza la tarea en localStorage.', err);

        const localTasks = loadTasksFromStorage().map(item => {
            if (Number(item.id) === Number(task.id)) {
                return { ...item, ...updated };
            }
            return item;
        });
        saveTasksToStorage(localTasks);
        renderTasks(localTasks);
    }
}

// -------------------------
// Inicialización: al cargar la página listamos los usuarios y las tareas
// -------------------------
document.addEventListener('DOMContentLoaded', async () => {
    await fetchUsers(); // Primero traemos la lista de usuarios.
    await fetchTasks(); // Después mostramos las tareas en pantalla.
});

// Nota final en código:
// - Se requiere `json-server` para persistencia real en bakent/db.json.
// - Si el servidor no está disponible, el código usa localStorage para que las tareas no se borren.
// - El id es crítico en DELETE/UPDATE para identificar qué tarea modificar o eliminar.

