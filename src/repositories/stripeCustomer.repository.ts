import { Types } from 'mongoose';

import { IStripeCustomers, StripeCustomers } from '../models/StripeCustomers';

export default class StripeCustomerRepository {
  static async createCustomer(
    data: Partial<IStripeCustomers>
  ): Promise<IStripeCustomers> {
    return await StripeCustomers.create(data);
  }

  static async updateCustomerById(
    userId: string | Types.ObjectId,
    data: Partial<IStripeCustomers>
  ): Promise<IStripeCustomers | null> {
    return await StripeCustomers.findOneAndUpdate(
      { userId, deletedAt: null },
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  }

  static async getCustomerByUserId(
    userId: string | Types.ObjectId
  ): Promise<IStripeCustomers | null> {
    return await StripeCustomers.findOne({ userId, deletedAt: null });
  }

  static async getCustomerByStripeCustomerId(
    stripeCustomerId: string
  ): Promise<IStripeCustomers | null> {
    return await StripeCustomers.findOne({ stripeCustomerId, deletedAt: null });
  }

  static async deleteCustomerById(
    userId: string | Types.ObjectId
  ): Promise<IStripeCustomers | null> {
    return await StripeCustomers.findOneAndUpdate(
      { userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
  }
}
