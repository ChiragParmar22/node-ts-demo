import mongoose, { Document, Schema, Types } from 'mongoose';

import { DeviceType, SocialLoginType } from '../constants/key.constants';

export interface IUsers extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  countryCode: string | null;
  phoneNumber: string | null;
  deviceType: DeviceType | null;
  deviceToken: string | null;
  socialLoginType: SocialLoginType;
  appleId: string | null;
  googleId: string | null;
  password: string | null;
  profilePicture: string | null;
  socketId: string | null;
  location: { type: string; coordinates: number[] };
  deleteReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const UsersSchema = new Schema<IUsers>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    countryCode: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    deviceType: {
      type: String,
      enum: [...Object.values(DeviceType)],
      required: true,
    },
    deviceToken: { type: String, default: null },
    socialLoginType: {
      type: String,
      enum: Object.values(SocialLoginType),
      required: true,
    },
    appleId: { type: String, default: null },
    googleId: { type: String, default: null },
    password: { type: String, default: null },
    profilePicture: { type: String, default: null },
    socketId: { type: String, default: null },
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number], index: '2dsphere' },
    },
    deleteReason: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  { collection: 'users' }
);

export const Users = mongoose.model<IUsers>('users', UsersSchema);
