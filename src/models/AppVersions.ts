import mongoose, { Document, Schema, Types } from 'mongoose';

import { DeviceType } from '../constants/key.constants';

export interface IAppVersions extends Document {
  _id: Types.ObjectId;
  deviceType: DeviceType;
  versionCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppVersionsSchema = new Schema<IAppVersions>(
  {
    deviceType: {
      type: String,
      enum: [...Object.values(DeviceType)],
      required: true,
    },
    versionCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'appVersions' }
);

export const AppVersions = mongoose.model<IAppVersions>(
  'appVersions',
  AppVersionsSchema
);
