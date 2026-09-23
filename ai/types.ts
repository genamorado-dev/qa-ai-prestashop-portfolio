export interface LlmCompletionRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LlmCompletionResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LlmClient {
  complete(request: LlmCompletionRequest): Promise<LlmCompletionResponse>;
}

export type LlmProvider = 'openai' | 'mock';

// TODO: implementar tipos de prompts, generación de tests y análisis de fallos