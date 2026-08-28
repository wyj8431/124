import test from 'node:test';
import assert from 'node:assert/strict';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

import { createMcpServer } from '../src/server.mjs';
import { DEFAULT_WRITE_CONFIRMATION, buildSecurityPolicy } from '../src/security.mjs';

function fakeDatabase() {
  const calls = [];
  return {
    calls,
    async health() {
      return { ok: true, database: 'test_db', version: '8.0.test' };
    },
    async listTables() {
      return [{ name: 'users', type: 'BASE TABLE' }];
    },
    async describeTable(table) {
      return { rows: [{ Field: table, Type: 'varchar(255)' }], rowCount: 1, fields: [] };
    },
    async execute(sql, params) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 1, name: 'demo' }],
        rowCount: 1,
        fields: [{ name: 'id', type: 3 }],
      };
    },
  };
}

async function connectedTestClient(database, policy = buildSecurityPolicy({})) {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createMcpServer({ database, policy, logger: () => {} });
  const client = new Client({ name: 'mysql-mcp-test-client', version: '1.0.0' });

  await server.connect(serverTransport);
  await client.connect(clientTransport);
  return { client, server };
}

test('MCP discovery and read invocation work over the protocol', async () => {
  const database = fakeDatabase();
  const { client, server } = await connectedTestClient(database);

  try {
    const listed = await client.listTools();
    assert.deepEqual(
      listed.tools.map((tool) => tool.name),
      ['mysql_health', 'mysql_list_tables', 'mysql_describe_table', 'mysql_query', 'mysql_execute'],
    );

    const result = await client.callTool({
      name: 'mysql_query',
      arguments: { sql: 'SELECT id, name FROM users WHERE id = ?', params: [1] },
    });
    const payload = JSON.parse(result.content[0].text);

    assert.equal(result.isError, undefined);
    assert.equal(payload.kind, 'read');
    assert.deepEqual(payload.rows, [{ id: 1, name: 'demo' }]);
    assert.deepEqual(database.calls, [{
      sql: 'SELECT id, name FROM users WHERE id = ?',
      params: [1],
    }]);
  } finally {
    await client.close();
    await server.close();
  }
});

test('MCP write invocation is denied while write access is disabled', async () => {
  const database = fakeDatabase();
  const { client, server } = await connectedTestClient(database);

  try {
    const result = await client.callTool({
      name: 'mysql_execute',
      arguments: {
        sql: 'UPDATE users SET name = ? WHERE id = ?',
        params: ['changed', 1],
        confirmation: DEFAULT_WRITE_CONFIRMATION,
      },
    });

    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /disabled/i);
    assert.deepEqual(database.calls, []);
  } finally {
    await client.close();
    await server.close();
  }
});
