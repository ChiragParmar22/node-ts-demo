import { NextFunction, Request, Response } from 'express';

import { logger, requestLogger } from '../logger/logger';

/**
 * Logger middleware to log incoming requests and outgoing responses
 */
export default (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  let hasLogged = false; // Flag to prevent duplicate logging

  // Prepare request data
  const requestData = {
    type: 'REQUEST',
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    body: req.body,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  };

  // Log incoming request to console and file
  logger.info('Incoming Request', requestData);
  requestLogger.info('REQUEST', requestData);

  // Capture the original res.json and res.send methods
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  // Override res.json to log response
  res.json = function (body: unknown) {
    if (!hasLogged) {
      logResponse(body);
      hasLogged = true;
    }
    return originalJson(body);
  };

  // Override res.send to log response
  res.send = function (body: unknown) {
    if (!hasLogged) {
      logResponse(body);
      hasLogged = true;
    }
    return originalSend(body);
  };

  // Function to log response
  const logResponse = (body: unknown) => {
    const duration = Date.now() - startTime;
    const responseData = {
      type: 'RESPONSE',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      body,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    };

    // Log outgoing response to console and file
    logger.info('Outgoing Response', responseData);
    requestLogger.info('RESPONSE', responseData);
  };

  next();
};
