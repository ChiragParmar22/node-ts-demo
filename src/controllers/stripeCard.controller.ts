import { NextFunction, Request, Response } from 'express';

import { IUsers } from '../models/Users';
import StripeCardService from '../services/stripeCard.service';

export default class StripeCardController {
  /**
   * Handle add card
   */
  static async addCard(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await StripeCardService.addCard(
        request.user as IUsers,
        request.body.token as string
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle get one card
   */
  static async getCard(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await StripeCardService.getCard(
        request.user as IUsers,
        request.params.stripeCardId as string
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle get all cards
   */
  static async getAllCards(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await StripeCardService.getAllCards(
        request.user as IUsers
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle delete card
   */
  static async deleteCard(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await StripeCardService.deleteCard(
        request.user as IUsers,
        request.params.stripeCardId as string
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }

  /**
   * Handle make primary card
   */
  static async makePrimary(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await StripeCardService.makePrimary(
        request.user as IUsers,
        request.params.stripeCardId as string
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
