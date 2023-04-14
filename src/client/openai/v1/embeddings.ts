import { CreateEmbeddingResponse, CreateEmbeddingResponseDataInner } from 'openai';

interface EmbeddingsOptions {
  token: string;
  model: string;
  input: string;
}

type EmbeddingResponse = {
  embeddings: number[][];
  usage: CreateEmbeddingResponse['usage'];
};

export const createEmbeddings = async ({ token, model, input }: EmbeddingsOptions): Promise<EmbeddingResponse> => {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    method: 'POST',
    body: JSON.stringify({ input, model })
  });

  const { error, data, usage } = await response.json();

  if (error) throw new Error(error.message);

  if (!data[0].embedding) throw new Error('No embedding returned from the completions endpoint');

  return {
    embeddings: data.map((d: CreateEmbeddingResponseDataInner) => d.embedding),
    usage
  };
};
