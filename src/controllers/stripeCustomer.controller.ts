import { NextFunction, Request, Response } from 'express';

import { StripeCustomerInput } from '../interfaces/stripeCustomer.interface';
import { IUsers } from '../models/Users';
import StripeCustomerService from '../services/stripeCustomer.service';

export default class StripeCustomerController {
  /**
   * Handle create stripe customer
   */
  static async createCustomer(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await StripeCustomerService.createCustomer(
        request.user as IUsers,
        request.body as StripeCustomerInput
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle get stripe customer
   */
  static async getCustomer(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await StripeCustomerService.getCustomer(
        request.user as IUsers
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle update stripe customer
   */
  static async updateCustomer(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await StripeCustomerService.updateCustomer(
        request.user as IUsers,
        request.body as StripeCustomerInput
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle delete stripe customer
   */
  static async deleteCustomer(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await StripeCustomerService.deleteCustomer(
        request.user as IUsers
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
