import mysql, { PoolOptions } from "mysql2/promise";
import { config } from "./env";

const poolOptions: PoolOptions = {
  host: config.DB_HOST || "localhost",
  user: config.DB_USER || "root",
  password: config.DB_PASSWORD || "root",
  database: config.DB_NAME || "hrms_db",
  port: config.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const pool = mysql.createPool(poolOptions);
