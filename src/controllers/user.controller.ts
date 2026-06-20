import { NextFunction, Request, Response } from 'express';

import {
  ChangePasswordInput,
  DeleteAccountInput,
  UpdateProfileInput,
} from '../interfaces/user.interface';
import { IUsers } from '../models/Users';
import UserService from '../services/user.service';

/**
 * User Controller
 * Handles HTTP requests and responses for user endpoints
 */
export default class UserController {
  /**
   * Handle get user profile
   */
  static async getProfile(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await UserService.getProfile(request.user as IUsers);
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle update user profile
   */
  static async updateProfile(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await UserService.updateProfile(
        request.user as IUsers,
        request.body as UpdateProfileInput,
        request.file as Express.Multer.File | undefined
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle change user password
   */
  static async changePassword(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await UserService.changePassword(
        request.user as IUsers,
        request.body as ChangePasswordInput
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle logout user
   */
  static async logout(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await UserService.logout(request.sessionId as string);
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle delete account user
   */
  static async deleteAccount(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await UserService.deleteAccount(
        request.user as IUsers,
        request.body as DeleteAccountInput
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
