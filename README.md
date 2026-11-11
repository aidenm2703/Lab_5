# Quiz 5

API Express con notas de texto y consultas a DeepSeek. Requiere Node.js 20 o superior.

## Ejecutar

1. Instalar dependencias: `npm install`.
2. Crear `.env` usando `.env.example` y completar `DEEPSEEK_API_KEY` (ya configurada localmente).
3. Ejecutar `npm run dev` o `npm start`.
4. Abrir http://localhost:3000/api-docs y usar **Try it out**.

La especificacion JSON esta en `/api-docs.json`. Las rutas y sus esquemas se registran juntos en `routes/index.js`; al agregar endpoints con `endpoint`, Swagger usa esos mismos esquemas para documentar los cuerpos que valida la API.

## Endpoints

- `GET /api/health`: estado del servidor.
- `GET /api/notas`: listar notas.
- `POST /api/notas`: crear con `{"titulo":"Clase 1","contenido":"Apuntes"}`.
- `POST /api/deepseek/chat`: consultar con `{"mensaje":"Explica que es una API"}`.

Las notas se guardan en `data/notas.json`. Esta persistencia es para uso local en un solo proceso. La estructura Sequelize existente queda disponible para una futura integracion con MySQL; el servidor actual no requiere MySQL.

Configurar `PORT`, `DEEPSEEK_BASE_URL` y `DEEPSEEK_MODEL` en `.env` si es necesario. `.env` y los datos locales se excluyen de Git.
