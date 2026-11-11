const { z } = require('zod');
const specification = {
  openapi: '3.0.3',
  info: { title: 'Quiz 5 - API de notas y DeepSeek', version: '1.0.0' },
  servers: [{ url: '/' }],
  paths: {},
};

function register(method, path, summary, options) {
  const responses = { [options.status || 200]: { description: 'Operacion exitosa', content: { 'application/json': { schema: options.response } } } };
  for (const status of [400, 500, ...(options.errors || [])]) {
    responses[status] = { description: status === 400 ? 'Datos invalidos' : 'Error', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } };
  }
  const operation = { summary, responses };
  if (options.body) {
    operation.requestBody = { required: true, content: { 'application/json': { schema: z.toJSONSchema(options.body, { target: 'openapi-3.0' }) } } };
  }
  specification.paths[path] ||= {};
  specification.paths[path][method] = operation;
}

module.exports = { specification, register };
