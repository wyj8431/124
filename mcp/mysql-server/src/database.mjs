import mysql from 'mysql2/promise';

export class DatabaseConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseConfigError';
  }
}

export class DatabaseInputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseInputError';
  }
}

function integerFromEnv(value, fallback, { min, max }) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    return fallback;
  }
  return parsed;
}

function isEnabled(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value ?? '').trim().toLowerCase());
}

export function readDatabaseConfig(env = process.env) {
  const host = String(env.MYSQL_HOST ?? '127.0.0.1').trim();
  const database = String(env.MYSQL_DATABASE ?? '').trim();
  const user = String(env.MYSQL_USER ?? env.MYSQL_USERNAME ?? '').trim();

  if (!host) {
    throw new DatabaseConfigError('MYSQL_HOST must not be empty.');
  }
  if (!database) {
    throw new DatabaseConfigError('MYSQL_DATABASE is required.');
  }
  if (!user) {
    throw new DatabaseConfigError('MYSQL_USER or MYSQL_USERNAME is required.');
  }

  const config = {
    host,
    port: integerFromEnv(env.MYSQL_PORT, 3306, { min: 1, max: 65_535 }),
    database,
    user,
    password: String(env.MYSQL_PASSWORD ?? ''),
    connectionLimit: integerFromEnv(env.MYSQL_CONNECTION_LIMIT, 5, { min: 1, max: 50 }),
    connectTimeout: integerFromEnv(env.MYSQL_CONNECT_TIMEOUT_MS, 10_000, { min: 500, max: 120_000 }),
    multipleStatements: false,
    waitForConnections: true,
    enableKeepAlive: true,
    charset: 'utf8mb4',
    supportBigNumbers: true,
    bigNumberStrings: true,
  };

  if (isEnabled(env.MYSQL_SSL)) {
    config.ssl = {
      rejectUnauthorized: !['0', 'false', 'no', 'off'].includes(
        String(env.MYSQL_SSL_REJECT_UNAUTHORIZED ?? 'true').trim().toLowerCase(),
      ),
    };
    if (env.MYSQL_SSL_CA) {
      config.ssl.ca = String(env.MYSQL_SSL_CA);
    }
  }

  return config;
}

function quoteIdentifier(identifier) {
  if (typeof identifier !== 'string' || !/^[A-Za-z0-9_$]+$/.test(identifier)) {
    throw new DatabaseInputError(
      'Table names must contain only letters, numbers, underscores, or dollar signs.',
    );
  }
  return `\`${identifier}\``;
}

function fieldMetadata(fields) {
  if (!Array.isArray(fields)) {
    return [];
  }
  return fields.map((field) => ({
    name: field.name,
    table: field.table,
    database: field.db,
    type: field.type,
    typeName: field.typeName,
  }));
}

function normalizeExecution(rows, fields) {
  if (Array.isArray(rows)) {
    return {
      rows,
      rowCount: rows.length,
      fields: fieldMetadata(fields),
    };
  }

  return {
    rows: [],
    rowCount: 0,
    fields: [],
    affectedRows: rows?.affectedRows ?? 0,
    changedRows: rows?.changedRows ?? 0,
    insertId: rows?.insertId ?? 0,
    warningStatus: rows?.warningStatus ?? 0,
  };
}

export function createDatabase(env = process.env) {
  const config = readDatabaseConfig(env);
  const pool = mysql.createPool(config);

  return {
    config: {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
    },

    async execute(sql, params = []) {
      const [rows, fields] = await pool.execute(sql, params);
      return normalizeExecution(rows, fields);
    },

    async health() {
      const [rows] = await pool.query('SELECT 1 AS ok, VERSION() AS version');
      return {
        ok: rows?.[0]?.ok === 1 || rows?.[0]?.ok === '1',
        version: rows?.[0]?.version ?? null,
        database: config.database,
      };
    },

    async listTables() {
      const result = await this.execute('SHOW FULL TABLES');
      return result.rows.map((row) => {
        const nameKey = Object.keys(row).find((key) => key.startsWith('Tables_in_'));
        return {
          name: nameKey ? row[nameKey] : null,
          type: row.Table_type ?? null,
        };
      });
    },

    async describeTable(table) {
      return this.execute(`SHOW FULL COLUMNS FROM ${quoteIdentifier(table)}`);
    },

    async close() {
      await pool.end();
    },
  };
}
