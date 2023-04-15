import type { MetaData } from '@7-docs/shared';

interface Vector {
  id: string;
  values: Array<number>;
  metadata?: MetaData;
}

interface FileData {
  filePath: string;
  url: string;
  content: Buffer;
}

export type FetchFiles = (patterns: string[], id: string) => Promise<Array<FileData>>;

export type UpsertVectorOptions = { namespace: string; vectors: Vector[] };
export type QueryOptions = { embedding: Array<number>; namespace: string };

export abstract class VectorDatabase {
  abstract upsertVectors(options: UpsertVectorOptions): Promise<number>;
  abstract query(options: QueryOptions): Promise<MetaData[]>;
}
