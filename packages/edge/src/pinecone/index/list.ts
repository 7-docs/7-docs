import { getControllerUrl } from '../util.js';

type ListIndexes = (options: { url: string; token: string }) => Promise<string[]>;

export const listIndexes: ListIndexes = async ({ url, token }) => {
  const response = await fetch(getControllerUrl(url), {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Api-Key': token
    },
    method: 'GET'
  });

  return response.json();
};
