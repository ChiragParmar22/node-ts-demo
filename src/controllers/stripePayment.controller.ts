import { NextFunction, Request, Response } from 'express';

import { IUsers } from '../models/Users';
import StripePaymentService from '../services/stripePayment.service';

export default class StripePaymentController {
  /**
   * Handle payment with card ID
   */
  static async payWithCardId(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const { stripeCardId, amount, currency, description, metadata } =
        request.body;

      const result = await StripePaymentService.payWithCardId(
        request.user as IUsers,
        stripeCardId as string,
        amount as number,
        currency as string | undefined,
        description as string | null | undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata as Record<string, any> | undefined
      );

      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
