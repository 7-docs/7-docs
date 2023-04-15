import { OpenAI } from '@7-docs/edge/openai';
import { OPENAI_API_KEY } from '../env.js';

export const openaiListModels = async () => {
  const client = new OpenAI(OPENAI_API_KEY);
  const models = await client.listModels();
  const names = models.map(model => model.id);
  console.log(names.sort().join('\n'));
};
