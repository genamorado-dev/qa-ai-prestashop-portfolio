// TODO: implementar cliente LLM real (OpenAI, OpenCode con modelos libres, etc.)

import { LlmClient, LlmCompletionRequest, LlmCompletionResponse } from '../types';

export class LlmClientImpl implements LlmClient {
  async complete(request: LlmCompletionRequest): Promise<LlmCompletionResponse> {
    // TODO: conectar con el proveedor LLM configurado en config/ai.config.ts
    throw new Error('Not implemented: LlmClientImpl.complete');
  }
}