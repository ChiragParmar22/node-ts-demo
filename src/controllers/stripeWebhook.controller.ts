import { NextFunction, Request, Response } from 'express';
import Stripe from 'stripe';

import config from '../configs/common.config';
import StripeWebhookService from '../services/stripeWebhook.service';

const stripeClient = new Stripe(config.STRIPE_SECRET_KEY, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2026-05-27.dahlia' as any,
  typescript: true,
});

export default class StripeWebhookController {
  /**
   * Handle incoming Stripe webhooks
   */
  static async handleWebhook(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    const signature = request.headers['stripe-signature'] as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawBody = (request as any).rawBody;

    if (!signature || !rawBody) {
      return response
        .status(400)
        .send('Webhook Error: Missing signature or rawBody');
    }

    let event: Stripe.Event;

    try {
      event = stripeClient.webhooks.constructEvent(
        rawBody,
        signature,
        config.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: unknown) {
      const error = err as Error;
      console.error(`Webhook signature verification failed: ${error.message}`);
      return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
      await StripeWebhookService.handleEvent(event);
      return response.status(200).json({ received: true });
    } catch (error: unknown) {
      return next(error);
    }
  }
}
