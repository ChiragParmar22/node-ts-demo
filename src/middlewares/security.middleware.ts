import { Application } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import config from '../configs/common.config';

/**
 * Setup security middleware for the application
 * Includes Helmet for security headers and rate limiting
 */
export default (app: Application): void => {
  // Helmet - Sets various HTTP headers for security
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"], // Blocks all resources by default unless explicitly allowed
          styleSrc: ["'self'", "'unsafe-inline'"], // Allows CSS from your own domain // 'unsafe-inline' allows inline styles (e.g. style="color:red")
          scriptSrc: ["'self'"], // Only allows JavaScript files from your own domain
          imgSrc: ["'self'", 'data:', 'https:'], // Allows images from your own domain // data: allows base64 encoded images // https: allows images from any HTTPS source
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // Global rate limiter - applies to all routes
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.NODE_ENV === 'prod' ? 300 : 1000, // Limit each IP
    message: {
      status: 429,
      message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    // Skip rate limiting in development if needed
    skip: () => config.NODE_ENV === 'dev',
  });

  // Apply general rate limiter to all API routes
  app.use('/api/', generalLimiter);

  // Strict rate limiter for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per 15 minutes
    skipSuccessfulRequests: true, // Don't count successful requests
    message: {
      status: 429,
      message:
        'Too many authentication attempts from this IP, please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply strict rate limiter to login endpoint
  app.use('/api/auth/login', authLimiter);
};
