import type { ScoredVector } from '@pinecone-database/pinecone';

export const ensureProtocol = (url: string) => url.replace(/^(https:\/\/)?/, 'https://');

export const sortByScoreDesc = (a: ScoredVector, b: ScoredVector) => (a.score && b.score ? b.score - a.score : 0);

const getEnvironmentFromUrl = (url: string) => {
  const m = url.match(/(?<=svc\.)([a-z0-9-]+)(?=\.pinecone)/);
  if (m) return m[0];
};

export const getControllerUrl = (url: string) => {
  const environment = getEnvironmentFromUrl(url);
  return `https://controller.${environment}.pinecone.io/databases`;
};
