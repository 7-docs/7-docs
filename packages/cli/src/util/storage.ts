import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

type Config = Record<string, Record<string, string>>;

const filePath = path.join(os.homedir(), '.7d.json');

let config: Config;
try {
  config = JSON.parse(String(fs.readFileSync(filePath)));
} catch {
  // Intentionally ignore
}

export const get = (db: string, key: string) => config?.[db]?.[key];

export const set = (db: string, key: string, value: string) => {
  if (!config) config = {};
  if (!config[db]) config[db] = {};
  config[db][key] = value;
  fs.writeFileSync(filePath, JSON.stringify(config));
  return value;
};

export const getOrSet = (db: string, key: string, value?: string, fallback?: string) => {
  if (value) return set(db, key, value);
  return get(db, key) ?? fallback;
};
