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
import candidateRoutes from './services/candidate-service'; // path to your route file
import offerDetails from './services/offerDetails';
import salaryStructureRoutes from './services/salary-structure';
import AttendanceRouter from './routes/attendance-route';
import mailRoutes from './routes/mail-route';
import rolecrud from './routes/role-crud-routes';
import fs from 'fs';
import https from 'https';
import path from 'path';
import weekOffRoutes from './routes/weekoff.routes';
import LoginService from './services/employee-login-service';
import { workTrackRouter } from './routes/work-track-route';
import { workFromHomeRouter} from './routes/work-from-home-route';

dotenv.config();

class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    const corsOptions = {
      origin: true,
      credentials: true,
      optionsSuccessStatus: 200,
    };

    this.app.use(express.json({ limit: '100mb' }));
    this.app.use(cors(corsOptions));

    // Request logger
    this.app.use((req, res, next) => {
      const clientIp =
        req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
      console.log(
        `[${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}] ${
          req.method
        } ${req.originalUrl} - from ${clientIp}`
      );
      next();
    });

    this.port = config.PORT;
    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
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
    // ✅ Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: true,
        message: '✅ HRMS Server is healthy and running',
        time: new Date().toISOString(),
      });
    });

    // ✅ API root route
    this.app.get('/api', (req, res) => {
      res.status(200).json({
        status: true,
        message: '✅ HRMS API is running successfully!',
        time: new Date().toISOString(),
      });
    });

    // ✅ Attach route modules
    this.app.use('/api', index);
    this.app.use('/api', AttendanceRouter);
    this.app.use('/api', rolecrud);
    this.app.use('/', offerDetails);
    this.app.use('/', mailRoutes);
    this.app.use('/', salaryStructureRoutes);
    this.app.use('/candidates', candidateRoutes);
    this.app.use('/api/v1/weekoff', weekOffRoutes);
    this.app.use('api/v1/work-track', workTrackRouter)
    this.app.use('/api', workFromHomeRouter);
    
    // ✅ NotFound middleware MUST be last
    this.app.use(notFound);
  }

  public start(): void {
    const sslOptions = {
      key: fs.readFileSync(path.join(__dirname, '../../../ssl/privkey.pem')),
      cert: fs.readFileSync(path.join(__dirname, '../../../ssl/fullchain.pem')),
    };
    const httpsServer = https.createServer(sslOptions, this.app);

    httpsServer.listen(this.port, async () => {
      try {
        const conn = await pool.getConnection();
        if (conn) {
          console.log(
            `Connected to database on host ${conn.connection.config.host}`
          );
          conn.release();
        }
      } catch (err) {
        console.error('Database connection failed:', err);
      }

      console.log(`Server running at https://localhost:${this.port}/api`);
    });
  }
}

const server = new Server();
server.start();
