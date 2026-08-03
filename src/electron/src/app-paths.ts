import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export function resolveDataDir(): string {
  const dataDir = path.join(app.getPath('appData'), 'Caffeine');
  fs.mkdirSync(dataDir, { recursive: true });
  return dataDir;
}
