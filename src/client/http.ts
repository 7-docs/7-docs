import type { FetchFiles } from '../types.js';

export const fetchFiles: FetchFiles = async urls => {
  return Promise.all(
    urls.map(async url => {
      const _url = new URL(url);
      const response = await fetch(_url);
      if (!response.ok) console.error(`${response.status} ${response.statusText}: ${url}`);
      const filePath = _url.pathname.replace(/(\.html?)?$/, '.html');
      return {
        filePath,
        url,
        content: Buffer.from(await response.arrayBuffer())
      };
    })
  );
};
