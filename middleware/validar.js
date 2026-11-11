module.exports = function validar(schema, origen = 'body') {
  return (req, res, next) => {
    const resultado = schema.safeParse(req[origen]);
    if (!resultado.success) return next(Object.assign(new Error('Datos invalidos'), {
      status: 400,
      detalles: resultado.error.issues.map(({ path, message }) => ({ campo: path.join('.'), mensaje: message })),
    }));
    res.locals[origen] = resultado.data;
    next();
  };
};
