import mongoose, { Document, Schema, Types } from 'mongoose';

import { PaymentMethod, TransactionStatus } from '../constants/key.constants';

export interface ITransactions extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  stripeCardId: string | null;
  paymentIntentId: string | null;
  chargeId: string | null;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  last4Digit: string | null;
  description: string | null;
  metadata: Record<string, object> | null;
  transactionType: string | null;
  transactionKey: string | null;
  payoutId: string | null;
  paymentMethodId: string | null;
  fee: number | null;
  netAmount: number | null;
  transactionId: string | null;
  balanceAvailableDate: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const TransactionsSchema = new Schema<ITransactions>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    stripeCardId: { type: String, default: null },
    paymentIntentId: {
      type: String,
      default: null,
      index: { unique: true, sparse: true },
    },
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
    transactionType: { type: String, default: null },
    transactionKey: { type: String, default: null },
    payoutId: { type: String, default: null },
    paymentMethodId: { type: String, default: null },
    fee: { type: Number, default: null },
    netAmount: { type: Number, default: null },
    transactionId: { type: String, default: null },
    balanceAvailableDate: { type: Number, default: null },
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
