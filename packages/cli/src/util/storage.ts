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

export const get = (section: string, key: string) => config?.[section]?.[key];

export const set = (section: string, key: string, value: string) => {
  if (!config) config = {};
  if (!config[section]) config[section] = {};
  config[section][key] = value;
  fs.writeFileSync(filePath, JSON.stringify(config));
  return value;
};

export const getOrSet = (section: string, key: string, value?: string, fallback?: string) => {
  if (value) return set(section, key, value);
  return get(section, key) ?? fallback;
};
