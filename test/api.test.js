const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const app = require('../app');
const notas = require('../services/notas.service');
const deepseek = require('../services/deepseek.service');
let server, base;
before(async () => {
  server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});
after(() => new Promise(resolve => server.close(resolve)));
const request = (path, method = 'GET', body) => fetch(base + path, {
  method, headers: { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
});
test('crear, listar, buscar y eliminar una nota; contrato compartido con B', async () => {
  const response = await request('/api/notas', 'POST', { titulo: ' Clase ', contenido: ' Apuntes ' });
  assert.equal(response.status, 201);
  const nota = await response.json();
  assert.equal(nota.titulo, 'Clase');
  assert.equal(nota.contenido, 'Apuntes');
  assert.equal(response.headers.get('location'), '/api/notas/' + nota.id);
  assert.deepEqual(notas.buscar(nota.id), nota);
  const copia = notas.buscar(nota.id); copia.titulo = 'No modificar';
  assert.equal(notas.buscar(nota.id).titulo, 'Clase');
  const lista = await (await request('/api/notas')).json();
  assert.ok(lista.some(item => item.id === nota.id));
  assert.deepEqual(await (await request('/api/notas/' + nota.id)).json(), nota);
  const eliminada = await request('/api/notas/' + nota.id, 'DELETE');
  assert.equal(eliminada.status, 204);
  assert.equal(await eliminada.text(), '');
  assert.equal(notas.buscar(nota.id), undefined);
  assert.equal((await request('/api/notas/' + nota.id)).status, 404);
  assert.equal((await request('/api/notas/' + nota.id, 'DELETE')).status, 404);
});
test('rechaza cuerpos invalidos sin crear notas', async () => {
  const cantidad = notas.listar().length;
  for (const body of [{}, { titulo: ' ', contenido: 'x' }, { titulo: 'x' }, { titulo: 1, contenido: 'x' }, { titulo: 'x', contenido: 'y', extra: true }, { titulo: 'x'.repeat(201), contenido: 'y' }, { titulo: 'x', contenido: 'y'.repeat(10001) }]) {
    const r = await request('/api/notas', 'POST', body);
    assert.equal(r.status, 400);
    assert.ok((await r.json()).detalles.length);
  }
  assert.equal(notas.listar().length, cantidad);
  assert.equal((await request('/api/notas/no-es-uuid')).status, 400);
  assert.equal((await request('/api/notas/' + randomUUID())).status, 404);
});
test('errores centralizados: JSON, limite y rutas inexistentes', async () => {
  const malformed = await fetch(base + '/api/notas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  assert.deepEqual(await malformed.json(), { error: 'JSON invalido' });
  assert.equal((await request('/api/notas', 'POST', { contenido: 'x'.repeat(110000) })).status, 413);
  assert.equal((await request('/no-existe')).status, 404);
});
test('errores internos ocultan detalles', () => {
  const handler = require('../middleware/errorHandler');
  let status, body;
  handler(new Error('credencial privada'), {}, { status(code) { status = code; return this; }, json(value) { body = value; } }, () => {});
  assert.equal(status, 500);
  assert.deepEqual(body, { error: 'Error interno del servidor' });
});
test('B valida preguntas, consulta DeepSeek y resume notas existentes', async () => {
  const consultarOriginal = deepseek.consultar;
  const resumirOriginal = deepseek.resumirNota;
  try {
    assert.equal((await request('/api/ia/preguntar', 'POST', { pregunta: ' ' })).status, 400);
    deepseek.consultar = async pregunta => ({ respuesta: `Respuesta: ${pregunta}`, modelo: 'deepseek-test' });
    const pregunta = await request('/api/ia/preguntar', 'POST', { pregunta: ' Hola ' });
    assert.deepEqual(await pregunta.json(), { respuesta: 'Respuesta: Hola', modelo: 'deepseek-test' });

    let llamadasResumen = 0;
    deepseek.resumirNota = async () => { llamadasResumen += 1; return { resumen: '- uno\n- dos\n- tres', modelo: 'deepseek-test' }; };
    assert.equal((await request('/api/notas/' + randomUUID() + '/resumen', 'POST')).status, 404);
    assert.equal(llamadasResumen, 0);

    const creada = await (await request('/api/notas', 'POST', { titulo: 'IA', contenido: 'Contenido para resumir' })).json();
    const resumen = await request('/api/notas/' + creada.id + '/resumen', 'POST');
    assert.equal(resumen.status, 200);
    assert.deepEqual(await resumen.json(), { id: creada.id, resumen: '- uno\n- dos\n- tres', modelo: 'deepseek-test' });
    assert.equal(llamadasResumen, 1);
  } finally {
    deepseek.consultar = consultarOriginal;
    deepseek.resumirNota = resumirOriginal;
  }
});
test('B comunica de forma segura errores de DeepSeek', async () => {
  const original = deepseek.consultar;
  try {
    const DeepSeekError = require('../errors/deepseek.error');
    deepseek.consultar = async () => { throw new DeepSeekError('Servicio de IA no configurado', 503); };
    const response = await request('/api/ia/preguntar', 'POST', { pregunta: 'Hola' });
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: 'Servicio de IA no configurado' });
  } finally {
    deepseek.consultar = original;
  }
});
test('Swagger documenta todas las operaciones de A y B', async () => {
  const spec = await (await request('/api-docs.json')).json();
  assert.equal(spec.openapi, '3.0.3');
  for (const [path, methods] of Object.entries({ '/api/notas': ['get', 'post'], '/api/notas/{id}': ['get', 'delete'] })) {
    for (const method of methods) assert.ok(spec.paths[path][method]);
  }
  assert.equal(spec.paths['/api/notas/{id}'].get.parameters[0].in, 'path');
  assert.equal(spec.paths['/api/notas/{id}'].delete.responses['204'].content, undefined);
  assert.equal(spec.paths['/api/notas'].post.requestBody.content['application/json'].schema.additionalProperties, false);
  assert.ok(spec.paths['/api/ia/preguntar'].post.requestBody);
  assert.ok(spec.paths['/api/notas/{id}/resumen'].post);
  assert.equal(spec.paths['/api/ia/preguntar'].post.responses['503'].description, 'Error');
  assert.equal((await request('/api-docs/')).status, 200);
});
