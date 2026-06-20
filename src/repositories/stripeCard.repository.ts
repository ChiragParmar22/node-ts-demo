import { Types } from 'mongoose';

import { IStripeCards, StripeCards } from '../models/StripeCards';

export default class StripeCardRepository {
  static async createCard(data: Partial<IStripeCards>): Promise<IStripeCards> {
    return await StripeCards.create(data);
  }

  static async getCardById(
    userId: string | Types.ObjectId,
    stripeCardId: string
  ): Promise<IStripeCards | null> {
    return await StripeCards.findOne({
      userId,
      stripeCardId,
      deletedAt: null,
    });
  }

  static async getAllCardsByUserId(
    userId: string | Types.ObjectId
  ): Promise<IStripeCards[]> {
    return await StripeCards.find({ userId, deletedAt: null });
  }

  static async deleteCardById(
    userId: string | Types.ObjectId,
    stripeCardId: string
  ): Promise<IStripeCards | null> {
    return await StripeCards.findOneAndUpdate(
      { userId, stripeCardId, deletedAt: null },
      { deletedAt: new Date(), isPrimary: false },
      { new: true }
    );
  }

  static async setPrimaryCard(
    userId: string | Types.ObjectId,
    stripeCardId: string
  ): Promise<IStripeCards | null> {
    // Remove primary from all user's cards
    await StripeCards.updateMany(
      { userId, deletedAt: null },
      { isPrimary: false, updatedAt: new Date() }
    );

    // Set the selected card as primary
    return await StripeCards.findOneAndUpdate(
      { userId, stripeCardId, deletedAt: null },
      { isPrimary: true, updatedAt: new Date() },
      { new: true }
    );
  }
}
