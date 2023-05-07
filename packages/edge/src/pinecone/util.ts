import type { ScoredVector } from '@pinecone-database/pinecone';

export const ensureProtocol = (url: string) => url.replace(/^(https:\/\/)?/, 'https://');

export const sortByScoreDesc = (a: ScoredVector, b: ScoredVector) => (a.score && b.score ? b.score - a.score : 0);

export const getControllerUrl = (environment: string) => `https://controller.${environment}.pinecone.io/databases`;
