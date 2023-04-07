import { pinecone } from '../client/pinecone';
import { PINECONE_NAMESPACE, PINECONE_INDEX } from '../env';

const pineconeIndex = pinecone.Index(PINECONE_INDEX);

const response = await pineconeIndex.delete1({ deleteAll: true, namespace: PINECONE_NAMESPACE });

console.log(response);
