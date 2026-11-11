require('./config/env');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { specification } = require('./config/swagger');
const app = express();

app.use(express.json({ limit: '100kb' }));
app.get('/', (req, res) => res.redirect('/api-docs'));
app.get('/api-docs.json', (req, res) => res.json(specification));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specification));
app.use('/api', require('./routes'));
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: status < 500 || err.expose ? err.message : 'Error interno del servidor' });
});

module.exports = app;
