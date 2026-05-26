import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import messagesConstants from '../constants/messages.constants';
import logger from '../logger/logger';

interface ErrorPayload {
  statusCode?: number;
  message?: string;
  name?: string;
  errors?: Record<string, { message: string }>;
}

export default (
  err: ErrorPayload,
  _request: Request,
  response: Response,
  next: NextFunction
) => {
  void next;
  try {
    let statusCode = err.statusCode;
    let message = typeof err.message === 'string' ? err.message : undefined;

    // Set default values for unhandled errors
    if (!statusCode) statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    if (!message) message = messagesConstants.SOMETHING_WENT_WRONG;

    // Handle specific cases (e.g., database, validation errors)
    if (err.name === 'ValidationError' && err.errors) {
      statusCode = StatusCodes.BAD_REQUEST;
      message = Object.values(err.errors)
        .map((val) => val.message)
        .join(', ');
    }

    logger.error(`Error occurred: ${message} - StatusCode: ${statusCode}`);

    // Respond with a standardized error object
    return response.status(statusCode).json({
      statusCode,
      isSuccess: false,
      message,
      data: null,
    });
  } catch (error) {
    logger.error(
      `Error occurred: ${error} - StatusCode: ${StatusCodes.INTERNAL_SERVER_ERROR}`
    );

    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      isSuccess: false,
      message: messagesConstants.SOMETHING_WENT_WRONG,
      data: null,
    });
  }
};
