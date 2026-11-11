const notas = require('../services/notas.service');
const deepseek = require('../services/deepseek.service');

exports.preguntar = async (req, res) => {
  const resultado = await deepseek.consultar(res.locals.body.pregunta);
  res.json(resultado);
};

exports.resumirNota = async (req, res) => {
  const nota = notas.buscar(res.locals.params.id);
  if (!nota) throw Object.assign(new Error('Nota no encontrada'), { status: 404 });
  const resultado = await deepseek.resumirNota(nota);
  res.json({ id: nota.id, resumen: resultado.resumen, modelo: resultado.modelo });
};
