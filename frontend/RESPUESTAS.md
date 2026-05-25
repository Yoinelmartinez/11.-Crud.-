# Respuestas y documentación - Actividad CRUD

Parte 1: Comprendiendo antes de programar

1. ¿Qué método HTTP usarían para:
- Crear una tarea: **POST**
- Listar tareas: **GET**
- Actualizar una tarea: **PUT** o **PATCH** (aquí usamos **PATCH** para cambios parciales)
- Eliminar una tarea: **DELETE**

2. ¿Qué información necesitarían enviar al servidor para actualizar o eliminar una tarea?
- Para actualizar: el `id` de la tarea (en la URL) y los campos a modificar en el cuerpo (por ejemplo `{ "title": "Nuevo título" }`).
- Para eliminar: el `id` de la tarea (en la URL). No suele requerirse cuerpo, solo el identificador.

3. ¿En qué momento debe actualizarse el DOM?
- El DOM debe actualizarse después de recibir la respuesta del servidor que confirma la operación (por ejemplo, después del `POST` que devuelve la tarea creada, o después del `DELETE` que confirma la eliminación). También es válido actualizar inmediatamente por optimismo (optimistic UI) y luego revertir si falla la petición, pero en este ejercicio se actualiza tras la respuesta.

Parte 2: Implementación Guiada - Preguntas específicas

2. Listar tareas (READ)
- ¿En qué momento se transforman los datos JSON en elementos HTML?
  - Tras recibir la respuesta y parsearla con `res.json()`. En el código la transformación ocurre en `renderTasks()` que recibe el array de objetos JSON y crea nodos DOM.

3. Crear tarea (CREATE)
- ¿Qué ocurre primero: se actualiza el DOM o se envía la solicitud al servidor?
  - En la implementación aquí, se envía la solicitud al servidor primero (`fetch` con `POST`), se espera la respuesta, y luego se actualiza el DOM volviendo a listar las tareas (`fetchTasks()`).

4. Eliminar tarea (DELETE)
- ¿Por qué es importante el id en esta operación?
  - El `id` identifica de forma única el recurso (tarea) en la API; sin él el servidor no sabría cuál registro eliminar.

5. Actualizar tarea (UPDATE)
- ¿Qué diferencia existe entre modificar un dato en el DOM y modificarlo en el servidor?
  - Modificar el DOM solo cambia la representación visual en el navegador; no persiste los cambios en la fuente de datos. Modificar en el servidor cambia la fuente de verdad (base de datos/archivo JSON). Para que los cambios sean persistentes y consistentes entre clientes hay que actualizar el servidor y luego reflejar ese cambio en el DOM.

Parte 3: Identificación del Ciclo Completo (esquema)

- Acción del usuario: hace clic en "Guardar", "Eliminar" o "Editar".
- Evento capturado en JavaScript: `submit`, `click` en botones.
- Solicitud HTTP enviada: `POST /tasks`, `DELETE /tasks/:id`, `PATCH /tasks/:id`, `GET /tasks`.
- Respuesta del servidor: JSON con la tarea creada / objeto vacío / tarea actualizada / lista de tareas.
- Actualización del DOM: se llama a `renderTasks()` para recrear la lista con los datos actuales.

Reflexión Final

- ¿Qué operación les resultó más sencilla?
  - Listar (GET) suele ser la más sencilla porque no requiere enviar cuerpo ni confirmaciones adicionales.
- ¿Cuál fue la más compleja y por qué?
  - Actualizar (PATCH/PUT) puede ser más compleja cuando se necesita validar campos, manejar cambios parciales y sincronizar UI con el servidor.
- ¿En qué parte del ciclo sintieron mayor dificultad: en la comunicación con la API o en la manipulación del DOM?
  - En este ejercicio las operaciones de red son directas (json-server facilita), la parte que puede traer más errores es la validación y sincronización del DOM con la respuesta real del servidor.

Evidencias y uso

- Código fuente: ver carpeta `frontend` con `index.html`, `app.js`, `style.css`.
- Para correr localmente (requerido `json-server`):

```bash
npx json-server --watch bakent/db.json --port 3000
```

- Luego abrir `frontend/index.html` en el navegador (o servir la carpeta con un servidor estático si lo prefiere).
