import { FilterQuery, Types, UpdateQuery } from 'mongoose';

import { TransactionStatus } from '../constants/key.constants';
import { ITransactions, Transactions } from '../models/Transactions';

export default class TransactionRepository {
  /**
   * Create a new transaction record
   */
  static async createTransaction(
    data: Partial<ITransactions>
  ): Promise<ITransactions> {
    return await Transactions.create(data);
  }

  /**
   * Get a transaction by ID
   */
  static async getTransactionById(
    transactionId: string | Types.ObjectId
  ): Promise<ITransactions | null> {
    return await Transactions.findOne({ _id: transactionId, deletedAt: null });
  }

  /**
   * Get a transaction by Payment Intent ID
   */
  static async getTransactionByPaymentIntentId(
    paymentIntentId: string
  ): Promise<ITransactions | null> {
    return await Transactions.findOne({ paymentIntentId, deletedAt: null });
  }

  /**
   * Get all transactions for a specific user
   */
  static async getTransactionsByUserId(
    userId: string | Types.ObjectId
  ): Promise<ITransactions[]> {
    return await Transactions.find({ userId, deletedAt: null }).sort({
      createdAt: -1,
    });
  }

  /**
   * Update transaction status and optional fields (e.g., chargeId)
   */
  static async updateTransactionStatus(
    paymentIntentId: string,
    status: TransactionStatus,
    additionalData: Partial<ITransactions> = {}
  ): Promise<ITransactions | null> {
    return await Transactions.findOneAndUpdate(
      { paymentIntentId, deletedAt: null },
      {
        status,
        ...additionalData,
        updatedAt: new Date(),
      },
      { new: true }
    );
  }

  /**
   * Soft delete a transaction record
   */
  static async deleteTransaction(
    transactionId: string | Types.ObjectId
  ): Promise<ITransactions | null> {
    return await Transactions.findByIdAndUpdate(
      transactionId,
      { deletedAt: new Date() },
      { new: true }
    );
  }

  static async findOne(
    filter: FilterQuery<ITransactions>
  ): Promise<ITransactions | null> {
    return await Transactions.findOne({ ...filter, deletedAt: null });
  }

  static async findOneAndUpdate(
    filter: FilterQuery<ITransactions>,
    update: UpdateQuery<ITransactions>
  ): Promise<ITransactions | null> {
    return await Transactions.findOneAndUpdate(
      { ...filter, deletedAt: null },
      { ...update, updatedAt: new Date() },
      { new: true }
    );
  }
}
