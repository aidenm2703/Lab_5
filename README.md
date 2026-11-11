# Laboratorio 5 - Parte A

API REST de notas con Express, Zod y Swagger UI. Requiere Node.js 20 o superior.

## Ejecutar y probar

1. Ejecutar `npm.cmd install`.
2. Copiar `.env.example` a `.env` si no existe. A funciona sin API key.
3. Ejecutar `npm.cmd run dev` (o `npm.cmd start`).
4. Abrir http://localhost:3000/api-docs y usar **Try it out / Execute**.
5. Ejecutar `npm.cmd test` para verificar CRUD, validacion, errores y Swagger.

En otras terminales se puede usar `npm` en lugar de `npm.cmd`.

## Endpoints de A

| Metodo | Ruta | Resultado |
| --- | --- | --- |
| GET | /api/notas | 200: lista de notas |
| GET | /api/notas/:id | 200: nota; 404 si no existe |
| POST | /api/notas | 201: nota creada y cabecera Location |
| DELETE | /api/notas/:id | 204 sin cuerpo; 404 si no existe |
| GET | /api/health | 200: estado del servidor |
| GET | /api-docs | Swagger UI |
| GET | /api-docs.json | OpenAPI 3.0.3 |

Crear con este JSON:

```json
{ "titulo": "Clase 1", "contenido": "Apuntes de Express" }
```

Copiar el UUID de la respuesta para obtener o eliminar esa nota. Las notas viven en memoria y se pierden al reiniciar. No se usa MySQL ni el antiguo archivo de datos.

El titulo debe tener entre 1 y 200 caracteres y el contenido entre 1 y 10000, despues de recortar espacios. Se rechazan campos adicionales. Un ID mal formado devuelve 400; un UUID valido inexistente devuelve 404. JSON invalido devuelve 400 y un cuerpo mayor a 100 KB devuelve 413. Los errores usan `{ "error": "mensaje" }`; los de Zod incluyen `detalles`. Los fallos internos devuelven 500 sin exponer detalles.

## Estructura y Swagger

- `services/notas.service.js`: almacenamiento en memoria y contrato compartido.
- `controllers/notas.controller.js`: respuestas HTTP.
- `routes/notas.routes.js`: las cuatro operaciones de notas y sus esquemas.
- `routes/endpoint.js`: registra ruta, validacion y OpenAPI juntos.
- `middleware/validar.js`: valida con Zod y deja los datos normalizados en `res.locals.body` o `res.locals.params`.
- `middleware/errorHandler.js`: manejo centralizado, listo para que B amplie los errores de Claude.

## Entrega a B (pendiente de implementar)

La funcion acordada es sincronica: `buscar(id)` recibe un UUID y devuelve una copia de `{ id, titulo, contenido, creadaEn }` o `undefined` si no existe. Importarla desde `services/notas.service.js`. Tambien se exportan `listar()`, `crear({ titulo, contenido })` y `eliminar(id)` (booleano).

B debe instalar el SDK oficial `@anthropic-ai/sdk`, crear `claude.service.js` e `ia.routes.js`, y agregar:

- `POST /api/ia/preguntar`.
- `POST /api/notas/:id/resumen`, usando `buscar(id)` y respondiendo 404 si no existe.
- Documentacion y pruebas de esas operaciones; manejo de errores del proveedor.

Puede usar `routes/endpoint.js` para documentar y validar sus rutas. El helper recibe paths completos relativos a `/api`; montar su router en `routes/index.js` sin repetir prefijos. Los controladores pueden ser async: Express 5 entrega sus rechazos al errorHandler. La clave se lee solo en backend desde `process.env.ANTHROPIC_API_KEY`.

La integracion DeepSeek anterior queda en sus archivos como referencia historica, sin rutas activas. No satisface la integracion Claude requerida por B.

## Git y trabajo en pareja

A trabaja en `feature/notas`; B en `feature/ia`. No subir directamente a main. Crear un PR hacia main y pedir revision a la pareja; la aprobacion y los comentarios deben realizarlos las personas participantes. Cada integrante necesita al menos cinco commits significativos.

Para que B tome esta base despues del push:

```bash
git fetch origin
git switch feature/ia
git merge origin/feature/notas
```

Si aun no tiene rama: `git switch -c feature/ia origin/feature/notas`.

Nunca agregar `.env`, claves ni capturas de credenciales. `.env.example` contiene solo variables vacias. La parte A no realiza solicitudes al proveedor de IA.
