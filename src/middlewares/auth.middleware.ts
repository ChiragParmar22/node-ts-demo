import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

import messagesConstants from '../constants/messages.constants';
import { TokenType } from '../interfaces/user.interface';
import { IUsers } from '../models/Users';
import UserRepository from '../repositories/user.repository';
import UserSessionRepository from '../repositories/userSession.repository';
import ApiResponse from '../utils/apiResponse';
import JwtUtil from '../utils/jwt.util';

/**
 * Extend Express Request to include user property
 */
declare module 'express-serve-static-core' {
  interface Request {
    user?: IUsers | null;
    sessionId?: string;
  }
}

export const validateUserFromToken = async (
  token: string
): Promise<{ user: IUsers; sessionId: string }> => {
  const decoded = await JwtUtil.verifyAccessToken(token);

  if (decoded.type !== TokenType.ACCESS) {
    throw new jwt.JsonWebTokenError(messagesConstants.INVALID_TOKEN);
  }

  const session = await UserSessionRepository.findById(decoded.sessionId);
  if (!session || session.accessToken !== token) {
    throw new jwt.JsonWebTokenError(messagesConstants.INVALID_TOKEN);
  }

  const user = await UserRepository.findById(decoded.id);

  if (!user) {
    throw new jwt.JsonWebTokenError(messagesConstants.INVALID_TOKEN);
  }

  return { user, sessionId: decoded.sessionId };
};

/**
 * Authentication middleware - verifies JWT token from Authorization header
 * @returns Express middleware function
 */
export default async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      const apiResponse = ApiResponse.unauthorized(
        messagesConstants.INVALID_TOKEN
      );
      return response.status(apiResponse.statusCode).json(apiResponse);
    }

    // Check if authorization header follows Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      const apiResponse = ApiResponse.unauthorized(
        messagesConstants.INVALID_TOKEN
      );
      return response.status(apiResponse.statusCode).json(apiResponse);
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      const apiResponse = ApiResponse.unauthorized(
        messagesConstants.INVALID_TOKEN
      );
      return response.status(apiResponse.statusCode).json(apiResponse);
    }

    const { user, sessionId } = await validateUserFromToken(token);

    // Attach user data to request object
    request.user = user;
    request.sessionId = sessionId;

    // Proceed to next middleware
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error instanceof jwt.TokenExpiredError) {
      const apiResponse = ApiResponse.unauthorized(
        messagesConstants.TOKEN_EXPIRED
      );
      return response.status(apiResponse.statusCode).json(apiResponse);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      const apiResponse = ApiResponse.unauthorized(
        messagesConstants.INVALID_TOKEN
      );
      return response.status(apiResponse.statusCode).json(apiResponse);
    }

    const apiResponse = ApiResponse.internalError(
      messagesConstants.INTERNAL_SERVER_ERROR
    );
    return response.status(apiResponse.statusCode).json(apiResponse);
  }
};

export type SocketAuthHandshake = {
  token?: string;
};

export type SocketData = {
  user?: IUsers;
};

export type SocketNext = (error?: Error) => void;

const extractTokenFromAuthorization = (
  authorizationHeader?: string
): string | null => {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.split(' ')[1] ?? null;
};

export const socketAuthMiddleware = async (
  socket: Socket<never, never, never, SocketData>,
  next: SocketNext
): Promise<void> => {
  try {
    const tokenFromHeader = extractTokenFromAuthorization(
      socket.handshake.headers.authorization
    );
    const token = tokenFromHeader;

    if (!token) {
      return next(new Error(messagesConstants.INVALID_TOKEN));
    }

    const { user } = await validateUserFromToken(token);

    socket.data.user = user;

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new Error(messagesConstants.TOKEN_EXPIRED));
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return next(new Error(messagesConstants.INVALID_TOKEN));
    }

    return next(new Error(messagesConstants.INTERNAL_SERVER_ERROR));
  }
};
