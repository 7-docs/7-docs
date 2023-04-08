export type MetaData = {
  title: string;
  filePath: string;
  url: string | null;
  text: string;
};

export interface Usage {
  prompt_tokens: number;
  completion_tokens?: number;
  total_tokens: number;
}
