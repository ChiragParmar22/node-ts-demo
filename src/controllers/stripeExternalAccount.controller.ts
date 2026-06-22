import { NextFunction, Request, Response } from 'express';

import { IUsers } from '../models/Users';
import StripeExternalAccountService from '../services/stripeExternalAccount.service';

export default class StripeExternalAccountController {
  /**
   * Handle external account creation/onboarding link request
   */
  static async createExternalAccount(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const authHeader = request.headers.authorization;
      const token = authHeader ? authHeader.split(' ')[1] || '' : '';

      const result = await StripeExternalAccountService.createExternalAccount(
        request.user as IUsers,
        token,
        request.body.country as string
      );

      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle Stripe onboarding refresh callback (redirects back to onboarding)
   */
  static async handleRefresh(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const token = String(request.params.token || '');
      const result = await StripeExternalAccountService.handleRefresh(token);

      if (result.statusCode === 200 && result.data) {
        const data = result.data as { url: string };
        if (data.url) {
          return response.redirect(data.url);
        }
      }

      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle Stripe onboarding success callback
   */
  static async handleSuccess(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const token = String(request.query.token || '');
      const result = await StripeExternalAccountService.handleSuccess(token);

      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
