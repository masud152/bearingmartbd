import "server-only";
import mysql, { type Pool, type PoolConnection, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

type Queryable = Pool | PoolConnection;

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for database access.`);
  return value;
}

let pool: Pool | undefined;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: required("DB_HOST"),
      port: Number(process.env.DB_PORT || 3306),
      database: required("DB_NAME"),
      user: required("DB_USER"),
      password: required("DB_PASSWORD"),
      waitForConnections: true,
      connectionLimit: 10,
      charset: "utf8mb4",
      timezone: "Z",
    });
  }
  return pool;
}

function mysqlSql(sql: string) {
  return sql
    .replace(/INSERT\s+OR\s+IGNORE/gi, "INSERT IGNORE")
    .replace(/datetime\('now'\)/gi, "UTC_TIMESTAMP()");
}

class Statement {
  constructor(private readonly sql: string, private readonly values: unknown[] = []) {}

  bind(...values: unknown[]) { return new Statement(this.sql, values); }

  private async execute(client: Queryable = getPool()) {
    return client.execute(mysqlSql(this.sql), this.values);
  }

  async all<T>() {
    const [rows] = await this.execute();
    return { results: rows as T[] };
  }

  async first<T>() {
    const [rows] = await this.execute();
    return (rows as T[])[0] ?? null;
  }

  async run() {
    const [result] = await this.execute();
    return result as ResultSetHeader;
  }

  async executeOn(client: PoolConnection) { return this.execute(client); }
}

class Database {
  prepare(sql: string) { return new Statement(sql); }

  async batch(statements: Statement[]) {
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      const results = [];
      for (const statement of statements) results.push(await statement.executeOn(connection));
      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async ping() {
    const [rows] = await getPool().query<RowDataPacket[]>("SELECT 1 AS ok");
    return rows[0]?.ok === 1;
  }
}

export const db = new Database();
