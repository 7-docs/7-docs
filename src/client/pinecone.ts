import { PineconeClient } from '@pinecone-database/pinecone';
import {
  PINECONE_ENVIRONMENT,
  PINECONE_API_KEY,
  PINECONE_UPSERT_VECTOR_LIMIT,
  OPENAI_VECTOR_DIMENSION,
  PINECONE_METRIC,
  PINECONE_POD_TYPE
} from '../constants.js';
import { get, set } from '../util/storage.js';
import { forEachChunkedAsync } from '../util/array.js';
import { ConfigurationError } from '../util/errors.js';
import type { MetaData, UpsertVectorOptions, VectorDatabase, QueryOptions } from '../types.js';

const pinecone = new PineconeClient();

export class Pinecone implements VectorDatabase {
  index: undefined | string;
  isInitialized = false;

  async init() {
    if (this.isInitialized) return;

    if (!PINECONE_API_KEY) throw new Error('Missing PINECONE_API_KEY environment variable');
    if (!PINECONE_ENVIRONMENT) throw new Error('Missing PINECONE_ENVIRONMENT environment variable');

    await pinecone.init({
      environment: PINECONE_ENVIRONMENT,
      apiKey: PINECONE_API_KEY
    });

    this.index = get('pinecone', 'index');

    this.isInitialized = true;
  }

  async createOrSetIndex(name: string) {
    if (!name) throw new ConfigurationError('Please provide name of index');

    await this.init();

    const createRequest = {
      name,
      dimension: OPENAI_VECTOR_DIMENSION,
      metric: PINECONE_METRIC,
      podType: PINECONE_POD_TYPE
    };

    try {
      const indices = await pinecone.listIndexes();
      if (indices.indexOf(name) === -1) {
        await pinecone.createIndex({ createRequest });
        console.log(`Created new index: ${name} (${OPENAI_VECTOR_DIMENSION}/${PINECONE_METRIC}/${PINECONE_POD_TYPE})`);
        console.log('Please wait a second or two until its ready and try again');
      }
      set('db', 'type', 'pinecone');
      set('pinecone', 'index', name);
      this.index = name;
      console.log(`Using pinecone index: ${name}`);
    } catch (error) {
      if (error instanceof Error) console.warn(error.message);
    }
  }

  async getIndex() {
    await this.init();
    if (!this.index) throw new ConfigurationError('No index selected. Use: 7d pinecone-set-index --index [name]');
    return pinecone.Index(this.index);
  }

  async upsertVectors({ namespace, vectors }: UpsertVectorOptions) {
    const client = await this.getIndex();
    let v = 0;
    await forEachChunkedAsync(vectors, PINECONE_UPSERT_VECTOR_LIMIT, async vectors => {
      console.log(`Upserting ${vectors.length} vectors for ${vectors[0].metadata?.filePath}`);
      const upsertRequest = { vectors, namespace };
      try {
        const response = await client.upsert({ upsertRequest });
        if (response.upsertedCount !== vectors.length)
          console.warn('Pinecone response did not match request:', response);
        v += vectors.length;
      } catch (error) {
        if (error instanceof Error) console.log(error.message);
        else throw error;
      }
    });
    return v;
  }

  async query({ embedding, namespace }: QueryOptions): Promise<MetaData[]> {
    const client = await this.getIndex();
    const results = await client.query({
      queryRequest: {
        vector: embedding,
        namespace,
        topK: 5,
        includeMetadata: true
      }
    });
    return results.matches?.map(match => match.metadata).filter((m): m is MetaData => !!m) ?? [];
  }

  async clearNamespace(namespace: string) {
    const client = await this.getIndex();
    await client.delete1({ deleteAll: true, namespace });
    console.log(`Cleared namespace ${namespace}`);
  }
}
