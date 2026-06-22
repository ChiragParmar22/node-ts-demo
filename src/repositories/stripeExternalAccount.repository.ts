import { FilterQuery, Types } from 'mongoose';

import {
  BankAccountDocument,
  BankAccountModel,
} from '../models/externalBankAccount';

export default class StripeExternalAccountRepository {
  static async createBankAccount(
    data: Partial<BankAccountDocument>
  ): Promise<BankAccountDocument> {
    return await BankAccountModel.create(data);
  }

  static async getBankAccountByUserId(
    userId: string | Types.ObjectId
  ): Promise<BankAccountDocument | null> {
    return await BankAccountModel.findOne({ userId, deletedAt: null });
  }

  static async updateBankAccountByUserId(
    userId: string | Types.ObjectId,
    data: Partial<BankAccountDocument>
  ): Promise<BankAccountDocument | null> {
    return await BankAccountModel.findOneAndUpdate(
      { userId, deletedAt: null },
      { ...data },
      { new: true }
    );
  }

  static async deleteBankAccountByUserId(
    userId: string | Types.ObjectId
  ): Promise<BankAccountDocument | null> {
    return await BankAccountModel.findOneAndUpdate(
      { userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
  }

  static async findOne(
    filter: FilterQuery<BankAccountDocument>
  ): Promise<BankAccountDocument | null> {
    return await BankAccountModel.findOne({ ...filter, deletedAt: null });
  }

  static async findOneAndDelete(
    filter: FilterQuery<BankAccountDocument>
  ): Promise<BankAccountDocument | null> {
    return await BankAccountModel.findOneAndUpdate(
      { ...filter, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
  }

  static async create(
    data: Partial<BankAccountDocument>
  ): Promise<BankAccountDocument> {
    return await BankAccountModel.create(data);
  }
}
