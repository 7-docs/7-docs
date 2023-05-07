import { pinecone } from '@7-docs/edge';
import {
  PINECONE_UPSERT_VECTOR_LIMIT,
  OPENAI_OUTPUT_DIMENSIONS,
  PINECONE_METRIC,
  PINECONE_POD_TYPE
} from '@7-docs/shared';
import { PINECONE_URL, PINECONE_API_KEY } from '../env.js';
import { forEachChunkedAsync } from '../util/array.js';
import { set } from '../util/storage.js';
import type { UpsertVectorOptions, VectorDatabase, QueryOptions } from '../types.js';
import type { MetaData } from '@7-docs/shared';

const getEnvironmentFromUrl = (url: string) => {
  const m = url.match(/(?<=svc\.)([a-z0-9-]+)(?=\.pinecone)/);
  if (m) return m[0];
  return '';
};

export class Pinecone implements VectorDatabase {
  token: string;
  url?: string;

  constructor() {
    if (!PINECONE_API_KEY) throw new Error('Missing PINECONE_API_KEY environment variable');
    this.token = PINECONE_API_KEY;
    this.url = PINECONE_URL;
  }

  async createIndex(name?: string, environment?: string) {
    if (!name) throw new Error('Please provide a name for the index');
    if (!this.url && !environment)
      throw new Error('Please use --environment [env] or set PINECONE_URL environment variable');

    set('db', 'type', 'pinecone');

    const env = environment ?? (this.url ? getEnvironmentFromUrl(this.url) : '');

    const indices = await pinecone.listIndexes({ environment: env, token: this.token });

    if (!indices.includes(name)) {
      const body = {
        name,
        dimension: OPENAI_OUTPUT_DIMENSIONS,
        metric: PINECONE_METRIC,
        podType: PINECONE_POD_TYPE
      };

      await pinecone.createIndex({ environment: env, token: this.token, body });

      return [
        `Created new index: ${name} (${OPENAI_OUTPUT_DIMENSIONS}/${PINECONE_METRIC}/${PINECONE_POD_TYPE})`,
        'Please wait a second or two until its ready to start ingestion.'
      ].join('\n');
    }
  }

  async upsertVectors({ namespace, vectors }: UpsertVectorOptions) {
    const url = this.url;
    if (!url) throw new Error('Missing PINECONE_URL environment variable');
    let v = 0;
    await forEachChunkedAsync(vectors, PINECONE_UPSERT_VECTOR_LIMIT, async vectors => {
      const body = { vectors, namespace };
      const response = await pinecone.upsert({ url, token: this.token, body });
      if (response.upsertedCount !== vectors.length) console.warn('Pinecone response did not match request:', response);
      v += vectors.length;
    });
    return v;
  }

  async query({ embedding, namespace }: QueryOptions): Promise<MetaData[]> {
    if (!this.url) throw new Error('Missing PINECONE_URL environment variable');
    return pinecone.query({ url: this.url, token: this.token, vector: embedding, namespace });
  }

  async clearNamespace(namespace: string) {
    if (!this.url) throw new Error('Missing PINECONE_URL environment variable');
    const body = { deleteAll: true, namespace };
    await pinecone.deleteVector({ url: this.url, token: this.token, body });
  }
}
