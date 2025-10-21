import express, { Application } from 'express';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { pool } from './config/database';
import { config } from './config/env';
import index from './routes/index';
import { notFound } from './middlewares/notFound.middleware';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

dotenv.config();

class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    var corsOptions = {
      origin: /[^.*:4200$]/,
      optionsSuccessStatus: 200,
      credentials: true,
    };
    this.app.use(cors(corsOptions));
    this.port = config.PORT;
    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(cookieParser());
    this.app.use(
      '/api/v1/login',
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 50,
        message: 'Too many sign-in attempts, please try again later',
      })
    );
  }

  private routes(): void {
    this.app.use('/api', index);
    this.app.get('/api', async (req, res) => {
      res.json('Server is running');
    });
    this.app.use(notFound);
  }

  public start(): void {
    this.app.listen(this.port, async () => {
      await pool.getConnection().then((res) => {
        if (res) {
          console.log(
            'Connected to database on https://' + res.connection.config.host
          );
        }
      });
      console.log(`Server running on port http://localhost:${this.port}/api`);
    });
  }
}

const server = new Server();
server.start();
