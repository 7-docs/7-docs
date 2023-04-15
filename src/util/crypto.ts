import { createHash } from 'node:crypto';

export const generateId = (input: string): string => createHash('md5').update(input).digest('hex');
