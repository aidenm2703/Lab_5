const router = require('express').Router();
const { z } = require('zod');
const endpoint = require('./endpoint');
const ia = require('../controllers/ia.controller');

const pregunta = z.object({ pregunta: z.string().trim().min(1).max(2000) }).strict();
const id = z.object({ id: z.uuid() });
const respuesta = {
  type: 'object', required: ['respuesta', 'modelo'],
  properties: { respuesta: { type: 'string' }, modelo: { type: 'string' } },
};
const resumen = {
  type: 'object', required: ['id', 'resumen', 'modelo'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    resumen: { type: 'string', description: 'Exactamente tres vinetas en espanol.' },
    modelo: { type: 'string' },
  },
};

endpoint(router, 'post', '/ia/preguntar', 'Hacer una pregunta libre a DeepSeek', ia.preguntar, {
  tags: ['IA'], body: pregunta, response: respuesta, errors: [502, 503],
  example: { pregunta: 'Explica que es una API REST en una frase.' },
});
endpoint(router, 'post', '/notas/:id/resumen', 'Resumir una nota en tres vinetas', ia.resumirNota, {
  tags: ['IA'], params: id, response: resumen, errors: [404, 502, 503],
});

module.exports = router;
