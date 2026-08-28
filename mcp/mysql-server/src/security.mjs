export const DEFAULT_WRITE_CONFIRMATION = 'I_UNDERSTAND_WRITE_ACCESS';
export const DEFAULT_DDL_CONFIRMATION = 'I_UNDERSTAND_DDL_ACCESS';
export const DEFAULT_MAX_ROWS = 100;
export const MAX_ALLOWED_ROWS = 10_000;

const READ_OPERATIONS = new Set(['SELECT', 'SHOW', 'DESCRIBE', 'DESC', 'EXPLAIN']);
const WRITE_OPERATIONS = new Set(['INSERT', 'UPDATE', 'DELETE', 'REPLACE']);
const DDL_OPERATIONS = new Set(['CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'RENAME']);

export class SqlSecurityError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SqlSecurityError';
  }
}

function isEnabled(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value ?? '').trim().toLowerCase());
}

function boundedMaxRows(value) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return DEFAULT_MAX_ROWS;
  }
  return Math.min(parsed, MAX_ALLOWED_ROWS);
}

export function buildSecurityPolicy(env = process.env) {
  return {
    allowWrite: isEnabled(env.MYSQL_MCP_ALLOW_WRITE),
    allowDdl: isEnabled(env.MYSQL_MCP_ALLOW_DDL),
    maxRows: boundedMaxRows(env.MYSQL_MCP_MAX_ROWS),
    writeConfirmation: DEFAULT_WRITE_CONFIRMATION,
    ddlConfirmation: DEFAULT_DDL_CONFIRMATION,
  };
}

function stripCommentsAndValidateStatements(sql) {
  let cleaned = '';
  let quote = null;
  let semicolonCount = 0;

  for (let index = 0; index < sql.length; index += 1) {
    const current = sql[index];
    const next = sql[index + 1];

    if (quote) {
      cleaned += current;
      if (current === '\\' && index + 1 < sql.length) {
        cleaned += sql[index + 1];
        index += 1;
      } else if (current === quote) {
        if (sql[index + 1] === quote) {
          cleaned += sql[index + 1];
          index += 1;
        } else {
          quote = null;
        }
      }
      continue;
    }

    if (current === '\'' || current === '"' || current === '`') {
      quote = current;
      cleaned += current;
      continue;
    }

    if (current === '-' && next === '-' && /\s/.test(sql[index + 2] ?? '')) {
      cleaned += ' ';
      index += 2;
      while (index + 1 < sql.length && sql[index + 1] !== '\n' && sql[index + 1] !== '\r') {
        index += 1;
      }
      continue;
    }

    if (current === '#') {
      cleaned += ' ';
      while (index + 1 < sql.length && sql[index + 1] !== '\n' && sql[index + 1] !== '\r') {
        index += 1;
      }
      continue;
    }

    if (current === '/' && next === '*') {
      const end = sql.indexOf('*/', index + 2);
      if (end === -1) {
        throw new SqlSecurityError('SQL contains an unterminated comment.');
      }
      cleaned += ' ';
      index = end + 1;
      continue;
    }

    if (current === ';') {
      semicolonCount += 1;
    }
    cleaned += current;
  }

  if (semicolonCount > 1 || (semicolonCount === 1 && !/;\s*$/.test(cleaned))) {
    throw new SqlSecurityError('Only one SQL statement is allowed.');
  }

  return cleaned.replace(/;\s*$/, '').trim();
}

function operationOf(sql) {
  const match = sql.match(/^([a-z]+)/i);
  return match?.[1]?.toUpperCase() ?? '';
}

function rejectDangerousConstructs(sql) {
  if (/\bLOAD_FILE\s*\(/i.test(sql)) {
    throw new SqlSecurityError('LOAD_FILE is not allowed through this MCP server.');
  }
  if (/\bLOAD\s+DATA\b/i.test(sql)) {
    throw new SqlSecurityError('LOAD DATA is not allowed through this MCP server.');
  }
  if (/\bINTO\s+(?:OUTFILE|DUMPFILE)\b/i.test(sql)) {
    throw new SqlSecurityError('Writing query results to files is not allowed.');
  }
  if (/\b(?:FOR\s+UPDATE|LOCK\s+IN\s+SHARE\s+MODE)\b/i.test(sql)) {
    throw new SqlSecurityError('Locking reads are not allowed through the read-only query tool.');
  }
}

export function validateSql(sql, policy = buildSecurityPolicy(), options = {}) {
  if (typeof sql !== 'string' || sql.trim().length === 0) {
    throw new SqlSecurityError('SQL must be a non-empty string.');
  }
  if (sql.length > 100_000) {
    throw new SqlSecurityError('SQL is too long.');
  }

  const normalizedSql = stripCommentsAndValidateStatements(sql);
  if (!normalizedSql) {
    throw new SqlSecurityError('SQL must contain a statement.');
  }

  rejectDangerousConstructs(normalizedSql);

  const operation = operationOf(normalizedSql);
  const confirmation = options.confirmation;

  if (READ_OPERATIONS.has(operation)) {
    return { sql: normalizedSql, operation, kind: 'read' };
  }

  if (WRITE_OPERATIONS.has(operation)) {
    if (!policy.allowWrite) {
      throw new SqlSecurityError('Write access is disabled by MYSQL_MCP_ALLOW_WRITE.');
    }
    if (confirmation !== policy.writeConfirmation) {
      throw new SqlSecurityError(`Write operations require confirmation: ${policy.writeConfirmation}.`);
    }
    return { sql: normalizedSql, operation, kind: 'write' };
  }

  if (DDL_OPERATIONS.has(operation)) {
    if (!policy.allowWrite) {
      throw new SqlSecurityError('Write access is disabled by MYSQL_MCP_ALLOW_WRITE.');
    }
    if (!policy.allowDdl) {
      throw new SqlSecurityError('DDL access is disabled by MYSQL_MCP_ALLOW_DDL.');
    }
    if (confirmation !== policy.ddlConfirmation) {
      throw new SqlSecurityError(`DDL operations require confirmation: ${policy.ddlConfirmation}.`);
    }
    return { sql: normalizedSql, operation, kind: 'ddl' };
  }

  throw new SqlSecurityError(
    `SQL operation ${operation || '<unknown>'} is not allowed. Use SELECT, SHOW, DESCRIBE, EXPLAIN, or an explicitly enabled write operation.`,
  );
}
