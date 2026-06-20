import mongoose, { Document, Schema, Types } from 'mongoose';

import { PaymentMethod, TransactionStatus } from '../constants/key.constants';

export interface ITransactions extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  stripeCardId: string;
  paymentIntentId: string;
  chargeId: string | null;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  last4Digit: string | null;
  description: string | null;
  metadata: Record<string, object> | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const TransactionsSchema = new Schema<ITransactions>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    stripeCardId: { type: String, required: true },
    paymentIntentId: { type: String, required: true, unique: true },
    chargeId: { type: String, default: null },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'usd' },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      required: true,
      default: TransactionStatus.PENDING,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
      default: PaymentMethod.CARD,
    },
    last4Digit: { type: String, default: null },
    description: { type: String, default: null },
    metadata: { type: Schema.Types.Map, of: Schema.Types.Mixed, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  { collection: 'transactions' }
);

export const Transactions = mongoose.model<ITransactions>(
  'transactions',
  TransactionsSchema
);
