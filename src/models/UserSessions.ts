import mongoose, { Document, Schema, Types } from 'mongoose';

import { DeviceType } from '../constants/key.constants';

export interface IUserSessions extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  deviceType: DeviceType;
  deviceId: string;
  deviceToken: string | null;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSessionsSchema = new Schema<IUserSessions>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    deviceType: {
      type: String,
      enum: [...Object.values(DeviceType)],
      required: true,
    },
    deviceId: { type: String, required: true },
    deviceToken: { type: String, default: null },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    accessTokenExpiresAt: { type: Date, required: true },
    refreshTokenExpiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'userSessions' }
);

export const UserSessions = mongoose.model<IUserSessions>(
  'userSessions',
  UserSessionsSchema
);
