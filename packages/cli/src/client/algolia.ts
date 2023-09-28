import algoliasearch, { type SearchClient } from 'algoliasearch';
import { ALGOLIA_APP_ID, ALGOLIA_API_KEY, ALGOLIA_INDEX_NAME } from '../env.js';
import type { UpsertVectorOptions, VectorDatabase, QueryOptions } from '../types.js';
import type { MetaData } from '@7-docs/shared';

interface MetaDataHit extends MetaData {
  metadata: Record<string, unknown>;
}

export class Algolia implements VectorDatabase {
  appId: string;
  apiKey: string;
  indexName: string;
  client?: SearchClient;

  constructor() {
    if (!ALGOLIA_APP_ID) throw new Error('Missing ALGOLIA_APP_ID environment variable');
    if (!ALGOLIA_API_KEY) throw new Error('Missing ALGOLIA_API_KEY environment variable');
    if (!ALGOLIA_INDEX_NAME) throw new Error('Missing ALGOLIA_INDEX_NAME environment variable');
    this.appId = ALGOLIA_APP_ID;
    this.apiKey = ALGOLIA_API_KEY;
    this.indexName = ALGOLIA_INDEX_NAME;
  }

  setClient() {
    // @ts-ignore This expression is not callable, ts(2349)
    const client = algoliasearch(this.appId, this.apiKey);
    this.client = client;
  }

  getClient() {
    if (!this.client) this.setClient();
    return this.client;
  }

  getIndex() {
    const client = this.getClient();
    return client?.initIndex(this.indexName);
  }

  async upsertVectors({ vectors }: UpsertVectorOptions) {
    const objects = vectors.map(v => ({ objectID: v.id, ...v.metadata }));
    const index = this.getIndex();
    if (!index) return 0;
    const { objectIDs } = await index.saveObjects(objects);
    return objectIDs.length;
  }

  async query({ embedding }: QueryOptions): Promise<MetaData[]> {
    const index = this.getIndex();
    if (!index) return [];
    const { hits } = await index.search<MetaDataHit>(embedding.join(','));
    return hits.map(hit => ({
      filePath: hit.filePath,
      url: hit.url,
      content: hit.content,
      title: hit.title,
      ...hit.metadata
    }));
  }
}
