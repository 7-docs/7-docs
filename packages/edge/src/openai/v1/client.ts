import {
  OPENAI_TOKENS_FOR_COMPLETION,
  OPENAI_COMPLETION_TEMPERATURE,
  OPENAI_COMPLETION_TOP_P,
  OPENAI_COMPLETION_N
} from '@7-docs/shared/constants.js';
import { chatCompletions } from './chatCompletions.js';
import { completions } from './completions.js';
import { createEmbeddings } from './embeddings.js';
import { listModels } from './listModels.js';
import type { CreateChatCompletionRequest, CreateCompletionRequest } from 'openai';

const defaults = {
  max_tokens: OPENAI_TOKENS_FOR_COMPLETION,
  temperature: OPENAI_COMPLETION_TEMPERATURE,
  top_p: OPENAI_COMPLETION_TOP_P,
  n: OPENAI_COMPLETION_N,
  frequency_penalty: 0,
  presence_penalty: 0,
  stream: true
};

export class OpenAI {
  token: string;

  constructor(token: string) {
    if (!token) throw new Error('Missing OPENAI_API_KEY environment variable');
    this.token = token;
  }

  createEmbeddings({ model, input }: { model: string; input: string }) {
    return createEmbeddings({ model, input, token: this.token });
  }

  chatCompletions(body: CreateChatCompletionRequest) {
    return chatCompletions({ body: { ...defaults, ...body }, token: this.token });
  }

  completions(body: CreateCompletionRequest) {
    return completions({ body: { ...defaults, ...body }, token: this.token });
  }

  listModels() {
    return listModels({ token: this.token });
  }
}
