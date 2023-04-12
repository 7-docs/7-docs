import { Pinecone } from '../client/pinecone.js';

export const pineconeClearNamespace = async (namespace: string) => {
  const pinecone = new Pinecone();
  await pinecone.clearNamespace(namespace);
};
