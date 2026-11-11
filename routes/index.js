const express = require('express');
const { z } = require('zod');
const notas = require('../controllers/notas.controller');
const deepseek = require('../controllers/deepseek.controller');
const { register } = require('../config/swagger');
const router = express.Router();

const texto = z.string().trim().min(1).max(10000);
const notaSchema = z.object({ titulo: texto.max(200), contenido: texto }).strict();
const consultaSchema = z.object({ mensaje: texto }).strict();
const notaOutput = {
  type: 'object',
  properties: { id: { type: 'string' }, titulo: { type: 'string' }, contenido: { type: 'string' }, creadaEn: { type: 'string', format: 'date-time' } },
};

function endpoint(method, path, summary, handler, options = {}) {
  register(method, `/api${path}`, summary, options);
  router[method](path, (req, res, next) => {
    if (options.body) {
      const parsed = options.body.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: 'Datos invalidos', detalles: parsed.error.issues });
      req.body = parsed.data;
    }
    return handler(req, res, next);
  });
}

endpoint('get', '/health', 'Estado de la API', (req, res) => res.json({ status: 'ok' }), {
  response: { type: 'object', properties: { status: { type: 'string' } } },
});
endpoint('get', '/notas', 'Listar notas', notas.listar, { response: { type: 'array', items: notaOutput } });
endpoint('post', '/notas', 'Crear nota', notas.crear, { body: notaSchema, status: 201, response: notaOutput });
endpoint('post', '/deepseek/chat', 'Consultar DeepSeek', deepseek.consultar, {
  body: consultaSchema,
  response: { type: 'object', properties: { respuesta: { type: 'string' }, modelo: { type: 'string' } } },
  errors: [502, 503],
});

module.exports = router;
