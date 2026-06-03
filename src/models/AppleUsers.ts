import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAppleUsers extends Document {
  _id: Types.ObjectId;
  appleId: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppleUsersSchema = new Schema<IAppleUsers>(
  {
    appleId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'appleUsers' }
);

export const AppleUsers = mongoose.model<IAppleUsers>(
  'appleUsers',
  AppleUsersSchema
);
