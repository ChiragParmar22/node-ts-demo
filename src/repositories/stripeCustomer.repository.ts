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
      { userId },
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  }

  static async getCustomerByUserId(
    userId: string | Types.ObjectId
  ): Promise<IStripeCustomers | null> {
    return await StripeCustomers.findOne({ userId });
  }

  static async deleteCustomerById(
    userId: string | Types.ObjectId
  ): Promise<boolean> {
    const deleted = await StripeCustomers.deleteOne({ userId });
    return deleted.deletedCount === 1;
  }
}
