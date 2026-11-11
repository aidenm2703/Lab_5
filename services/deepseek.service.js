const OpenAI = require('openai');
const config = require('../config/env');

async function consultar(mensaje) {
  if (!config.deepseekApiKey) {
    throw Object.assign(new Error('Configura DEEPSEEK_API_KEY en .env'), { status: 503, expose: true });
  }
  const client = new OpenAI({
    apiKey: config.deepseekApiKey,
    baseURL: config.deepseekBaseUrl,
    timeout: 30000,
    maxRetries: 0,
  });
  try {
    const result = await client.chat.completions.create({
      model: config.deepseekModel,
      messages: [{ role: 'user', content: mensaje }],
    });
    const respuesta = result.choices?.[0]?.message?.content;
    if (!respuesta) throw new Error('Respuesta vacia');
    return { respuesta, modelo: result.model };
  } catch (error) {
    throw Object.assign(new Error(`No se pudo consultar DeepSeek${error.status ? ` (HTTP ${error.status})` : ''}`), { status: 502, expose: true });
  }
}

module.exports = { consultar };
