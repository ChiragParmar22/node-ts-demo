import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

import ApiResponse from '../utils/apiResponse';

/**
 * Interface for validation schema
 */
interface ValidationSchema {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
}

const keys: (keyof ValidationSchema)[] = ['params', 'query', 'body'];

/**
 * Validation middleware factory
 * @param schema - Joi validation schema for body, query, and/or params
 * @returns Express middleware function
 */
export default (requestSchema: ValidationSchema) => {
  return (
    request: Request,
    response: Response,
    next: NextFunction
  ): void | Response => {
    try {
      for (const key of keys) {
        const schema = requestSchema?.[key];

        if (!schema) continue;

        const { error, value } = schema.validate(request[key] || {});

        if (error) {
          const { details } = error;
          const message = details
            .map((i: { message: string }) => i.message)
            .join(',');

          const apiResponse = ApiResponse.unProcessEntity(message);
          return response.status(apiResponse.statusCode).json(apiResponse);
        }

        if (key !== 'query') request[key] = value;
      }

      // If validation passes, proceed to the next middleware
      next();
    } catch (error) {
      console.log('==========> error', error);
      const apiResponse = ApiResponse.internalError(error as string);
      return response.status(apiResponse.statusCode).json(apiResponse);
    }
  };
};
