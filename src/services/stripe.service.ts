import Stripe from 'stripe';

import config from '../configs/common.config';

const stripeClient = new Stripe(config.STRIPE_SECRET_KEY, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2026-05-27.dahlia' as any,
  typescript: true,
});

export default class StripeService {
  /**
   * Create a new customer on Stripe
   */
  static async createCustomer(
    params: Stripe.CustomerCreateParams
  ): Promise<Stripe.Customer> {
    return await stripeClient.customers.create(params);
  }

  /**
   * Retrieve a customer from Stripe by customer ID
   */
  static async getCustomer(
    customerId: string
  ): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
    return await stripeClient.customers.retrieve(customerId);
  }

  /**
   * Update a customer on Stripe
   */
  static async updateCustomer(
    customerId: string,
    params: Stripe.CustomerUpdateParams
  ): Promise<Stripe.Customer> {
    return await stripeClient.customers.update(customerId, params);
  }

  /**
   * Delete a customer from Stripe
   */
  static async deleteCustomer(
    customerId: string
  ): Promise<Stripe.DeletedCustomer> {
    return await stripeClient.customers.del(customerId);
  }

  /**
   * Create a card source on Stripe customer
   */
  static async createCard(
    customerId: string,
    token: string
  ): Promise<Stripe.CustomerSource> {
    return await stripeClient.customers.createSource(customerId, {
      source: token,
    });
  }

  /**
   * Retrieve a card from Stripe customer
   */
  static async getCard(
    customerId: string,
    cardId: string
  ): Promise<Stripe.CustomerSource> {
    return await stripeClient.customers.retrieveSource(customerId, cardId);
  }

  /**
   * List all cards for a Stripe customer
   */
  static async listCards(
    customerId: string
  ): Promise<Stripe.ApiList<Stripe.CustomerSource>> {
    return await stripeClient.customers.listSources(customerId, {
      object: 'card',
    });
  }

  /**
   * Delete a card from Stripe customer
   */
  static async deleteCard(
    customerId: string,
    cardId: string
  ): Promise<
    Stripe.CustomerSource | Stripe.DeletedBankAccount | Stripe.DeletedCard
  > {
    return await stripeClient.customers.deleteSource(customerId, cardId);
  }

  /**
   * Set default source (primary card) on Stripe customer
   */
  static async setDefaultSource(
    customerId: string,
    cardId: string
  ): Promise<Stripe.Customer> {
    return await stripeClient.customers.update(customerId, {
      default_source: cardId,
    });
  }

  /**
   * Create and confirm a PaymentIntent on Stripe
   */
  static async createPaymentIntent(
    params: Stripe.PaymentIntentCreateParams
  ): Promise<Stripe.PaymentIntent> {
    return await stripeClient.paymentIntents.create(params);
  }
}
