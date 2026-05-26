import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Define log directory
const logDir = 'logs';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define console format (for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Daily rotate transport for error logs
const errorRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m', // 20MB
  maxFiles: '30d', // Keep logs for 30 days
  zippedArchive: true, // Compress old logs
});

// Daily rotate transport for combined logs
const combinedRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m', // 20MB
  maxFiles: '30d', // Keep logs for 30 days
  zippedArchive: true, // Compress old logs
});

// Create the main logger
export const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [errorRotateTransport, combinedRotateTransport],
});

// Daily rotate transport for request/response logs
const requestRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'requests-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '50m', // 50MB
  maxFiles: '14d', // Keep logs for 14 days
  zippedArchive: true, // Compress old logs
});

// Create a separate logger for request/response logging
export const requestLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [requestRotateTransport],
});

// If we're not in production, also log to console
if (process.env.NODE_ENV !== 'prod') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Log rotation events (optional but useful for debugging)
errorRotateTransport.on('rotate', (oldFilename, newFilename) => {
  console.log(`Error log rotated: ${oldFilename} -> ${newFilename}`);
});

combinedRotateTransport.on('rotate', (oldFilename, newFilename) => {
  console.log(`Combined log rotated: ${oldFilename} -> ${newFilename}`);
});

requestRotateTransport.on('rotate', (oldFilename, newFilename) => {
  console.log(`Request log rotated: ${oldFilename} -> ${newFilename}`);
});

// Log when logs are archived
errorRotateTransport.on('archive', (zipFilename) => {
  console.log(`Error log archived: ${zipFilename}`);
});

combinedRotateTransport.on('archive', (zipFilename) => {
  console.log(`Combined log archived: ${zipFilename}`);
});

requestRotateTransport.on('archive', (zipFilename) => {
  console.log(`Request log archived: ${zipFilename}`);
});

export default logger;
