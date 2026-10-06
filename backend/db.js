require('dotenv').config();
const { Pool } = require('pg');

const rawUrl = process.env.DATABASE_URL || '';
const isNeon = rawUrl.includes('neon.tech');

// Strip sslmode from the connection string — the explicit ssl option below
// takes precedence and sslmode=verify-full causes ENOTFOUND / cert errors.
const connectionString = rawUrl.replace(/[?&]sslmode=[^&]*/g, (m, offset, str) => {
  // If sslmode was the only query param, remove the ? too
  return m.startsWith('?') ? '' : '';
});

// Each cluster worker gets its own pool.
// Cap per-worker connections so all workers combined stay within Neon's limit.
// Neon free tier allows ~20 connections; with 2 workers: 8 each + headroom.
const WORKERS = parseInt(process.env.WEB_CONCURRENCY) || require('os').cpus().length;
const MAX_PER_WORKER = Math.max(2, Math.floor(18 / WORKERS));

const pool = new Pool({
  connectionString,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
  max: MAX_PER_WORKER,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// ─── Query Builder ────────────────────────────────────────────────────────────
// Mimics the Supabase JS client API used throughout the routes so no route
// file needs to change.

function buildClient(pool) {
  function table(tableName) {
    return new QueryBuilder(pool, tableName);
  }

  return { from: table };
}

class QueryBuilder {
  constructor(pool, tableName) {
    this._pool = pool;
    this._table = tableName;
    this._operation = 'select';
    this._selectCols = '*';
    this._conditions = [];   // { col, op, val }
    this._orConditions = null;
    this._insertData = null;
    this._updateData = null;
    this._orderBy = null;
    this._limitVal = null;
    this._single = false;
    this._countOnly = false;
    this._upsertConflict = null;
    this._returning = null;
    this._joins = [];        // raw JOIN strings
    this._inConditions = []; // { col, vals }
    this._notInConditions = [];
    this._gteConditions = [];
    this._lteConditions = [];
    this._isNullConditions = [];
    this._notNullConditions = [];
    this._head = false;
    this._count = false;
  }

  // ── Chainable methods ──────────────────────────────────────────────────────

  select(cols = '*', opts = {}) {
    // When chained after insert/update/upsert, just mark that we want data back
    if (this._operation === 'insert' || this._operation === 'update' || this._operation === 'upsert') {
      this._selectCols = cols;
      return this;
    }
    this._operation = 'select';
    this._selectCols = cols;
    if (opts.count === 'exact') this._count = true;
    if (opts.head) this._head = true;
    return this;
  }

  insert(data) {
    this._operation = 'insert';
    this._insertData = Array.isArray(data) ? data : [data];
    return this;
  }

  update(data) {
    this._operation = 'update';
    this._updateData = data;
    return this;
  }

  delete() {
    this._operation = 'delete';
    return this;
  }

  upsert(data, opts = {}) {
    this._operation = 'upsert';
    this._insertData = Array.isArray(data) ? data : [data];
    this._upsertConflict = opts.onConflict || null;
    return this;
  }

  eq(col, val) {
    this._conditions.push({ col, op: '=', val });
    return this;
  }

  neq(col, val) {
    this._conditions.push({ col, op: '!=', val });
    return this;
  }

  gte(col, val) {
    this._gteConditions.push({ col, val });
    return this;
  }

  lte(col, val) {
    this._lteConditions.push({ col, val });
    return this;
  }

  gt(col, val) {
    this._conditions.push({ col, op: '>', val });
    return this;
  }

  lt(col, val) {
    this._conditions.push({ col, op: '<', val });
    return this;
  }

  in(col, vals) {
    this._inConditions.push({ col, vals });
    return this;
  }

  like(col, pattern) {
    this._conditions.push({ col, op: 'LIKE', val: pattern });
    return this;
  }

  ilike(col, pattern) {
    this._conditions.push({ col, op: 'ILIKE', val: pattern });
    return this;
  }

  not(col, op, val) {
    if (op === 'in') {
      this._notInConditions.push({ col, vals: val });
    } else if (op === 'is' && val === null) {
      this._notNullConditions.push(col);
    } else {
      this._conditions.push({ col, op: `NOT ${op}`, val });
    }
    return this;
  }

  is(col, val) {
    if (val === null) this._isNullConditions.push(col);
    return this;
  }

  or(conditionStr) {
    this._orConditions = conditionStr;
    return this;
  }

  order(col, opts = {}) {
    this._orderBy = { col, ascending: opts.ascending !== false };
    return this;
  }

  limit(n) {
    this._limitVal = n;
    return this;
  }

  single() {
    this._single = true;
    if (this._operation === 'select') this._limitVal = 1;
    return this;
  }

  maybeSingle() {
    this._single = true;
    if (this._operation === 'select') this._limitVal = 1;
    return this;
  }

  // ── Execute ────────────────────────────────────────────────────────────────

  then(resolve, reject) {
    return this._execute().then(resolve, reject);
  }

  async _execute() {
    try {
      const result = await this._run();
      return result;
    } catch (err) {
      return { data: null, error: err, count: null };
    }
  }

  async _run() {
    const { text, values } = this._buildSQL();

    if (this._head) {
      // COUNT only
      const countSQL = `SELECT COUNT(*) FROM "${this._table}"${this._whereClause(values).where}`;
      const r = await this._pool.query(countSQL, values);
      return { data: null, error: null, count: parseInt(r.rows[0].count, 10) };
    }

    const r = await this._pool.query(text, values);

    if (this._count) {
      return { data: r.rows, error: null, count: r.rowCount };
    }

    if (this._single) {
      return { data: r.rows[0] || null, error: null };
    }

    // insert/update/upsert without .single() — return first row if only one
    if (this._operation !== 'select' && r.rows.length === 1) {
      return { data: r.rows[0], error: null };
    }

    return { data: r.rows, error: null };
  }

  _buildSQL() {
    const values = [];

    const addVal = (v) => {
      values.push(v);
      return `$${values.length}`;
    };

    const { where } = this._whereClause(values, addVal);

    let text = '';

    if (this._operation === 'select') {
      const cols = this._parseSelectCols(values, addVal);
      text = `SELECT ${cols} FROM "${this._table}"${where}`;
      if (this._orderBy) {
        text += ` ORDER BY "${this._orderBy.col}" ${this._orderBy.ascending ? 'ASC' : 'DESC'}`;
      }
      if (this._limitVal) text += ` LIMIT ${this._limitVal}`;
    }

    else if (this._operation === 'insert') {
      const rows = this._insertData;
      const keys = Object.keys(rows[0]);
      const cols = keys.map(k => `"${k}"`).join(', ');
      const rowPlaceholders = rows.map(row => {
        const ph = keys.map(k => addVal(this._serialize(row[k]))).join(', ');
        return `(${ph})`;
      }).join(', ');
      text = `INSERT INTO "${this._table}" (${cols}) VALUES ${rowPlaceholders}`;
      if (this._returning !== false) text += ' RETURNING *';
    }

    else if (this._operation === 'upsert') {
      const rows = this._insertData;
      const keys = Object.keys(rows[0]);
      const cols = keys.map(k => `"${k}"`).join(', ');
      const rowPlaceholders = rows.map(row => {
        const ph = keys.map(k => addVal(this._serialize(row[k]))).join(', ');
        return `(${ph})`;
      }).join(', ');
      const conflictCol = this._upsertConflict || keys[0];
      const conflictCols = conflictCol.split(',').map(c => `"${c.trim()}"`).join(', ');
      const updateSet = keys.filter(k => !conflictCol.split(',').map(c => c.trim()).includes(k)).map(k => `"${k}" = EXCLUDED."${k}"`).join(', ');
      text = `INSERT INTO "${this._table}" (${cols}) VALUES ${rowPlaceholders} ON CONFLICT (${conflictCols}) DO UPDATE SET ${updateSet} RETURNING *`;
    }

    else if (this._operation === 'update') {
      const keys = Object.keys(this._updateData);
      const setClause = keys.map(k => `"${k}" = ${addVal(this._serialize(this._updateData[k]))}`).join(', ');
      text = `UPDATE "${this._table}" SET ${setClause}${where} RETURNING *`;
    }

    else if (this._operation === 'delete') {
      text = `DELETE FROM "${this._table}"${where}`;
    }

    return { text, values };
  }

  _whereClause(values, addVal) {
    if (!addVal) {
      // read-only path for count
      addVal = (v) => { values.push(v); return `$${values.length}`; };
    }

    const parts = [];

    this._conditions.forEach(({ col, op, val }) => {
      parts.push(`"${col}" ${op} ${addVal(val)}`);
    });

    this._gteConditions.forEach(({ col, val }) => {
      parts.push(`"${col}" >= ${addVal(val)}`);
    });

    this._lteConditions.forEach(({ col, val }) => {
      parts.push(`"${col}" <= ${addVal(val)}`);
    });

    this._inConditions.forEach(({ col, vals }) => {
      if (!vals || vals.length === 0) {
        parts.push('FALSE');
      } else {
        const phs = vals.map(v => addVal(v)).join(', ');
        parts.push(`"${col}" IN (${phs})`);
      }
    });

    this._notInConditions.forEach(({ col, vals }) => {
      if (vals && vals.length > 0) {
        const phs = vals.map(v => addVal(v)).join(', ');
        parts.push(`"${col}" NOT IN (${phs})`);
      }
    });

    this._isNullConditions.forEach(col => {
      parts.push(`"${col}" IS NULL`);
    });

    this._notNullConditions.forEach(col => {
      parts.push(`"${col}" IS NOT NULL`);
    });

    if (this._orConditions) {
      // Parse simple Supabase OR strings like:
      // "status.eq.pending,status.is.null"
      // "user_id.eq.1,friend_id.eq.1"
      // "and(user_id.eq.X,friend_id.eq.Y),and(user_id.eq.Y,friend_id.eq.X)"
      const orStr = this._orConditions;
      const orParts = this._parseOrString(orStr, addVal);
      if (orParts) parts.push(`(${orParts})`);
    }

    const where = parts.length > 0 ? ` WHERE ${parts.join(' AND ')}` : '';
    return { where };
  }

  _parseOrString(str, addVal) {
    // Handle "and(...),and(...)" pattern
    if (str.startsWith('and(')) {
      const andGroups = str.match(/and\(([^)]+)\)/g) || [];
      const groupSQLs = andGroups.map(group => {
        const inner = group.slice(4, -1);
        const conditions = inner.split(',').map(c => this._parseConditionStr(c.trim(), addVal));
        return `(${conditions.join(' AND ')})`;
      });
      return groupSQLs.join(' OR ');
    }

    // Handle "col.op.val,col.op.val" pattern
    const parts = str.split(',').map(c => this._parseConditionStr(c.trim(), addVal));
    return parts.join(' OR ');
  }

  _parseConditionStr(condStr, addVal) {
    const parts = condStr.split('.');
    const col = parts[0];
    const op = parts[1];
    const val = parts.slice(2).join('.');

    if (op === 'eq') return `"${col}" = ${addVal(val)}`;
    if (op === 'neq') return `"${col}" != ${addVal(val)}`;
    if (op === 'is' && val === 'null') return `"${col}" IS NULL`;
    if (op === 'gte') return `"${col}" >= ${addVal(val)}`;
    if (op === 'lte') return `"${col}" <= ${addVal(val)}`;
    return `"${col}" = ${addVal(val)}`;
  }

  _parseSelectCols(values, addVal) {
    const cols = this._selectCols;
    // If it's a simple column list or *, return as-is (quoted)
    if (cols === '*') return '*';

    // Handle Supabase join syntax: "*, users!creator_id(first_name, last_name)"
    // We flatten joins into a simple column list from the main table only
    // (complex joins are handled by returning all columns)
    if (cols.includes('!') || cols.includes('(')) {
      return '*';
    }

    // Simple comma-separated columns
    return cols.split(',').map(c => {
      const trimmed = c.trim();
      if (trimmed === '*') return '*';
      return `"${trimmed}"`;
    }).join(', ');
  }

  _serialize(val) {
    if (val === null || val === undefined) return null;
    if (Array.isArray(val)) return val; // Let pg driver handle TEXT[] natively
    if (typeof val === 'object') return JSON.stringify(val);
    return val;
  }

  // Supabase-style RPC stub (no-op, returns empty)
  rpc() {
    return Promise.resolve({ data: null, error: null });
  }
}

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = { pool, buildClient };
