import { Configuration, OpenAIApi } from 'openai';
import { OPENAI_API_KEY, OPENAI_ORGANIZATION } from '../env';

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
  organization: OPENAI_ORGANIZATION
});

export const openai = new OpenAIApi(configuration);

type EmbeddingOptions = {
  input: string | string[];
  model: string;
};

export const createEmbedding = async (options: EmbeddingOptions) => {
  const response = await openai.createEmbedding(options);
  if (!response.data.data[0].embedding) throw new Error('No embedding returned from the completions endpoint');
  return {
    embeddings: response.data.data.map(d => d.embedding),
    usage: response.data.usage
  };
};

