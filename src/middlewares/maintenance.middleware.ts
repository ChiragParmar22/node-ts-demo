import { NextFunction, Request, Response } from 'express';

import config from '../configs/common.config';
import messagesConstants from '../constants/messages.constants';
import ApiResponse from '../utils/apiResponse';

/**
 * Middleware to check if system is in maintenance mode
 * Reads from environment variable MAINTENANCE_MODE
 * Returns 503 Service Unavailable if maintenance mode is enabled
 */
export default (
  request: Request,
  response: Response,
  next: NextFunction
): void | Response => {
  // Allow certain routes even during maintenance (e.g., health check, user routes)
  const allowedRoutes = ['/', '/health'];

  // Check if current route is allowed during maintenance
  const isAllowedRoute = allowedRoutes.some((route) => route === request.path);

  // If maintenance mode is enabled and route is not allowed, return 503
  if (config.MAINTENANCE_MODE && !isAllowedRoute) {
    const apiResponse = ApiResponse.serviceUnavailable(
      messagesConstants.MAINTENANCE_MESSAGE
    );
    return response.status(apiResponse.statusCode).json(apiResponse);
  }

  // Otherwise, proceed to next middleware
  next();
};
