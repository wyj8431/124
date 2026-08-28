import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { createDatabase } from './database.mjs';
import {
  SqlSecurityError,
  buildSecurityPolicy,
  validateSql,
} from './security.mjs';

const SERVER_NAME = 'chuangkit-mysql';
const SERVER_VERSION = '0.1.0';

const scalarSchema = {
  anyOf: [
    { type: 'string' },
    { type: 'number' },
    { type: 'boolean' },
    { type: 'null' },
  ],
};

const toolDefinitions = [
  {
    name: 'mysql_health',
    description: 'Check the connection and report the authorized database name and MySQL version.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'mysql_list_tables',
    description: 'List tables and views in the configured MySQL database.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'mysql_describe_table',
    description: 'Describe columns for one table in the configured MySQL database.',
    inputSchema: {
      type: 'object',
      properties: { table: { type: 'string', minLength: 1, maxLength: 128 } },
      required: ['table'],
      additionalProperties: false,
    },
  },
  {
    name: 'mysql_query',
    description: 'Run one read-only parameterized SQL statement. SELECT, SHOW, DESCRIBE, and EXPLAIN are allowed.',
    inputSchema: {
      type: 'object',
      properties: {
        sql: { type: 'string', minLength: 1, maxLength: 100000 },
        params: { type: 'array', maxItems: 100, items: scalarSchema },
      },
      required: ['sql'],
      additionalProperties: false,
    },
  },
  {
    name: 'mysql_execute',
    description: 'Run one explicitly confirmed write or DDL SQL statement when server-side opt-ins allow it.',
    inputSchema: {
      type: 'object',
      properties: {
        sql: { type: 'string', minLength: 1, maxLength: 100000 },
        params: { type: 'array', maxItems: 100, items: scalarSchema },
        confirmation: { type: 'string' },
      },
      required: ['sql'],
      additionalProperties: false,
    },
  },
];

function textResult(value) {
  return {
    content: [{ type: 'text', text: JSON.stringify(value, bigintReplacer, 2) }],
  };
}

function errorResult(message) {
  return {
    isError: true,
    content: [{ type: 'text', text: message }],
  };
}

function bigintReplacer(_key, value) {
  return typeof value === 'bigint' ? value.toString() : value;
}

function argsObject(request) {
  const args = request.params?.arguments ?? {};
  if (!args || typeof args !== 'object' || Array.isArray(args)) {
    throw new Error('Tool arguments must be an object.');
  }
  return args;
}

function paramsArray(value) {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value) || value.length > 100) {
    throw new Error('params must be an array with at most 100 scalar values.');
  }
  for (const param of value) {
    if (param !== null && !['string', 'number', 'boolean'].includes(typeof param)) {
      throw new Error('params may contain only strings, numbers, booleans, or null.');
    }
  }
  return value;
}

function limitedResult(result, maxRows) {
  if (!Array.isArray(result.rows)) {
    return result;
  }
  const rows = result.rows.slice(0, maxRows);
  return {
    ...result,
    rows,
    returnedRows: rows.length,
    truncated: result.rows.length > rows.length,
  };
}

export function createMcpServer({ database, policy = buildSecurityPolicy(), logger = console.error }) {
  const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      capabilities: { tools: {} },
      instructions:
        'This server is scoped to one configured MySQL database. Use mysql_query for reads. Writes and DDL are disabled unless explicitly enabled in the server environment and confirmed in the tool arguments.',
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: toolDefinitions }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name } = request.params;

    try {
      const args = argsObject(request);

      if (name === 'mysql_health') {
        return textResult(await database.health());
      }
      if (name === 'mysql_list_tables') {
        return textResult({ tables: await database.listTables() });
      }
      if (name === 'mysql_describe_table') {
        if (typeof args.table !== 'string' || !args.table.trim()) {
          throw new Error('table is required.');
        }
        return textResult({ table: args.table, ...await database.describeTable(args.table) });
      }
      if (name === 'mysql_query' || name === 'mysql_execute') {
        if (typeof args.sql !== 'string') {
          throw new Error('sql is required.');
        }
        const validated = validateSql(args.sql, policy, { confirmation: args.confirmation });
        if (name === 'mysql_query' && validated.kind !== 'read') {
          throw new SqlSecurityError('mysql_query accepts read-only statements; use mysql_execute for writes.');
        }
        if (name === 'mysql_execute' && validated.kind === 'read') {
          throw new SqlSecurityError('mysql_execute accepts writes or DDL; use mysql_query for reads.');
        }
        const result = await database.execute(validated.sql, paramsArray(args.params));
        return textResult({
          operation: validated.operation,
          kind: validated.kind,
          ...limitedResult(result, policy.maxRows),
        });
      }

      throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!(error instanceof SqlSecurityError)) {
        logger(`[${SERVER_NAME}] ${message}`);
      }
      return errorResult(message);
    }
  });

  return server;
}

export async function startServer({ env = process.env, logger = console.error } = {}) {
  const database = createDatabase(env);
  const server = createMcpServer({ database, policy: buildSecurityPolicy(env), logger });
  const transport = new StdioServerTransport();

  const shutdown = async () => {
    await database.close();
    await server.close();
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
  await server.connect(transport);
  return { server, database, transport };
}

const isMain = process.argv[1]
  && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (isMain) {
  startServer().catch((error) => {
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    console.error(`[${SERVER_NAME}] failed to start: ${message}`);
    process.exitCode = 1;
  });
}
