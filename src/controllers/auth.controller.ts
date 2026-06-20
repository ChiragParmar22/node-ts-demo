import { NextFunction, Request, Response } from 'express';

import {
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
  ResetPasswordInput,
  SendOtpInput,
  SocialLoginInput,
} from '../interfaces/user.interface';
import AuthService from '../services/auth.services';

/**
 * Auth Controller
 * Handles HTTP requests and responses for user authentication endpoints
 */
export default class AuthController {
  /**
   * Handle send OTP for registration
   */
  static async sendOtp(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await AuthService.sendOtp(request.body as SendOtpInput);
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle user registration
   */
  static async register(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await AuthService.register(
        request.body as RegisterInput,
        request.file as Express.Multer.File | undefined
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle user login
   */
  static async login(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await AuthService.login(request.body as LoginInput);
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle user social login
   */
  static async socialLogin(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await AuthService.socialLogin(
        request.body as SocialLoginInput
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle user forgot password
   */
  static async forgotPassword(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await AuthService.forgotPassword(
        request.body as SendOtpInput
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle user reset password
   */
  static async resetPassword(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await AuthService.resetPassword(
        request.body as ResetPasswordInput
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle refresh token
   */
  static async refreshToken(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await AuthService.refreshToken(
        request.body as RefreshTokenInput
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
