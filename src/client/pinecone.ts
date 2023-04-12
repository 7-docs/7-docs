import { PineconeClient } from '@pinecone-database/pinecone';
import {
  PINECONE_ENVIRONMENT,
  PINECONE_API_KEY,
  PINECONE_UPSERT_VECTOR_LIMIT,
  OPENAI_OUTPUT_DIMENSIONS,
  PINECONE_METRIC,
  PINECONE_POD_TYPE,
  EMBEDDING_MATCH_COUNT
} from '../constants.js';
import { get, set } from '../util/storage.js';
import { forEachChunkedAsync } from '../util/array.js';
import type { ScoredVector } from '@pinecone-database/pinecone';
import type { MetaData, UpsertVectorOptions, VectorDatabase, QueryOptions } from '../types.js';

const sortByScoreDesc = (a: ScoredVector, b: ScoredVector) => (a.score && b.score ? b.score - a.score : 0);

const pinecone = new PineconeClient();

export class Pinecone implements VectorDatabase {
  indexName: undefined | string;
  isInitialized = false;

  async init() {
    if (this.isInitialized) return;

    if (!PINECONE_API_KEY) throw new Error('Missing PINECONE_API_KEY environment variable');
    if (!PINECONE_ENVIRONMENT) throw new Error('Missing PINECONE_ENVIRONMENT environment variable');

    await pinecone.init({
      environment: PINECONE_ENVIRONMENT,
      apiKey: PINECONE_API_KEY
    });

    this.indexName = get('pinecone', 'index');

    this.isInitialized = true;
  }

  async createOrSetIndex(name: string) {
    if (!name) throw new Error('Please provide name of index');

    await this.init();

    set('db', 'type', 'pinecone');
    set('pinecone', 'index', name);
    this.indexName = name;

    const indices = await pinecone.listIndexes();
    if (indices.indexOf(name) === -1) {
      const createRequest = {
        name,
        dimension: OPENAI_OUTPUT_DIMENSIONS,
        metric: PINECONE_METRIC,
        podType: PINECONE_POD_TYPE
      };

      await pinecone.createIndex({ createRequest });

      return [
        `Created new index: ${name} (${OPENAI_OUTPUT_DIMENSIONS}/${PINECONE_METRIC}/${PINECONE_POD_TYPE})`,
        'Please wait a second or two until its ready to start ingestion.'
      ].join('\n');
    }
  }

  async getIndex() {
    await this.init();
    if (!this.indexName) throw new Error('No index selected. Use: 7d pinecone-set-index --index [name]');
    return pinecone.Index(this.indexName);
  }

  async getIndexName() {
    await this.init();
    if (!this.indexName) throw new Error('No index selected. Use: 7d pinecone-set-index --index [name]');
    return this.indexName;
  }

  async upsertVectors({ namespace, vectors }: UpsertVectorOptions) {
    const client = await this.getIndex();
    let v = 0;
    await forEachChunkedAsync(vectors, PINECONE_UPSERT_VECTOR_LIMIT, async vectors => {
      const upsertRequest = { vectors, namespace };
      const response = await client.upsert({ upsertRequest });
      if (response.upsertedCount !== vectors.length) console.warn('Pinecone response did not match request:', response);
      v += vectors.length;
    });
    return v;
  }

  async query({ embedding, namespace }: QueryOptions): Promise<MetaData[]> {
    const client = await this.getIndex();
    const results = await client.query({
      queryRequest: {
        vector: embedding,
        namespace,
        topK: EMBEDDING_MATCH_COUNT,
        includeMetadata: true
      }
    });
    return (
      results.matches
        ?.sort(sortByScoreDesc)
        .map(match => match.metadata)
        .filter((m): m is MetaData => !!m) ?? []
    );
  }

  async clearNamespace(namespace: string) {
    const client = await this.getIndex();
    await client.delete1({ deleteAll: true, namespace });
  }
}
