// Don't allow `null` values (not supported in Pinecone)
export interface MetaData {
  filePath: string;
  url: string;
  content: string;
  title: string; // document title
  header?: string; // section header
}

export interface StreamMetaData extends Partial<MetaData> {
  score?: number;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens?: number;
  total_tokens: number;
}

export type Params = {
  query?: string;
  previousQueries?: string[];
  previousResponses?: string[];
  embedding_model?: string;
  completion_model?: string;
  stream?: boolean;
};

interface BaseEventData {
  id: string;
  created: number;
  model: string;
}

export interface ChatCompletionEventData extends BaseEventData {
  object: 'chat.completion.chunk';
  choices: {
    delta: {
      content: string;
    };
  }[];
}

export interface CompletionEventData extends BaseEventData {
  object: 'text_completion';
  choices: {
    text: string;
    index: number;
    finish_reason: string;
  }[];
}

export type EventData = CompletionEventData | ChatCompletionEventData;
