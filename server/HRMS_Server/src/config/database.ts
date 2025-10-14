import mysql, { PoolOptions } from "mysql2/promise";
import { config } from "./env";

const poolOptions: PoolOptions = {
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  port: config.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const pool = mysql.createPool(poolOptions);
