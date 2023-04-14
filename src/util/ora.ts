import { default as _ora } from 'ora';
import { parseConfig } from '../cli-arguments.js';
import type { Ora, Options } from 'ora';

const { debug } = await parseConfig();

const logger = (message: Options) => {
  if (message) console.log(message);

  const log = (message: string) => {
    if (message) console.log(message);
    return ora;
  };

  const ora = {
    start: log,
    info: log,
    fail: log,
    succeed: log,
    set text(message: string) {
      console.log(message);
    }
  };

  return ora;
};

const ora = function (options?: string | Options): Ora {
  // @ts-ignore
  return debug ? logger(options) : _ora(options);
};

export default ora;
