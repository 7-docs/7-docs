import { ChatCompletionRequestMessage, Configuration, OpenAIApi, CreateCompletionResponseUsage } from 'openai';
import {
  OPENAI_API_KEY,
  OPENAI_COMPLETION_MODEL,
  OPENAI_COMPLETION_N,
  OPENAI_COMPLETION_TEMPERATURE,
  OPENAI_COMPLETION_TOP_P,
  OPENAI_ORGANIZATION,
  OPENAI_TOKENS_FOR_COMPLETION
} from '../constants.js';
import type { IncomingMessage } from 'http';

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

const streamHandler = (chunk: Buffer) => {
  const lines = chunk
    .toString()
    .split('\n')
    .filter(line => line.trim() !== '');

  for (const line of lines) {
    const message = line.replace(/^data: /, '');
    if (message === '[DONE]') {
      process.stdout.write('\n\n');
      return;
    }
    try {
      const parsed = JSON.parse(message);
      const delta = parsed.choices[0].delta?.content;
      if (delta) process.stdout.write(delta);
    } catch (error) {
      console.error('Unable to parse chunk:', line);
      console.error(error);
    }
  }
};

type CreateChatCompletionOptions = { messages: ChatCompletionRequestMessage[]; stream: boolean };
type CreateChatCompletionReturn = { text?: string; usage?: CreateCompletionResponseUsage };
type CreateChatCompletion = (options: CreateChatCompletionOptions) => Promise<CreateChatCompletionReturn>;

export const createChatCompletion: CreateChatCompletion = async ({ messages, stream }) => {
  const openai = getClient();
  const response = await openai.createChatCompletion(
    {
      model: OPENAI_COMPLETION_MODEL,
      messages,
      temperature: OPENAI_COMPLETION_TEMPERATURE,
      max_tokens: OPENAI_TOKENS_FOR_COMPLETION,
      top_p: OPENAI_COMPLETION_TOP_P,
      n: OPENAI_COMPLETION_N,
      stream,
      stop: undefined,
      presence_penalty: 0,
      frequency_penalty: 0
    },
    { responseType: stream ? 'stream' : 'json' }
  );

  if (stream) {
    const stream = response.data as unknown as IncomingMessage;
    return new Promise((resolve, reject) => {
      stream.on('data', streamHandler);
      stream.on('end', () => resolve({ text: undefined, usage: undefined }));
      stream.on('error', reject);
    });
  } else {
    const text = response.data.choices[0].message?.content?.trim();
    const usage = response.data.usage;
    return { text, usage };
  }
};

export const listModels = async () => {
  const openai = getClient();
  const response = await openai.listModels();
  return response.data.data;
};
