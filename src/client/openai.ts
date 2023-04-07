import { Configuration, OpenAIApi } from 'openai';
import { OPENAI_API_KEY, OPENAI_ORGANIZATION } from '../env';

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
  organization: OPENAI_ORGANIZATION
});

export const openai = new OpenAIApi(configuration);

type EmbeddingOptions = {
  input: string | string[];
  model?: string;
};

export async function createEmbedding({
  input,
  model = 'text-embedding-ada-002'
}: EmbeddingOptions): Promise<number[][]> {
  const result = await openai.createEmbedding({ model, input });
  if (!result.data.data[0].embedding) throw new Error('No embedding returned from the completions endpoint');
  return result.data.data.map(d => d.embedding);
}
