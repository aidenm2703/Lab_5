const validar = require('../middleware/validar');
const { register } = require('../config/swagger');
// Una declaracion registra ruta, validacion y documentacion.
module.exports = function endpoint(router, method, path, summary, handler, options = {}) {
  register(method, '/api' + path.replace(/:([A-Za-z0-9_]+)/g, '{$1}'), summary, options);
  const middlewares = [];
  if (options.body) middlewares.push(validar(options.body));
  if (options.params) middlewares.push(validar(options.params, 'params'));
  router[method](path, ...middlewares, handler);
};
