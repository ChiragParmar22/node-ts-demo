import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
// import https from 'https';
// import fs from 'fs';
import path from 'path';

import config from './configs/common.config';
import messagesConstants from './constants/messages.constants';
import appVersionMiddleware from './middlewares/appVersion.middleware';
import errorHandler from './middlewares/error.middleware';
import loggerMiddleware from './middlewares/logger.middleware';
import maintenanceMiddleware from './middlewares/maintenance.middleware';
import setupSecurity from './middlewares/security.middleware';
import {
  connectDatabase,
  disconnectDatabase,
  isDatabaseConnected,
} from './models/dbConnection';
import ApiResponse from './utils/apiResponse';
import nodeCron from './utils/nodeCron';
import { initializeSocket } from './utils/socket';
import mainRouter from './routes';

const app: Application = express();

// CORS configuration
const allowedOrigins = [config.SERVER_URL, config.CLIENT_URL];
const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
};
app.use(cors(corsOptions));

// Security middleware (Helmet & Rate Limiting)
setupSecurity(app);

// Body parsers
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Static files
app.use('/public', express.static(path.join(__dirname, '..', 'src', 'public')));

// Logger middleware - logs all requests and responses
app.use(loggerMiddleware);

// Maintenance mode middleware - blocks requests when maintenance is enabled
app.use(maintenanceMiddleware);

// Health check endpoint (always accessible, even during maintenance)
app.get('/health', (_req: Request, response: Response) => {
  let apiResponse: ApiResponse;
  try {
    const isDbConnected = isDatabaseConnected();

    const healthStatus = {
      status: isDbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
      database: isDbConnected ? 'connected' : 'disconnected',
    };

    apiResponse = ApiResponse.success(
      healthStatus,
      messagesConstants.HEALTH_CHECK_SUCCESS
    );
  } catch {
    apiResponse = ApiResponse.internalError(
      messagesConstants.HEALTH_CHECK_UNHEALTHY
    );
  }

  return response.status(apiResponse.statusCode).json(apiResponse);
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  return res
    .status(StatusCodes.OK)
    .send(messagesConstants.WELCOME_MESSAGE(config.APP_NAME, config.NODE_ENV));
});

app.use(appVersionMiddleware);

// Routes
app.use('/api', mainRouter);

// Node Cron
nodeCron();

// 404 handler
app.use((_request: Request, response: Response) => {
  const apiResponse = ApiResponse.notFound(messagesConstants.ROUTE_NOT_FOUND);
  return response.status(apiResponse.statusCode).json(apiResponse);
});

// Global error handling middleware
app.use(errorHandler);

// Server instance
let server: Server;

// Start server
const PORT = config.PORT;

(async () => {
  try {
    await connectDatabase();

    console.log(messagesConstants.DATABASE_CONNECTION_SUCCESS);

    server = app.listen(PORT, () => {
      console.log(
        messagesConstants.SERVER_START_SUCCESS(PORT, config.NODE_ENV)
      );
      console.log(`Server URL: ${config.SERVER_URL}`);
      console.log(`Health check: ${config.SERVER_URL}/health`);
    });

    // Resolve paths safely (relative to project root)
    // const keyPath = path.resolve('./privkey.pem');
    // const certPath = path.resolve('./fullchain.pem');
    // const caPath = path.resolve('./chain.pem');

    // const httpsOptions: https.ServerOptions = {
    //   key: fs.readFileSync(keyPath),
    //   cert: fs.readFileSync(certPath),
    //   ca: fs.existsSync(caPath) ? fs.readFileSync(caPath) : undefined,
    //   requestCert: false,
    //   rejectUnauthorized: false,
    // };

    // server = https.createServer(httpsOptions, app);

    // server.listen(PORT, () => {
    //   console.log(
    //     messagesConstants.SERVER_START_SUCCESS(PORT, config.NODE_ENV)
    //   );
    //   console.log(`Server URL: ${config.SERVER_URL}`);
    //   console.log(`Health check: ${config.SERVER_URL}/health`);
    // });
    initializeSocket(server);
  } catch (error) {
    console.error(messagesConstants.DATABASE_CONNECTION_ERROR, error);
    process.exit(1);
  }
})();

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Close server to stop accepting new connections
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');

      try {
        // Close database connection
        if (isDatabaseConnected()) {
          await disconnectDatabase();
          console.log('Database connection closed');
        }

        console.log('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Handle SIGTERM (production environments, Docker, Kubernetes)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle SIGINT (Ctrl+C in terminal)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on(
  'unhandledRejection',
  (reason: unknown, promise: Promise<unknown>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
  }
);
