import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStripeCustomers extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  stripeCustomerId: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  postalCode: string | null;
  state: string | null;
  country: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const StripeCustomersSchema = new Schema<IStripeCustomers>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    stripeCustomerId: { type: String, required: true },
    addressLine1: { type: String, default: null },
    addressLine2: { type: String, default: null },
    city: { type: String, default: null },
    postalCode: { type: String, default: null },
    state: { type: String, default: null },
    country: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'stripeCustomers' }
);

export const StripeCustomers = mongoose.model<IStripeCustomers>(
  'stripeCustomers',
  StripeCustomersSchema
);
