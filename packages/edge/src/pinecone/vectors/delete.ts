import { ensureProtocol } from '../util.js';
import type { Delete1Request } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';

type Delete = (options: { url: string; token: string; body: Delete1Request }) => Promise<void>;

export const deleteVector: Delete = async ({ url, token, body }) => {
  const response = await fetch(`${ensureProtocol(url)}/vectors/delete`, {
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
    const message = `${response.status} ${response.statusText}: ${text ?? `Unable to delete vectors`})`;
    throw new Error(message);
  }
};
