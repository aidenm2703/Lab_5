const OpenAI = require('openai');
const config = require('../config/env');
const DeepSeekError = require('../errors/deepseek.error');

function cliente() {
  if (!config.deepseekApiKey) throw new DeepSeekError('Servicio de IA no configurado', 503);
  return new OpenAI({
    apiKey: config.deepseekApiKey,
    baseURL: config.deepseekBaseUrl,
    timeout: 30000,
    maxRetries: 0,
  });
}

async function consultar(pregunta, instrucciones) {
  try {
    const messages = [];
    if (instrucciones) messages.push({ role: 'system', content: instrucciones });
    messages.push({ role: 'user', content: pregunta });
    const result = await cliente().chat.completions.create({ model: config.deepseekModel, messages });
    const respuesta = result.choices?.[0]?.message?.content?.trim();
    if (!respuesta) throw new DeepSeekError('DeepSeek devolvio una respuesta vacia');
    return { respuesta, modelo: result.model || config.deepseekModel };
  } catch (error) {
    if (error instanceof DeepSeekError) throw error;
    throw new DeepSeekError('No fue posible obtener una respuesta de DeepSeek');
  }
}

function tresVinetas(texto) {
  const puntos = texto.split('\n')
    .map(linea => linea.trim().replace(/^(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 3);
  if (puntos.length !== 3) throw new DeepSeekError('DeepSeek no genero un resumen de tres vinetas');
  return puntos.map(punto => `- ${punto}`).join('\n');
}

async function resumirNota(nota) {
  const resultado = await consultar(
    `Titulo: ${nota.titulo}\n\nContenido:\n${nota.contenido}`,
    'Resume la nota en espanol. Devuelve exactamente tres vinetas, una por linea, y no agregues introduccion ni conclusion.',
  );
  return { ...resultado, resumen: tresVinetas(resultado.respuesta) };
}

module.exports = { consultar, resumirNota };
