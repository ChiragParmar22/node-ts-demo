import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface BankAccountDocument extends Document {
  userId: Types.ObjectId;
  holderName: string;
  holderType: string;
  email: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  stripeBankAccountId: string;
  fingerPrint: string;
  country: string;
  currency: string;
  frontImageName: string;
  backImageName: string;
  createdAt: Date;
  deletedAt: Date;
}

const BankAccountSchema: Schema<BankAccountDocument> =
  new Schema<BankAccountDocument>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'user',
      },
      holderName: {
        type: String,
        required: true,
      },
      holderType: {
        type: String,
        required: true,
      },
      email: {
        type: String,
      },
      bankName: {
        type: String,
        required: true,
      },
      accountNumber: {
        type: String,
        required: true,
      },
      routingNumber: {
        type: String,
        required: true,
      },
      fingerPrint: {
        type: String,
        default: null,
      },
      country: {
        type: String,
        default: null,
      },
      currency: {
        type: String,
        default: null,
      },
      backImageName: {
        type: String,
        default: null,
      },
      frontImageName: {
        type: String,
        default: null,
      },
      stripeBankAccountId: {
        type: String,
        default: null,
      },
      deletedAt: {
        type: Date,
        default: null,
      },
    },
    { collection: 'externalBankAccount', timestamps: true }
  );

export const BankAccountModel: Model<BankAccountDocument> =
  mongoose.model<BankAccountDocument>('externalBankAccount', BankAccountSchema);
