const { randomUUID } = require('node:crypto');
const notas = new Map();
function listar() { return [...notas.values()].map(nota => ({ ...nota })); }
// Contrato con B: recibe UUID; devuelve una copia de la nota o undefined.
function buscar(id) { const nota = notas.get(id); return nota ? { ...nota } : undefined; }
function crear({ titulo, contenido }) {
  const nota = { id: randomUUID(), titulo, contenido, creadaEn: new Date().toISOString() };
  notas.set(nota.id, nota);
  return { ...nota };
}
function eliminar(id) { return notas.delete(id); }
module.exports = { listar, buscar, crear, eliminar };
