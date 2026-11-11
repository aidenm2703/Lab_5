# Laboratorio 5 - API de notas con DeepSeek

API REST construida con Express, Zod, Swagger UI y DeepSeek. Las notas viven en memoria: se reinician al detener el servidor.

## Ejecutar

1. Ejecutar `npm.cmd install`.
2. Copiar `.env.example` como `.env` y asignar localmente `DEEPSEEK_API_KEY`.
3. Ejecutar `npm.cmd run dev` o `npm.cmd start`.
4. Abrir `http://localhost:3000/api-docs`.
5. Ejecutar `npm.cmd test`.

No se debe subir `.env` ni una API key. `DEEPSEEK_BASE_URL` y `DEEPSEEK_MODEL` son opcionales; sus valores por defecto son `https://api.deepseek.com` y `deepseek-flash`.

## Endpoints

| Metodo | Ruta | Resultado |
| --- | --- | --- |
| GET | /api/health | Estado de la API |
| GET | /api/notas | Lista de notas |
| POST | /api/notas | Crea una nota |
| GET | /api/notas/:id | Obtiene una nota |
| DELETE | /api/notas/:id | Elimina una nota |
| POST | /api/ia/preguntar | Consulta libre a DeepSeek |
| POST | /api/notas/:id/resumen | Resume una nota en exactamente tres vinetas en espanol |

Crear una nota:

```json
{ "titulo": "Clase 1", "contenido": "Apuntes de Express y Zod" }
```

Preguntar a DeepSeek:

```json
{ "pregunta": "Explica que es una API REST en una frase." }
```

Para resumir, usar el UUID devuelto al crear la nota. Si el ID es un UUID valido pero no existe, la API responde `404` antes de solicitar el resumen a DeepSeek. Las preguntas vacias, campos extra o preguntas de mas de 2000 caracteres devuelven `400`.

## Errores y pruebas

Los errores tienen la forma `{ "error": "mensaje" }`; los errores de Zod incluyen `detalles`. Los errores del proveedor IA se manejan de forma centralizada: falta de configuracion devuelve `503`, y una respuesta invalida o fallo de DeepSeek devuelve `502` sin exponer detalles del proveedor.

La prueba automatizada verifica CRUD, validacion, Swagger, preguntas libres, resumen de una nota y el caso `404` que evita llamar a IA. Para la prueba cruzada manual: A debe probar `POST /api/ia/preguntar` y `POST /api/notas/:id/resumen`; B debe crear, consultar y eliminar notas con el CRUD de A.

## Reflexion

- Zod evita que datos invalidos lleguen a servicios y mantiene los contratos visibles en Swagger.
- Separar controlador, servicio y middleware permite cambiar el proveedor de IA sin alterar las rutas.
- El resumen busca la nota antes de llamar a la IA: es mas rapido, evita costo innecesario y devuelve el `404` correcto.

## Trabajo en pareja

La parte A cubre Express, Swagger, CRUD, Zod para notas y los errores generales. La parte B cubre DeepSeek, preguntas libres, resumenes, validacion de preguntas, errores de IA, documentacion y pruebas de sus endpoints. Los cambios se integran mediante pull requests revisados por la otra persona.
