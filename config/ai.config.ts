export const aiConfig = {
  provider: (process.env.LLM_PROVIDER as 'openai' | 'mock') || 'mock',
  model: process.env.LLM_MODEL || 'gpt-4o-mini',
  apiKey: process.env.OPENAI_API_KEY || '',
  temperature: 0.2,
  maxTokens: 2048,
  // TODO: configurar modelos libres de OpenCode cuando se integren
} as const;