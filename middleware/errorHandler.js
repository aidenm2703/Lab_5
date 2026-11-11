module.exports = function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status <= 599 ? err.status : 500;
  let mensaje = status < 500 || err.expose ? err.message : 'Error interno del servidor';
  if (err.type === 'entity.parse.failed') mensaje = 'JSON invalido';
  if (err.type === 'entity.too.large') mensaje = 'El cuerpo excede el limite permitido';
  const respuesta = { error: mensaje };
  if (status === 400 && err.detalles) respuesta.detalles = err.detalles;
  res.status(status).json(respuesta);
};
