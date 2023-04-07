import { PineconeClient } from '@pinecone-database/pinecone';
import { PINECONE_ENVIRONMENT, PINECONE_API_KEY } from '../env';

const pinecone = new PineconeClient();

await pinecone.init({
  environment: PINECONE_ENVIRONMENT,
  apiKey: PINECONE_API_KEY
});

export { pinecone };
