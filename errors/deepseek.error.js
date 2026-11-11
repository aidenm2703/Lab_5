class DeepSeekError extends Error {
  constructor(mensaje, status = 502) {
    super(mensaje);
    this.name = 'DeepSeekError';
    this.status = status;
    this.expose = true;
  }
}

module.exports = DeepSeekError;
