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
}
