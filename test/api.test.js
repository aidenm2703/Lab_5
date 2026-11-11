const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');
const deepseek = require('../services/deepseek.service');

test('Swagger, validacion y ruta DeepSeek', async () => {
  const server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const original = deepseek.consultar;
  try {
    const spec = await (await fetch(`${base}/api-docs.json`)).json();
    assert.ok(spec.paths['/api/notas'].post.requestBody);
    assert.ok(spec.paths['/api/deepseek/chat'].post.requestBody);
    const post = body => fetch(`${base}/api/deepseek/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    assert.equal((await post({ mensaje: '  ' })).status, 400);
    deepseek.consultar = async mensaje => ({ respuesta: mensaje, modelo: 'test' });
    const response = await post({ mensaje: ' Hola ' });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { respuesta: 'Hola', modelo: 'test' });
    deepseek.consultar = async () => { throw new Error('secreto'); };
    const failed = await post({ mensaje: 'Hola' });
    assert.equal(failed.status, 500);
    assert.deepEqual(await failed.json(), { error: 'Error interno del servidor' });
  } finally {
    deepseek.consultar = original;
    await new Promise(resolve => server.close(resolve));
  }
});
