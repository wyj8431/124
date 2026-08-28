import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_WRITE_CONFIRMATION,
  DEFAULT_DDL_CONFIRMATION,
  SqlSecurityError,
  buildSecurityPolicy,
  validateSql,
} from '../src/security.mjs';

test('write access is disabled by default', () => {
  const policy = buildSecurityPolicy({});

  assert.equal(policy.allowWrite, false);
  assert.equal(policy.allowDdl, false);
  assert.throws(
    () => validateSql('UPDATE users SET name = ? WHERE id = ?', policy, {
      confirmation: DEFAULT_WRITE_CONFIRMATION,
    }),
    (error) => error instanceof SqlSecurityError && /disabled/i.test(error.message),
  );
});

test('read-only statements are accepted and normalized', () => {
  const policy = buildSecurityPolicy({ MYSQL_MCP_MAX_ROWS: '25' });

  assert.equal(policy.maxRows, 25);
  assert.equal(
    validateSql('  /* report */ SELECT id, name FROM users  ', policy).kind,
    'read',
  );
  assert.equal(validateSql('SHOW TABLES', policy).kind, 'read');
  assert.equal(validateSql('DESCRIBE users', policy).kind, 'read');
});

test('writes require both configuration and an exact confirmation', () => {
  const policy = buildSecurityPolicy({ MYSQL_MCP_ALLOW_WRITE: 'true' });

  assert.throws(
    () => validateSql('DELETE FROM users WHERE id = ?', policy),
    (error) => error instanceof SqlSecurityError && /confirmation/i.test(error.message),
  );
  assert.equal(
    validateSql('DELETE FROM users WHERE id = ?', policy, {
      confirmation: DEFAULT_WRITE_CONFIRMATION,
    }).kind,
    'write',
  );
});

test('DDL requires its own opt-in and confirmation', () => {
  const policy = buildSecurityPolicy({
    MYSQL_MCP_ALLOW_WRITE: 'true',
    MYSQL_MCP_ALLOW_DDL: 'true',
  });

  assert.throws(
    () => validateSql('DROP TABLE users', policy, {
      confirmation: DEFAULT_WRITE_CONFIRMATION,
    }),
    (error) => error instanceof SqlSecurityError && /DDL/i.test(error.message),
  );
  assert.equal(
    validateSql('CREATE TABLE audit_log (id INT PRIMARY KEY)', policy, {
      confirmation: DEFAULT_DDL_CONFIRMATION,
    }).kind,
    'ddl',
  );
});

test('multiple statements and dangerous file operations are rejected', () => {
  const policy = buildSecurityPolicy({});

  for (const sql of [
    'SELECT 1; SELECT 2',
    'SELECT LOAD_FILE(?)',
    'SELECT * FROM users INTO OUTFILE \'/tmp/users.csv\'',
    'LOAD DATA LOCAL INFILE \'users.csv\' INTO TABLE users',
  ]) {
    assert.throws(
      () => validateSql(sql, policy),
      (error) => error instanceof SqlSecurityError,
      sql,
    );
  }
});

test('invalid limits fall back to a bounded default', () => {
  assert.equal(buildSecurityPolicy({ MYSQL_MCP_MAX_ROWS: 'not-a-number' }).maxRows, 100);
  assert.equal(buildSecurityPolicy({ MYSQL_MCP_MAX_ROWS: '999999' }).maxRows, 10000);
  assert.equal(buildSecurityPolicy({ MYSQL_MCP_MAX_ROWS: '-1' }).maxRows, 100);
});
