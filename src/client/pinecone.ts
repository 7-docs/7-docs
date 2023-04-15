import { listIndexes, createIndex, upsert, deleteVector, query } from '@7-docs/edge/pinecone';
import {
  PINECONE_UPSERT_VECTOR_LIMIT,
  OPENAI_OUTPUT_DIMENSIONS,
  PINECONE_METRIC,
  PINECONE_POD_TYPE
} from '@7-docs/shared/constants.js';
import { PINECONE_URL, PINECONE_API_KEY } from '../env.js';
import { forEachChunkedAsync } from '../util/array.js';
import { set } from '../util/storage.js';
import type { UpsertVectorOptions, VectorDatabase, QueryOptions } from '../types.js';

export class Pinecone implements VectorDatabase {
  token: string;
  url: string;

  constructor() {
    if (!PINECONE_URL) throw new Error('Missing PINECONE_URL environment variable');
    if (!PINECONE_API_KEY) throw new Error('Missing PINECONE_API_KEY environment variable');
    this.token = PINECONE_API_KEY;
    this.url = PINECONE_URL;
  }

  async createIndex(name?: string) {
    if (!name) throw new Error('Please provide a name for the index');

    set('db', 'type', 'pinecone');

    const indices = await listIndexes({ url: this.url, token: this.token });

    if (!indices.includes(name)) {
      const body = {
        name,
        dimension: OPENAI_OUTPUT_DIMENSIONS,
        metric: PINECONE_METRIC,
        podType: PINECONE_POD_TYPE
      };

      await createIndex({ url: this.url, token: this.token, body });

      return [
        `Created new index: ${name} (${OPENAI_OUTPUT_DIMENSIONS}/${PINECONE_METRIC}/${PINECONE_POD_TYPE})`,
        'Please wait a second or two until its ready to start ingestion.'
      ].join('\n');
    }
  }

  async upsertVectors({ namespace, vectors }: UpsertVectorOptions) {
    let v = 0;
    await forEachChunkedAsync(vectors, PINECONE_UPSERT_VECTOR_LIMIT, async vectors => {
      const body = { vectors, namespace };
      const response = await upsert({ url: this.url, token: this.token, body });
      if (response.upsertedCount !== vectors.length) console.warn('Pinecone response did not match request:', response);
      v += vectors.length;
    });
    return v;
  }

  async query({ embedding, namespace }: QueryOptions) {
    return query({ url: this.url, token: this.token, vector: embedding, namespace });
  }

  async clearNamespace(namespace: string) {
    const body = { deleteAll: true, namespace };
    await deleteVector({ url: this.url, token: this.token, body });
  }
}
