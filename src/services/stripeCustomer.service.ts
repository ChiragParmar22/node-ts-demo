import messagesConstants from '../constants/messages.constants';
import { StripeCustomerInput } from '../interfaces/stripeCustomer.interface';
import { IUsers } from '../models/Users';
import StripeCustomerRepository from '../repositories/stripeCustomer.repository';
import ApiResponse from '../utils/apiResponse';

import StripeService from './stripe.service';

export default class StripeCustomerService {
  /**
   * Create a new stripe customer
   */
  static async createCustomer(
    user: IUsers,
    data: StripeCustomerInput
  ): Promise<ApiResponse> {
    const existingCustomer = await StripeCustomerRepository.getCustomerByUserId(
      user._id
    );
    if (existingCustomer) {
      return ApiResponse.conflict(
        messagesConstants.STRIPE_CUSTOMER_ALREADY_EXISTS
      );
    }

    // Create customer on Stripe
    const stripeCustomer = await StripeService.createCustomer({
      name: user.name,
      email: user.email,
      address: {
        line1: data.addressLine1 || undefined,
        line2: data.addressLine2 || undefined,
        city: data.city || undefined,
        postal_code: data.postalCode || undefined,
        state: data.state || undefined,
        country: data.country || undefined,
      },
    });

    // Save to database
    const customer = await StripeCustomerRepository.createCustomer({
      userId: user._id,
      stripeCustomerId: stripeCustomer.id,
      addressLine1: data.addressLine1 || null,
      addressLine2: data.addressLine2 || null,
      city: data.city || null,
      postalCode: data.postalCode || null,
      state: data.state || null,
      country: data.country || null,
    });

    return ApiResponse.created(
      customer,
      messagesConstants.STRIPE_CUSTOMER_CREATED
    );
  }

  /**
   * Get stripe customer by user ID
   */
  static async getCustomer(user: IUsers): Promise<ApiResponse> {
    const customer = await StripeCustomerRepository.getCustomerByUserId(
      user._id
    );
    if (!customer) {
      return ApiResponse.notFound(messagesConstants.STRIPE_CUSTOMER_NOT_FOUND);
    }

    return ApiResponse.success(
      customer,
      messagesConstants.STRIPE_CUSTOMER_FETCHED
    );
  }

  /**
   * Update stripe customer
   */
  static async updateCustomer(
    user: IUsers,
    data: StripeCustomerInput
  ): Promise<ApiResponse> {
    const existingCustomer = await StripeCustomerRepository.getCustomerByUserId(
      user._id
    );
    if (!existingCustomer) {
      return ApiResponse.notFound(messagesConstants.STRIPE_CUSTOMER_NOT_FOUND);
    }

    // Verify customer exists on Stripe
    const stripeCustomer = await StripeService.getCustomer(
      existingCustomer.stripeCustomerId
    );
    if (stripeCustomer.deleted) {
      return ApiResponse.notFound(messagesConstants.STRIPE_CUSTOMER_NOT_FOUND);
    }

    // Update on Stripe
    await StripeService.updateCustomer(existingCustomer.stripeCustomerId, {
      name: user.name || undefined,
      email: user.email || undefined,
      address: {
        line1: data.addressLine1 || undefined,
        line2: data.addressLine2 || undefined,
        city: data.city || undefined,
        postal_code: data.postalCode || undefined,
        state: data.state || undefined,
        country: data.country || undefined,
      },
    });

    // Update in database
    const customer = await StripeCustomerRepository.updateCustomerById(
      user._id,
      {
        addressLine1: data.addressLine1 || existingCustomer.addressLine1,
        addressLine2: data.addressLine2 || existingCustomer.addressLine2,
        city: data.city || existingCustomer.city,
        postalCode: data.postalCode || existingCustomer.postalCode,
        state: data.state || existingCustomer.state,
        country: data.country || existingCustomer.country,
      }
    );

    return ApiResponse.success(
      customer,
      messagesConstants.STRIPE_CUSTOMER_UPDATED
    );
  }

  /**
   * Delete stripe customer
   */
  static async deleteCustomer(user: IUsers): Promise<ApiResponse> {
    const existingCustomer = await StripeCustomerRepository.getCustomerByUserId(
      user._id
    );
    if (!existingCustomer) {
      return ApiResponse.notFound(messagesConstants.STRIPE_CUSTOMER_NOT_FOUND);
    }

    // Verify customer exists on Stripe
    const stripeCustomer = await StripeService.getCustomer(
      existingCustomer.stripeCustomerId
    );
    if (stripeCustomer.deleted) {
      return ApiResponse.notFound(messagesConstants.STRIPE_CUSTOMER_NOT_FOUND);
    }

    // Delete from Stripe
    await StripeService.deleteCustomer(existingCustomer.stripeCustomerId);

    // Delete from database
    await StripeCustomerRepository.deleteCustomerById(user._id);

    return ApiResponse.success({}, messagesConstants.STRIPE_CUSTOMER_DELETED);
  }
}
