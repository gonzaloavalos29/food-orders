// Runner de tests por workspace, con encabezado DOMAIN / FRONTEND / BACKEND.
//
// Modos (primer argumento):
//   checks    (default) -> muestra SOLO las líneas con tilde verde (✓)
//   full                -> muestra toda la salida (errores incluidos)
//   coverage            -> muestra el reporte de coverage completo
//
// Ejecuta cada workspace por separado (sin `foreach`) para poder etiquetar la
// salida y conservar un código de salida agregado real.
import { spawn } from 'node:child_process';

const mode = process.argv[2] ?? 'checks';
const isCoverage = mode === 'coverage';
const onlyChecks = mode === 'checks';

const CYAN = '\x1b[1m\x1b[36m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

// script = nombre del script en el package.json del workspace, o null si no aplica.
const WORKSPACES = [
  { label: 'DOMAIN', name: '@food-orders/domain', script: isCoverage ? 'test:coverage' : 'test' },
  { label: 'FRONTEND', name: '@food-orders/frontend', script: isCoverage ? 'test:coverage' : 'test' },
  { label: 'BACKEND', name: '@food-orders/backend', script: isCoverage ? null : 'test' },
];

function keepLine(line) {
  if (!onlyChecks) return true; // full / coverage -> todo
  const plain = line.replace(/\x1b\[[0-9;]*m/g, '');
  return plain.includes('✓') || plain.includes('√');
}

function runOne(ws) {
  return new Promise((resolve) => {
    process.stdout.write(`\n${CYAN}=== ${ws.label} ===${RESET}\n`);

    if (!ws.script) {
      process.stdout.write(`  ${DIM}(sin tests)${RESET}\n`);
      return resolve(0);
    }

    const child = spawn('yarn', ['workspace', ws.name, 'run', ws.script], {
      env: { ...process.env, FORCE_COLOR: '1' },
      shell: true,
    });

    let buffer = '';
    let printed = 0;

    const emit = (line) => {
      if (keepLine(line)) {
        process.stdout.write(line + '\n');
        printed++;
      }
    };
    const onData = (data) => {
      buffer += data.toString();
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';
      for (const line of lines) emit(line);
    };

    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('close', (code) => {
      if (buffer) emit(buffer);
      if (onlyChecks && printed === 0) {
        process.stdout.write(`  ${DIM}(sin tests)${RESET}\n`);
      }
      resolve(code ?? 0);
    });
  });
}

let failed = 0;
for (const ws of WORKSPACES) {
  const code = await runOne(ws);
  if (code !== 0) failed = code;
}
process.stdout.write('\n');
process.exit(failed);
