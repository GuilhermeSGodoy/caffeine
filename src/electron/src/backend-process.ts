import { ChildProcess, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const DEV_API_URL = 'http://127.0.0.1:5000';
const BACKEND_EXECUTABLE = process.platform === 'win32' ? 'Caffeine.Api.exe' : 'Caffeine.Api';
const PORT_LINE_PATTERN = /^PORT=(\d+)/;

export interface BackendHandle {
  apiBaseUrl: string;
  process: ChildProcess | null;
}

export async function startBackend(dataDir: string, resourcesPath: string): Promise<BackendHandle> {
  const backendPath = path.join(resourcesPath, 'backend', BACKEND_EXECUTABLE);

  if (!fs.existsSync(backendPath)) {
    // Dev: o backend roda separadamente via `dotnet watch run` numa porta fixa.
    return { apiBaseUrl: `${DEV_API_URL}/api`, process: null };
  }

  const child = spawn(backendPath, [], {
    env: { ...process.env, CAFFEINE_DATA_DIR: dataDir },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const port = await new Promise<number>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Backend não respondeu a tempo com a porta.')), 15000);

    child.stdout?.on('data', (chunk: Buffer) => {
      for (const line of chunk.toString().split(/\r?\n/)) {
        const match = PORT_LINE_PATTERN.exec(line);
        if (match) {
          clearTimeout(timeout);
          resolve(Number(match[1]));
          return;
        }
      }
    });

    child.on('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Backend encerrou antes de reportar a porta (código ${code}).`));
    });
  });

  return { apiBaseUrl: `http://127.0.0.1:${port}/api`, process: child };
}

export function stopBackend(handle: BackendHandle): void {
  handle.process?.kill();
}
