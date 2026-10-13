import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { startApiServer } from './server.js';

const apiPort = Number(process.env.API_PORT || 3001);
const viteCli = resolve('node_modules', 'vite', 'bin', 'vite.js');

if (!existsSync(viteCli)) {
  throw new Error('No se encontró Vite. Instala las dependencias con npm install.');
}

const apiServer = await startApiServer({ host: '127.0.0.1', port: apiPort });
const vite = spawn(process.execPath, [viteCli, ...process.argv.slice(2)], { stdio: 'inherit' });

let shuttingDown = false;
function stop() {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  vite.kill();
  apiServer.close();
}

process.once('SIGINT', stop);
process.once('SIGTERM', stop);
vite.once('error', error => {
  console.error('No se pudo iniciar Vite:', error);
  stop();
  process.exitCode = 1;
});
vite.once('exit', (code, signal) => {
  apiServer.close();
  if (signal) {
    process.exitCode = 1;
  } else {
    process.exitCode = code ?? 0;
  }
});
