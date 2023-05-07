import { getControllerUrl } from '../util.js';

type ListIndexes = (options: { environment: string; token: string }) => Promise<string[]>;

export const listIndexes: ListIndexes = async ({ environment, token }) => {
  const response = await fetch(getControllerUrl(environment), {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Api-Key': token
    },
    method: 'GET'
  });

  return response.json();
};
