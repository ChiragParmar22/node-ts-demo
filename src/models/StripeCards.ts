import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStripeCards extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  stripeCustomerId: string;
  stripeCardId: string;
  last4Digit: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const StripeCardsSchema = new Schema<IStripeCards>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    stripeCustomerId: { type: String, required: true },
    stripeCardId: { type: String, required: true },
    last4Digit: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  { collection: 'stripeCards' }
);

export const StripeCards = mongoose.model<IStripeCards>(
  'stripeCards',
  StripeCardsSchema
);
