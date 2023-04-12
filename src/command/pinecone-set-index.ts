import { Pinecone } from '../client/pinecone.js';

export const pineconeSetIndex = async (index: string) => {
  const pinecone = new Pinecone();
  await pinecone.createOrSetIndex(index);
};
