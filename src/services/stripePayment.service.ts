import { PaymentMethod, TransactionStatus } from '../constants/key.constants';
import messagesConstants from '../constants/messages.constants';
import { IUsers } from '../models/Users';
import StripeCardRepository from '../repositories/stripeCard.repository';
import StripeCustomerRepository from '../repositories/stripeCustomer.repository';
import TransactionRepository from '../repositories/transaction.repository';
import ApiResponse from '../utils/apiResponse';

import StripeService from './stripe.service';

export default class StripePaymentService {
  /**
   * Charge a saved card using card database ID
   */
  static async payWithCardId(
    user: IUsers,
    stripeCardId: string,
    amount: number,
    currency: string = 'usd',
    description: string | null = null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: Record<string, any> = {}
  ): Promise<ApiResponse> {
    // 1. Fetch saved card from database
    const card = await StripeCardRepository.getCardById(user._id, stripeCardId);
    if (!card) {
      return ApiResponse.notFound(messagesConstants.STRIPE_CARD_NOT_FOUND);
    }

    // 2. Fetch customer from database
    const customer = await StripeCustomerRepository.getCustomerByUserId(
      user._id
    );
    if (!customer) {
      return ApiResponse.notFound(messagesConstants.STRIPE_CUSTOMER_NOT_FOUND);
    }

    try {
      // 3. Create and confirm Stripe PaymentIntent
      const paymentIntent = await StripeService.createPaymentIntent({
        amount: Math.round(amount * 100), // convert to cents
        currency: currency.toLowerCase(),
        customer: customer.stripeCustomerId,
        payment_method: card.stripeCardId, // The card source ID (e.g. card_xxx)
        confirm: true,
        off_session: true,
        description: description || undefined,
        metadata: {
          userId: user._id.toString(),
          ...metadata,
        },
      });

      // 4. Save transaction to database
      let status = TransactionStatus.PENDING;
      if (paymentIntent.status === 'succeeded') {
        status = TransactionStatus.SUCCEEDED;
      } else if (
        paymentIntent.status === 'requires_payment_method' ||
        paymentIntent.status === 'canceled'
      ) {
        status = TransactionStatus.FAILED;
      }

      const transaction = await TransactionRepository.createTransaction({
        userId: user._id,
        stripeCardId: card.stripeCardId,
        paymentIntentId: paymentIntent.id,
        chargeId: (paymentIntent.latest_charge as string) || null,
        amount,
        currency: currency.toLowerCase(),
        status,
        paymentMethod: PaymentMethod.CARD,
        last4Digit: card.last4Digit,
        description,
        metadata: paymentIntent.metadata as unknown as Record<string, object>,
      });

      if (status === TransactionStatus.FAILED) {
        return ApiResponse.badRequest(messagesConstants.STRIPE_PAYMENT_FAILED);
      }

      return ApiResponse.success(
        transaction,
        messagesConstants.STRIPE_PAYMENT_SUCCESS
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Handle card error or generic stripe error and log a failed transaction
      console.error('Payment Error:', err);

      const errorMessage =
        err.message || messagesConstants.STRIPE_PAYMENT_FAILED;
      const paymentIntentId =
        err.raw?.payment_intent?.id || `failed_pi_${Date.now()}`;
      const chargeId = err.raw?.payment_intent?.latest_charge || null;

      await TransactionRepository.createTransaction({
        userId: user._id,
        stripeCardId: card.stripeCardId,
        paymentIntentId,
        chargeId,
        amount,
        currency: currency.toLowerCase(),
        status: TransactionStatus.FAILED,
        paymentMethod: PaymentMethod.CARD,
        last4Digit: card.last4Digit,
        description: description || `Error: ${errorMessage}`,
        metadata: { error: errorMessage } as unknown as Record<string, object>,
      });

      return ApiResponse.badRequest(errorMessage);
    }
  }
}
