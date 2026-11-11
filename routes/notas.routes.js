const router = require('express').Router();
const { z } = require('zod');
const notas = require('../controllers/notas.controller');
const endpoint = require('./endpoint');
const body = z.object({ titulo: z.string().trim().min(1).max(200), contenido: z.string().trim().min(1).max(10000) }).strict();
const params = z.object({ id: z.uuid() });
const response = { $ref: '#/components/schemas/Nota' };
endpoint(router, 'get', '/notas', 'Listar todas las notas', notas.listar, { response: { type: 'array', items: response } });
endpoint(router, 'get', '/notas/:id', 'Obtener una nota', notas.obtener, { params, response, errors: [404] });
endpoint(router, 'post', '/notas', 'Crear una nota', notas.crear, {
  body, status: 201, response, example: { titulo: 'Clase 1', contenido: 'Apuntes de Express' },
});
endpoint(router, 'delete', '/notas/:id', 'Eliminar una nota', notas.eliminar, { params, status: 204, errors: [404] });
module.exports = router;
