import { NextFunction, Request, Response } from 'express';

import {
  RefreshTokenInput,
  ResetPasswordInput,
  SendOtpInput,
  SigninInput,
  SignupInput,
  VerifyOtpInput,
} from '../interfaces/user.interface';
import AuthService from '../services/auth.services';

/**
 * Auth Controller
 * Handles HTTP requests and responses for user authentication endpoints
 */
export default class AuthController {
  /**
   * Handle send OTP for signup
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
   * Handle user signup
   */
  static async signup(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await AuthService.signup(
        request.body as SignupInput,
        request.file as Express.Multer.File | undefined
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle user signin
   */
  static async signin(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await AuthService.signin(request.body as SigninInput);
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
   * Handle user verify otp
   */
  static async verifyOtp(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await AuthService.verifyOtp(
        request.body as VerifyOtpInput
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
