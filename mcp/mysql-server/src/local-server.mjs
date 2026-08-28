import { execFileSync } from 'node:child_process';

import { startServer } from './server.mjs';

function readWindowsUserEnvironment(name) {
  if (process.platform !== 'win32') {
    return undefined;
  }

  try {
    const output = execFileSync(
      'reg.exe',
      ['query', 'HKCU\\Environment', '/v', name],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
    const match = output.match(new RegExp(`${name}\\s+REG_(?:SZ|EXPAND_SZ)\\s+(.+)`, 'i'));
    return match?.[1]?.trim() || undefined;
  } catch {
    return undefined;
  }
}

const env = { ...process.env };
env.MYSQL_HOST = '127.0.0.1';
env.MYSQL_PORT = '3307';
env.MYSQL_DATABASE = 'chuangkit';
env.MYSQL_USER = 'chuangkit_mcp';
env.MYSQL_PASSWORD = env.MYSQL_PASSWORD || readWindowsUserEnvironment('CHUANGKIT_MCP_MYSQL_PASSWORD') || '';
env.MYSQL_MCP_ALLOW_WRITE = 'false';
env.MYSQL_MCP_ALLOW_DDL = 'false';
env.MYSQL_MCP_MAX_ROWS = '100';

if (!env.MYSQL_PASSWORD) {
  console.error('CHUANGKIT_MCP_MYSQL_PASSWORD is not configured for the current Windows user.');
  process.exit(1);
}

await startServer({ env });
