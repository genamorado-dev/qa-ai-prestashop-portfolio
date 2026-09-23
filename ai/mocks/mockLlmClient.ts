// TODO: implementar mock del cliente LLM para desarrollo sin API key

import { LlmClient, LlmCompletionRequest, LlmCompletionResponse } from '../types';

export class MockLlmClient implements LlmClient {
  async complete(request: LlmCompletionRequest): Promise<LlmCompletionResponse> {
    // TODO: devolver respuestas fijas configurables según el prompt
    return {
      content: `SIMULATED RESPONSE for: ${request.prompt.slice(0, 100)}`,
      usage: { promptTokens: request.prompt.length, completionTokens: 0, totalTokens: request.prompt.length },
    };
  }
}