const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const archivo = path.join(__dirname, '../data/notas.json');
let cola = Promise.resolve();

async function listar() {
  try { return JSON.parse(await fs.readFile(archivo, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}

function guardar(datos) {
  const operacion = cola.then(async () => {
    const notas = await listar();
    const nota = { id: randomUUID(), ...datos, creadaEn: new Date().toISOString() };
    notas.push(nota);
    await fs.mkdir(path.dirname(archivo), { recursive: true });
    await fs.writeFile(`${archivo}.tmp`, JSON.stringify(notas, null, 2));
    await fs.rename(`${archivo}.tmp`, archivo);
    return nota;
  });
  cola = operacion.catch(() => {});
  return operacion;
}

module.exports = { listar, guardar };
