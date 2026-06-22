import mongoose, { Document, Schema, Types } from 'mongoose';

import { KYC_STATUS, SocialLoginType } from '../constants/key.constants';

export interface IUsers extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  countryCode: string | null;
  phoneNumber: string | null;
  socialLoginType: SocialLoginType;
  socialId: string | null;
  password: string | null;
  profilePicture: string | null;
  socketId: string | null;
  location: { type: string; coordinates: number[] };
  walletBalance: number;
  accountId: string | null;
  kycStatus: KYC_STATUS | null;
  deleteReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const UsersSchema = new Schema<IUsers>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    countryCode: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    socialLoginType: {
      type: String,
      enum: Object.values(SocialLoginType),
      required: true,
    },
    socialId: { type: String, default: null },
    password: { type: String, default: null },
    profilePicture: { type: String, default: null },
    socketId: { type: String, default: null },
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number], index: '2dsphere' },
    },
    walletBalance: { type: Number, default: 0 },
    accountId: { type: String, default: null },
    kycStatus: {
      type: String,
      enum: Object.values(KYC_STATUS),
      default: null,
    },
    deleteReason: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  { collection: 'users' }
);

export const Users = mongoose.model<IUsers>('users', UsersSchema);
