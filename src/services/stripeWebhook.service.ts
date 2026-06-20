import Stripe from 'stripe';

import { PaymentMethod, TransactionStatus } from '../constants/key.constants';
import StripeCustomerRepository from '../repositories/stripeCustomer.repository';
import TransactionRepository from '../repositories/transaction.repository';

export default class StripeWebhookService {
  /**
   * Handle verified Stripe events
   */
  static async handleEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.processPaymentIntent(
          paymentIntent,
          TransactionStatus.SUCCEEDED
        );
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.processPaymentIntent(
          paymentIntent,
          TransactionStatus.FAILED
        );
        break;
      }
      case 'payment_intent.processing': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.processPaymentIntent(
          paymentIntent,
          TransactionStatus.PENDING
        );
        break;
      }
      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.processPaymentIntent(
          paymentIntent,
          TransactionStatus.FAILED
        );
        break;
      }
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }
  }

  /**
   * Helper to process PaymentIntent status changes
   */
  private static async processPaymentIntent(
    paymentIntent: Stripe.PaymentIntent,
    status: TransactionStatus
  ): Promise<void> {
    const paymentIntentId = paymentIntent.id;
    const transaction =
      await TransactionRepository.getTransactionByPaymentIntentId(
        paymentIntentId
      );

    // Retrieve details from payment intent object
    const amount = paymentIntent.amount / 100; // Stripe amounts are in cents
    const currency = paymentIntent.currency;
    const stripeCustomerId = paymentIntent.customer as string;
    const chargeId = (paymentIntent.latest_charge as string) || null;
    const description = paymentIntent.description || null;
    const metadata = (paymentIntent.metadata || {}) as unknown as Record<
      string,
      object
    >;

    // Attempt to extract payment method details
    let paymentMethodVal = PaymentMethod.CARD;
    let last4: string | null = null;
    let stripeCardId = '';

    if (
      paymentIntent.payment_method_types &&
      paymentIntent.payment_method_types.includes('card')
    ) {
      paymentMethodVal = PaymentMethod.CARD;
    }

    // Extract charges information
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const charges = (paymentIntent as any).charges?.data;
    if (charges && charges.length > 0) {
      const charge = charges[0];
      if (charge.payment_method_details?.card) {
        last4 = charge.payment_method_details.card.last4 || null;
        stripeCardId = (charge.payment_method as string) || '';
      }
    }

    if (!transaction) {
      // Find userId in metadata, or look up StripeCustomer by customer ID
      let userIdStr = paymentIntent.metadata?.userId;

      if (!userIdStr && stripeCustomerId) {
        const customer =
          await StripeCustomerRepository.getCustomerByStripeCustomerId(
            stripeCustomerId
          );
        if (customer) {
          userIdStr = customer.userId.toString();
        }
      }

      if (!userIdStr) {
        console.warn(
          `Could not determine userId for PaymentIntent ${paymentIntentId}. Transaction skipped.`
        );
        return;
      }

      // Create transaction
      await TransactionRepository.createTransaction({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: userIdStr as any,
        stripeCardId,
        paymentIntentId,
        chargeId,
        amount,
        currency,
        status,
        paymentMethod: paymentMethodVal,
        last4Digit: last4,
        description,
        metadata,
      });
      console.log(
        `Transaction created for PaymentIntent ${paymentIntentId} with status ${status}`
      );
    } else {
      // Update transaction
      await TransactionRepository.updateTransactionStatus(
        paymentIntentId,
        status,
        {
          chargeId,
          last4Digit: last4 || transaction.last4Digit,
          stripeCardId: stripeCardId || transaction.stripeCardId,
          description,
          metadata,
        }
      );
      console.log(
        `Transaction updated for PaymentIntent ${paymentIntentId} to status ${status}`
      );
    }
  }
}
