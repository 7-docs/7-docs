interface Vector {
  id: string;
  values: Array<number>;
  metadata?: MetaData;
}

interface FileData {
  filePath: string;
  url: string;
  content: string;
}

// Don't allow `null` values (not supported in Pinecone)
export interface MetaData extends FileData {
  title: string;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens?: number;
  total_tokens: number;
}

export type FetchFiles = (patterns: string | string[], id: string) => Promise<Array<FileData>>;

export type UpsertVectorOptions = { namespace: string; vectors: Vector[] };
export type QueryOptions = { embedding: Array<number>; namespace: string };

export abstract class VectorDatabase {
  abstract upsertVectors(options: UpsertVectorOptions): Promise<number>;
  abstract query(options: QueryOptions): Promise<MetaData[]>;
}
