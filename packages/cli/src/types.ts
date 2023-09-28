import type { MetaData } from '@7-docs/shared';

type File = {
  filePath: string;
  url: string;
  content: Buffer;
};

export type FetchFiles = (identifiers: string[], options: { repo: string; ignore: string[] }) => Promise<Array<File>>;

interface Vector {
  id: string;
  values: Array<number>;
  metadata?: MetaData;
}

export type UpsertVectorOptions = { namespace: string; vectors: Vector[] };
export type QueryOptions = { embedding: Array<number>; namespace: string };

export abstract class VectorDatabase {
  abstract upsertVectors(options: UpsertVectorOptions): Promise<number>;
  abstract query(options: QueryOptions): Promise<MetaData[]>;
}

export interface DocumentSection {
  header?: string;
  content: string;
  tags?: string[];
}

type ParsedDocument = { title?: string; sections: DocumentSection[] };

export type DocumentParser = (document: Buffer | string, maxLength: number) => ParsedDocument;
export type AsyncDocumentParser = (document: Buffer | string, maxLength: number) => Promise<ParsedDocument>;
