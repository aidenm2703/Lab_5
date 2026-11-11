const notas = require('../services/notas.service');
function obtenerNota(id) {
  const nota = notas.buscar(id);
  if (!nota) throw Object.assign(new Error('Nota no encontrada'), { status: 404 });
  return nota;
}
exports.listar = (req, res) => res.json(notas.listar());
exports.obtener = (req, res) => res.json(obtenerNota(res.locals.params.id));
exports.crear = (req, res) => {
  const nota = notas.crear(res.locals.body);
  res.location('/api/notas/' + nota.id).status(201).json(nota);
};
exports.eliminar = (req, res) => {
  const { id } = res.locals.params;
  obtenerNota(id);
  notas.eliminar(id);
  res.status(204).end();
};
