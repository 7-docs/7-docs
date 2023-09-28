import { MetaData } from '@7-docs/shared';
import algoliasearch, { SearchClient } from 'algoliasearch';
import { ALGOLIA_APP_ID, ALGOLIA_API_KEY, ALGOLIA_INDEX_NAME } from "../env.js";
import type { UpsertVectorOptions, VectorDatabase, QueryOptions } from "../types.js";

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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const client = algoliasearch(this.appId, this.apiKey);
    this.client = client;
  }

  getClient(): SearchClient {
    if (!this.client) this.setClient();
    return this.client as SearchClient;
  }

  getIndex() {
    const client = this.getClient();
    console.log('client', client);
    console.log('indexName', this.indexName);
    return client?.initIndex(this.indexName);
  }

  async upsertVectors({
    vectors
  }: UpsertVectorOptions) {
    const index = this.getIndex();
    const objects = vectors.map(v => ({ objectID: v.id, ...v.metadata }));
    const { objectIDs } = await index.saveObjects(objects);
    return objectIDs.length;
  }

  async query({ embedding }: QueryOptions): Promise<MetaData[]> {
    const index = this.getIndex();
    const { hits } = await index.search(embedding.join(','));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return hits.map((hit: any) => ({
      filePath: hit.filePath,
      url: hit.url,
      content: hit.content,
      title: hit.title,
      ...hit.metadata
    }));
  }
}
