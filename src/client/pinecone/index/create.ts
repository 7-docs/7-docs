import { getControllerUrl } from '../util.js';
import type { CreateRequest } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';

type CreateIndex = (options: { url: string; token: string; body: CreateRequest }) => Promise<void>;

export const createIndex: CreateIndex = async ({ url, token, body }) => {
  const response = await fetch(getControllerUrl(url), {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Api-Key': token
    },
    method: 'POST',
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text ?? `Unable to create new index (${response.status} ${response.statusText})`);
  }
};
