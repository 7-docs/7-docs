import type { ListModelsResponse } from '@7-docs/shared';

interface ListModelsOptions {
  token: string;
}

export const listModels = async ({ token }: ListModelsOptions): Promise<ListModelsResponse['data']> => {
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    method: 'GET'
  });

  const { error, data } = await response.json();

  if (error) throw new Error(error.message);

  return data.data;
};
