const router = require('express').Router();
const endpoint = require('./endpoint');
router.use(require('./notas.routes'));
endpoint(router, 'get', '/health', 'Estado de la API', (req, res) => res.json({ status: 'ok' }), {
  tags: ['Estado'], response: { type: 'object', properties: { status: { type: 'string' } } },
});
// B puede montar aqui su ia.routes.js y la ruta de resumen.
module.exports = router;
