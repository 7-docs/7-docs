import * as fs from './fs.js';
import * as github from './github.js';
import * as http from './http.js';

export const sources = {
  fs,
  github,
  http
} as const;

export const fetchDocuments = async (
  source: keyof typeof sources,
  identifiers: string[],
  options: { repo: string; ignore: string[] }
) => {
  return sources[source].fetchFiles(identifiers, options);
};
