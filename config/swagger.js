const { z } = require('zod');
const specification = {
  openapi: '3.0.3',
  info: {
    title: 'Laboratorio 5 - API de notas con DeepSeek',
    version: '1.0.0',
    description: 'API de notas en memoria con consultas y resumenes generados por DeepSeek.',
  },
  servers: [{ url: '/' }], paths: {},
  tags: [
    { name: 'Notas', description: 'CRUD de notas en memoria.' },
    { name: 'IA', description: 'Consultas y resumenes generados por DeepSeek.' },
    { name: 'Estado', description: 'Disponibilidad de la API.' },
  ],
  components: { schemas: {
    Nota: { type: 'object', required: ['id', 'titulo', 'contenido', 'creadaEn'], properties: {
      id: { type: 'string', format: 'uuid' }, titulo: { type: 'string' }, contenido: { type: 'string' }, creadaEn: { type: 'string', format: 'date-time' },
    } },
    Error: { type: 'object', required: ['error'], properties: {
      error: { type: 'string' }, detalles: { type: 'array', items: { type: 'object', properties: { campo: { type: 'string' }, mensaje: { type: 'string' } } } },
    } },
  } },
};
function register(method, path, summary, options = {}) {
  const status = options.status || 200;
  const responses = { [status]: { description: status === 204 ? 'Nota eliminada; sin cuerpo' : 'Operacion exitosa' } };
  if (options.response) responses[status].content = { 'application/json': { schema: options.response } };
  for (const code of [400, 413, 500, ...(options.errors || [])]) {
    responses[code] = { description: ({ 400: 'Datos o JSON invalidos', 404: 'Nota no encontrada', 413: 'Cuerpo demasiado grande', 500: 'Error interno' })[code] || 'Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } };
  }
  const operation = { summary, tags: options.tags || ['Notas'], responses };
  if (options.body) operation.requestBody = { required: true, content: { 'application/json': { schema: z.toJSONSchema(options.body, { target: 'openapi-3.0' }), example: options.example } } };
  if (options.params) operation.parameters = [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'UUID devuelto al crear la nota' }];
  specification.paths[path] ||= {};
  specification.paths[path][method] = operation;
}
module.exports = { specification, register };
