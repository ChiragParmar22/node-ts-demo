import messagesConstants from '../constants/messages.constants';
import { IUsers } from '../models/Users';
import StripeCardRepository from '../repositories/stripeCard.repository';
import StripeCustomerRepository from '../repositories/stripeCustomer.repository';
import ApiResponse from '../utils/apiResponse';

import StripeService from './stripe.service';

export default class StripeCardService {
  /**
   * Add a new card
   */
  static async addCard(user: IUsers, token: string): Promise<ApiResponse> {
    const customer = await StripeCustomerRepository.getCustomerByUserId(
      user._id
    );
    if (!customer) {
      return ApiResponse.notFound(messagesConstants.STRIPE_CUSTOMER_NOT_FOUND);
    }

    // Verify customer exists on Stripe
    const stripeCustomer = await StripeService.getCustomer(
      customer.stripeCustomerId
    );
    if (stripeCustomer.deleted) {
      return ApiResponse.notFound(messagesConstants.STRIPE_CUSTOMER_NOT_FOUND);
    }

    // Create card on Stripe
    const stripeCard = await StripeService.createCard(
      customer.stripeCustomerId,
      token
    );

    // Save to database
    const card = await StripeCardRepository.createCard({
      userId: user._id,
      stripeCustomerId: customer.stripeCustomerId,
      stripeCardId: stripeCard.id,
      last4Digit: (stripeCard as { last4?: string }).last4 || '',
    });

    return ApiResponse.created(card, messagesConstants.STRIPE_CARD_ADDED);
  }

  /**
   * Get one card
   */
  static async getCard(
    user: IUsers,
    stripeCardId: string
  ): Promise<ApiResponse> {
    const card = await StripeCardRepository.getCardById(user._id, stripeCardId);
    if (!card) {
      return ApiResponse.notFound(messagesConstants.STRIPE_CARD_NOT_FOUND);
    }

    return ApiResponse.success(card, messagesConstants.STRIPE_CARD_FETCHED);
  }

  /**
   * Get all cards for a user
   */
  static async getAllCards(user: IUsers): Promise<ApiResponse> {
    const cards = await StripeCardRepository.getAllCardsByUserId(user._id);

    return ApiResponse.success(cards, messagesConstants.STRIPE_CARDS_FETCHED);
  }

  /**
   * Delete a card
   */
  static async deleteCard(
    user: IUsers,
    stripeCardId: string
  ): Promise<ApiResponse> {
    const customer = await StripeCustomerRepository.getCustomerByUserId(
      user._id
    );
    if (!customer) {
      return ApiResponse.notFound(messagesConstants.STRIPE_CUSTOMER_NOT_FOUND);
    }

    const card = await StripeCardRepository.getCardById(user._id, stripeCardId);
    if (!card) {
      return ApiResponse.notFound(messagesConstants.STRIPE_CARD_NOT_FOUND);
    }

    // Delete from Stripe
    await StripeService.deleteCard(customer.stripeCustomerId, stripeCardId);

    // Soft delete from database
    await StripeCardRepository.deleteCardById(user._id, stripeCardId);

    return ApiResponse.success({}, messagesConstants.STRIPE_CARD_DELETED);
  }

  /**
   * Make a card primary
   */
  static async makePrimary(
    user: IUsers,
    stripeCardId: string
  ): Promise<ApiResponse> {
    const card = await StripeCardRepository.getCardById(user._id, stripeCardId);
    if (!card) {
      return ApiResponse.notFound(messagesConstants.STRIPE_CARD_NOT_FOUND);
    }

    const customer = await StripeCustomerRepository.getCustomerByUserId(
      user._id
    );
    if (!customer) {
      return ApiResponse.notFound(messagesConstants.STRIPE_CUSTOMER_NOT_FOUND);
    }

    // Set default source on Stripe
    await StripeService.setDefaultSource(
      customer.stripeCustomerId,
      stripeCardId
    );

    // Update primary in database
    const updatedCard = await StripeCardRepository.setPrimaryCard(
      user._id,
      stripeCardId
    );

    return ApiResponse.success(
      updatedCard,
      messagesConstants.STRIPE_CARD_PRIMARY_UPDATED
    );
  }
}
