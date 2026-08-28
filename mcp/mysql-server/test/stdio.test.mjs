import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.resolve(here, '../src/server.mjs');

test('the production server exposes tools over stdio without opening a query', async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
    cwd: path.resolve(here, '..'),
    stderr: 'pipe',
    env: {
      MYSQL_HOST: '127.0.0.1',
      MYSQL_PORT: '3306',
      MYSQL_DATABASE: 'mcp_protocol_discovery_only',
      MYSQL_USER: 'mcp_discovery_only',
      MYSQL_PASSWORD: '',
      MYSQL_MCP_ALLOW_WRITE: 'false',
      MYSQL_MCP_ALLOW_DDL: 'false',
    },
  });
  const client = new Client({ name: 'stdio-test-client', version: '1.0.0' });

  try {
    await client.connect(transport);
    const listed = await client.listTools();
    assert.equal(listed.tools.some((tool) => tool.name === 'mysql_query'), true);
    assert.equal(listed.tools.some((tool) => tool.name === 'mysql_execute'), true);
  } finally {
    await client.close();
  }
});
