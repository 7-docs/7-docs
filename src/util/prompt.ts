import { OPENAI_MAX_COMPLETION_TOKENS, OPENAI_TOKENS_FOR_COMPLETION } from '../constants.js';

const intro = `Answer the question as truthfully as possible using the provided context, and if the answer is not contained within the text below, say "Sorry, I don't have that information.".`;

const getEstimatedTokens = (value: string) => Math.round(value.length / 4);

const _getPrompt = (context: string, query: string) => {
  return `${intro}\n\nContext:${context}\n\nQuestion: ${query}\n\nAnswer:`;
};

const availableTokens =
  OPENAI_MAX_COMPLETION_TOKENS - OPENAI_TOKENS_FOR_COMPLETION - getEstimatedTokens(_getPrompt('', ''));

const getContext = (text: string[]) => {
  const [, promptText] = text.reduce(
    ([remainingTokens, context], text) => {
      const tokens = getEstimatedTokens(text);
      if (tokens > remainingTokens) return [remainingTokens, context];
      return [remainingTokens - tokens, context + '\n' + text];
    },
    [availableTokens, ''] as [number, string]
  );

  return promptText;
};

export const getPrompt = (content: string[], query: string) => {
  const context = getContext(content);
  return _getPrompt(context, query);
};
