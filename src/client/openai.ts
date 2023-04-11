import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import {
  OPENAI_API_KEY,
  OPENAI_COMPLETION_MODEL,
  OPENAI_COMPLETION_N,
  OPENAI_COMPLETION_TEMPERATURE,
  OPENAI_COMPLETION_TOP_P,
  OPENAI_ORGANIZATION,
  OPENAI_TOKENS_FOR_COMPLETION
} from '../constants.js';

let _openai: OpenAIApi;
const getClient = () => {
  if (_openai) return _openai;
  if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY environment variable');
  const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
    organization: OPENAI_ORGANIZATION
  });
  _openai = new OpenAIApi(configuration);
  return _openai;
};

type EmbeddingOptions = {
  input: string | string[];
  model: string;
};

export const createEmbedding = async (options: EmbeddingOptions) => {
  const openai = getClient();
  const response = await openai.createEmbedding(options);
  if (!response.data.data[0].embedding) throw new Error('No embedding returned from the completions endpoint');
  return {
    embeddings: response.data.data.map(d => d.embedding),
    usage: response.data.usage
  };
};

type CompletionOptions = {
  messages: ChatCompletionRequestMessage[];
};

export const createChatCompletion = async ({ messages }: CompletionOptions) => {
  const openai = getClient();
  const response = await openai.createChatCompletion({
    model: OPENAI_COMPLETION_MODEL,
    messages,
    temperature: OPENAI_COMPLETION_TEMPERATURE,
    max_tokens: OPENAI_TOKENS_FOR_COMPLETION,
    top_p: OPENAI_COMPLETION_TOP_P,
    n: OPENAI_COMPLETION_N,
    stream: false,
    stop: undefined,
    presence_penalty: 0,
    frequency_penalty: 0
  });

  const text = response.data.choices[0].message?.content?.trim();
  const usage = response.data.usage;

  return { text, usage };
};
