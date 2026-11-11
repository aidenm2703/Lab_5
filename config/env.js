require('dotenv').config({ quiet: true });

module.exports = {
  port: Number(process.env.PORT || 3000),
  deepseekApiKey: process.env.DEEPSEEK_API_KEY,
  deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  deepseekModel: process.env.DEEPSEEK_MODEL || 'deepseek-flash',
};
