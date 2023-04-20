const chatCompletionModels = [
  'gpt-4',
  'gpt-4-0314',
  'gpt-4-32k',
  'gpt-4-32k-0314',
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-0301'
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const completionModels = [
  'text-davinci-003',
  'text-davinci-002',
  'text-curie-001',
  'text-babbage-001',
  'text-ada-001',
  'davinci',
  'curie',
  'babbage',
  'ada'
];

export const isChatCompletionModel = (value: string) => chatCompletionModels.includes(value);
