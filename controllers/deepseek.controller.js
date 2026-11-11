const deepseek = require('../services/deepseek.service');
exports.consultar = async (req, res) => res.json(await deepseek.consultar(req.body.mensaje));
