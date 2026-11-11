const notas = require('../services/notas.service');
exports.listar = async (req, res) => res.json(await notas.listar());
exports.crear = async (req, res) => res.status(201).json(await notas.guardar(req.body));
