import dotenv from "dotenv";
import path from "path";
dotenv.config();

interface Config {
  EMAIL_USER: string;
  EMAIL_PASS: string;
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
}

export const config: Config = {
  PORT: Number(process.env.PORT),
  DB_NAME: process.env.DB_NAME || "",
  DB_USER: process.env.DB_USER || "",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_HOST: process.env.DB_HOST || "",
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || "",
  DB_PORT: Number(process.env.DB_PORT) || 3306,
};


